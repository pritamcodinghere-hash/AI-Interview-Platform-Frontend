import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

import Navbar from "../components/Navbar";

import "../styles/CodingHistory.css";

function CodingHistory() {

  const [attempts, setAttempts] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get("/submission/submissions");
        if (active) setAttempts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (active) setError(err.response?.data?.message || err.response?.data || "Unable to load coding history.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (

    <div className="page-shell">

      <Navbar />

      <div className="page-container">

        <div className="page-header">

          <div className="page-header-left">

            <span className="badge-soft badge-green">💻 Coding</span>

            <h1 className="page-title">Coding History</h1>

            <p className="page-subtitle">

              Every submission you&apos;ve made, with scores and AI feedback.

            </p>

          </div>

          <div className="page-actions">

            <Link to="/coding" className="btn-grad">

              🚀 Solve Another

            </Link>

            <Link to="/dashboard" className="btn-ghost">

              Dashboard

            </Link>

          </div>

        </div>

        {loading && (

          <div className="loading-block">

            <div className="spinner" />

            Loading your history...

          </div>

        )}

        {error && (

          <div className="alert alert-danger-custom">

            {typeof error === "string" ? error : JSON.stringify(error)}

          </div>

        )}

        {!loading && !error && attempts.length === 0 && (

          <div className="content-card empty-state fade-up">

            <div className="empty-icon">🗂️</div>

            <h3>No coding attempts yet</h3>

            <p>Solve your first problem to start building your history.</p>

            <Link to="/coding" className="btn-grad" style={{ marginTop: 18 }}>

              Start Coding

            </Link>

          </div>

        )}

        {!loading && attempts.map((attempt, index) => {
          const passed = attempt.passed || 0;
          const total = attempt.total || 0;
          const score = attempt.score || 0;
          const status = total > 0 && passed === total ? "completed" : "failed";

          return (
            <div
              className={`attempt-card ${status}`}
              key={attempt.id}
              style={{ animationDelay: `${Math.min(index * 0.06, 0.4)}s` }}
            >
              <div className="attempt-head">
                <h3>💻 {attempt.question}</h3>
                <span className="attempt-score">
                  {score}
                  <small>/100</small>
                </span>
              </div>

              <div className="attempt-grid">
                <div className="attempt-cell">
                  <span>Submitted At</span>
                  <strong>
                    {attempt.submittedAt
                      ? new Date(attempt.submittedAt).toLocaleString()
                      : "—"}
                  </strong>
                </div>

                <div className="attempt-cell">
                  <span>Status</span>
                  <strong style={{ color: status === "completed" ? "#34d399" : "#f87171" }}>
                    {status === "completed" ? "✅ Completed" : "❌ Failed"}
                  </strong>
                </div>

                <div className="attempt-cell">
                  <span>Language</span>
                  <strong>{attempt.language || "—"}</strong>
                </div>

                <div className="attempt-cell">
                  <span>Test Cases</span>
                  <strong>{passed}/{total}</strong>
                </div>
              </div>

              {attempt.feedback && (
                <>
                  <div className="problem-block">
                    <b>AI Feedback</b>
                  </div>
                  <pre className="pre-wrap">{attempt.feedback}</pre>
                </>
              )}
            </div>
          );
        })}

      </div>

    </div>

  );

}

export default CodingHistory;
