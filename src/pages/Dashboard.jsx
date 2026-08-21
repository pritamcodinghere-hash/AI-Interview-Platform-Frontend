import { useEffect, useState } from "react";
import api from "../services/api";

import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import FeatureCard from "../components/FeatureCard";
import ProgressChart from "../components/ProgressChart";
import StreakCard from "../components/StreakCard";
import RecentActivity from "../components/RecentActivity";

import {
  FaMicrophone,
  FaCode,
  FaChartBar,
  FaStar,
  FaFileAlt,
} from "react-icons/fa";

import "../styles/Dashboard.css";

function Dashboard() {
  let name = "Happy";
  try {
    name = localStorage.getItem("name") || "Happy";
  } catch {
    name = "Happy";
  }

  const [stats, setStats] = useState({
    totalInterviews: 0,
    codingAttempts: 0,
    reports: 0,
    resumes: 0,
    averageScore: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data || e.message || "Failed to load dashboard";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Navbar />
      {error && <div className="alert alert-danger m-3">{error}</div>}
      {loading && <div className="text-center p-3">Loading...</div>}

      <section className="hero">
        <h1>Welcome Back, {name} 👋</h1>

        <p>
          Practice AI interviews, solve coding questions and get placement ready.
        </p>
      </section>

      <section className="stats">

        <StatsCard
          icon={<FaMicrophone />}
          title="Interviews"
          value={stats.totalInterviews}
          color="#3b82f6"
        />

        <StatsCard
          icon={<FaCode />}
          title="Coding"
          value={stats.codingAttempts}
          color="#22c55e"
        />

        <StatsCard
          icon={<FaChartBar />}
          title="Reports"
          value={stats.reports}
          color="#f59e0b"
        />

        <StatsCard
          icon={<FaFileAlt />}
          title="Resumes"
          value={stats.resumes}
          color="#8b5cf6"
        />

        <StatsCard
          icon={<FaStar />}
          title="Average Score"
          value={`${Math.round(stats.averageScore)}%`}
          color="#ef4444"
        />

      </section>

      <section className="features">

        <FeatureCard
          icon="🎤"
          title="AI Interview"
          description="Practice HR and Technical interviews with AI."
          button="Start Interview"
          link="/interview"
        />

        <FeatureCard
          icon="💻"
          title="Coding Round"
          description="Solve coding questions and improve DSA."
          button="Start Coding"
          link="/coding"
        />

        <FeatureCard
          icon="📊"
          title="Reports"
          description="Track interview performance and AI feedback."
          button="View Reports"
          link="/report"
        />

        <FeatureCard
          icon="📄"
          title="Resume Analyzer"
          description="Upload your resume and get AI feedback."
          button="Analyze Resume"
          link="/resume"
        />

      </section>

      <section className="chart-section">
        <ProgressChart />
      </section>

      <section className="bottom-section">
        <StreakCard />
        <RecentActivity />
      </section>

    </div>
  );
}

export default Dashboard;