import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";

function Interview() {
    const location = useLocation();
    const setup = location.state || {};
    const [email, setEmail] = useState(() => {
        try { return localStorage.getItem("email") || ""; } catch { return ""; }
    });

    const [answer, setAnswer] = useState("");

    const [conversation, setConversation] = useState([
        {
            sender: "AI",
            message:
                "👋 Hello! I am your AI Interviewer. Tell me about yourself."
        }
    ]);

    const [questionNumber, setQuestionNumber] = useState(1);

    const [domain] = useState(setup.role || "Java");
    const [difficulty] = useState(setup.difficulty || "Medium");
    // totalQuestions already defined above via setup, fallback 10 if not set
    const effectiveTotal = setup.questions || 10;

    const [seconds, setSeconds] = useState(0);

    const [thinking, setThinking] = useState(false);

    const [technicalScore, setTechnicalScore] = useState(0);

    const [communicationScore, setCommunicationScore] = useState(0);

    const [confidenceScore, setConfidenceScore] = useState(0);

    const [strengths, setStrengths] = useState("");

    const [weaknesses, setWeaknesses] = useState("");

    const [suggestions, setSuggestions] = useState("");

    const [report, setReport] = useState(null);
    const [interviewError, setInterviewError] = useState("");
    const timerRef = useRef(null);

    useEffect(() => {
        timerRef.current = setInterval(() => setSeconds(prev => prev + 1), 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const formatTime = () => {

        const minutes = Math.floor(seconds / 60);

        const secs = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    };
    const askQuestion = async () => {
    setInterviewError("");
    const storedEmail = (() => { try { return localStorage.getItem("email"); } catch { return null; }})();
    const effectiveEmail = (email || storedEmail || "").trim();
    if (!effectiveEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(effectiveEmail)) {
        setInterviewError("Please enter a valid email. Login email will be used.");
        return;
    }
    if (effectiveEmail !== email) setEmail(effectiveEmail);
    if (!answer.trim()) {
        setInterviewError("Please enter your answer.");
        return;
    }
    try {
        setThinking(true);
        const currentAnswer = answer;
        const chatResponse = await api.post("/interview/chat", { message: currentAnswer });
        const aiReply = chatResponse.data.reply || chatResponse.data.response || chatResponse.data.message || "No reply";
        setConversation(prev => [...prev, { sender: "You", message: currentAnswer }, { sender: "AI", message: aiReply }]);
        const evaluationResponse = await api.post("/interview/evaluate", { question: aiReply, answer: currentAnswer });
        const evaluation = evaluationResponse.data;
        setTechnicalScore(evaluation.technicalScore ?? 0);
        setCommunicationScore(evaluation.communicationScore ?? 0);
        setConfidenceScore(evaluation.confidenceScore ?? 0);
        setStrengths(evaluation.strengths || "");
        setWeaknesses(evaluation.weaknesses || "");
        setSuggestions(evaluation.suggestions || "");
        setQuestionNumber(prev => prev + 1);
        setAnswer("");
    } catch (e) {
        const msg = e.response?.data?.message || e.response?.data || e.message || "Interview Failed";
        setInterviewError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
        setThinking(false);
    }
};

    const finishInterview = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const overall = Math.round((technicalScore + communicationScore + confidenceScore) / 3);
        const effectiveEmail = (() => { try { return email || localStorage.getItem("email") || ""; } catch { return email; }})();
        const reportData = {
            email: effectiveEmail, domain, difficulty, technicalScore, communicationScore, confidenceScore, overallScore: overall, strengths, weaknesses, suggestions
        };
        try {
            await api.post("/reports/generate", reportData);
        } catch {
            // fallback: still show local report if backend not available
        }
        try {
            const existing = JSON.parse(localStorage.getItem("interview_reports") || "[]");
            existing.push({ ...reportData, createdAt: new Date().toISOString() });
            localStorage.setItem("interview_reports", JSON.stringify(existing));
        } catch {
            // ignore
        }
        setReport(reportData);
    };
        return (

        <>

            <div
                style={{
                    background: "#0f172a",
                    minHeight: "100vh",
                    padding: "30px",
                    color: "white"
                }}
            >

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "25px"
                    }}
                >

                    <div>

                        <h1>🤖 AI Mock Interview</h1>

                        <p>👤 Candidate : {email || "Candidate"}</p>

                        <p>💻 Domain : {domain}</p>

                        <p>⭐ Difficulty : {difficulty}</p>

                    </div>

                    <div
                        style={{
                            background: "#1e293b",
                            padding: "20px",
                            borderRadius: "12px",
                            textAlign: "center"
                        }}
                    >

                        <h2>{formatTime()}</h2>

                        <p>Interview Timer</p>

                    </div>

                </div>

                <h3>
                    Question {questionNumber} / {effectiveTotal}
                </h3>
                <div style={{ width: "100%", height: "15px", background: "#334155", borderRadius: "10px", marginBottom: "25px" }}>
                    <div style={{ width: `${(questionNumber / effectiveTotal) * 100}%`, height: "15px", background: "#22c55e", borderRadius: "10px" }} />
                </div>
                {interviewError && <div className="alert alert-danger">{interviewError}</div>}
                <input type="email" placeholder="📧 Enter your email" value={email} readOnly style={{ width: "100%", padding: "15px", fontSize: "18px", borderRadius: "12px", border: "1px solid #334155", background: "#1e293b", color: "white", marginBottom: "20px", opacity: 0.8 }} title="Email from login, cannot be changed" />

                <div
                    style={{
                        background: "#111827",
                        padding: "20px",
                        borderRadius: "15px",
                        height: "350px",
                        overflowY: "auto",
                        marginBottom: "20px"
                    }}
                >

                    {

                        conversation.map((chat, index) => (

                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        chat.sender === "You"
                                            ? "flex-end"
                                            : "flex-start",
                                    marginBottom: "15px"
                                }}
                            >

                                <div
                                    style={{
                                        background:
                                            chat.sender === "You"
                                                ? "#2563eb"
                                                : "#374151",
                                        padding: "15px",
                                        borderRadius: "15px",
                                        maxWidth: "70%"
                                    }}
                                >

                                    <b>{chat.sender}</b>

                                    <br />
                                    <br />

                                    {chat.message}

                                </div>

                            </div>

                        ))

                    }

                    {

                        thinking && (

                            <div
                                style={{
                                    background: "#374151",
                                    padding: "15px",
                                    borderRadius: "10px"
                                }}
                            >

                                🤖 AI is thinking...

                            </div>

                        )

                    }

                </div>

                <textarea
                    rows="6"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    style={{
                        width: "100%",
                        background: "#1e293b",
                        color: "white",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        padding: "15px",
                        fontSize: "16px"
                    }}
                />

                <br />

                <br />

                <div
                    style={{
                        display: "flex",
                        gap: "15px"
                    }}
                >

                    <button
                        onClick={askQuestion}
                        style={{
                            padding: "15px 35px",
                            border: "none",
                            borderRadius: "10px",
                            background: "#2563eb",
                            color: "white",
                            cursor: "pointer"
                        }}
                    >

                        🚀 Send Answer

                    </button>

                    <button
                        onClick={finishInterview}
                        style={{
                            padding: "15px 35px",
                            border: "none",
                            borderRadius: "10px",
                            background: "#dc2626",
                            color: "white",
                            cursor: "pointer"
                        }}
                    >

                        🏁 Finish Interview

                    </button>

                </div>
                                <div
                    style={{
                        marginTop: "30px",
                        display: "grid",
                        gridTemplateColumns: "repeat(3,1fr)",
                        gap: "20px"
                    }}
                >

                    <div
                        style={{
                            background: "#1e293b",
                            padding: "20px",
                            borderRadius: "12px",
                            textAlign: "center"
                        }}
                    >
                        <h3>💻 Technical</h3>
                        <h2>{technicalScore}/10</h2>
                    </div>

                    <div
                        style={{
                            background: "#1e293b",
                            padding: "20px",
                            borderRadius: "12px",
                            textAlign: "center"
                        }}
                    >
                        <h3>🗣 Communication</h3>
                        <h2>{communicationScore}/10</h2>
                    </div>

                    <div
                        style={{
                            background: "#1e293b",
                            padding: "20px",
                            borderRadius: "12px",
                            textAlign: "center"
                        }}
                    >
                        <h3>🔥 Confidence</h3>
                        <h2>{confidenceScore}/10</h2>
                    </div>

                </div>

                <div
                    style={{
                        marginTop: "30px",
                        background: "#1e293b",
                        padding: "25px",
                        borderRadius: "15px"
                    }}
                >

                    <h2>🤖 AI Feedback</h2>

                    <br />

                    <h3 style={{ color: "#22c55e" }}>✅ Strengths</h3>

                    <p>{strengths}</p>

                    <br />

                    <h3 style={{ color: "#ef4444" }}>❌ Weaknesses</h3>

                    <p>{weaknesses}</p>

                    <br />

                    <h3 style={{ color: "#3b82f6" }}>💡 Suggestions</h3>

                    <p>{suggestions}</p>

                </div>

                <div
                    style={{
                        marginTop: "30px",
                        display: "flex",
                        justifyContent: "space-around",
                        background: "#111827",
                        padding: "20px",
                        borderRadius: "12px"
                    }}
                >

                    <div>

                        <h3>⭐ Overall</h3>

                        <h1>
                            {Math.round((technicalScore + communicationScore + confidenceScore) / 3)}/10
                        </h1>

                    </div>

                    <div>

                        <h3>Status</h3>

                        <h1
                            style={{
                                color:
                                    (
                                        technicalScore +
                                        communicationScore +
                                        confidenceScore
                                    ) / 3 >= 8
                                        ? "#22c55e"
                                        : "#f59e0b"
                            }}
                        >

                            {
                                (
                                    technicalScore +
                                    communicationScore +
                                    confidenceScore
                                ) / 3 >= 8
                                    ? "Excellent"
                                    : "Needs Improvement"
                            }

                        </h1>

                    </div>

                </div>

                <div
                    style={{
                        marginTop: "40px",
                        textAlign: "center",
                        color: "#94a3b8"
                    }}
                >

                    Built with ❤️ using React + Spring Boot + Gemini AI

                </div>
                                {report && (

                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            background: "rgba(0,0,0,.8)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 999
                        }}
                    >

                        <div
                            style={{
                                width: "700px",
                                background: "#111827",
                                padding: "30px",
                                borderRadius: "20px",
                                color: "white"
                            }}
                        >

                            <h1>🎉 AI Interview Report</h1>

                            <hr />

                            <br />

                            <h2>
                                Overall Score : {report.overallScore}/10
                            </h2>

                            <br />

                            <h3>
                                💻 Technical : {report.technicalScore}/10
                            </h3>

                            <h3>
                                🗣 Communication : {report.communicationScore}/10
                            </h3>

                            <h3>
                                🔥 Confidence : {report.confidenceScore}/10
                            </h3>

                            <br />

                            <h2 style={{ color: "#22c55e" }}>
                                ✅ Strengths
                            </h2>

                            <p>{report.strengths}</p>

                            <br />

                            <h2 style={{ color: "#ef4444" }}>
                                ❌ Weaknesses
                            </h2>

                            <p>{report.weaknesses}</p>

                            <br />

                            <h2 style={{ color: "#3b82f6" }}>
                                💡 Suggestions
                            </h2>

                            <p>{report.suggestions}</p>

                            <br />

                            <button
                                onClick={() => setReport(null)}
                                style={{
                                    padding: "12px 25px",
                                    border: "none",
                                    borderRadius: "10px",
                                    background: "#2563eb",
                                    color: "white",
                                    cursor: "pointer"
                                }}
                            >
                                Close Report
                            </button>

                        </div>

                    </div>

                )}

            </div>

        </>

    );

}

export default Interview;