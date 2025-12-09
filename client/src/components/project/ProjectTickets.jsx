import React, { useState, useMemo } from "react";
import { Plus, Bug, ClipboardList, Layers, Filter, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea"; // if you don't have this, replace with <textarea>
import { cn } from "@/lib/utils"; // if you don't have cn, remove and inline classes

const STATUS_OPTIONS = ["Open", "In Progress", "Done"];
const TYPE_OPTIONS = ["Bug", "Story", "Task"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

export default function ProjectTickets({ project }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Bug");
  const [status, setStatus] = useState("Open");
  const [priority, setPriority] = useState("Medium");
  const [assignee, setAssignee] = useState("");
  const [description, setDescription] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");

  const resetForm = () => {
    setTitle("");
    setType("Bug");
    setStatus("Open");
    setPriority("Medium");
    setAssignee("");
    setDescription("");
  };

  const addTicket = () => {
    if (!title.trim()) return;

    const now = new Date().toISOString();

    setTickets((prev) => [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        type,
        status,
        priority,
        assignee: assignee.trim() || "Unassigned",
        description: description.trim(),
        createdAt: now,
        updatedAt: now,
      },
      ...prev,
    ]);

    resetForm();
  };

  const updateTicket = (id, partial) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...partial, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const typeIcon = (t) => {
    if (t === "Bug") return <Bug className="w-3 h-3" />;
    if (t === "Story") return <Layers className="w-3 h-3" />;
    return <ClipboardList className="w-3 h-3" />;
  };

  const priorityBadgeClass = (p) => {
    switch (p) {
      case "Low":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/40";
      case "Medium":
        return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/40";
      case "High":
        return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/40";
      case "Critical":
        return "bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/40";
      default:
        return "bg-muted text-muted-foreground border-border/60";
    }
  };

  const statusBadgeClass = (s) => {
    switch (s) {
      case "Open":
        return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/40";
      case "In Progress":
        return "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/40";
      case "Done":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/40";
      default:
        return "bg-muted text-muted-foreground border-border/60";
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (filterStatus !== "All" && t.status !== filterStatus) return false;
      if (filterType !== "All" && t.type !== filterType) return false;
      if (
        search.trim() &&
        !`${t.title} ${t.description} ${t.assignee}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [tickets, filterStatus, filterType, search]);

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === "Open").length;
    const inProgress = tickets.filter((t) => t.status === "In Progress").length;
    const done = tickets.filter((t) => t.status === "Done").length;
    return { open, inProgress, done, total: tickets.length };
  }, [tickets]);

  return (
    <div className="space-y-6">
      {/* Top: summary + filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Stats */}
        <div className="flex flex-wrap gap-3">
          <div className="rounded-lg border border-border bg-card px-3 py-2">
            <p className="text-[11px] text-muted-foreground uppercase tracking-[0.12em] mb-1">
              Total tickets
            </p>
            <p className="text-lg font-semibold text-foreground">
              {stats.total}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-3 py-2">
            <p className="text-[11px] text-muted-foreground uppercase tracking-[0.12em] mb-1">
              Open
            </p>
            <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
              {stats.open}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-3 py-2">
            <p className="text-[11px] text-muted-foreground uppercase tracking-[0.12em] mb-1">
              In progress
            </p>
            <p className="text-lg font-semibold text-sky-600 dark:text-sky-400">
              {stats.inProgress}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-3 py-2">
            <p className="text-[11px] text-muted-foreground uppercase tracking-[0.12em] mb-1">
              Done
            </p>
            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.done}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              className="pl-8 w-52"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="w-3 h-3" />
            <span>Filters</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-2 text-xs"
          >
            <option value="All">Status: All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-2 text-xs"
          >
            <option value="All">Type: All</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                Type: {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create ticket box */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Raise a new ticket
            </p>
            <p className="text-xs text-muted-foreground">
              Log bugs, stories or tasks for{" "}
              <span className="font-medium">{project?.name}</span>.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={addTicket}>
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short summary, e.g. 'Fix login error on project page'"
          />

          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-muted-foreground" />
              <Input
                className="h-9 w-40"
                placeholder="Assignee (optional)"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="ml-auto text-xs"
            >
              {showAdvanced ? "Hide details" : "Add details"}
            </Button>
          </div>

          {showAdvanced && (
            <div>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the steps, expected behaviour, screenshots, etc."
              />
            </div>
          )}
        </div>
      </div>

      {/* Tickets list */}
      <div className="space-y-2">
        {filteredTickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {tickets.length === 0
              ? "No tickets created for this project yet. Start by raising a ticket above."
              : "No tickets match the current filters."}
          </p>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredTickets.map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card px-3 py-2.5 md:flex-row md:items-center md:justify-between"
              >
                {/* Left: main info */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-muted-foreground">
                    {typeIcon(t.type)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {t.title}
                    </p>
                    {t.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {t.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 items-center text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {t.assignee}
                      </span>
                      <span>•</span>
                      <span>
                        Created:{" "}
                        {new Date(t.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span>
                        Updated:{" "}
                        {new Date(t.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: controls */}
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  {/* Type */}
                  <Badge variant="secondary" className="capitalize">
                    {t.type}
                  </Badge>

                  {/* Priority */}
                  <span
                    className={cn(
                      "text-[11px] inline-flex items-center px-2 py-0.5 rounded-full border font-medium",
                      priorityBadgeClass(t.priority)
                    )}
                  >
                    {t.priority}
                  </span>

                  {/* Status select */}
                  <select
                    value={t.status}
                    onChange={(e) =>
                      updateTicket(t.id, { status: e.target.value })
                    }
                    className={cn(
                      "h-8 rounded-full border bg-background px-2 text-xs font-medium",
                      t.status === "Open"
                        ? "border-amber-300"
                        : t.status === "In Progress"
                        ? "border-sky-300"
                        : "border-emerald-300"
                    )}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>

                  {/* Status pill visual */}
                  <span
                    className={cn(
                      "text-[11px] inline-flex items-center px-2 py-0.5 rounded-full border",
                      statusBadgeClass(t.status)
                    )}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
