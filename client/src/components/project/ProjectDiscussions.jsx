import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  MessageSquare,
  Plus,
  User,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function ProjectDiscussions({ projectId }) {
  const queryClient = useQueryClient();

  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [replyContent, setReplyContent] = useState("");

  const {
    data: discussions = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["discussions", projectId],
    queryFn: () => base44.entities.Discussion.filter({ project_id: projectId }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // ✅ On success: push discussion into cache immediately, THEN refetch
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Discussion.create(data),
    onSuccess: (createdDiscussion, variables) => {
      queryClient.setQueryData(
        ["discussions", projectId],
        (old = []) => {
          const newItem =
            createdDiscussion && createdDiscussion.id
              ? createdDiscussion
              : {
                  // fallback if API doesn't return the created entity
                  id: `temp-${Date.now()}`,
                  ...variables,
                  created_date: new Date().toISOString(),
                  is_resolved: false,
                  replies_count:
                    typeof variables.replies_count === "number"
                      ? variables.replies_count
                      : 0,
                };

          return [newItem, ...old];
        }
      );

      setIsCreating(false);
      setNewTitle("");
      setNewContent("");

      // optional: keep server & cache in sync
      queryClient.invalidateQueries({ queryKey: ["discussions", projectId] });
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    createMutation.mutate({
      title: newTitle.trim(),
      content: newContent.trim(),
      project_id: projectId,
      replies_count: 0,
    });
  };

  const safeDiscussions = discussions;

  // ----------------- Loading state -----------------
  if (isLoading && !isCreating && !selectedDiscussion && safeDiscussions.length === 0) {
    return (
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b border-slate-100 py-4 bg-gradient-to-r from-indigo-600/15 to-white">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase font-medium tracking-[0.16em] text-indigo-700">
                Discussions
              </span>
              <span className="text-[11px] text-slate-500">Loading…</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </CardContent>
      </Card>
    );
  }

  // ----------------- Create view -----------------
  if (isCreating) {
    return (
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b border-slate-100 py-3 bg-gradient-to-r from-indigo-600/15 to-white">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase font-medium tracking-[0.16em] text-indigo-700">
                Start New Discussion
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-[11px] text-slate-600"
              type="button"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Topic title
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What do you want to discuss?"
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Description
              </label>
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share enough context so your team can respond effectively..."
                className="min-h-[140px] text-sm"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Posting…" : "Post discussion"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // ----------------- Detail view -----------------
  if (selectedDiscussion) {
    const created = selectedDiscussion.created_date
      ? new Date(selectedDiscussion.created_date)
      : null;

    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="px-0 text-xs text-slate-600 hover:text-slate-900"
          onClick={() => setSelectedDiscussion(null)}
        >
          ← Back to discussions
        </Button>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-100 py-3 bg-gradient-to-r from-indigo-600/15 to-white">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase font-medium tracking-[0.16em] text-indigo-700">
                  Discussion
                </span>
                <CardTitle className="text-base font-semibold text-slate-900">
                  {selectedDiscussion.title}
                </CardTitle>
              </div>
              {selectedDiscussion.is_resolved && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 flex items-center gap-1 text-[10px]">
                  <CheckCircle2 className="w-3 h-3" />
                  Resolved
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-[11px] bg-indigo-100 text-indigo-700">
                  A
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-slate-800 text-xs">
                Author name
              </span>
              <span>•</span>
              <span>
                {created ? format(created, "MMM d, yyyy") : "Just now"}
              </span>
            </div>

            <div className="text-sm text-slate-800 leading-relaxed">
              {selectedDiscussion.content}
            </div>
          </CardContent>
        </Card>

        {/* Replies block (UI only for now) */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-100 py-3 bg-slate-50">
            <CardTitle className="text-[11px] font-semibold text-slate-700 uppercase tracking-[0.16em]">
              Replies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">
                    Jane Doe
                  </span>
                  <span className="text-[11px] text-slate-400">
                    2 hours ago
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  This looks great. I agree with the proposed changes and we can
                  pick this up in the next sprint.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                  Me
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Write a reply…"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="mb-2 bg-white text-sm"
                />
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                >
                  Reply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----------------- List view -----------------
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="border-b border-slate-100 py-3 bg-gradient-to-r from-indigo-600/15 to-white">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase font-medium tracking-[0.16em] text-indigo-700">
              Discussions
            </span>
            <span className="text-[11px] text-slate-500">
              {safeDiscussions.length} topic
              {safeDiscussions.length === 1 ? "" : "s"}
              {isFetching && (
                <span className="ml-2 text-[10px] text-slate-400">
                  (updating…)
                </span>
              )}
            </span>
          </div>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-xs"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-3 h-3 mr-1" />
            New topic
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {safeDiscussions.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-slate-900 mb-1">
              No discussions yet
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Start a new topic to get feedback and decisions in one place.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setIsCreating(true)}
            >
              Start discussion
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {safeDiscussions.map((discussion) => {
              const created = discussion.created_date
                ? new Date(discussion.created_date)
                : null;

              const repliesCount =
                typeof discussion.replies_count === "number"
                  ? discussion.replies_count
                  : 0;

              return (
                <Card
                  key={discussion.id}
                  className="hover:shadow-md transition-shadow cursor-pointer border-slate-200"
                  onClick={() => setSelectedDiscussion(discussion)}
                >
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm text-slate-900 line-clamp-1">
                          {discussion.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Author
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {created ? format(created, "MMM d") : "Just now"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {discussion.is_resolved && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                          Resolved
                        </Badge>
                      )}
                      <div className="text-center px-3 py-1 bg-slate-50 rounded-md border border-slate-100 min-w-[60px]">
                        <span className="block text-sm font-semibold text-slate-800 leading-tight">
                          {repliesCount}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Replies
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
