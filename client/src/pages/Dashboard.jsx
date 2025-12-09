import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import {
  Briefcase,
  CheckCircle2,
  Calendar as CalendarIcon,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { format } from "date-fns";

// -------------------- KPI Section --------------------

const KpiCard = ({ label, value, accentBg }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
    <div className="flex h-20">
      {/* Left: label text */}
      <div className="flex-1 px-4 py-3 flex flex-col justify-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
      </div>

      {/* Right: solid colored block with curved left bottom + number inside */}
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

const StatsSection = ({ tasks = [], projects = [] }) => {
  const now = new Date();

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const overdueTasks = tasks.filter((t) => {
    if (!t.due_date) return false;
    const due = new Date(t.due_date);
    return due < now && t.status !== "done";
  }).length;

  return (
    <div className="mb-6">
      {/* Label for KPI row */}
      <div className="mb-3 inline-flex rounded-full bg-gradient-to-r from-indigo-600/15 to-white px-3 py-1 border border-slate-200/70">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-700">
          Workspace metrics
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          label="Total projects"
          value={totalProjects}
          accentBg="bg-gradient-to-br from-indigo-50 to-indigo-100"
        />
        <KpiCard
          label="Active projects"
          value={activeProjects}
          accentBg="bg-gradient-to-br from-emerald-50 to-emerald-100"
        />
        <KpiCard
          label="Open tasks"
          value={openTasks}
          accentBg="bg-gradient-to-br from-amber-50 to-amber-100"
        />
        <KpiCard
          label="Overdue tasks"
          value={overdueTasks}
          accentBg="bg-gradient-to-br from-rose-50 to-rose-100"
        />
        <KpiCard
          label="Completed tasks"
          value={completedTasks}
          accentBg="bg-gradient-to-br from-violet-50 to-purple-100"
        />
      </div>
    </div>
  );
};

// -------------------- Project Workload Chart --------------------

const ProjectWorkloadChart = () => {
  // Dummy velocity data for last 7 days
  const data = [
    { label: "Monday", created: 4, completed: 1 },
    { label: "Tuesday", created: 6, completed: 3 },
    { label: "Wednesday", created: 3, completed: 4 },
    { label: "Thursday", created: 7, completed: 5 },
    { label: "Friday", created: 5, completed: 6 },
    { label: "Saturday", created: 2, completed: 3 },
    { label: "Sunday", created: 1, completed: 2 },
  ];

  return (
    <Card className="mb-8 shadow-sm overflow-hidden">
      {/* Unified gradient header */}
      <CardHeader className="py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600/15 to-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase font-medium tracking-[0.16em] text-indigo-700">
              Tasks flow
            </span>
            {/* <CardTitle className="text-sm font-semibold text-slate-900">
              Tasks assigned and completed (last 7 days)
            </CardTitle> */}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-2 w-2 rounded-full bg-sky-500" />
              <span>Created</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>Completed</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 12, left: 0, bottom: 24 }}
            >
              <defs>
                <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.08} />
                </linearGradient>

                <linearGradient
                  id="completedGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.08} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#0f172a" }}
              >
                <Label
                  value="Day of week"
                  position="insideBottom"
                  offset={-16}
                  style={{
                    fontSize: 12,
                    fill: "#94a3b8",
                  }}
                />
              </XAxis>

              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#0f172a" }}
                allowDecimals={false}
              >
                <Label
                  value="Number of tasks"
                  angle={-90}
                  position="insideLeft"
                  offset={10}
                  dy={30}
                  style={{
                    fontSize: 12,
                    fill: "#94a3b8",
                  }}
                />
              </YAxis>

              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.06)" }}
                contentStyle={{
                  borderRadius: 8,
                  borderColor: "#e2e8f0",
                  fontSize: 12,
                  boxShadow:
                    "0 10px 20px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)",
                }}
                labelStyle={{ fontSize: 11, color: "#0f172a" }}
              />

              <Area
                type="monotone"
                dataKey="created"
                name="Created"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#createdGradient)"
                activeDot={{ r: 4 }}
              />

              <Area
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#completedGradient)"
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// -------------------- Recent Projects --------------------

