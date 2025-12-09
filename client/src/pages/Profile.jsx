import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Github,
  Twitter,
  Award,
  BookOpen,
  Briefcase,
  Linkedin,
  Camera,
  Mail,
  Phone as PhoneIcon,
  AtSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import Cropper from "react-easy-crop"; // npm install react-easy-crop

// --------- helper: crop image to data URL ----------
async function getCroppedImage(imageSrc, cropPixels) {
  if (!imageSrc || !cropPixels) return null;

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const { x, y, width, height } = cropPixels;
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(
    image,
    x,
    y,
    width,
    height,
    0,
    0,
    width,
    height
  );

  return canvas.toDataURL("image/png");
}

// --------- helper: generate fake activity data (365 days) ----------
function generateActivityData(days = 365) {
  const today = new Date();
  const map = {};

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);

    // Stable "level" 0..4
    const level = (i * 7 + 3) % 5;

    const items =
      level === 0
        ? []
        : [
          {
            type: "ticket_created",
            text: `Created ticket DEV-${100 + i}`,
          },
          {
            type: "ticket_closed",
            text: `Closed ticket DEV-${80 + i}`,
          },
          {
            type: "comment",
            text: `Commented on API design discussion`,
          },
        ].slice(0, level);

    map[key] = {
      date: d,
      level,
      items,
    };
  }

  return map;
}

