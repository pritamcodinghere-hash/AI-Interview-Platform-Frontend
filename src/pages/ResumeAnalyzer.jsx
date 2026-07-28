import { useState } from "react";
import axios from "axios";

function ResumeAnalyzer() {

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");

    const uploadResume = async () => {

        if (!file) {
            alert("Please select a PDF Resume");
            return;
        }

        const formData = new FormData();
        formData.append("resume", file);

        try {

            setLoading(true);

            const response = await axios.post(
                "http://localhost:8080/api/resume/analyze",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setResult(response.data);

        } catch (e) {

            console.log(e);

            alert("Resume Analysis Failed");

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

            <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
            />

            <br />
            <br />

            <button
                onClick={uploadResume}
                style={{
                    padding: "15px 35px",
                    border: "none",
                    borderRadius: "10px",
                    background: "#2563eb",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "18px"
                }}
            >
                Analyze Resume
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