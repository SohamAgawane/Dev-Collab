// src/api/entities/sprint.js

import SprintSchema from "@/Entities/Sprint.json";

let mockSprints = [
  {
    id: "s1",
    name: "Sprint 1 – Setup & Foundations",
    goal: "Set up Dev Collab core infrastructure and basic project flows.",
    start_date: "2025-12-01",
    end_date: "2025-12-15",
    project_id: "p1",
    status: "active",
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
  {
    id: "s2",
    name: "Sprint 2 – Collaboration Features",
    goal: "Implement chat, discussions and docs integration.",
    start_date: "2025-12-16",
    end_date: "2025-12-31",
    project_id: "p1",
    status: "planned",
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
];

const generateId = () =>
  `s_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export const SprintEntity = {
  schema: SprintSchema,

  /**
   * List all sprints, optionally filtered by project_id
   */
  async list({ project_id } = {}) {
    if (!project_id) return mockSprints;
    return mockSprints.filter((s) => s.project_id === project_id);
  },

  /**
   * Get a sprint by ID
   */
  async getById(id) {
    return mockSprints.find((s) => s.id === id) || null;
  },

  /**
   * Create a new sprint
   */
  async create(data) {
    if (!data?.name) {
      throw new Error("Sprint requires 'name'");
    }
    if (!data?.project_id) {
      throw new Error("Sprint requires 'project_id'");
    }

    const allowedStatuses = SprintSchema.properties.status.enum;

    if (data.status && !allowedStatuses.includes(data.status)) {
      throw new Error(`Invalid sprint status: ${data.status}`);
    }

    const newSprint = {
      id: generateId(),
      name: data.name,
      goal: data.goal || "",
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      project_id: data.project_id,
      status:
        data.status ||
        SprintSchema.properties.status.default,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };

    mockSprints.push(newSprint);
    return newSprint;
  },

  /**
   * Update an existing sprint
   */
  async update(id, data) {
    const idx = mockSprints.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Sprint not found");

    const allowedStatuses = SprintSchema.properties.status.enum;

    if (data.status && !allowedStatuses.includes(data.status)) {
      throw new Error(`Invalid sprint status: ${data.status}`);
    }

    const updated = {
      ...mockSprints[idx],
      ...data,
      updated_date: new Date().toISOString(),
    };

    mockSprints[idx] = updated;
    return updated;
  },

  /**
   * Change sprint status
   */
  async setStatus(id, status) {
    return this.update(id, { status });
  },
};
