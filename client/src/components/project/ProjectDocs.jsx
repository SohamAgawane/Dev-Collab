import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  FileText,
  Plus,
  MoreVertical,
  Save,
  Trash2,
  Clock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function ProjectDocs({ projectId }) {
  const queryClient = useQueryClient();

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  /* ------------------ Data ------------------ */

  const { data: docs, isLoading } = useQuery({
    queryKey: ["docs", projectId],
    queryFn: () => base44.entities.Document.filter({ project_id: projectId }),
    staleTime: 60_000
  });

  /* Select first doc automatically */
  useEffect(() => {
    if (docs?.length && !selectedDoc && !isEditing) {
      setSelectedDoc(docs[0]);
    }
  }, [docs, selectedDoc, isEditing]);

  /* ---------------- Mutations ---------------- */

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Document.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docs", projectId] });
      setIsEditing(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Document.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docs", projectId] });

      setSelectedDoc((prev) => ({
        ...prev,
        title: editTitle,
        content: editContent
      }));

      setIsEditing(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docs", projectId] });
      setSelectedDoc(null);
    }
  });

  /* ---------------- Handlers ---------------- */

  const handleCreateNew = () => {
    setSelectedDoc(null);
    setEditTitle("Untitled Document");
    setEditContent("");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;

    if (selectedDoc) {
      updateMutation.mutate({
        id: selectedDoc.id,
        data: {
          title: editTitle,
          content: editContent
        }
      });
    } else {
      createMutation.mutate({
        title: editTitle,
        content: editContent,
        project_id: projectId
      });
    }
  };

  const startEdit = (doc) => {
    setEditTitle(doc.title);
    setEditContent(doc.content || "");
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(id);
    }
  };

  /* ---------------- Loading ---------------- */

  if (isLoading) return <Skeleton className="w-full h-96" />;

  /* ================= UI ================= */

  return (
    <div className="flex h-[calc(100vh-200px)] border border-slate-200 rounded-lg overflow-hidden bg-white">

      {/* ---------------- Sidebar ---------------- */}
      <aside className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Documents</h3>

          <Button variant="ghost" size="icon" onClick={handleCreateNew}>
            <Plus className="w-4 h-4 text-indigo-600" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {docs?.length === 0 && !isEditing && (
            <div className="text-center py-10 px-4 text-slate-400 text-sm">
              No docs yet. Click + to create one.
            </div>
          )}

          {docs?.map((doc) => (
            <div
              key={doc.id}
              onClick={() => {
                setSelectedDoc(doc);
                setIsEditing(false);
              }}
              className={`p-3 rounded-md cursor-pointer flex items-center gap-3 text-sm transition-colors ${selectedDoc?.id === doc.id
                  ? "bg-white shadow-sm text-indigo-600 font-medium ring-1 ring-slate-200"
                  : "hover:bg-slate-100 text-slate-600"
                }`}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{doc.title}</span>
            </div>
          ))}

          {isEditing && !selectedDoc && (
            <div className="p-3 rounded-md bg-white shadow-sm text-indigo-600 font-medium ring-1 ring-slate-200 flex items-center gap-3 text-sm italic">
              <FileText className="w-4 h-4" />
              New Document…
            </div>
          )}
        </div>
      </aside>

      {/* ---------------- Main Content ---------------- */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedDoc || isEditing ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-gradient-to-r from-indigo-600/15 to-white">
              <div className="flex-1 mr-4">
                {isEditing ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-lg font-bold border-none shadow-none px-0 focus-visible:ring-0"
                    placeholder="Document Title"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-slate-900 truncate">
                    {selectedDoc.title}
                  </h2>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        if (!selectedDoc) setSelectedDoc(docs?.[0] || null);
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={handleSave}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-slate-400 mr-4 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedDoc.updated_date
                        ? selectedDoc.updated_date.split("T")[0]
                        : "Just now"}
                    </span>

                    <Button variant="outline" size="sm" onClick={() => startEdit(selectedDoc)}>
                      Edit
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(selectedDoc.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-white">
              {isEditing ? (
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write your document here..."
                  className="w-full h-full resize-none border-none focus-visible:ring-0 p-8 text-slate-800"
                />
              ) : (
                <div className="prose max-w-none p-8 text-slate-800 whitespace-pre-wrap">
                  {selectedDoc.content || (
                    <span className="text-slate-400 italic">
                      Empty document.
                    </span>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a document to view</p>
          </div>
        )}
      </main>
    </div>
  );
}
