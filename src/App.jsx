import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import Interview from "./pages/Interview";
import InterviewSetup from "./pages/InterviewSetup";

import Coding from "./pages/Coding";
import Report from "./pages/Report";
import CodingHistory from "./pages/CodingHistory";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";

function App() {
  console.log("APP UPDATED");
  console.log("ResumeAnalyzer =", ResumeAnalyzer);
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Interview Setup */}
        <Route
          path="/interview-setup"
          element={<InterviewSetup />}
        />

        {/* Interview Session (existing page for now) */}
        <Route
          path="/interview"
          element={<Interview />}
        />

        <Route
          path="/coding"
          element={<Coding />}
        />

        <Route
          path="/coding-history"
          element={<CodingHistory />}
        />

        <Route
          path="/report"
          element={<Report />}
        />

        <Route
    path="/resume"
    element={<ResumeAnalyzer />}
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;