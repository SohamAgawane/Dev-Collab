import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tag, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TaskModal({
  open,
  onOpenChange,
  task,
  projectId,
  onClose,
  defaultStatus = 'backlog',
}) {
  const queryClient = useQueryClient();
  const isEditing = !!task;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'medium',
    due_date: '',
    tags: [],
    assignee_email: '',
  });

  const [newTag, setNewTag] = useState('');

  // hydrate / reset when task or defaultStatus changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || defaultStatus,
        priority: task.priority || 'medium',
        due_date: task.due_date ? String(task.due_date).slice(0, 10) : '',
        tags: task.tags || [],
        assignee_email: task.assignee_email || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: defaultStatus,
        priority: 'medium',
        due_date: '',
        tags: [],
        assignee_email: '',
      });
    }
    setNewTag('');
  }, [task, open, defaultStatus]);

  const handleClose = () => {
    onOpenChange(false);
    if (onClose) onClose();
  };

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.Task.create({
        ...data,
        project_id: projectId,
        due_date: data.due_date || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.Task.update(task.id, {
        ...data,
        due_date: data.due_date || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Task.delete(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      handleClose();
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const addTag = (e) => {
    e.preventDefault();
    const trimmed = newTag.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData({ ...formData, tags: [...formData.tags, trimmed] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        // ESC / overlay click
        if (!val) handleClose();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="sm:max-w-[620px] rounded-xl border border-slate-200 bg-white shadow-xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
            <Badge
              variant="secondary"
              className="text-[10px] uppercase tracking-[0.16em] bg-indigo-50 text-indigo-700"
            >
              {isEditing ? 'Editing' : 'New'}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            {isEditing
              ? 'Update the task details.'
              : 'Add a new task to your board.'}
          </DialogDescription>
        </DialogHeader>

        {/* No internal scroll: compact layout, tighter gaps */}
        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g. Implement login API"
              required
              className="text-sm font-medium focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-slate-300"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <div className="relative">
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-0 focus:border-slate-300 appearance-none"
                >
                  <option value="backlog">Backlog</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 text-[10px]">
                  ▼
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <div className="relative">
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-0 focus:border-slate-300 appearance-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 text-[10px]">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add description, acceptance criteria, notes..."
              className="min-h-[80px] text-sm focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-slate-300"
            />
          </div>

          {/* Due date + Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date || ''}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="text-sm focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-slate-300"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assignee">Assignee (Email)</Label>
              <Input
                id="assignee"
                value={formData.assignee_email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assignee_email: e.target.value,
                  })
                }
                placeholder="user@example.com"
                className="text-sm focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-slate-300"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex gap-2 flex-wrap mb-1">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 bg-slate-100 text-slate-700"
                >
                  <Tag className="w-3 h-3" />
                  <span className="text-[11px]">{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-[12px] leading-none hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {formData.tags.length === 0 && (
                <span className="text-[11px] text-slate-400">
                  No tags yet.
                </span>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                className="max-w-[220px] text-sm focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-slate-300"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addTag}
                className="text-xs"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={() => {
                  if (
                    !isDeleting &&
                    window.confirm('Are you sure you want to delete this task?')
                  ) {
                    deleteMutation.mutate();
                  }
                }}
                className="text-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Task
                  </>
                )}
              </Button>
            )}

            <div className="flex gap-2 justify-end w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditing ? 'Saving…' : 'Creating…'}
                  </>
                ) : (
                  <>{isEditing ? 'Save Changes' : 'Create Task'}</>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
