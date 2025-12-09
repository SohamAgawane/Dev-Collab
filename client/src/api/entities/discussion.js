// src/api/entities/discussion.js

import DiscussionSchema from "@/Entities/Discussion.json";

// In-memory mock data
let mockDiscussions = [
  {
    id: "d1",
    title: "How should we structure the API?",
    content: "I think we should go with REST first, then consider GraphQL.",
    project_id: "p1",
    replies_count: 3,
    is_resolved: false,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
  {
    id: "d2",
    title: "Naming convention for components",
    content: "Proposal: PascalCase for components, camelCase for hooks.",
    project_id: "p1",
    replies_count: 1,
    is_resolved: true,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
];

const generateId = () =>
  `d_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export const DiscussionEntity = {
  schema: DiscussionSchema,

  /**
   * List all discussions (optionally per project)
   */
  async list({ project_id } = {}) {
    if (!project_id) return mockDiscussions;
    return mockDiscussions.filter(
      (d) => d.project_id === project_id
    );
  },

  /**
   * Get a single discussion by id
   */
  async getById(id) {
    return mockDiscussions.find((d) => d.id === id) || null;
  },

  /**
   * Create a new discussion
   */
  async create(data) {
    if (!data?.title) {
      throw new Error("Discussion requires 'title'");
    }
    if (!data?.project_id) {
      throw new Error("Discussion requires 'project_id'");
    }

    const newDiscussion = {
      id: generateId(),
      title: data.title,
      content: data.content || "",
      project_id: data.project_id,
      replies_count:
        typeof data.replies_count === "number"
          ? data.replies_count
          : DiscussionSchema.properties.replies_count.default,
      is_resolved:
        typeof data.is_resolved === "boolean"
          ? data.is_resolved
          : DiscussionSchema.properties.is_resolved.default,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };

    mockDiscussions.unshift(newDiscussion);
    return newDiscussion;
  },

  /**
   * Update an existing discussion
   */
  async update(id, data) {
    const idx = mockDiscussions.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error("Discussion not found");

    const updated = {
      ...mockDiscussions[idx],
      ...data,
      updated_date: new Date().toISOString(),
    };

    mockDiscussions[idx] = updated;
    return updated;
  },

  /**
   * Mark as resolved/unresolved
   */
  async setResolved(id, isResolved = true) {
    return this.update(id, { is_resolved: isResolved });
  },
};
