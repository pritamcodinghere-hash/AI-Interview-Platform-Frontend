import { useState } from "react";
import api from "../services/api";

function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [error, setError] = useState("");

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

    return (

        <div
            style={{
                background: "#0f172a",
                minHeight: "100vh",
                color: "white",
                padding: "40px"
            }}
        >

            <h1>📄 AI Resume Analyzer</h1>

            <p>
                Upload your resume and receive an ATS Score,
                HR Feedback and AI Suggestions.
            </p>

            <br />

            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />

            <br />
            <br />

            {error && <div className="alert alert-danger">{typeof error === "string" ? error : JSON.stringify(error)}</div>}

            <button
                onClick={uploadResume}
                disabled={loading}
                style={{
                    padding: "15px 35px",
                    border: "none",
                    borderRadius: "10px",
                    background: loading ? "#64748b" : "#2563eb",
                    color: "white",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "18px"
                }}
            >
                {loading ? "Analyzing..." : "Analyze Resume"}
            </button>

            <br />
            <br />

            {loading && (

                <h2>
                    🤖 Gemini AI is analyzing your Resume...
                </h2>

            )}

            {!loading && result !== "" && (

                <div
                    style={{
                        background: "#1e293b",
                        padding: "25px",
                        borderRadius: "15px",
                        marginTop: "20px"
                    }}
                >

                    <h2>Analysis Report</h2>

                    <hr />

                    <pre
                        style={{
                            whiteSpace: "pre-wrap",
                            fontSize: "16px",
                            lineHeight: "30px"
                        }}
                    >
                        {result}
                    </pre>

                </div>

            )}

        </div>

    );

}

export default ResumeAnalyzer;