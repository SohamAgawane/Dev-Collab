// src/api/base44Client.js
import { entities } from "./entities";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const base44 = {
  async get(url) { /* ... */ },
  async post(url, data) { /* ... */ },
  async put(url, data) { /* ... */ },
  async delete(url) { /* ... */ },

  auth: {
    async me() {
      return {
        id: "demo-user",
        full_name: "Demo User",
        avatar_url: null,
      };
    },
    logout() {
      console.log("Mock logout called");
    },
  },

  entities, // ✅ Chat / Projects now work
};
