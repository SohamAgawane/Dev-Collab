import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, UserPlus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProjectMemberProfile from "@/components/project/ProjectMemberProfile";

/* -------------------------
   Dummy Data (Instant UI)
-------------------------- */

const KPI = [
  {
    label: "Tasks",
    value: 128,
    accentBg: "bg-gradient-to-br from-indigo-100 to-indigo-300",
  },
  {
    label: "Completed",
    value: 84,
    accentBg: "bg-gradient-to-br from-emerald-100 to-emerald-300",
  },
  {
    label: "Documents",
    value: 16,
    accentBg: "bg-gradient-to-br from-sky-100 to-sky-300",
  },
  {
    label: "Members",
    value: 5,
    accentBg: "bg-gradient-to-br from-amber-100 to-amber-300",
  },
];

const STATUS = [
  { label: "Backlog", value: 32, from: "from-slate-200", to: "to-slate-400" },
  {
    label: "In Progress",
    value: 41,
    from: "from-indigo-300",
    to: "to-indigo-500",
  },
  {
    label: "In Review",
    value: 21,
    from: "from-amber-300",
    to: "to-amber-500",
  },
  {
    label: "Done",
    value: 34,
    from: "from-emerald-300",
    to: "to-emerald-500",
  },
];

const UPCOMING = [
  { title: "API authentication update", date: "Jul 8", tag: "Backend" },
  { title: "Calendar regression fix", date: "Jul 11", tag: "Bugfix" },
  { title: "Mobile UI polish", date: "Jul 13", tag: "Frontend" },
];

const RECENT = [
  { title: "User settings refactor", when: "Today", type: "Code" },
  { title: "Stripe webhook integration", when: "Today", type: "Integration" },
  { title: "Kanban status UI", when: "Yesterday", type: "UI" },
  { title: "Login token refresh", when: "2 days ago", type: "Auth" },
];

const totalTasks = STATUS.reduce((sum, s) => sum + s.value, 0);

/* -------------------------
   Dummy members
-------------------------- */

const INITIAL_MEMBERS = [
  { id: "u1", name: "Soham Agawane", role: "Admin", status: "online" },
  { id: "u2", name: "Aditi Sharma", role: "Developer", status: "online" },
  { id: "u3", name: "Rohit Verma", role: "Tester", status: "away" },
  { id: "u4", name: "Neha Singh", role: "Developer", status: "offline" },
  { id: "u5", name: "Guest Viewer", role: "Viewer", status: "offline" },
];

const CURRENT_USER_ID = "u1";

/* -------------------------
   KPI Card
-------------------------- */

const KpiCard = ({ label, value, accentBg }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white">
    <div className="flex h-20">
      {/* Left: label text */}
      <div className="flex-1 px-4 py-3 flex flex-col justify-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
      </div>

      {/* Right: colored block */}
      <div
        className={`
          relative ml-auto h-full w-24 
          flex items-center justify-center
          ${accentBg}
          rounded-l-[2.5rem]
        `}
      >
        <span className="text-2xl font-semibold text-slate-900">
          {value}
        </span>

        {/* Decorative circle */}
        <div className="pointer-events-none absolute -bottom-3 -left-3 h-8 w-8 rounded-full border border-white/60 bg-white/10" />
      </div>
    </div>
  </Card>
);

/* -------------------------
   Members Capsule Button
-------------------------- */