const RecentProjects = ({ projects = [], tasks = [], isLoading }) => {
  const getOpenTasksForProject = (projectId) =>
    tasks.filter(
      (t) => String(t.project_id) === String(projectId) && t.status !== "done"
    ).length;

  return (
    <div className="mb-8">
      <Card className="shadow-sm overflow-hidden">
        {/* Header with unified gradient */}
        <CardHeader className="py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600/15 to-white">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase font-medium tracking-[0.16em] text-indigo-700">
                Projects
              </span>
              {/* <CardTitle className="text-sm font-semibold text-slate-900">
                Recent projects
              </CardTitle> */}
            </div>

            <Link
              to="/Projects"
              className="text-indigo-600 text-xs font-medium hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))
            ) : projects.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-50 mb-3">
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-slate-900 font-medium mb-1">
                  No projects yet
                </p>
                <p className="text-slate-500 text-sm mb-4">
                  Create your first project to start collaborating.
                </p>
                <Link to="/Projects">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Create project
                  </Button>
                </Link>
              </div>
            ) : (
              projects.slice(0, 3).map((project) => {
                const openTasks = getOpenTasksForProject(project.id);

                const statusLabel =
                  project.status === "active"
                    ? "Active"
                    : project.status === "on_hold"
                      ? "On hold"
                      : "Archived";

                return (
                  <Link
                    key={project.id}
                    to={`${createPageUrl("ProjectDetail")}?id=${project.id}`}
                  >
                    <Card className="relative hover:shadow-md transition-all duration-200 cursor-pointer h-full overflow-hidden">
                      {/* Thin blue accent strip */}
                      <div className="absolute inset-x-0 top-0 h-[3px] bg-indigo-600" />

                      <CardContent className="p-6 pt-5">
                        <div className="flex justify-between items-start mb-3">
                          <Badge
                            variant="outline"
                            className={
                              project.visibility === "public"
                                ? "bg-blue-50 text-blue-700 border-blue-200 capitalize"
                                : "bg-slate-100 text-slate-700 border-slate-200 capitalize"
                            }
                          >
                            {project.visibility}
                          </Badge>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>

                        <h3 className="text-base font-semibold text-slate-900 mb-1.5 line-clamp-1">
                          {project.name}
                        </h3>

                        <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                          {project.description || "No description added yet."}
                        </p>

                        <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                          <span className="flex items-center gap-1">
                            <span className="inline-flex w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            {statusLabel}
                          </span>
                          <span>
                            {openTasks} open {openTasks === 1 ? "item" : "items"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div className="flex -space-x-2">
                            <Avatar className="w-7 h-7 border-2 border-white">
                              <AvatarFallback className="bg-indigo-100 text-[11px]">
                                A
                              </AvatarFallback>
                            </Avatar>
                            <Avatar className="w-7 h-7 border-2 border-white">
                              <AvatarFallback className="bg-indigo-200 text-[11px]">
                                B
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          <span className="text-[11px] text-slate-400">
                            Updated{" "}
                            {format(
                              new Date(project.updated_date || new Date()),
                              "MMM d"
                            )}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// -------------------- My Tasks / Tickets --------------------

const MyTasks = ({ tasks = [], projects = [], isLoading }) => {
  const [openDialog, setOpenDialog] = React.useState(false);

  // Sort tasks: most recent first (updated_date, then created_date)
  const sortedTasks = [...tasks].sort((a, b) => {
    const da = new Date(a.updated_date || a.created_date || 0);
    const db = new Date(b.updated_date || b.created_date || 0);
    return db - da;
  });

  // On dashboard: only 3 most recent
  const visible = sortedTasks.slice(0, 3);

  const getProjectName = (projectId) =>
    projects.find((p) => String(p.id) === String(projectId))?.name ||
    "Unassigned";

  const TaskRow = ({ task }) => (
    <div className="px-4 py-3 flex items-center gap-4 hover:bg-slate-50/80 transition-colors">
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === "high"
          ? "bg-rose-500"
          : task.priority === "medium"
            ? "bg-amber-500"
            : "bg-indigo-500"
          }`}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-900 truncate">
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
          <span className="truncate">{getProjectName(task.project_id)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CalendarIcon className="w-3 h-3" />
            {task.due_date
              ? format(new Date(task.due_date), "MMM d")
              : "No due date"}
          </span>
        </div>
      </div>
      <Badge variant="secondary" className="capitalize text-xs">
        {task.status?.replace("_", " ")}
      </Badge>
    </div>
  );

  return (
    <>
      <Card className="shadow-sm overflow-hidden">
        {/* Header: unified gradient */}
        <CardHeader className="border-b border-slate-100 py-4 bg-gradient-to-r from-indigo-600/15 to-white">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase font-medium tracking-[0.16em] text-indigo-700">
                Tickets & tasks
              </span>
              {/* <CardTitle className="text-sm font-semibold text-slate-900">
                Assigned to you
              </CardTitle> */}
            </div>
            <button
              onClick={() => setOpenDialog(true)}
              className="text-indigo-600 text-xs font-medium hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : sortedTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No tickets or tasks assigned right now.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visible.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full list dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-slate-200 shadow-xl">
          {/* Dialog header – same language */}
          <DialogHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-600/15 to-white px-4 -mx-4 -mt-4 rounded-t-xl">
            <div className="flex flex-col justify-center min-h-[56px]">
              <span className="text-[11px] uppercase font-medium tracking-[0.16em] text-indigo-700">
                Tickets & tasks
              </span>
            </div>
          </DialogHeader>

          {/* Scrollable list container */}
          <div className="flex-1 overflow-y-auto mt-3 border border-slate-100 rounded-lg bg-white">
            {sortedTasks.length === 0 ? (
              <div className="p-6 text-sm text-slate-500 text-center">
                No tickets or tasks to display.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sortedTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// -------------------- Recent Activity --------------------

const ActivityFeed = ({ tasks = [], projects = [], isLoading }) => {
  // Build activity items based on tasks (created / updated)
  const items = [...tasks]
    .sort((a, b) => {
      const da = new Date(a.updated_date || a.created_date || 0);
      const db = new Date(b.updated_date || b.created_date || 0);
      return db - da;
    })
    .slice(0, 6)
    .map((task) => {
      const project =
        projects.find((p) => String(p.id) === String(task.project_id)) || null;
      const ts = task.updated_date || task.created_date;
      const when = ts ? format(new Date(ts), "MMM d, HH:mm") : "Just now";

      const verb = task.status === "done" ? "Completed" : "Updated";

      return {
        id: task.id,
        title: task.title,
        projectName: project?.name || "Unassigned project",
        verb,
        when,
      };
    });

  return (
    <Card className="shadow-sm overflow-hidden">
      {/* Unified gradient header */}
      <CardHeader className="border-b border-slate-100 py-4 bg-gradient-to-r from-indigo-600/15 to-white">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase font-medium tracking-[0.16em] text-indigo-700">
              Activity
            </span>
            {/* <CardTitle className="text-sm font-semibold text-slate-900">
              Recent activity across projects
            </CardTitle> */}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">
            When work starts happening across projects, you&apos;ll see a stream
            of activity here.
          </p>
        ) : (
          <div className="space-y-5 relative before:absolute before:left-2 before:top-1 before:bottom-1 before:w-0.5 before:bg-slate-100">
            {items.map((item) => (
              <div key={item.id} className="relative pl-8">
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white bg-indigo-500 shadow-sm ring-1 ring-slate-100" />
                <p className="text-sm text-slate-900">
                  <span className="font-medium">{item.verb}</span> task{" "}
                  <span className="font-medium text-indigo-600">
                    {item.title}
                  </span>{" "}
                  in{" "}
                  <span className="font-medium text-slate-900">
                    {item.projectName}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">{item.when}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// -------------------- Main Dashboard --------------------

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-updated_date", 10),
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date", 20),
  });

  const safeProjects = projects || [];
  const safeTasks = tasks || [];

  return (
    <div className="pb-10">
      <StatsSection tasks={safeTasks} projects={safeProjects} />
      <ProjectWorkloadChart tasks={safeTasks} projects={safeProjects} />

      <RecentProjects
        projects={safeProjects}
        tasks={safeTasks}
        isLoading={projectsLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MyTasks
          tasks={safeTasks}
          projects={safeProjects}
          isLoading={tasksLoading}
        />
        <ActivityFeed
          tasks={safeTasks}
          projects={safeProjects}
          isLoading={tasksLoading || projectsLoading}
        />
      </div>
    </div>
  );
}
