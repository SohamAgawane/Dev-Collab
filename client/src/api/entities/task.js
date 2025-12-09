// src/api/entities/task.js

import TaskSchema from "@/Entities/Task.json";

let mockTasks = [
  {
    id: "t1",
    title: "Set up Dev Collab repo",
    description: "Initialize Vite + React + Tailwind project structure.",
    project_id: "p1",
    status: "backlog",
    priority: "high",
    due_date: "2025-12-10",
    assignee_email: "dev1@example.com",
    tags: ["setup", "infrastructure"],
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
  {
    id: "t2",
    title: "Implement project dashboard",
    description: "Create overview cards, charts, and quick links.",
    project_id: "p1",
    status: "in_progress",
    priority: "medium",
    due_date: "2025-12-15",
    assignee_email: "dev2@example.com",
    tags: ["frontend", "ui"],
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
  {
    id: "t3",
    title: "Set up activity feed",
    description: "Track project changes like tasks, docs, and discussions.",
    project_id: "p1",
    status: "in_review",
    priority: "medium",
    due_date: "2025-12-18",
    assignee_email: "dev3@example.com",
    tags: ["backend", "activity"],
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
];

const generateId = () =>
  `t_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export const TaskEntity = {
  schema: TaskSchema,

  /**
   * List all tasks, optionally filtered by project_id
   */
  async list({ project_id } = {}) {
    if (!project_id) return mockTasks;
    return mockTasks.filter((t) => t.project_id === project_id);
  },

  /**
   * Filter by project_id + status (good for Kanban columns)
   */
  async filter({ project_id, status } = {}) {
    let result = mockTasks;

    if (project_id) {
      result = result.filter((t) => t.project_id === project_id);
    }

    if (status) {
      result = result.filter((t) => t.status === status);
    }

    return result;
  },

  /**
   * Get a single task
   */
  async getById(id) {
    return mockTasks.find((t) => t.id === id) || null;
  },

  /**
   * Create a new task
   */
  async create(data) {
    if (!data?.title) {
      throw new Error("Task requires 'title'");
    }
    if (!data?.project_id) {
      throw new Error("Task requires 'project_id'");
    }

    const allowedStatuses = TaskSchema.properties.status.enum;
    const allowedPriorities = TaskSchema.properties.priority.enum;

    if (data.status && !allowedStatuses.includes(data.status)) {
      throw new Error(`Invalid task status: ${data.status}`);
    }

    if (data.priority && !allowedPriorities.includes(data.priority)) {
      throw new Error(`Invalid task priority: ${data.priority}`);
    }

    const newTask = {
      id: generateId(),
      title: data.title,
      description: data.description || "",
      project_id: data.project_id,
      status:
        data.status || TaskSchema.properties.status.default,
      priority:
        data.priority ||
        TaskSchema.properties.priority.default,
      due_date: data.due_date || null,
      assignee_email: data.assignee_email || null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };

    mockTasks.push(newTask);
    return newTask;
  },

  /**
   * Update an existing task
   */
  async update(id, data) {
    const idx = mockTasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Task not found");

    const allowedStatuses = TaskSchema.properties.status.enum;
    const allowedPriorities = TaskSchema.properties.priority.enum;

    if (data.status && !allowedStatuses.includes(data.status)) {
      throw new Error(`Invalid task status: ${data.status}`);
    }

    if (data.priority && !allowedPriorities.includes(data.priority)) {
      throw new Error(`Invalid task priority: ${data.priority}`);
    }

    const updated = {
      ...mockTasks[idx],
      ...data,
      updated_date: new Date().toISOString(),
    };

    mockTasks[idx] = updated;
    return updated;
  },

  /**
   * Move a task between statuses (for Kanban drag & drop)
   */
  async setStatus(id, status) {
    return this.update(id, { status });
  },
};
