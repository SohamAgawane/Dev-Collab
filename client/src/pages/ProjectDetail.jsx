import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Calendar, Lock, Globe } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// Your project components
import ProjectOverview from "@/components/project/ProjectOverview";
import ProjectKanban from "@/components/project/ProjectKanban";
import ProjectSprints from "@/components/project/ProjectSprints";
import ProjectDesign from "@/components/project/ProjectDesign";
import ProjectDiscussions from "@/components/project/ProjectDiscussions";
import ProjectDocs from "@/components/project/ProjectDocs";
import ProjectChat from "@/components/project/ProjectChat";
import ProjectTickets from "@/components/project/ProjectTickets";

// TaskModal is probably used inside those components as needed

function useProjectIdFromUrl() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return params.get("id");
}

export default function ProjectDetail() {
  const projectId = useProjectIdFromUrl();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    enabled: !!projectId,
    // Using list + find to avoid guessing the exact base44 API method for single fetch
    queryFn: async () => {
      const list = await base44.entities.Project.list("-created_date", 50);
      return list.find((p) => String(p.id) === String(projectId));
    },
  });

  if (!projectId) {
    return (
      <div>
        <p className="text-sm text-red-500">
          No project id provided in URL query.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <p className="text-sm text-slate-500">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <p className="text-sm text-red-500">
          Project not found. It may have been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header / meta */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {project.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              {project.description || "No description provided."}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant={project.status === "active" ? "default" : "secondary"}
              className="capitalize"
            >
              {project.status?.replace("_", " ")}
            </Badge>
            {project.visibility === "private" ? (
              <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Globe className="w-3 h-3" />
                <span>Public</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            {project.created_date
              ? `Created ${format(new Date(project.created_date), "MMM d, yyyy")}`
              : "Created date unknown"}
          </div>
        </div>
      </div>

      {/* Main content card with tabs */}
      <Card className="border-slate-200 rounded-2xl">
        <CardHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-900">
              Project workspace
            </CardTitle>
            <CardDescription className="text-xs">
              Switch between views to manage work.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="sprints">Sprints</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="docs">Docs</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <ProjectOverview project={project} />
            </TabsContent>

            <TabsContent value="kanban" className="mt-0">
              <ProjectKanban project={project} />
            </TabsContent>

            <TabsContent value="sprints" className="mt-0">
              <ProjectSprints project={project} />
            </TabsContent>

            <TabsContent value="design" className="mt-0">
              <ProjectDesign project={project} />
            </TabsContent>

            <TabsContent value="discussions" className="mt-0">
              <ProjectDiscussions project={project} />
            </TabsContent>

            <TabsContent value="docs" className="mt-0">
              <ProjectDocs project={project} />
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <ProjectChat project={project} />
            </TabsContent>

            <TabsContent value="tickets" className="mt-0">
              <ProjectTickets project={project} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
