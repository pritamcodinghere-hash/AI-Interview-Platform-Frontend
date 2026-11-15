import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import Interview from "./pages/Interview";
import InterviewSetup from "./pages/InterviewSetup";

import Coding from "./pages/Coding";
import Report from "./pages/Report";
import CodingHistory from "./pages/CodingHistory";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Learn from "./pages/Learn";
import WeeklyTest from "./pages/WeeklyTest";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-setup"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InterviewSetup />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Interview />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coding"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Coding />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coding-history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CodingHistory />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Report />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ResumeAnalyzer />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Learn />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/weekly-test"
          element={
            <ProtectedRoute>
              <AppLayout>
                <WeeklyTest />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
