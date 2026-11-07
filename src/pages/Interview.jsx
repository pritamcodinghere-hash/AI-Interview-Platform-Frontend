import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

import Navbar from "../components/Navbar";

import "../styles/Interview.css";

function Interview() {
    const location = useLocation();
    const navigate = useNavigate();
    const setup = location.state || {};

    const [email] = useState(() => {
        try { return localStorage.getItem("email") || ""; } catch { return ""; }
    });

    const [answer, setAnswer] = useState("");
    const [conversation, setConversation] = useState([
        { sender: "AI", message: "👋 Hello! I am your AI Interviewer. Tell me about yourself." }
    ]);
    const [questionNumber, setQuestionNumber] = useState(1);
    const [domain] = useState(setup.role || "Java");
    const [difficulty] = useState(setup.difficulty || "Medium");
    const [experience] = useState(setup.experience || "Fresher");
    const [topics] = useState(setup.topics || "");
    const timeLimit = Number(setup.timeLimit) || 0;
    const effectiveTotal = setup.questions || 10;

    const [seconds, setSeconds] = useState(0);
    const [qSeconds, setQSeconds] = useState(0);
    const [thinking, setThinking] = useState(false);
    const [scoreHistory, setScoreHistory] = useState([]);
    const [qaHistory, setQaHistory] = useState([]);
    const [report, setReport] = useState(null);
    const [interviewError, setInterviewError] = useState("");
    const [finished, setFinished] = useState(false);

    // Voice state — default from setup
    const [voiceEnabled, setVoiceEnabled] = useState(setup.voice !== false);
    const [listening, setListening] = useState(false);
    const [voiceSupported] = useState(() => {
        return typeof window !== "undefined" &&
            !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    });

    const timerRef = useRef(null);
    const chatRef = useRef(null);
    const recognitionRef = useRef(null);
    const voiceEnabledRef = useRef(voiceEnabled);
    const finishedRef = useRef(false);
    const askQuestionRef = useRef(null);

    useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);

    // Session reset on mount — fresh interview every time
    useEffect(() => {
        let active = true;
        (async () => {
            try { await api.post("/interview/reset"); } catch { /* ignore */ }
            if (!active) return;
            if (!setup.role) {
                navigate("/interview-setup", { replace: true });
            }
        })();
        return () => { active = false; };
    }, [navigate, setup.role]);

    useEffect(() => {
        timerRef.current = setInterval(() => setSeconds(prev => prev + 1), 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    // Per-question countdown — auto-submit current answer on timeout
    useEffect(() => {
        if (finished || thinking) return;
        if (timeLimit <= 0) return;
        const t0 = setTimeout(() => setQSeconds(timeLimit), 0);
        const id = setInterval(() => {
            setQSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(id);
                    // Auto-submit whatever is typed (or a "Time up" marker if empty)
                    if (!finishedRef.current) {
                        setTimeout(() => {
                            const el = document.querySelector(".iv-answer");
                            const current = el && el.value ? el.value.trim() : "";
                            if (current) {
                                setAnswer(current);
                                // Force submit the current answer
                                setTimeout(() => askQuestionRef.current?.(current), 0);
                            } else {
                                // Auto-submit empty with time-up note
                                setAnswer("[No answer — time limit exceeded]");
                                setTimeout(() => askQuestionRef.current?.("[No answer — time limit exceeded]"), 0);
                            }
                        }, 0);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { clearTimeout(t0); clearInterval(id); };
    }, [questionNumber, finished, thinking, timeLimit]);

    // Reset q-timer display when question changes without auto-submit noise
    useEffect(() => {
        if (timeLimit > 0) {
            const t = setTimeout(() => setQSeconds(timeLimit), 0);
            return () => clearTimeout(t);
        }
    }, [questionNumber, timeLimit]);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [conversation, thinking]);

    // Cleanup speech on unmount
    useEffect(() => {
        return () => {
            try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
            try { recognitionRef.current?.stop(); } catch { /* ignore */ }
        };
    }, []);

    const formatTime = () => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // ---- Aggregated scores (average across all answers) ----
    const avg = (key) => {
        if (!scoreHistory.length) return 0;
        const sum = scoreHistory.reduce((acc, s) => acc + (s[key] || 0), 0);
        return Math.round((sum / scoreHistory.length) * 10) / 10;
    };
    // Merge strengths/weaknesses/suggestions from all evaluations
    const merged = (key) => {
        const parts = scoreHistory
            .map(s => (s[key] || "").trim())
            .filter(Boolean);
        const unique = [...new Set(parts)];
        return unique.slice(0, 3).join(" · ") || "";
    };
    const strengths = merged("strengths");
    const weaknesses = merged("weaknesses");
    const suggestions = merged("suggestions");

    // ---- Text-to-speech ----
    const speak = useCallback((text) => {
        if (!voiceEnabledRef.current || !window.speechSynthesis) return;
        try {
            window.speechSynthesis.cancel();
            const clean = text.replace(/[👋🤖🎉🔥💡✅❌⭐📊]/gu, "").slice(0, 400);
            const utter = new SpeechSynthesisUtterance(clean);
            utter.rate = 1.02;
            utter.pitch = 1;
            const voices = window.speechSynthesis.getVoices();
            const preferred = voices.find(v => v.lang.startsWith("en") && /female|natural|google|zira|aria/i.test(v.name))
                || voices.find(v => v.lang.startsWith("en"));
            if (preferred) utter.voice = preferred;
            window.speechSynthesis.speak(utter);
        } catch { /* ignore */ }
    }, []);

    // Preload voices for TTS
    useEffect(() => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.getVoices();
        const handler = () => window.speechSynthesis.getVoices();
        window.speechSynthesis.addEventListener?.("voiceschanged", handler);
        return () => window.speechSynthesis.removeEventListener?.("voiceschanged", handler);
    }, []);

    // ---- Speech-to-text ----
    const startListening = useCallback(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        try { recognitionRef.current?.stop(); } catch { /* ignore */ }

        const rec = new SR();
        rec.lang = "en-US";
        rec.interimResults = true;
        rec.continuous = true;
        rec.maxAlternatives = 1;

        let finalTranscript = "";

        rec.onstart = () => setListening(true);
        rec.onend = () => setListening(false);
        rec.onerror = () => setListening(false);
        rec.onresult = (event) => {
            let interim = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) finalTranscript += t + " ";
                else interim += t;
            }
            setAnswer((finalTranscript + interim).trim());
        };

        recognitionRef.current = rec;
        try { rec.start(); } catch { setListening(false); }
    }, []);

    const stopListening = useCallback(() => {
        try { recognitionRef.current?.stop(); } catch { /* ignore */ }
        setListening(false);
    }, []);

    const toggleMic = () => {
        if (listening) stopListening();
        else startListening();
    };

    // ---- Finish interview ----
    const finishInterview = useCallback((auto = false) => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        setFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);
        stopListening();
        try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
        try { recognitionRef.current?.stop(); } catch { /* ignore */ }

        const overall = scoreHistory.length
            ? Math.round((avg("technicalScore") + avg("communicationScore") + avg("confidenceScore")) / 3 * 10) / 10
            : 0;

        const reportData = {
            email, domain, difficulty, experience,
            technicalScore: avg("technicalScore"),
            communicationScore: avg("communicationScore"),
            confidenceScore: avg("confidenceScore"),
            overallScore: overall,
            strengths, weaknesses, suggestions,
            questionsAnswered: scoreHistory.length,
            duration: formatTime(),
            autoFinished: auto
        };

        // Show report instantly — save in the background (non-blocking)
        setReport(reportData);
        try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
        (async () => {
            try { await api.post("/reports/generate", reportData); } catch { /* fallback local */ }
            try { await api.post("/interview/reset"); } catch { /* ignore */ }
            try {
                const existing = JSON.parse(localStorage.getItem("interview_reports") || "[]");
                existing.push({ ...reportData, createdAt: new Date().toISOString() });
                localStorage.setItem("interview_reports", JSON.stringify(existing));
            } catch { /* ignore */ }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, domain, difficulty, experience, scoreHistory, strengths, weaknesses, suggestions, stopListening]);

    const resetLocal = () => {
        setReport(null);
        setConversation([{ sender: "AI", message: "👋 Hello! I am your AI Interviewer. Tell me about yourself." }]);
        setQuestionNumber(1);
        setScoreHistory([]);
        setQaHistory([]);
        setAnswer("");
        setSeconds(0);
        setFinished(false);
        finishedRef.current = false;
        setInterviewError("");
    };

    // ---- Send answer ----
    const askQuestion = async (forcedAnswer) => {
        setInterviewError("");
        if (finishedRef.current) return;
        const forced = typeof forcedAnswer === "string" ? forcedAnswer : "";
        const answerText = (forced || answer).trim();
        if (!answerText) {
            setInterviewError("Please enter or speak your answer.");
            return;
        }
        try {
            setThinking(true);
            stopListening();
            const currentAnswer = answerText;
            const chatResponse = await api.post("/interview/chat", {
                message: currentAnswer,
                domain,
                difficulty,
                experience,
                questionNumber,
                topics
            });
            let aiReply = chatResponse.data.reply || chatResponse.data.response || chatResponse.data.message || "No reply";
            // Hide verdict-only replies (e.g. "Incorrect") from the chat
            if (/^(correct|incorrect|partial|wrong|right)[.!]?$/i.test(aiReply.trim())) {
                aiReply = "Thanks for your answer. Let's move on — here's the next question.";
            }
            setConversation(prev => [...prev, { sender: "You", message: currentAnswer }, { sender: "AI", message: aiReply }]);

            const evaluationResponse = await api.post("/interview/evaluate", { question: aiReply, answer: currentAnswer });
            const evaluation = evaluationResponse.data || {};
            const verdict = evaluation.verdict || "";
            setScoreHistory(prev => [...prev, {
                technicalScore: evaluation.technicalScore ?? 0,
                communicationScore: evaluation.communicationScore ?? 0,
                confidenceScore: evaluation.confidenceScore ?? 0,
                verdict,
                strengths: evaluation.strengths || "",
                weaknesses: evaluation.weaknesses || "",
                suggestions: evaluation.suggestions || ""
            }]);
            setQaHistory(prev => [...prev, {
                qNumber: questionNumber,
                question: aiReply,
                yourAnswer: currentAnswer,
                correctAnswer: evaluation.correctAnswer || "",
                verdict: verdict || "—",
                technicalScore: evaluation.technicalScore ?? 0,
                strengths: evaluation.strengths || "",
                weaknesses: evaluation.weaknesses || "",
                suggestions: evaluation.suggestions || ""
            }]);

            const nextQ = questionNumber + 1;
            setAnswer("");
            setQuestionNumber(nextQ);

            // Speak the AI's next message
            speak(aiReply);

            // Auto-finish when question limit reached
            if (nextQ > effectiveTotal) {
                setTimeout(() => finishInterview(true), 400);
            }
        } catch (e) {
            const msg = e.response?.data?.message || e.response?.data || e.message || "Interview Failed";
            setInterviewError(typeof msg === "string" ? msg : JSON.stringify(msg));
        } finally {
            setThinking(false);
        }
    };

    useEffect(() => { askQuestionRef.current = askQuestion; });

    const formatQTime = () => {
        const m = Math.floor(qSeconds / 60);
        const s = qSeconds % 60;
        return `${m}:${String(s).padStart(2, "0")}`;
    };

    const qTimeDanger = timeLimit > 0 && qSeconds <= 15 && qSeconds > 0 && !thinking && !finished;

    const progressPct = Math.min(100, Math.round(((questionNumber - 1) / effectiveTotal) * 100));
    const answeredCount = scoreHistory.length;

    // Auto-navigate back to setup after user dismisses the report
    const closeReportAndGoHome = () => {
        resetLocal();
        navigate("/interview-setup", { replace: true });
    };

    return (
        <div className="interview-page">
            <Navbar />
            <div className="page-container iv-body">

                {/* Call-style header */}
                <header className="iv-callbar glass fade-up">
                    <div className="iv-call-left">
                        <div className="iv-avatar-ring">
                            <div className="iv-avatar">🤖</div>
                            <span className="iv-live-dot" />
                        </div>
                        <div className="iv-call-info">
                            <h1>AI Interviewer</h1>
                            <div className="iv-meta">
                                <span className="badge-soft badge-blue">💻 {domain}</span>
                                <span className="badge-soft badge-amber">⭐ {difficulty}</span>
                                <span className="badge-soft">🎓 {experience}</span>
                            </div>
                        </div>
                    </div>
                    <div className="iv-call-right">
                        <div className="iv-timer">
                            <span className="iv-timer-value">{formatTime()}</span>
                            <span className="iv-timer-label">Elapsed</span>
                        </div>
                        {timeLimit > 0 && (
                            <div className={`iv-timer iv-qtimer ${qTimeDanger ? "danger" : ""}`}>
                                <span className="iv-timer-value">{formatQTime()}</span>
                                <span className="iv-timer-label">This answer</span>
                            </div>
                        )}
                        <button
                            className={`iv-voice-toggle ${voiceEnabled ? "on" : ""}`}
                            onClick={() => setVoiceEnabled(v => !v)}
                            title={voiceEnabled ? "Voice ON — AI speaks questions" : "Voice OFF"}
                        >
                            {voiceEnabled ? "🔊" : "🔇"}
                        </button>
                        <button className="btn-danger-soft" onClick={() => finishInterview(false)} disabled={finished}>
                            🏁 Finish
                        </button>
                    </div>
                </header>

                {/* Progress + question navigator */}
                <section className="iv-progress glass fade-up">
                    <div className="iv-progress-head">
                        <span>Question {Math.min(questionNumber, effectiveTotal)} / {effectiveTotal}</span>
                        <span>{answeredCount} answered</span>
                    </div>
                    <div className="iv-progress-track">
                        <div className="iv-progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="iv-qdots">
                        {Array.from({ length: effectiveTotal }, (_, i) => (
                            <span
                                key={i}
                                className={`iv-qdot ${i < answeredCount ? "done" : i === answeredCount ? "current" : ""}`}
                            />
                        ))}
                    </div>
                </section>

                {interviewError && (
                    <div className="alert alert-danger-custom">{interviewError}</div>
                )}

                {/* Chat */}
                <section className="iv-chat glass" ref={chatRef}>
                    {conversation.map((chat, index) => (
                        <div key={index} className={`iv-msg ${chat.sender === "You" ? "mine" : "ai"}`}>
                            <div className="iv-msg-sender">
                                {chat.sender === "You" ? "🧑 You" : "🤖 Interviewer"}
                            </div>
                            <div className="iv-msg-bubble">{chat.message}</div>
                        </div>
                    ))}
                    {thinking && (
                        <div className="iv-msg ai">
                            <div className="iv-msg-sender">🤖 Interviewer</div>
                            <div className="iv-msg-bubble typing">
                                <span /><span /><span />
                            </div>
                        </div>
                    )}
                </section>

                {/* Answer box + voice controls */}
                <section className="iv-composer glass">
                    <textarea
                        className="iv-answer"
                        rows="3"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={listening ? "🎙️ Listening... speak now" : "Type your answer or tap the mic to speak..."}
                        disabled={finished || thinking}
                    />
                    <div className="iv-composer-actions">
                        {voiceSupported ? (
                            <button
                                className={`iv-mic-btn ${listening ? "listening" : ""}`}
                                onClick={toggleMic}
                                disabled={finished || thinking}
                                title={listening ? "Stop listening" : "Start voice answer"}
                            >
                                {listening ? "⏹ Stop" : "🎙️ Speak"}
                            </button>
                        ) : (
                            <span className="iv-mic-unsupported">Voice input not supported in this browser</span>
                        )}
                        <button className="btn-grad" onClick={() => askQuestion()} disabled={thinking || finished || !answer.trim()}>
                            🚀 Send Answer
                        </button>
                    </div>
                </section>

                <footer className="app-footer">
                    Built with ❤️ using React + Spring Boot + AI
                </footer>
            </div>

            {/* Full interview report modal */}
            {report && (
                <div className="iv-modal" onClick={closeReportAndGoHome}>
                    <div className="iv-modal-card iv-report-card" onClick={(e) => e.stopPropagation()}>
                        <span className="badge-soft badge-green">✓ Session complete</span>
                        <h1>🎉 AI Interview Report</h1>
                        {report.autoFinished && (
                            <p className="iv-modal-auto">Auto-finished after {effectiveTotal} questions</p>
                        )}

                        {/* Score summary */}
                        <div className="iv-modal-score">
                            <div className="ring">
                                <strong>{report.overallScore}</strong>
                                <span>/10</span>
                            </div>
                            <div className="iv-modal-score-list">
                                <div>
                                    <span>💻 Technical</span>
                                    <strong>{report.technicalScore}/10</strong>
                                </div>
                                <div>
                                    <span>🗣 Communication</span>
                                    <strong>{report.communicationScore}/10</strong>
                                </div>
                                <div>
                                    <span>🔥 Confidence</span>
                                    <strong>{report.confidenceScore}/10</strong>
                                </div>
                                <div>
                                    <span>📝 Answered</span>
                                    <strong>{report.questionsAnswered}/{effectiveTotal}</strong>
                                </div>
                                <div>
                                    <span>⏱ Duration</span>
                                    <strong>{report.duration}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Strengths / weaknesses / suggestions */}
                        <div className="iv-modal-fb">
                            <h3 className="good">✅ Strengths</h3>
                            <p>{report.strengths || "—"}</p>
                            <h3 className="bad">❌ Weaknesses</h3>
                            <p>{report.weaknesses || "—"}</p>
                            <h3 className="tip">💡 Suggestions</h3>
                            <p>{report.suggestions || "—"}</p>
                        </div>

                        {/* Per-question Q&A breakdown */}
                        {qaHistory.length > 0 && (
                            <div className="iv-report-qa">
                                <h3 className="iv-report-qa-title">📋 Full Q&amp;A Review</h3>
                                {qaHistory.map((qa) => {
                                    const v = (qa.verdict || "").toLowerCase();
                                    const isCorrect = v.includes("correct") && !v.includes("incorrect");
                                    const isPartial = v.includes("partial");
                                    const isWrong = v.includes("incorrect") || v.includes("wrong");
                                    return (
                                        <div key={qa.qNumber} className={`iv-qa-item ${isCorrect ? "good" : isPartial ? "warn" : isWrong ? "bad" : ""}`}>
                                            <div className="iv-qa-head">
                                                <strong>Q{qa.qNumber}</strong>
                                                <span className={`iv-qa-verdict ${isCorrect ? "g" : isPartial ? "w" : isWrong ? "b" : ""}`}>
                                                    {qa.verdict || "—"} · {qa.technicalScore}/10
                                                </span>
                                            </div>
                                            <div className="iv-qa-body">
                                                <p className="iv-qa-label">❓ Question</p>
                                                <p className="iv-qa-q">{qa.question}</p>

                                                <p className="iv-qa-label">🧑 Your answer</p>
                                                <p className="iv-qa-a">{qa.yourAnswer || <em>(no answer given)</em>}</p>

                                                {(isWrong || isPartial || !isCorrect) && (
                                                    <>
                                                        <p className="iv-qa-label">✅ Correct answer</p>
                                                        <p className="iv-qa-c">{qa.correctAnswer || "—"}</p>
                                                    </>
                                                )}

                                                {qa.weaknesses && (
                                                    <>
                                                        <p className="iv-qa-label">❌ What you missed</p>
                                                        <p className="iv-qa-w">{qa.weaknesses}</p>
                                                    </>
                                                )}
                                                {qa.strengths && (
                                                    <>
                                                        <p className="iv-qa-label good">✅ What you did well</p>
                                                        <p className="iv-qa-s">{qa.strengths}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="iv-modal-actions">
                            <Link to="/report" className="btn-grad" onClick={closeReportAndGoHome}>
                                📊 Reports History
                            </Link>
                            <Link to="/interview-setup" className="btn-ghost" onClick={closeReportAndGoHome}>
                                🔄 New Interview
                            </Link>
                            <button className="btn-ghost" onClick={closeReportAndGoHome}>
                                ✕ Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Interview;
