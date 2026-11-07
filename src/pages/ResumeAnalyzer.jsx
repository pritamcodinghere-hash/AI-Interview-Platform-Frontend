import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

import Navbar from "../components/Navbar";

import "../styles/Report.css";

function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    const uploadResume = async () => {
        setError("");
        if (!file) {
            setError("Please select a PDF Resume");
            return;
        }
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            setError("Only PDF files are allowed");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError("File too large. Max 10MB");
            return;
        }
        const formData = new FormData();
        formData.append("resume", file);
        try {
            setLoading(true);
            setResult("");
            const response = await api.post("/resume/analyze", formData, {
                headers: { "Content-Type": undefined },
            });
            setResult(response.data);
        } catch (e) {
            const status = e.response?.status;
            if (status === 413) setError("File too large");
            else if (status === 415) setError("Invalid file type. Please upload PDF");
            else if (status === 401) setError("Unauthorized. Please login again");
            else setError(e.response?.data?.message || e.response?.data || "Resume Analysis Failed");
        } finally {
            setLoading(false);
        }
    };

    const onPick = (e) => {
        const picked = e.target.files?.[0];
        if (picked) setFile(picked);
    };

    return (

        <div className="page-shell">

            <Navbar />

            <div className="page-container">

                <div className="page-header">

                    <div className="page-header-left">

                        <span className="badge-soft badge-purple">📄 ATS Analysis</span>

                        <h1 className="page-title">AI Resume Analyzer</h1>

                        <p className="page-subtitle">

                            Upload your resume and receive an ATS Score,

                            HR Feedback and AI Suggestions.

                        </p>

                    </div>

                    <div className="page-actions">

                        <Link to="/dashboard" className="btn-ghost">

                            Dashboard

                        </Link>

                    </div>

                </div>

                <div className="resume-layout">

                    <div className="content-card fade-up">

                        <div

                            className={`upload-zone${file ? " has-file" : ""}`}

                            onClick={() => inputRef.current?.click()}

                        >

                            <input

                                ref={inputRef}

                                type="file"

                                accept=".pdf"

                                onChange={onPick}

                                style={{ display: "none" }}

                            />

                            <div className="upload-icon">📄</div>

                            <h3>

                                {file ? file.name : "Drop your resume here"}

                            </h3>

                            <p>

                                {file

                                    ? `${(file.size / 1024).toFixed(1)} KB — ready to analyze`

                                    : "or click to browse · PDF only · max 10MB"}

                            </p>

                        </div>

                        {error && (

                            <div className="alert alert-danger-custom">

                                {typeof error === "string" ? error : JSON.stringify(error)}

                            </div>

                        )}

                        <button

                            className="btn-grad btn-block"

                            onClick={uploadResume}

                            disabled={loading}

                            style={{ marginTop: 18, padding: "15px 26px" }}

                        >

                            {loading ? "Analyzing..." : "✨ Analyze Resume"}

                        </button>

                        {loading && (

                            <div className="loading-block" style={{ padding: "30px 10px" }}>

                                <div className="spinner" />

                                🤖 AI is analyzing your resume...

                            </div>

                        )}

                    </div>

                    <div className="content-card fade-up">

                        <h2 className="section-title">📊 Analysis Report</h2>

                        {result ? (

                            <pre className="pre-wrap" style={{ maxHeight: "70vh", margin: 0 }}>

                                {result}

                            </pre>

                        ) : (

                            <div className="empty-state" style={{ padding: "40px 10px" }}>

                                <div className="empty-icon">🪄</div>

                                <h3>Nothing to show yet</h3>

                                <p>

                                    Upload a PDF and hit Analyze to get your ATS

                                    score, skill gaps and hiring chances.

                                </p>

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );

}

export default ResumeAnalyzer;
