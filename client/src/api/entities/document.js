// src/api/entities/document.js

import DocumentSchema from "@/Entities/Document.json";

// In-memory mock data for documents
let mockDocuments = [
  {
    id: "doc_1",
    title: "Project Overview",
    content: "High-level description of Dev Collab and its goals.",
    project_id: "p1",
    is_pinned: true,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
  {
    id: "doc_2",
    title: "Sprint 1 Notes",
    content: "Decisions and notes from the first sprint planning.",
    project_id: "p1",
    is_pinned: false,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
];

const generateId = () =>
  `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export const DocumentEntity = {
  schema: DocumentSchema,

  /**
   * List all documents, optionally filtered by project_id
   */
  async list({ project_id } = {}) {
    if (!project_id) return mockDocuments;
    return mockDocuments.filter((d) => d.project_id === project_id);
  },

  /**
   * Get a single document by ID
   */
  async getById(id) {
    return mockDocuments.find((d) => d.id === id) || null;
  },

  /**
   * Create a new document
   */
  async create(data) {
    if (!data?.title) {
      throw new Error("Document requires 'title'");
    }
    if (!data?.project_id) {
      throw new Error("Document requires 'project_id'");
    }

    const newDoc = {
      id: generateId(),
      title: data.title,
      content: data.content || "",
      project_id: data.project_id,
      is_pinned:
        typeof data.is_pinned === "boolean"
          ? data.is_pinned
          : DocumentSchema.properties.is_pinned.default,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };

    mockDocuments.unshift(newDoc);
    return newDoc;
  },

  /**
   * Update an existing document
   */
  async update(id, data) {
    const idx = mockDocuments.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error("Document not found");

    const updated = {
      ...mockDocuments[idx],
      ...data,
      updated_date: new Date().toISOString(),
    };

    mockDocuments[idx] = updated;
    return updated;
  },

  /**
   * Pin or unpin a document
   */
  async setPinned(id, isPinned = true) {
    return this.update(id, { is_pinned: isPinned });
  },
};
