import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

import Navbar from "../components/Navbar";

import "../styles/Report.css";

function Report() {

    const [report, setReport] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const generateReport = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.post("/reports/generate");
            setReport(res.data);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || "Unable to generate report.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await api.get("/reports");
                if (!active) return;
                if (Array.isArray(res.data) && res.data.length > 0) {
                    const sorted = [...res.data].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
                    setReports(sorted);
                    setReport(sorted[sorted.length - 1]);
                } else if (res.data && res.data.report) {
                    setReport(res.data);
                }
            } catch (err) {
                if (active) setError(err.response?.data?.message || "Failed to load reports");
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

                        <span className="badge-soft badge-blue">📊 Performance</span>

                        <h1 className="page-title">Interview Report</h1>

                        <p className="page-subtitle">

                            AI-generated analysis of your interview sessions

                            with strengths, weaknesses and hiring recommendations.

                        </p>

                    </div>

                    <div className="page-actions">

                        <button

                            className="btn-grad"

                            onClick={generateReport}

                            disabled={loading}

                        >

                            {loading ? "Generating..." : "✦ Generate AI Report"}

                        </button>

                        <Link to="/dashboard" className="btn-ghost">

                            Dashboard

                        </Link>

                    </div>

                </div>

                {error && (

                    <div className="alert alert-danger-custom">

                        {typeof error === "string" ? error : JSON.stringify(error)}

                    </div>

                )}

                {/* Interview History */}
                {reports.length > 0 && (
                    <section className="report-history fade-up">
                        <h2 className="report-history-title">📋 Interview History</h2>
                        <p className="report-history-sub">
                            {reports.length} past session{reports.length !== 1 ? "s" : ""} · click to preview
                        </p>
                        <div className="report-history-list">
                            {reports.map((r, i) => (
                                <button
                                    key={r.id || i}
                                    type="button"
                                    className={`report-history-item ${report?.id === r.id ? "selected" : ""}`}
                                    onClick={() => setReport(r)}
                                >
                                    <div className="report-history-item-top">
                                        <strong>#{reports.length - i}</strong>
                                        <span className="report-history-score">{r.score ?? "—"}{r.score != null ? "/10" : ""}</span>
                                    </div>
                                    <span className="report-history-date">
                                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                                    </span>
                                    {r.strengths && (
                                        <span className="report-history-preview">
                                            {r.strengths.slice(0, 80)}…
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {loading && (

                    <div className="loading-block">

                        <div className="spinner" />

                        🤖 AI is generating your report...

                    </div>

                )}

                {report && !loading ? (

                    <div className="content-card report-card fade-up">

                        <div className="report-card-head">

                            <h2 className="section-title">📝 Interview Analysis</h2>

                            <span className="badge-soft badge-green">✓ Generated</span>

                        </div>

                        <pre className="pre-wrap">{report.report}</pre>

                        <div className="report-meta">

                            <span className="badge-soft">

                                🕘 Generated At:{" "}

                                {report.createdAt

                                    ? new Date(report.createdAt).toLocaleString()

                                    : "—"}

                            </span>

                        </div>

                    </div>

                ) : (

                    !loading && (

                        <div className="content-card empty-state fade-up">

                            <div className="empty-icon">📊</div>

                            <h3>No report yet</h3>

                            <p>

                                Complete an AI interview or hit

                                &quot;Generate AI Report&quot; to create one.

                            </p>

                        </div>

                    )

                )}

            </div>

        </div>

    );

}

export default Report;
