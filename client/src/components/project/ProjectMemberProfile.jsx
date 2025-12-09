import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Users,
  Mail,
  PhoneCall,
  Clock,
  MapPin,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";

export default function ProjectMemberProfile({
  open,
  onOpenChange,
  member,
  project,
}) {
  const navigate = useNavigate();
  const [extendedUser, setExtendedUser] = useState(null);

  if (!open || !member) return null;

  const initials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // Try to hydrate member info from backend (optional)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // Best-guess: if your API exposes User.get / retrieve, etc.
        if (base44?.entities?.User?.get) {
          const data = await base44.entities.User.get(member.id);
          if (!cancelled) setExtendedUser(data);
        }
      } catch {
        // If this fails, we just use the info coming from `member`
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [member.id]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        onOpenChange?.(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  const statusColor =
    member.status === "online"
      ? "bg-emerald-500"
      : member.status === "away"
      ? "bg-amber-400"
      : "bg-slate-300";

  // --- Derived fields with graceful fallbacks ---

  const email = extendedUser?.email || member.email || "Not provided";
  const phone =
    extendedUser?.phone ||
    extendedUser?.phone_number ||
    member.phone ||
    "Not provided";

  const location =
    extendedUser?.location ||
    extendedUser?.city ||
    member.location ||
    "Not provided";

  const lastSeen =
    member.lastSeen ||
    extendedUser?.last_seen ||
    (member.status === "online"
      ? "Online now"
      : member.status === "away"
      ? "Away · last seen recently"
      : "Last seen recently");

  const linkedin =
    extendedUser?.linkedin_url ||
    extendedUser?.links?.linkedin ||
    member.linkedin ||
    null;
  const twitter =
    extendedUser?.twitter_url ||
    extendedUser?.links?.twitter ||
    member.twitter ||
    null;
  const github =
    extendedUser?.github_url ||
    extendedUser?.links?.github ||
    member.github ||
    null;

  // --------- Actions ---------

  const goToChat = () => {
    onOpenChange?.(false);
    navigate("/Chat", {
      state: {
        directMessageTo: {
          id: member.id,
          name: member.name,
          role: member.role,
          status: member.status,
          email,
        },
        mode: "chat",
      },
    });
  };

  const startCall = () => {
    onOpenChange?.(false);
    navigate("/Chat", {
      state: {
        directMessageTo: {
          id: member.id,
          name: member.name,
          role: member.role,
          status: member.status,
          email,
        },
        mode: "call",
      },
    });
  };

  const viewActivity = () => {
    onOpenChange?.(false);
    navigate("/Team", {
      state: {
        focusMemberId: member.id,
        focusMemberName: member.name,
        tab: "activity",
      },
    });
  };

  const openFullProfile = () => {
    onOpenChange?.(false);
    // /profile can read location.state if you want to show that member by id
    navigate("/profile", {
      state: {
        focusMemberId: member.id,
        focusMemberName: member.name,
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20"
      onClick={() => onOpenChange?.(false)}
    >
      {/* Centered modal card */}
      <Card
        className="
          w-full max-w-lg mx-4
          bg-white
          rounded-2xl shadow-2xl border border-slate-200
          flex flex-col max-h-[90vh]
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative h-11 w-11 rounded-full bg-slate-900 text-slate-50 flex items-center justify-center text-sm font-semibold">
              {initials(member.name)}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white ${statusColor}`}
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                {member.name}
              </p>

              {/* Email + phone + last seen */}
              <div className="flex flex-col gap-0.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">
                    {email !== "Not provided" ? (
                      <a
                        href={`mailto:${email}`}
                        className="hover:text-indigo-600"
                      >
                        {email}
                      </a>
                    ) : (
                      "Email not provided"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>
                    {phone !== "Not provided" ? (
                      <a
                        href={`tel:${phone}`}
                        className="hover:text-indigo-600"
                      >
                        {phone}
                      </a>
                    ) : (
                      "Phone not provided"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{`Last seen: ${lastSeen}`}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            onClick={() => onOpenChange?.(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Section: Project membership */}
          <Card className="border border-slate-200 bg-slate-50">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-slate-900 text-slate-50 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Project membership
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {project?.name || "Project"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] mt-2">
                <div className="space-y-0.5">
                  <p className="text-slate-500">Role</p>
                  <p className="font-medium capitalize text-slate-900">
                    {member.role}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-slate-500">Status</p>
                  <p className="font-medium capitalize text-slate-900">
                    {member.status || "offline"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section: Actions */}
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-3 space-y-3">
              <p className="text-xs font-semibold text-slate-900">
                Quick actions
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={goToChat}
                >
                  Message
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={startCall}
                >
                  Start call
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={viewActivity}
                >
                  View activity
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={openFullProfile}
                >
                  View full profile
                </Button>
              </div>
              <p className="text-[11px] text-slate-500">
                Chat, calls, and activity are routed to their respective pages
                with this member pre-selected. The full profile view lets you
                see richer details on the /profile screen.
              </p>
            </CardContent>
          </Card>

          {/* Section: Location & social links */}
          <Card className="border border-slate-200 bg-white">
            <CardContent className="p-3 space-y-3">
              <p className="text-xs font-semibold text-slate-900">
                Contact & links
              </p>

              {/* Location */}
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{location}</span>
              </div>

              {/* Social links */}
              <div className="flex flex-wrap gap-2 mt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] px-2 border-slate-200 text-slate-700"
                  asChild
                  disabled={!github}
                >
                  <a
                    href={github || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={!github ? "pointer-events-none opacity-60" : ""}
                  >
                    <Github className="w-3.5 h-3.5 mr-1.5" />
                    {github ? "GitHub" : "GitHub not linked"}
                  </a>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] px-2 border-slate-200 text-slate-700"
                  asChild
                  disabled={!linkedin}
                >
                  <a
                    href={linkedin || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={!linkedin ? "pointer-events-none opacity-60" : ""}
                  >
                    <Linkedin className="w-3.5 h-3.5 mr-1.5" />
                    {linkedin ? "LinkedIn" : "LinkedIn not linked"}
                  </a>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] px-2 border-slate-200 text-slate-700"
                  asChild
                  disabled={!twitter}
                >
                  <a
                    href={twitter || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={!twitter ? "pointer-events-none opacity-60" : ""}
                  >
                    <Twitter className="w-3.5 h-3.5 mr-1.5" />
                    {twitter ? "Twitter" : "Twitter not linked"}
                  </a>
                </Button>
              </div>

              <p className="text-[11px] text-slate-500">
                Social profiles are populated from your user record (e.g. the
                same data powering the /profile page). Once backend fields are
                wired, these buttons will deep-link to this member&apos;s public
                profiles.
              </p>
            </CardContent>
          </Card>
        </div>
      </Card>
    </div>
  );
}
