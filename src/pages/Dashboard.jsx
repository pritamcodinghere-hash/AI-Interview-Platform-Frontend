import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

import ProgressChart from "../components/ProgressChart";
import questions from "../data/questions";

import {
  FaMicrophone,
  FaCode,
  FaChartBar,
  FaStar,
  FaFileAlt,
  FaPlay,
  FaSignOutAlt,
} from "react-icons/fa";

import "../styles/Dashboard.css";

const MODULES = [
  { key: "overview", label: "Overview", icon: "🏠", color: "#3b82f6" },
  { key: "interview", label: "AI Interview", icon: "🎤", color: "#8b5cf6" },
  { key: "coding", label: "Coding Round", icon: "💻", color: "#22c55e" },
  { key: "learn", label: "Learn", icon: "📚", color: "#06b6d4" },
  { key: "weeklytest", label: "Weekly Test", icon: "🏆", color: "#f59e0b" },
  { key: "reports", label: "Reports", icon: "📊", color: "#f59e0b" },
  { key: "resume", label: "Resume Analyzer", icon: "📄", color: "#ef4444" },
];

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const TOPICS = ["All", ...new Set(questions.map(q => q.topic))];
const DIFF_COLOR = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };

function CodingBrowser({ onSelect }) {
  const [difficulty, setDifficulty] = useState("All");
  const [topic, setTopic] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = questions.filter(q => {
    if (difficulty !== "All" && q.difficulty !== difficulty) return false;
    if (topic !== "All" && q.topic !== topic) return false;
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="module-content">
      <div className="module-header">
        <h2>💻 Coding Round</h2>
        <p>Solve coding questions and improve your DSA skills.</p>
      </div>

      <div className="browser-filters">
        <input type="text" placeholder="🔍 Search problems..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="browser-count">{filtered.length} problems</span>
      </div>

      <div className="browser-layout">
        <div className="browser-list">
          {filtered.map(q => (
            <button key={q.id} className={`browser-row ${selected?.id === q.id ? "browser-row-active" : ""}`} onClick={() => setSelected(q)}>
              <span className="browser-id">#{q.id}</span>
              <span className="browser-title">{q.title}</span>
              <span className="browser-diff" style={{ color: DIFF_COLOR[q.difficulty] }}>● {q.difficulty}</span>
              <span className="browser-topic">{q.topic}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="browser-empty">No problems match your filters.</div>
          )}
        </div>

        <div className="browser-preview">
          {selected ? (
            <div className="bp-card">
              <div className="bp-header">
                <div className="bp-icon">💻</div>
                <div>
                  <h3>{selected.title}</h3>
                  <div className="bp-meta">
                    <span style={{ color: DIFF_COLOR[selected.difficulty] }}>● {selected.difficulty}</span>
                    <span>{selected.topic}</span>
                  </div>
                </div>
              </div>
              <p className="bp-desc">{selected.problem}</p>
              {selected.examples?.[0] && (
                <div className="bp-example">
                  <div className="bp-ex-label">Example</div>
                  <div><b>Input:</b> <code>{selected.examples[0].input}</code></div>
                  <div><b>Output:</b> <code>{selected.examples[0].output}</code></div>
                </div>
              )}
              <button className="bp-start" onClick={() => onSelect(selected)}>
                <FaPlay /> Start Coding Interview
              </button>
            </div>
          ) : (
            <div className="bp-empty">
              <div className="bp-empty-icon">👈</div>
              <p>Select a problem to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  let name;
  try { name = localStorage.getItem("name") || "Guest"; } catch { name = "Guest"; }

  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("overview");
  const [stats, setStats] = useState({ totalInterviews: 0, codingAttempts: 0, reports: 0, resumes: 0, averageScore: 0 });
  const [overview, setOverview] = useState({
    weeklyProgress: [],
    streakDays: 0,
    problemsSolved: 0,
    totalProblems: 150,
    weeklyGoal: 20,
    goalStatus: "Not started",
    nextMilestone: 10,
    recentActivities: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [statsRes, overviewRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/overview"),
        ]);
        if (active) {
          setStats(statsRes.data);
          setOverview(overviewRes.data);
        }
      } catch (e) {
        const msg = e.response?.data?.message || e.message || "Failed to load";
        if (active) setError(typeof msg === "string" ? msg : "Error");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleCodingSelect = (q) => {
    navigate(`/coding?q=${q.id}`);
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("name");
    } catch { /* ignore */ }
    navigate("/", { replace: true });
  };

  return (
    <div className="dashboard">
      <div className="dash-layout">
        {/* Left Sidebar */}
        <aside className="dash-sidebar">
          <div className="sidebar-greeting">
            <div className="sidebar-avatar">{name[0]?.toUpperCase()}</div>
            <div>
              <div className="sidebar-name">{name}</div>
              <div className="sidebar-role">Placement Prep</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {MODULES.map(m => (
              <button
                key={m.key}
                className={`sidebar-item ${activeModule === m.key ? "sidebar-active" : ""}`}
                onClick={() => {
                  if (m.key === "resume") {
                    navigate("/resume");
                  } else if (m.key === "learn") {
                    navigate("/learn");
                  } else if (m.key === "weeklytest") {
                    navigate("/weekly-test");
                  } else {
                    setActiveModule(m.key);
                  }
                }}
              >
                <span className="sidebar-icon">{m.icon}</span>
                <span className="sidebar-label">{m.label}</span>
                {activeModule === m.key && <span className="sidebar-bar" style={{ background: m.color }} />}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <Link to="/learn" className="sidebar-link">📚 Learn</Link>
            <Link to="/weekly-test" className="sidebar-link">🏆 Weekly Test</Link>
            <Link to="/coding-history" className="sidebar-link">🕘 Coding History</Link>
            <Link to="/report" className="sidebar-link">🎤 Interview History</Link>
            <Link to="/interview-setup" className="sidebar-link">🎯 Quick Setup</Link>
            <button className="sidebar-link sidebar-logout" onClick={logout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        {/* Right Content */}
        <main className="dash-content">
          {error && <div className="alert alert-danger-custom">{error}</div>}

          {loading ? (
            <div className="loading-block">
              <div className="spinner" />
              Loading...
            </div>
          ) : (
            <>
              {/* Overview Module */}
              {activeModule === "overview" && (
                <div className="module-content">
                  <div className="ov-hero">
                    <div className="ov-hero-text">
                      <span className="hero-badge">✦ AI-powered preparation</span>
                      <h1>Welcome back, {name} 👋</h1>
                      <p>Practice AI interviews, solve coding questions and get placement ready.</p>
                      <div className="ov-hero-actions">
                        <button className="ov-btn ov-btn-primary" onClick={() => setActiveModule("interview")}>
                          <FaMicrophone /> Start Interview
                        </button>
                        <button className="ov-btn ov-btn-secondary" onClick={() => setActiveModule("coding")}>
                          <FaCode /> Solve Problems
                        </button>
                      </div>
                    </div>
                    <div className="ov-hero-stats">
                      <div className="ov-hero-stat">
                        <span className="ov-hero-stat-value">{stats.totalInterviews}</span>
                        <span className="ov-hero-stat-label">Interviews</span>
                      </div>
                      <div className="ov-hero-stat">
                        <span className="ov-hero-stat-value">{overview.problemsSolved}</span>
                        <span className="ov-hero-stat-label">Solved</span>
                      </div>
                      <div className="ov-hero-stat">
                        <span className="ov-hero-stat-value">{Math.round(stats.averageScore)}%</span>
                        <span className="ov-hero-stat-label">Avg Score</span>
                      </div>
                    </div>
                  </div>

                  <div className="ov-stats-grid">
                    <div className="ov-stat-card" style={{ "--card-accent": "#3b82f6" }}>
                      <div className="ov-stat-icon"><FaMicrophone /></div>
                      <div className="ov-stat-body">
                        <div className="ov-stat-value">{stats.totalInterviews}</div>
                        <div className="ov-stat-title">Interviews</div>
                      </div>
                      <div className="ov-stat-trend">AI sessions</div>
                    </div>
                    <div className="ov-stat-card" style={{ "--card-accent": "#22c55e" }}>
                      <div className="ov-stat-icon"><FaCode /></div>
                      <div className="ov-stat-body">
                        <div className="ov-stat-value">{stats.codingAttempts}</div>
                        <div className="ov-stat-title">Coding Attempts</div>
                      </div>
                      <div className="ov-stat-trend">Submissions</div>
                    </div>
                    <div className="ov-stat-card" style={{ "--card-accent": "#f59e0b" }}>
                      <div className="ov-stat-icon"><FaChartBar /></div>
                      <div className="ov-stat-body">
                        <div className="ov-stat-value">{stats.reports}</div>
                        <div className="ov-stat-title">Reports</div>
                      </div>
                      <div className="ov-stat-trend">Generated</div>
                    </div>
                    <div className="ov-stat-card" style={{ "--card-accent": "#8b5cf6" }}>
                      <div className="ov-stat-icon"><FaFileAlt /></div>
                      <div className="ov-stat-body">
                        <div className="ov-stat-value">{stats.resumes}</div>
                        <div className="ov-stat-title">Resumes</div>
                      </div>
                      <div className="ov-stat-trend">Analyzed</div>
                    </div>
                    <div className="ov-stat-card" style={{ "--card-accent": "#ef4444" }}>
                      <div className="ov-stat-icon"><FaStar /></div>
                      <div className="ov-stat-body">
                        <div className="ov-stat-value">{Math.round(stats.averageScore)}%</div>
                        <div className="ov-stat-title">Avg Score</div>
                      </div>
                      <div className="ov-stat-trend">Performance</div>
                    </div>
                  </div>

                  <div className="ov-panels">
                    <div className="ov-panel ov-panel-chart">
                      <div className="ov-panel-head">
                        <h3>📈 Weekly Progress</h3>
                      </div>
                      <ProgressChart data={overview.weeklyProgress} />
                    </div>

                    <div className="ov-panel ov-panel-side">
                      <div className="ov-panel-head">
                        <h3>🔥 Daily Streak</h3>
                      </div>
                      <div className="ov-streak-box">
                        <div className="ov-streak-days">{overview.streakDays} <span>{overview.streakDays === 1 ? "Day" : "Days"}</span></div>
                        <div className="ov-streak-meta">
                          <div className="ov-streak-row">
                            <span>🏆 Problems solved</span>
                            <strong>{overview.problemsSolved} / {overview.totalProblems}</strong>
                          </div>
                          <div className="ov-streak-bar">
                            <div className="ov-streak-fill" style={{ width: `${Math.min(100, (overview.problemsSolved / overview.totalProblems) * 100)}%` }} />
                          </div>
                          <div className="ov-streak-row">
                            <span>⭐ Weekly goal</span>
                            <strong>{overview.goalStatus}</strong>
                          </div>
                          <div className="ov-streak-row">
                            <span>🎯 Next milestone</span>
                            <strong>{overview.nextMilestone} problems</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Interview Module */}
              {activeModule === "interview" && (
                <div className="module-content">
                  <div className="module-header">
                    <h2>🎤 AI Interview</h2>
                    <p>Pick a role and difficulty, then practice with AI.</p>
                  </div>
                  <div className="module-cards">
                    <Link to="/interview-setup" className="module-card">
                      <div className="module-card-icon">🎯</div>
                      <h3>Quick Setup</h3>
                      <p>Configure your interview parameters and start.</p>
                      <span className="module-card-btn">Setup & Start →</span>
                    </Link>
                    <Link to="/interview" className="module-card">
                      <div className="module-card-icon">🎙️</div>
                      <h3>Start Interview</h3>
                      <p>Jump into an AI-powered mock interview.</p>
                      <span className="module-card-btn">Start Now →</span>
                    </Link>
                    <Link to="/report" className="module-card">
                      <div className="module-card-icon">🕘</div>
                      <h3>Interview History</h3>
                      <p>Review your past AI mock interview sessions and reports.</p>
                      <span className="module-card-btn">View History →</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Coding Round Module */}
              {activeModule === "coding" && (
                <CodingBrowser onSelect={handleCodingSelect} />
              )}

              {/* Reports Module */}
              {activeModule === "reports" && (
                <div className="module-content">
                  <div className="module-header">
                    <h2>📊 Reports</h2>
                    <p>Track interview performance and AI feedback.</p>
                  </div>
                  <div className="module-cards">
                    <Link to="/report" className="module-card">
                      <div className="module-card-icon">📋</div>
                      <h3>All Reports</h3>
                      <p>View detailed performance reports.</p>
                      <span className="module-card-btn">View Reports →</span>
                    </Link>
                    <div className="module-card">
                      <div className="module-card-icon">📈</div>
                      <h3>Performance</h3>
                      <p>Average score: {Math.round(stats.averageScore)}%</p>
                      <span className="module-card-stat">{stats.reports} reports</span>
                    </div>
                    <div className="module-card">
                      <div className="module-card-icon">🎯</div>
                      <h3>Interviews</h3>
                      <p>Total interviews completed.</p>
                      <span className="module-card-stat">{stats.totalInterviews} sessions</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Resume Analyzer Module */}
              {activeModule === "resume" && (
                <div className="module-content">
                  <div className="module-header">
                    <h2>📄 Resume Analyzer</h2>
                    <p>Upload your resume and get AI feedback.</p>
                  </div>
                  <div className="module-cards">
                    <Link to="/resume" className="module-card">
                      <div className="module-card-icon">📤</div>
                      <h3>Upload Resume</h3>
                      <p>Analyze your resume with AI-powered insights.</p>
                      <span className="module-card-btn">Analyze Now →</span>
                    </Link>
                    <div className="module-card">
                      <div className="module-card-icon">📊</div>
                      <h3>Previous Analysis</h3>
                      <p>{stats.resumes} resumes analyzed.</p>
                      <span className="module-card-stat">{stats.resumes} uploads</span>
                    </div>
                  </div>
                </div>
              )}

            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
