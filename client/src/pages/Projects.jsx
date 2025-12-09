import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus,
  Search,
  Filter,
  Folder,
  Calendar,
  Lock,
  Globe,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { format } from "date-fns";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Reusable dropdown using your DropdownMenu (closes on outside click + selection)
function FilterSelect({ value, onChange, placeholder, options, className }) {
  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? placeholder;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-between rounded-md border border-slate-200",
            "bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50",
            "min-w-[130px]",
            className
          )}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-2" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[140px]">
        {options.map((opt) => (
          <DropdownMenuItem key={opt.value} onClick={() => onChange(opt.value)}>
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const CreateProjectDialog = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "private",
    status: "active",
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        visibility: "private",
        status: "active",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      tags: ["New"], // Default tag
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Create a new space for your team to collaborate.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="e.g. Mobile App Redesign"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Briefly describe what this project is about..."
              className="resize-none"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <FilterSelect
                value={formData.visibility}
                onChange={(val) =>
                  setFormData({ ...formData, visibility: val })
                }
                placeholder="Select visibility"
                options={[
                  { value: "private", label: "Private" },
                  { value: "public", label: "Public" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <FilterSelect
                value={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val })}
                placeholder="Select status"
                options={[
                  { value: "active", label: "Active" },
                  { value: "on_hold", label: "On Hold" },
                  { value: "completed", label: "Completed" },
                ]}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-sm"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function Projects() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date", 50),
  });

  const allProjects = projects || [];

  // Collect available years from project created_date
  const availableYears = Array.from(
    new Set(
      allProjects
        .filter((p) => p.created_date)
        .map((p) => new Date(p.created_date).getFullYear())
    )
  ).sort((a, b) => b - a);

  const filteredProjects =
    allProjects.filter((project) => {
      const name = project.name || "";
      const description = project.description || "";

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;

      let matchesMonth = true;
      let matchesYear = true;

      if ((monthFilter !== "all" || yearFilter !== "all") && project.created_date) {
        const date = new Date(project.created_date);
        const month = date.getMonth() + 1; // 1–12
        const year = date.getFullYear();

        if (monthFilter !== "all") {
          matchesMonth = month === Number(monthFilter);
        }
        if (yearFilter !== "all") {
          matchesYear = year === Number(yearFilter);
        }
      }

      return matchesSearch && matchesStatus && matchesMonth && matchesYear;
    }) || [];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">
            Manage your workspace projects and progress.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search projects by name or description..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters block (title + 3 dropdowns) */}
        <div className="flex flex-col items-stretch sm:items-end gap-1">

          <div className="flex flex-wrap items-center gap-2 justify-end">
            {/* Status */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Status"
                options={[
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "on_hold", label: "On Hold" },
                  { value: "completed", label: "Completed" },
                ]}
                className="min-w-[150px]"
              />
            </div>

            {/* Month */}
            <FilterSelect
              value={monthFilter}
              onChange={setMonthFilter}
              placeholder="Month"
              options={[
                { value: "all", label: "All Months" },
                ...MONTHS.map((m, idx) => ({
                  value: String(idx + 1),
                  label: m,
                })),
              ]}
            />

            {/* Year */}
            <FilterSelect
              value={yearFilter}
              onChange={setYearFilter}
              placeholder="Year"
              options={[
                { value: "all", label: "All Years" },
                ...availableYears.map((year) => ({
                  value: String(year),
                  label: String(year),
                })),
              ]}
              className="min-w-[110px]"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center mb-4 text-xs text-slate-500">
        <span>
          Showing{" "}
          <span className="font-medium text-slate-700">
            {filteredProjects.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-700">
            {allProjects.length}
          </span>{" "}
          projects
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <Folder className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">
            No projects found
          </h3>
          <p className="text-slate-500 mb-6">
            Try adjusting your filters or create a new project.
          </p>
          <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`${createPageUrl("ProjectDetail")}?id=${project.id}`}
            >
              {/* gradient border wrapper */}
              <div className="h-full rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-100 p-[1px] hover:from-indigo-100 hover:via-white hover:to-sky-100 transition-colors">
                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col rounded-2xl">
                  <CardHeader className="p-6 pb-4">
                    <div className="flex justify-between items-start">
                      <Badge
                        variant={
                          project.status === "active" ? "default" : "secondary"
                        }
                        className="capitalize mb-3"
                      >
                        {project.status.replace("_", " ")}
                      </Badge>
                      {project.visibility === "private" ? (
                        <Lock className="w-3 h-3 text-slate-400" />
                      ) : (
                        <Globe className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                    <CardTitle className="text-xl hover:text-indigo-600 transition-colors line-clamp-1">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">
                      {project.description || "No description provided."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex-1">
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.tags?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs font-normal bg-slate-50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 border-t border-slate-100 mt-2 flex justify-between items-center">
                    <div className="flex -space-x-2">
                      <Avatar className="w-6 h-6 border-2 border-white">
                        <AvatarFallback className="text-[10px]">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <Avatar className="w-6 h-6 border-2 border-white">
                        <AvatarFallback className="text-[10px]">
                          AS
                        </AvatarFallback>
                      </Avatar>
                      <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-medium">
                        +2
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {project.created_date
                        ? format(new Date(project.created_date), "MMM d")
                        : "—"}
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
