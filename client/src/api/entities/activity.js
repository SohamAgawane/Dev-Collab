// src/api/entities/activity.js

import ActivitySchema from "@/Entities/Activity.json";

// In-memory mock data store
let mockActivities = [
  {
    id: "a1",
    description: "Created the Dev Collab project",
    type: "project",
    project_id: "p1",
    entity_id: "p1",
    created_date: new Date().toISOString(),
  },
  {
    id: "a2",
    description: "Added initial task board",
    type: "task",
    project_id: "p1",
    entity_id: "t1",
    created_date: new Date().toISOString(),
  },
];

// Simple ID generator
const generateId = () => `a_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export const ActivityEntity = {
  // Exporting schema helps with future schema-designer / form-generator features
  schema: ActivitySchema,

  /**
   * Get all activity entries
   */
  async list() {
    return mockActivities;
  },

  /**
   * Filter activities (currently by project_id)
   */
  async filter({ project_id } = {}) {
    if (!project_id) return mockActivities;

    return mockActivities.filter(
      (activity) => activity.project_id === project_id
    );
  },

  /**
   * Create a new activity entry
   */
  async create(data) {
    // Basic runtime validation based on schema
    if (!data?.description || !data?.type) {
      throw new Error("Activity requires 'description' and 'type'");
    }

    if (
      !ActivitySchema.properties.type.enum.includes(data.type)
    ) {
      throw new Error(`Invalid activity type: ${data.type}`);
    }

    const newActivity = {
      id: generateId(),
      description: data.description,
      type: data.type,
      project_id: data.project_id || null,
      entity_id: data.entity_id || null,
      created_date: new Date().toISOString(),
    };

    // newest activity at the top
    mockActivities.unshift(newActivity);

    return newActivity;
  },
};
