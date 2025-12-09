import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  AlertTriangle,
  FolderKanban,
  CheckCircle2,
  PauseCircle,
  Archive,
  Shield,
  Globe2,
  Ticket,
  Bug,
} from "lucide-react";

import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Open / close with Ctrl+K / Cmd+K and close with Escape
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange((prev) => !prev);
      }
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  // Fetch projects when the panel opens
  useEffect(() => {
    if (!open) return;

    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const list = await base44.entities.Project.list("-created_date", 50);
        setProjects(list || []);
      } catch {
        // ignore errors, panel still works
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [open]);

  const closePanel = () => {
    onOpenChange(false);
  };

  const go = (path) => {
    closePanel();
    navigate(path);
  };

  const goProject = (id) => {
    closePanel();
    navigate(`${createPageUrl("ProjectDetail")}?id=${id}`);
  };

  if (!open) return null;

  // ---------- Derived project data ----------

  const onHoldProjects = projects.filter((p) => p.status === "on_hold");
  const archivedProjects = projects.filter((p) => p.status === "archived");
  const activeProjects = projects.filter((p) => p.status === "active");

  const projectsWithoutDescription = projects.filter(
    (p) => !p.description || p.description.trim() === ""
  );

  const publicProjects = projects.filter((p) => p.visibility === "public");
  const privateProjects = projects.filter((p) => p.visibility === "private");

  const attentionProjects = [
    ...onHoldProjects.slice(0, 3),
    ...projectsWithoutDescription.slice(0, 3),
  ].slice(0, 5);

  // ---------- Synthetic tickets (Jira-style, based on projects) ----------

  const ticketTypes = ["Bug", "Story", "Task"];
  const ticketStatuses = ["Open", "In progress", "Done"];

  const syntheticTickets = projects.slice(0, 4).flatMap((project, projectIndex) => {
    // 2 tickets per project for now
    return Array.from({ length: 2 }).map((_, ticketIndex) => {
      const type = ticketTypes[(projectIndex + ticketIndex) % ticketTypes.length];
      const status =
        ticketStatuses[(projectIndex + ticketIndex) % ticketStatuses.length];

      const keyPrefix =
        (project.name || "PRJ")
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase() || "PRJ";

      const key = `${keyPrefix}-${(projectIndex + 1) * 100 + (ticketIndex + 1)}`;

      let title;
      if (type === "Bug") {
        title = "Fix critical issue in " + (project.name || "project");
      } else if (type === "Story") {
        title = "Implement feature for " + (project.name || "project");
      } else {
        title = "Follow-up task for " + (project.name || "project");
      }

      return {
        key,
        title,
        type,
        status,
        projectName: project.name || "Untitled project",
        projectId: project.id,
      };
    });
  });

  const openTickets = syntheticTickets.filter((t) => t.status === "Open").length;
  const inProgressTickets = syntheticTickets.filter(
    (t) => t.status === "In progress"
  ).length;
  const doneTickets = syntheticTickets.filter((t) => t.status === "Done").length;

  // We'll render all syntheticTickets but the container will be scrollable
  // and sized so that roughly 4 tickets are visible; the rest require scroll.
  const recentTickets = syntheticTickets;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm"
      onClick={closePanel}
    >
      <div
        className="w-full max-w-5xl max-h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-slate-50">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Project control center
              </h2>
              <p className="text-xs text-slate-500">
                See projects that need attention, views and tickets at a glance.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closePanel}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            aria-label="Close project control center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 flex-1 overflow-y-auto">
          {/* Column 1: Projects needing attention */}
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Needs attention
            </p>

            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-800">
                  Summary
                </span>
                <span className="text-[10px] text-slate-500">
                  {onHoldProjects.length} on hold ·{" "}
                  {projectsWithoutDescription.length} without description
                </span>
              </div>

              {isLoadingProjects ? (
                <p className="text-xs text-slate-400">Scanning projects…</p>
              ) : attentionProjects.length === 0 ? (
                <p className="text-xs text-emerald-600">
                  Nothing critical found. Projects look healthy.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {attentionProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => goProject(project.id)}
                      className="w-full flex items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-slate-100 transition"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                        <FolderKanban className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 truncate">
                            {project.name}
                          </span>
                          {project.status === "on_hold" && (
                            <span className="text-[10px] inline-flex items-center px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                              On hold
                            </span>
                          )}
                          {(!project.description ||
                            project.description.trim() === "") && (
                            <span className="text-[10px] inline-flex items-center px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100">
                              Add description
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {project.description || "No description yet"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Saved project views (all go to /Projects) */}
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Project views
            </p>

            <div className="space-y-1.5">
              <button
                onClick={() => go("/Projects")}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  Active projects
                </span>
                <span className="text-[11px] text-slate-500">
                  {activeProjects.length}
                </span>
              </button>

              <button
                onClick={() => go("/Projects")}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <PauseCircle className="w-4 h-4 text-slate-400" />
                  On-hold projects
                </span>
                <span className="text-[11px] text-slate-500">
                  {onHoldProjects.length}
                </span>
              </button>

              <button
                onClick={() => go("/Projects")}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <Archive className="w-4 h-4 text-slate-400" />
                  Archived projects
                </span>
                <span className="text-[11px] text-slate-500">
                  {archivedProjects.length}
                </span>
              </button>

              <button
                onClick={() => go("/Projects")}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <Globe2 className="w-4 h-4 text-slate-400" />
                  Public projects
                </span>
                <span className="text-[11px] text-slate-500">
                  {publicProjects.length}
                </span>
              </button>

              <button
                onClick={() => go("/Projects")}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <Shield className="w-4 h-4 text-slate-400" />
                  Private projects
                </span>
                <span className="text-[11px] text-slate-500">
                  {privateProjects.length}
                </span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              All views open the{" "}
              <span className="font-medium text-slate-700">Projects</span>{" "}
              page. You can later wire filters there based on status/visibility.
            </p>
          </div>

          {/* Column 3: Tickets overview (Jira-style) */}
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Tickets overview
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 space-y-1.5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-slate-50">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    Ticket snapshot
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Synthetic tickets based on your current projects.
                  </div>
                </div>
              </div>

              {syntheticTickets.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  Create a few projects to see a ticket-style snapshot here.
                </p>
              ) : (
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>
                    Open:{" "}
                    <span className="font-semibold text-amber-700">
                      {openTickets}
                    </span>
                  </span>
                  <span>
                    In progress:{" "}
                    <span className="font-semibold text-sky-700">
                      {inProgressTickets}
                    </span>
                  </span>
                  <span>
                    Done:{" "}
                    <span className="font-semibold text-emerald-700">
                      {doneTickets}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {syntheticTickets.length > 0 && (
              <div className="space-y-1.5 max-h-[230px] overflow-y-auto pr-1">
                {recentTickets.map((ticket) => (
                  <button
                    key={ticket.key}
                    onClick={() => goProject(ticket.projectId)}
                    className="w-full flex items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 transition border border-slate-100"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                      {ticket.type === "Bug" ? (
                        <Bug className="w-4 h-4" />
                      ) : (
                        <Ticket className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-mono text-slate-500">
                          {ticket.key}
                        </span>
                        <span
                          className={
                            "text-[10px] inline-flex items-center px-1.5 py-0.5 rounded-full border " +
                            (ticket.type === "Bug"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : ticket.type === "Story"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                              : "bg-slate-50 text-slate-700 border-slate-100")
                          }
                        >
                          {ticket.type}
                        </span>
                        <span
                          className={
                            "text-[10px] inline-flex items-center px-1.5 py-0.5 rounded-full border " +
                            (ticket.status === "Open"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : ticket.status === "In progress"
                              ? "bg-sky-50 text-sky-700 border-sky-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100")
                          }
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-900 truncate">
                        {ticket.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        Project: {ticket.projectName}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
