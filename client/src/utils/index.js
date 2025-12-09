// src/utils/index.js

/**
 * Creates internal URLs for routing pages.
 * Example:
 *   createPageUrl("Projects") -> "/projects"
 *   createPageUrl("ProjectDetail", { id: "123" })
 *        -> "/projects/123"
 */

export function createPageUrl(page, params = {}) {
    const baseRoutes = {
      Dashboard: "/",
      Projects: "/projects",
      ProjectDetail: "/projects/:projectId",
      Chat: "/chat",
      Team: "/team",
      Profile: "/profile",
      Settings: "/settings",
      Editor: "/editor",
    };
  
    let path = baseRoutes[page] || "/";
  
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
  
    return path;
  }
  