import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import Navbar from "../components/Navbar";

import "../styles/InterviewSetup.css";

const ROLES = [
  { id: "java-fullstack", label: "Java Full Stack", icon: "☕", desc: "Java, Spring, React, DBs" },
  { id: "java-backend", label: "Java Backend", icon: "🛠️", desc: "Core Java, Spring Boot, APIs" },
  { id: "frontend", label: "Frontend Dev", icon: "🎨", desc: "React, JS, CSS, TS" },
  { id: "software-engineer", label: "Software Engineer", icon: "💻", desc: "DSA, OS, CS fundamentals" },
  { id: "aiml", label: "AIML Engineer", icon: "🤖", desc: "ML, Python, Data, Models" },
  { id: "devops", label: "DevOps Engineer", icon: "☁️", desc: "CI/CD, Docker, Cloud" },
  { id: "data-analyst", label: "Data Analyst", icon: "📊", desc: "SQL, Excel, Statistics" },
  { id: "product", label: "Product Manager", icon: "🚀", desc: "Strategy, Cases, Metrics" },
];

const EXPERIENCE = [
  { id: "Fresher", label: "Fresher", icon: "🌱", desc: "Just starting out" },
  { id: "1-2 Years", label: "1-2 Years", icon: "📈", desc: "Early career" },
  { id: "3-5 Years", label: "3-5 Years", icon: "⚡", desc: "Mid-level" },
  { id: "5+ Years", label: "5+ Years", icon: "🏆", desc: "Senior / lead" },
];

const DIFFICULTY = [
  { id: "Easy", label: "Easy", icon: "😊", desc: "Fundamentals", color: "#22c55e" },
  { id: "Medium", label: "Medium", icon: "🙂", desc: "Realistic mixed", color: "#f59e0b" },
  { id: "Hard", label: "Hard", icon: "😤", desc: "Deep & tricky", color: "#ef4444" },
];

const TOPICS = [
  { id: "Java", label: "Java" },
  { id: "DSA", label: "DSA" },
  { id: "OOP", label: "OOP" },
  { id: "System Design", label: "System Design" },
  { id: "DBMS", label: "DBMS" },
  { id: "HR", label: "HR" },
  { id: "Behavioral", label: "Behavioral" },
  { id: "Projects", label: "Projects" },
];

const COUNTS = [5, 10, 15, 20];
const TIME_LIMITS = [
  { id: 0, label: "No limit", desc: "Take your time" },
  { id: 60, label: "1 min", desc: "Quick rounds" },
  { id: 120, label: "2 min", desc: "Balanced" },
  { id: 300, label: "5 min", desc: "Deep answers" },
];