function MembersCapsuleButton({ project }) {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Developer");

  const currentUser = members.find((m) => m.id === CURRENT_USER_ID);
  const isAdmin = currentUser?.role === "Admin";

  const roles = ["All", "Admin", "Developer", "Tester", "Viewer"];

  const initials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const filteredMembers = members.filter((m) => {
    if (roleFilter !== "All" && m.role !== roleFilter) return false;
    if (search.trim() && !m.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const handleAdd = () => {
    if (!newMemberName.trim()) return;
    setMembers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newMemberName.trim(),
        role: newMemberRole,
        status: "offline",
      },
    ]);
    setNewMemberName("");
    setNewMemberRole("Developer");
    setShowAddForm(false);
  };

  const handleRemove = (id) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    if (!window.confirm(`Remove ${member.name} from project?`)) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleLeave = () => {
    if (!currentUser) return;
    if (!window.confirm("Are you sure you want to leave this project?")) return;
    setMembers((prev) => prev.filter((m) => m.id !== CURRENT_USER_ID));
  };

  return (
    <div className="relative">
      {/* Gradient capsule button */}
      <button
        type="button"
        onClick={() => setPanelOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 shadow-md hover:shadow-lg hover:brightness-110 transition"
      >
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          Members
        </span>

        <span className="rounded-full bg-white/20 px-2 py-[2px] text-[10px]">
          {members.length}
        </span>
      </button>

      {/* Panel (dropdown style) */}
            {/* Panel (dropdown style, card format) */}
      {panelOpen && (
        <Card
          className="
            absolute right-0 mt-2 w-80 z-[9999]
            rounded-xl border border-slate-200
            shadow-xl
            bg-white dark:bg-slate-100
          "
        >
          <CardContent className="p-3 space-y-3">
            {/* Header row inside panel */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Project members
                </p>
                <p className="text-[11px] text-slate-500">
                  {members.length} people · {project?.name || "Project"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <button
                    type="button"
                    className="h-7 w-7 flex items-center justify-center rounded-full bg-slate-900 text-slate-50 hover:bg-slate-800"
                    onClick={() => setShowAddForm((v) => !v)}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  className="h-7 w-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  onClick={() => setPanelOpen(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Search + filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
                <Input
                  className="pl-7 h-8 text-xs bg-white"
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-600"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Add member form (admin only) */}
            {isAdmin && showAddForm && (
              <div className="rounded-md bg-slate-50 border border-slate-200 px-2.5 py-2 space-y-2">
                <p className="text-[11px] font-medium text-slate-600">
                  Add member from your enterprise
                </p>
                <Input
                  className="h-8 text-xs bg-white"
                  placeholder="Search by name / email..."
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
                <div className="flex gap-2">
                  <select
                    className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-600"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                  >
                    <option>Admin</option>
                    <option>Developer</option>
                    <option>Tester</option>
                    <option>Viewer</option>
                  </select>
                  <Button
                    size="sm"
                    className="ml-auto h-8 text-[11px]"
                    onClick={handleAdd}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            {/* Members list */}
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {filteredMembers.length === 0 && (
                <p className="text-[11px] text-slate-400">
                  No members match current filter.
                </p>
              )}

              {filteredMembers.map((m) => {
                const onlineColor =
                  m.status === "online"
                    ? "bg-emerald-500"
                    : m.status === "away"
                    ? "bg-amber-400"
                    : "bg-slate-300";

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMember(m)}
                    className="group w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100 text-left"
                  >
                    {/* Avatar */}
                    <div className="relative h-7 w-7 rounded-full bg-slate-900 text-slate-50 flex items-center justify-center text-[11px] font-medium">
                      {initials(m.name)}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${onlineColor}`}
                      />
                    </div>

                    {/* Name + role */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-medium text-slate-800 truncate">
                          {m.name}
                        </span>
                        {m.id === CURRENT_USER_ID && (
                          <span className="text-[10px] text-indigo-500">
                            • You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="capitalize">{m.role}</span>
                        <span>•</span>
                        <span className="capitalize">{m.status}</span>
                      </div>
                    </div>

                    {/* Role pill */}
                    <Badge
                      variant="secondary"
                      className="text-[10px] capitalize"
                    >
                      {m.role}
                    </Badge>

                    {/* Remove / leave */}
                    {isAdmin && m.id !== CURRENT_USER_ID && (
                      <button
                        type="button"
                        className="text-slate-300 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(m.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    {m.id === CURRENT_USER_ID && (
                      <button
                        type="button"
                        className="text-[9px] text-slate-400 hover:text-red-500 underline decoration-dotted"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeave();
                        }}
                      >
                        Leave
                      </button>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Member profile sheet */}
      {selectedMember && (
        <ProjectMemberProfile
          open={!!selectedMember}
          onOpenChange={(open) => !open && setSelectedMember(null)}
          member={selectedMember}
          project={project}
        />
      )}
    </div>
  );
}

/* -------------------------
   Main Component
-------------------------- */

export default function ProjectOverview({ project }) {
  return (
    <div className="space-y-5 bg-white rounded-2xl p-4">
      {/* HEADER with gradient Members capsule */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {project?.name || "Project Overview"}
          </h1>
          <p className="text-sm text-slate-500">
            {project?.description ||
              "High-level snapshot of work, team, deadlines, and recent activity."}
          </p>
        </div>

        {/* Gradient Members capsule button */}
        <MembersCapsuleButton project={project} />
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KPI.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            accentBg={kpi.accentBg}
          />
        ))}
      </div>

      {/* MAIN GRID: Status graph + Upcoming + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* STATUS GRAPH */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Task Distribution
            </h3>

            {STATUS.map((s) => {
              const pct = Math.round((s.value / totalTasks) * 100);
              return (
                <div key={s.label} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{s.label}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {s.value} tasks
                      </span>
                      <span className="px-2 py-[2px] rounded-full bg-slate-100 text-[10px] text-slate-600">
                        {pct}%
                      </span>
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${s.from} ${s.to} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* UPCOMING DEADLINES */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Upcoming Deadlines
            </h3>

            {UPCOMING.map((t) => (
              <div
                key={t.title}
                className="flex items-center gap-3 text-xs bg-slate-50 rounded-lg px-3 py-2.5"
              >
                <div className="flex flex-col items-center justify-center h-10 w-12 rounded-md bg-gradient-to-br from-indigo-100 to-indigo-300 text-[11px] text-slate-800">
                  <span className="font-semibold text-[13px]">
                    {t.date.split(" ")[1]}
                  </span>
                  <span className="uppercase tracking-[0.16em] text-[9px]">
                    {t.date.split(" ")[0]}
                  </span>
                </div>

                <div className="flex-1 flex flex-col">
                  <span className="font-medium text-slate-800 line-clamp-1">
                    {t.title}
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full bg-indigo-50 text-[10px] text-indigo-700">
                      <Clock className="w-3 h-3" />
                      Due soon
                    </span>
                    <span className="px-2 py-[2px] rounded-full bg-slate-100 text-[10px] text-slate-600">
                      {t.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* RECENT ACTIVITY */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Recent Activity
            </h3>

            <div className="space-y-3">
              {RECENT.map((item, idx) => (
                <div
                  key={item.title}
                  className="flex gap-3 items-stretch min-h-[44px]"
                >
                  <div className="flex flex-col items-center">
                    {idx !== 0 && <div className="flex-1 w-px bg-slate-200" />}
                    <div className="h-3 w-3 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-sm" />
                    {idx !== RECENT.length - 1 && (
                      <div className="flex-1 w-px bg-slate-200" />
                    )}
                  </div>

                  <div className="flex-1 text-xs bg-slate-50 rounded-md px-3 py-2 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800 line-clamp-1">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {item.type}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {item.when}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
