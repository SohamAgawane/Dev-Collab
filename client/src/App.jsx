// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Layout.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Chat from "./pages/Chat.jsx";
import Profile from "./pages/Profile.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import Projects from "./pages/Projects.jsx";
import Quill from "./pages/quill.jsx";
import Settings from "./pages/Settings.jsx";
import Team from "./pages/Team.jsx";
import Calendar from "./pages/Calendar.jsx";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Dashboard as home */}
          <Route path="/" element={<Dashboard />} />

          {/* Project related */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />

          {/* Team & chat */}
          <Route path="/team" element={<Team />} />
          <Route path="/chat" element={<Chat />} />

          {/* Calender */}
          <Route path="/calendar" element={<Calendar />} />

          {/* Profile & settings */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          {/* Quill editor page */}
          <Route path="/editor" element={<Quill />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