function InterviewSetup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("java-fullstack");
  const [customRole, setCustomRole] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [experience, setExperience] = useState("Fresher");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questions, setQuestions] = useState(10);
  const [timeLimit, setTimeLimit] = useState(120);
  const [voice, setVoice] = useState(true);
  const [topics, setTopics] = useState(["Java", "DSA", "OOP"]);
  const [micOk, setMicOk] = useState(null);

  // Mic permission pre-check
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          if (!cancelled) setMicOk(false);
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        if (!cancelled) setMicOk(true);
      } catch {
        if (!cancelled) setMicOk(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggleTopic = (id) => {
    setTopics(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const roleLabel = useCustom && customRole.trim()
    ? customRole.trim()
    : ROLES.find(r => r.id === role)?.label || role;

  const estMinutes = Math.ceil(questions * (timeLimit > 0 ? timeLimit / 60 + 0.5 : 2));

  const startInterview = () => {
    navigate("/interview", {
      state: {
        role: roleLabel,
        experience,
        difficulty,
        questions: Number(questions),
        timeLimit,
        voice,
        topics: topics.length ? topics.join(", ") : "General",
      }
    });
  };

  return (
    <div className="page-shell">
      <Navbar />
      <div className="page-container setup-page">

        <div className="page-header">
          <div className="page-header-left">
            <span className="badge-soft badge-blue">🎯 Configuration</span>
            <h1 className="page-title">Interview Setup</h1>
            <p className="page-subtitle">
              Configure your live AI mock interview — role, focus topics, timing and voice.
            </p>
          </div>
          <div className="page-actions">
            <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
          </div>
        </div>

        {/* Role */}
        <section className="setup-section fade-up">
          <h2 className="setup-section-title">Job Role</h2>
          <div className="setup-grid setup-grid-4">
            {ROLES.map(r => (
              <button
                key={r.id}
                type="button"
                className={`setup-card ${!useCustom && role === r.id ? "selected" : ""}`}
                onClick={() => { setRole(r.id); setUseCustom(false); }}
              >
                <span className="setup-card-icon">{r.icon}</span>
                <span className="setup-card-label">{r.label}</span>
                <span className="setup-card-desc">{r.desc}</span>
              </button>
            ))}
          </div>
          <div className="setup-custom">
            <label className="setup-custom-toggle">
              <input
                type="checkbox"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
              />
              Or type a custom role
            </label>
            {useCustom && (
              <input
                type="text"
                className="setup-custom-input"
                placeholder="e.g. Cloud Architect, Flutter Developer..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                maxLength={60}
              />
            )}
          </div>
        </section>

        {/* Experience + Difficulty */}
        <div className="setup-row">
          <section className="setup-section fade-up">
            <h2 className="setup-section-title">Experience</h2>
            <div className="setup-grid setup-grid-2">
              {EXPERIENCE.map(x => (
                <button
                  key={x.id}
                  type="button"
                  className={`setup-card ${experience === x.id ? "selected" : ""}`}
                  onClick={() => setExperience(x.id)}
                >
                  <span className="setup-card-icon">{x.icon}</span>
                  <span className="setup-card-label">{x.label}</span>
                  <span className="setup-card-desc">{x.desc}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="setup-section fade-up">
            <h2 className="setup-section-title">Difficulty</h2>
            <div className="setup-grid setup-grid-3">
              {DIFFICULTY.map(d => (
                <button
                  key={d.id}
                  type="button"
                  className={`setup-card ${difficulty === d.id ? "selected" : ""}`}
                  style={difficulty === d.id ? { borderColor: d.color, boxShadow: `0 0 0 1px ${d.color}40` } : undefined}
                  onClick={() => setDifficulty(d.id)}
                >
                  <span className="setup-card-icon">{d.icon}</span>
                  <span className="setup-card-label">{d.label}</span>
                  <span className="setup-card-desc">{d.desc}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Topics */}
        <section className="setup-section fade-up">
          <h2 className="setup-section-title">
            Focus Topics
            <span className="setup-section-hint">Pick one or more — AI mixes questions from these</span>
          </h2>
          <div className="setup-topics">
            {TOPICS.map(t => (
              <button
                key={t.id}
                type="button"
                className={`setup-chip ${topics.includes(t.id) ? "selected" : ""}`}
                onClick={() => toggleTopic(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* Count + timing + voice */}
        <div className="setup-row">
          <section className="setup-section fade-up">
            <h2 className="setup-section-title">Questions</h2>
            <div className="setup-counts">
              {COUNTS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`setup-count ${questions === c ? "selected" : ""}`}
                  onClick={() => setQuestions(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </section>

          <section className="setup-section fade-up">
            <h2 className="setup-section-title">Per-Question Time</h2>
            <div className="setup-times">
              {TIME_LIMITS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`setup-time ${timeLimit === t.id ? "selected" : ""}`}
                  onClick={() => setTimeLimit(t.id)}
                >
                  <strong>{t.label}</strong>
                  <span>{t.desc}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="setup-section fade-up">
            <h2 className="setup-section-title">Voice</h2>
            <button
              type="button"
              className={`setup-voice ${voice ? "on" : ""}`}
              onClick={() => setVoice(v => !v)}
            >
              <span className="setup-voice-icon">{voice ? "🔊" : "🔇"}</span>
              <span>
                <strong>{voice ? "Voice ON" : "Voice OFF"}</strong>
                <em>{voice ? "AI speaks questions · mic answers" : "Type answers only"}</em>
              </span>
            </button>
          </section>
        </div>

        {/* Pre-flight checklist */}
        <section className="setup-preflight fade-up">
          <h2 className="setup-section-title">Before You Start</h2>
          <ul className="setup-checklist">
            <li className={micOk === true ? "ok" : micOk === false ? "warn" : ""}>
              {micOk === true ? "✅" : micOk === false ? "⚠️" : "⏳"} Microphone{" "}
              {micOk === true ? "ready" : micOk === false ? "not available — you can still type answers" : "checking..."}
            </li>
            <li>⏱ Estimated duration: <strong>~{estMinutes} min</strong> ({questions} questions)</li>
            <li>🎯 Focus: <strong>{topics.length ? topics.join(", ") : "General"}</strong></li>
            <li>🧑‍💼 Role: <strong>{roleLabel}</strong> · {difficulty} · {experience}</li>
            <li>🔊 Voice: <strong>{voice ? "On" : "Off"}</strong>
              {timeLimit > 0 ? <> · <strong>{timeLimit >= 60 ? `${timeLimit / 60} min` : `${timeLimit}s`}</strong> per question</> : " · no time limit"}
            </li>
          </ul>

          <button className="btn-grad btn-block setup-start" onClick={startInterview}>
            🚀 Start Interview
          </button>
        </section>

      </div>
    </div>
  );
}

export default InterviewSetup;
