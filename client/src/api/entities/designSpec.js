// src/api/entities/designSpec.js

import DesignSpecSchema from "@/Entities/DesignSpec.json";

// In-memory mock storage
let mockDesignSpecs = [
  {
    id: "ds_1",
    title: "System Architecture v1",
    type: "architecture",
    project_id: "p1",
    content: {
      overview: "High level architecture for Dev Collab",
      services: ["Frontend", "API Gateway", "Auth Service", "DB"],
    },
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
  {
    id: "ds_2",
    title: "Database Schema Draft",
    type: "schema",
    project_id: "p1",
    content: {
      entities: ["Project", "Task", "Activity", "User"],
    },
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  },
];

// Helper ID generator
const generateId = () =>
  `ds_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export const DesignSpecEntity = {
  // Make schema available for dynamic builders/editors
  schema: DesignSpecSchema,

  /**
   * List all design specs
   */
  async list() {
    return mockDesignSpecs;
  },

  /**
   * Filter by project_id
   */
  async filter({ project_id } = {}) {
    if (!project_id) return mockDesignSpecs;

    return mockDesignSpecs.filter(
      (spec) => spec.project_id === project_id
    );
  },

  /**
   * Find a single spec by ID
   */
  async getById(id) {
    return mockDesignSpecs.find((spec) => spec.id === id);
  },

  /**
   * Create new design spec
   */
  async create(data) {
    if (!data?.title) {
      throw new Error("DesignSpec requires 'title'");
    }

    if (!data?.project_id) {
      throw new Error("DesignSpec requires 'project_id'");
    }

    // Validate type enum
    const allowedTypes =
      DesignSpecSchema.properties.type.enum;

    if (data.type && !allowedTypes.includes(data.type)) {
      throw new Error(`Invalid DesignSpec type: ${data.type}`);
    }

    const newSpec = {
      id: generateId(),
      title: data.title,
      type:
        data.type ||
        DesignSpecSchema.properties.type.default,
      project_id: data.project_id,
      content: data.content || {},
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };

    mockDesignSpecs.unshift(newSpec);

    return newSpec;
  },

  /**
   * Update design spec
   */
  async update(id, data) {
    const idx = mockDesignSpecs.findIndex(
      (spec) => spec.id === id
    );

    if (idx === -1) {
      throw new Error("DesignSpec not found");
    }

    const updatedSpec = {
      ...mockDesignSpecs[idx],
      ...data,
      updated_date: new Date().toISOString(),
    };

    mockDesignSpecs[idx] = updatedSpec;

    return updatedSpec;
  },
};
