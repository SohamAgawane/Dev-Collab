import ProjectSchema from "@/Entities/Project.json";

let mockProjects = [
  {
    id: "p1",
    name: "Dev Collab",
    description: "Engineering collaboration workspace",
    status: "active",
    visibility: "private",
    created_date: new Date().toISOString(),
  },
  {
    id: "p2",
    name: "Design System",
    description: "Shared design components",
    status: "on_hold",
    visibility: "public",
    created_date: new Date().toISOString(),
  },
];

export const ProjectEntity = {
  schema: ProjectSchema, // useful later for schema designer

  async list(order = "-created_date", limit = 50) {
    // you can sort by date here if you want
    return mockProjects.slice(0, limit);
  },

  async create(data) {
    const newProject = {
      id: `p_${Date.now()}`,
      created_date: new Date().toISOString(),
      ...data,
    };
    mockProjects.push(newProject);
    return newProject;
  },
};