export default function Profile() {
  const queryClient = useQueryClient();
  const avatarInputRef = useRef(null);

  // ---- Fetch current user ----
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  // Projects – use same source as /Projects route (no extra filtering here)
  const { data: userProjects = [] } = useQuery({
    queryKey: ["projects-for-user-profile"],
    enabled: !!user?.id,
    queryFn: async () => {
      try {
        if (base44?.entities?.Project?.list) {
          // Same pattern as /Projects page: backend gives you only the projects
          // this user should see / is assigned to
          const list = await base44.entities.Project.list("-created_date", 100);
          return list || [];
        }
      } catch {
        // ignore, fall back to empty
      }
      return [];
    },
  });

  // ---- Local edit state ----
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    job_title: "",
    location: "",
    phone: "",
    website_url: "",
    github_url: "",
    twitter_url: "",
    linkedin_url: "",
    bio: "",
    skills: "",
  });

  // ---- Avatar crop state ----
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawAvatarUrl, setRawAvatarUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState(null);

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedPixels(croppedAreaPixels);
  };

  // ---- Activity data (365 days) ----
  const [activityByDate, setActivityByDate] = useState({});
  const [selectedActivityKey, setSelectedActivityKey] = useState(null);

  useEffect(() => {
    const data = generateActivityData(365);
    setActivityByDate(data);
    const keys = Object.keys(data).sort();
    if (keys.length > 0) {
      const latestKey = keys[keys.length - 1];
      setSelectedActivityKey(latestKey);
    }
  }, []);

  const sortedActivityKeys = useMemo(
    () => Object.keys(activityByDate).sort(),
    [activityByDate]
  );

  const activityWeeks = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < sortedActivityKeys.length; i += 7) {
      weeks.push(sortedActivityKeys.slice(i, i + 7));
    }
    return weeks;
  }, [sortedActivityKeys]);

  const selectedActivity =
    (selectedActivityKey && activityByDate[selectedActivityKey]) || null;

  // ---- Hydrate form when user loads ----
  useEffect(() => {
    if (!user) return;
    setForm({
      full_name: user.full_name || "",
      username: user.username || user.handle || "",
      job_title: user.job_title || user.title || "",
      location: user.location || "",
      phone:
        user.phone ||
        user.phone_number ||
        user.mobile ||
        "",
      website_url: user.website_url || user.website || "",
      github_url: user.github_url || user.links?.github || "",
      twitter_url: user.twitter_url || user.links?.twitter || "",
      linkedin_url: user.linkedin_url || user.links?.linkedin || "",
      bio: user.bio || "",
      skills:
        Array.isArray(user.skills) && user.skills.length > 0
          ? user.skills.join(", ")
          : user.skills || "",
    });
    setAvatarPreview(user.avatar_url || null);
  }, [user]);

  // ---- Update profile mutation ----
  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      try {
        if (base44?.entities?.User?.update && user?.id) {
          const updated = await base44.entities.User.update(user.id, payload);
          return updated;
        }
      } catch {
        // ignore, fall back
      }
      return { ...user, ...payload };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["user"], updated);
      setEditing(false);
    },
  });

  // ---- Avatar upload & crop ----
  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setRawAvatarUrl(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropModalOpen(true);
    e.target.value = "";
  };

  const handleApplyCrop = async () => {
    if (!rawAvatarUrl || !croppedPixels) {
      setCropModalOpen(false);
      return;
    }
    try {
      const dataUrl = await getCroppedImage(rawAvatarUrl, croppedPixels);
      if (dataUrl) {
        // Instant preview; backend upload can be wired behind this
        setAvatarPreview(dataUrl);
        await updateMutation.mutateAsync({ avatar_url: dataUrl });
      }
    } catch {
      // ignore
    } finally {
      setCropModalOpen(false);
      setRawAvatarUrl(null);
    }
  };

  // ---- Form helpers ----
  const onChangeField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      full_name: form.full_name,
      username: form.username,
      job_title: form.job_title,
      location: form.location,
      phone: form.phone,
      website_url: form.website_url,
      github_url: form.github_url,
      twitter_url: form.twitter_url,
      linkedin_url: form.linkedin_url,
      bio: form.bio,
      skills: form.skills
        ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };
    updateMutation.mutate(payload);
  };

  // ---- Derived display fields ----
  if (isLoading) return <Skeleton className="h-96 w-full" />;

  if (isError || !user) {
    return (
      <div className="max-w-5xl mx-auto pb-10">
        <Card>
          <CardContent className="p-6 text-sm text-red-500">
            Failed to load profile. Please refresh or try again later.
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = editing ? form.full_name : user.full_name || "User Name";
  const roleLabel =
    user.role === "admin"
      ? "Administrator"
      : user.role
        ? user.role
        : "Team Member";

  const username = editing ? form.username : user.username || user.handle || "";
  const email = user.email || "";
  const phoneDisplay = editing
    ? form.phone
    : user.phone || user.phone_number || user.mobile || "";

  const title = editing
    ? form.job_title || "Your title"
    : user.job_title || user.title || "Add your title";

  const location =
    editing && form.location
      ? form.location
      : user.location || "Add your location";

  const joinedText = user.created_date
    ? `Joined ${format(new Date(user.created_date), "MMMM yyyy")}`
    : "Joined recently";

  const website =
    editing && form.website_url
      ? form.website_url
      : user.website_url || user.website || "";

  const github = editing
    ? form.github_url
    : user.github_url || user.links?.github || "";
  const twitter = editing
    ? form.twitter_url
    : user.twitter_url || user.links?.twitter || "";
  const linkedin = editing
    ? form.linkedin_url
    : user.linkedin_url || user.links?.linkedin || "";

  const bio = editing ? form.bio : user.bio;

  const skillsList =
    editing && form.skills
      ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : Array.isArray(user.skills)
        ? user.skills
        : user.skills
          ? user.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [];

  const showGithub = !!github;
  const showTwitter = !!twitter;
  const showLinkedin = !!linkedin;

  const formatUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Profile Header (no gradient, clean white card) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Avatar + name block */}
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="relative shrink-0">
                <Avatar className="w-24 h-24 sm:w-24 sm:h-24 md:w-28 md:h-28 border-2 border-slate-200 shadow-md bg-slate-100 overflow-hidden rounded-full">
                  {avatarPreview ? (
                    <AvatarImage
                      src={avatarPreview}
                      alt={displayName}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <AvatarFallback className="text-4xl sm:text-5xl bg-indigo-100 text-indigo-700">
                      {displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>

                {/* Small camera button */}
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="
            absolute bottom-2 right-2
            h-7 w-7
            rounded-full
            bg-white
            border border-slate-200
            shadow-sm
            hover:bg-slate-50
            flex items-center justify-center
          "
                  aria-label="Change profile photo"
                >
                  <Camera className="w-3 h-3 text-slate-600" />
                </button>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarSelected}
                />
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900">
                  {displayName}
                </h1>
                <p className="text-sm text-slate-500">{roleLabel}</p>

                {/* Username / email / phone under name */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                  {username && (
                    <div className="flex items-center gap-1">
                      <AtSign className="w-3 h-3" />
                      <span>{username}</span>
                    </div>
                  )}

                  {email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <a
                        href={`mailto:${email}`}
                        className="hover:text-indigo-600 break-all"
                      >
                        {email}
                      </a>
                    </div>
                  )}

                  {phoneDisplay && (
                    <div className="flex items-center gap-1">
                      <PhoneIcon className="w-3 h-3" />
                      <span>{phoneDisplay}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 md:gap-3 md:self-start md:ml-auto">
              {editing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      // Reset form from latest user data
                      if (user) {
                        setForm({
                          full_name: user.full_name || "",
                          username: user.username || user.handle || "",
                          job_title: user.job_title || user.title || "",
                          location: user.location || "",
                          phone:
                            user.phone ||
                            user.phone_number ||
                            user.mobile ||
                            "",
                          website_url: user.website_url || user.website || "",
                          github_url:
                            user.github_url || user.links?.github || "",
                          twitter_url:
                            user.twitter_url || user.links?.twitter || "",
                          linkedin_url:
                            user.linkedin_url || user.links?.linkedin || "",
                          bio: user.bio || "",
                          skills:
                            Array.isArray(user.skills) && user.skills.length > 0
                              ? user.skills.join(", ")
                              : user.skills || "",
                        });
                        // Reset avatar preview back to backend avatar, if any
                        setAvatarPreview(user.avatar_url || null);
                      }
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleSave}
                    disabled={updateMutation.isLoading}
                  >
                    {updateMutation.isLoading ? "Saving..." : "Save changes"}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Meta row under header */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
            {title && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{title}</span>
              </div>
            )}

            {location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
            )}

            {joinedText && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{joinedText}</span>
              </div>
            )}

            {website && (
              <div className="flex items-center gap-2 min-w-0">
                <LinkIcon className="w-4 h-4 flex-shrink-0" />
                <a
                  href={formatUrl(website)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600 truncate max-w-[220px]"
                  title={website}
                >
                  {website}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body layout: left = About/Skills/Social, right = Activity + Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="space-y-6">
          {/* About + Bio + Social icons (shown here only) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Display name
                  </label>
                  <Input
                    value={form.full_name}
                    onChange={(e) =>
                      onChangeField("full_name", e.target.value)
                    }
                    placeholder="Your full name"
                    className="mb-3"
                  />

                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Username
                  </label>
                  <Input
                    value={form.username}
                    onChange={(e) =>
                      onChangeField("username", e.target.value)
                    }
                    placeholder="Your username / handle"
                    className="mb-3"
                  />

                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Title / Role
                  </label>
                  <Input
                    value={form.job_title}
                    onChange={(e) =>
                      onChangeField("job_title", e.target.value)
                    }
                    placeholder="e.g. Senior Frontend Engineer"
                    className="mb-3"
                  />

                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Location
                  </label>
                  <Input
                    value={form.location}
                    onChange={(e) =>
                      onChangeField("location", e.target.value)
                    }
                    placeholder="City, Country"
                    className="mb-3"
                  />

                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Phone
                  </label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      onChangeField("phone", e.target.value)
                    }
                    placeholder="+91 99999 99999"
                    className="mb-3"
                  />

                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Bio
                  </label>
                  <Textarea
                    value={form.bio}
                    onChange={(e) => onChangeField("bio", e.target.value)}
                    placeholder="Tell your team a bit about yourself..."
                    rows={4}
                  />

                  <div className="mt-4 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em]">
                      Social handles
                    </p>
                    <Input
                      value={form.github_url}
                      onChange={(e) =>
                        onChangeField("github_url", e.target.value)
                      }
                      placeholder="GitHub URL (optional)"
                      className="text-xs"
                    />
                    <Input
                      value={form.linkedin_url}
                      onChange={(e) =>
                        onChangeField("linkedin_url", e.target.value)
                      }
                      placeholder="LinkedIn URL (optional)"
                      className="text-xs"
                    />
                    <Input
                      value={form.twitter_url}
                      onChange={(e) =>
                        onChangeField("twitter_url", e.target.value)
                      }
                      placeholder="X / Twitter URL (optional)"
                      className="text-xs"
                    />
                    <Input
                      value={form.website_url}
                      onChange={(e) =>
                        onChangeField("website_url", e.target.value)
                      }
                      placeholder="Personal website (optional)"
                      className="text-xs"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-slate-600 leading-relaxed">
                    {bio ||
                      "Add a short bio so your team knows what you work on, what you care about, and how you like to collaborate."}
                  </p>

                  {/* Social icons only here (not in header) */}
                  {(showGithub || showLinkedin || showTwitter) && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em] mb-2">
                        Social
                      </p>
                      <div className="flex items-center gap-2">
                        {showGithub && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full"
                            asChild
                          >
                            <a
                              href={formatUrl(github)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Github className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {showLinkedin && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full"
                            asChild
                          >
                            <a
                              href={formatUrl(linkedin)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {showTwitter && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full"
                            asChild
                          >
                            <a
                              href={formatUrl(twitter)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Twitter className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Skills (comma-separated)
                  </label>
                  <Input
                    value={form.skills}
                    onChange={(e) => onChangeField("skills", e.target.value)}
                    placeholder="React, TypeScript, Node.js, UX, GraphQL"
                  />
                </div>
              ) : skillsList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-slate-100 text-slate-700"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Add your skills so teammates can discover you by expertise.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Activity + Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity card with 12-month GitHub-style graph */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-500">
                Last 12 months of activity. Click a day to see details.
              </p>
              <div className="overflow-x-auto pb-2">
                <div className="inline-flex gap-[3px]">
                  {activityWeeks.map((week, wi) => (
                    <div
                      key={wi}
                      className="flex flex-col gap-[3px]"
                    >
                      {Array.from({ length: 7 }).map((_, di) => {
                        const key = week[di];
                        const day = key ? activityByDate[key] : null;
                        const level = day?.level ?? 0;

                        const baseClasses =
                          "w-3 h-3 rounded-[3px] cursor-pointer border border-transparent";
                        let color = "bg-slate-100";
                        if (level === 1) color = "bg-emerald-100";
                        if (level === 2) color = "bg-emerald-200";
                        if (level === 3) color = "bg-emerald-400";
                        if (level === 4) color = "bg-emerald-600";

                        const isSelected = key === selectedActivityKey;

                        return (
                          <button
                            key={key || `${wi}-${di}`}
                            type="button"
                            className={`${baseClasses} ${color} ${isSelected ? "ring-1 ring-indigo-500" : ""
                              }`}
                            disabled={!day}
                            onClick={() =>
                              day && setSelectedActivityKey(key)
                            }
                            title={
                              day
                                ? `${format(
                                  day.date,
                                  "MMM d"
                                )} • ${day.items.length} updates`
                                : ""
                            }
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected day details */}
              <div className="mt-4 border-t border-slate-100 pt-3">
                {selectedActivity ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em]">
                        {format(selectedActivity.date, "EEEE, MMM d yyyy")}
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {selectedActivity.items.length} updates
                      </span>
                    </div>
                    {selectedActivity.items.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        No recorded activity on this day.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedActivity.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <div className="mt-0.5">
                              {item.type === "ticket_created" && (
                                <BookOpen className="w-3 h-3 text-emerald-500" />
                              )}
                              {item.type === "ticket_closed" && (
                                <Award className="w-3 h-3 text-indigo-500" />
                              )}
                              {item.type === "comment" && (
                                <Briefcase className="w-3 h-3 text-slate-400" />
                              )}
                            </div>
                            <p className="text-slate-700 text-xs">
                              {item.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-400">
                    Select a day to see activity.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Projects card – list only, no click to open details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Projects you’re assigned to
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userProjects.length === 0 ? (
                <p className="text-sm text-slate-500">
                  You’re not assigned to any projects yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {userProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900 line-clamp-1">
                          {project.name}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {project.description || "No description provided"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {project.status && (
                          <Badge
                            variant="secondary"
                            className="capitalize text-[10px]"
                          >
                            {String(project.status).replace("_", " ")}
                          </Badge>
                        )}
                        {project.created_date && (
                          <span className="text-[10px] text-slate-400">
                            Created{" "}
                            {format(
                              new Date(project.created_date),
                              "MMM d, yyyy"
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Avatar crop modal */}
      {cropModalOpen && rawAvatarUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              Adjust profile photo
            </h2>
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-slate-900">
              <Cropper
                image={rawAvatarUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex items-center justify-between mt-3">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 mr-4"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => {
                    setCropModalOpen(false);
                    setRawAvatarUrl(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleApplyCrop}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
