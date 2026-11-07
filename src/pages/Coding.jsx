import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import questions from "../data/questions";
import allTestCases from "../data/testCases";
import api from "../services/api";
import { FaCode, FaPlay, FaArrowLeft } from "react-icons/fa";

import CodingNavbar from "../components/CodingNavbar";
import CodingSidePanel from "../components/CodingSidePanel";
import EditorPanel from "../components/EditorPanel";
import CodingBottomPanel from "../components/CodingBottomPanel";

import "../styles/Coding.css";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const TOPICS = ["All", ...new Set(questions.map(q => q.topic))];
const DIFF_COLOR = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };

const SOLVED_KEY = "aip.solvedTitles";
const BEST_KEY = "aip.bestSolutions";

function loadSolved() {
    try {
        const arr = JSON.parse(localStorage.getItem(SOLVED_KEY) || "[]");
        return new Set(Array.isArray(arr) ? arr : []);
    } catch {
        return new Set();
    }
}

function loadBestMap() {
    try {
        const obj = JSON.parse(localStorage.getItem(BEST_KEY) || "{}");
        return obj && typeof obj === "object" ? obj : {};
    } catch {
        return {};
    }
}

// Rank complexities so a "better" (smaller) one replaces the stored best
const CX_RANK = {
    "O(1)": 1, "O(logn)": 2, "O(n)": 3, "O(nlogn)": 4, "O(n^2)": 5,
    "O(n^3)": 6, "O(2^n)": 7, "O(n!)": 8
};

function cxRank(cx) {
    if (!cx) return 99;
    const k = String(cx).replace(/\s+/g, "");
    if (CX_RANK[k]) return CX_RANK[k];
    if (/^O\(log/.test(k)) return 2;
    if (/^O\(n\s*log/.test(k)) return 4;
    if (/^O\(n\)/.test(k)) return 3;
    if (/^O\(n\^?2\)/.test(k)) return 5;
    if (/^O\(n\^?3\)/.test(k)) return 6;
    if (/^O\(2\^/.test(k)) return 7;
    return 50;
}

function extractCx(text) {
    if (!text) return "";
    const m = String(text).match(/O\s*\(\s*[^)]+\s*\)/);
    return m ? m[0].replace(/\s+/g, "") : "";
}

function TaskBrowser({ onSelect, solved }) {
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

    const display = filtered.slice(0, 30);

    return (
        <div className="task-browser">
            <div className="browser-hero">
                <h1>💻 Coding Round</h1>
                <p>Solve coding questions and improve your DSA skills. Pick a problem to start.</p>
            </div>

            <div className="browser-filters">
                <input
                    type="text"
                    placeholder="🔍 Search problems..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
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
                    {display.map(q => (
                        <button
                            key={q.id}
                            className={`browser-row ${selected?.id === q.id ? "browser-row-active" : ""}`}
                            onClick={() => setSelected(q)}
                        >
                            <span className="browser-id">#{q.id}</span>
                            <span className="browser-title">
                                {q.title}
                                {solved.has(q.title) && (
                                    <span className="browser-solved" title="Solved">✓ Solved</span>
                                )}
                            </span>
                            <span className="browser-diff" style={{ color: DIFF_COLOR[q.difficulty] }}>
                                ● {q.difficulty}
                            </span>
                            <span className="browser-topic">{q.topic}</span>
                        </button>
                    ))}
                    {display.length === 0 && (
                        <div className="browser-none">No problems match your filters</div>
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
                                        <span style={{ color: DIFF_COLOR[selected.difficulty] }}>
                                            ● {selected.difficulty}
                                        </span>
                                        <span>{selected.topic}</span>
                                        {solved.has(selected.title) && (
                                            <span className="chip chip-solved">✓ Solved</span>
                                        )}
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
                            <p>Select a problem to preview and start</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Coding() {

    const [searchParams] = useSearchParams();
    const [question, setQuestion] = useState(null);
    const [runOutput, setRunOutput] = useState("");
    const [submission, setSubmission] = useState(null);
    const [aiState, setAiState] = useState({ loading: false, text: "" });
    const [input, setInput] = useState("");
    const [sideTab, setSideTab] = useState("problem");
    const [bottomTab, setBottomTab] = useState("testcase");
    const [busy, setBusy] = useState(null); // null | "run" | "submit"
    const [solved, setSolved] = useState(loadSolved);
    const [best, setBest] = useState(loadBestMap);
    const [editorCmd, setEditorCmd] = useState({ type: null, key: 0 });
    const [toast, setToast] = useState("");
    const bestRef = useRef(best);

    useEffect(() => {
        bestRef.current = best;
    }, [best]);

    useEffect(() => {
        const qid = searchParams.get("q");
        if (qid) {
            const found = questions.find(q => q.id === parseInt(qid));
            if (found) {
                const t = setTimeout(() => {
                    setQuestion(found);
                    setInput(found.input || "");
                }, 0);
                return () => clearTimeout(t);
            }
        }
    }, [searchParams]);

    // Load solved history from server (merges into localStorage cache)
    useEffect(() => {
        let alive = true;
        api.get("/submission/submissions", { timeout: 15000 })
            .then((res) => {
                const list = Array.isArray(res.data) ? res.data : [];
                const titles = list
                    .filter((s) => s && s.total > 0 && s.passed === s.total)
                    .map((s) => s.question)
                    .filter((t) => typeof t === "string");
                if (!alive || titles.length === 0) return;
                setSolved((prev) => {
                    const next = new Set(prev);
                    titles.forEach((t) => next.add(t));
                    localStorage.setItem(SOLVED_KEY, JSON.stringify([...next]));
                    return next;
                });
            })
            .catch(() => {});
        return () => { alive = false; };
    }, []);

    useEffect(() => {
        if (!toast) return undefined;
        const t = setTimeout(() => setToast(""), 3200);
        return () => clearTimeout(t);
    }, [toast]);

    const handleQuestionChange = useCallback((q) => {
        setQuestion(q);
        setInput(q && q.input ? q.input : "");
        setRunOutput("");
        setSubmission(null);
        setAiState({ loading: false, text: "" });
        setSideTab("problem");
        setBottomTab("testcase");
        setBusy(null);
        setToast("");
    }, []);

    const handleBack = () => {
        setQuestion(null);
        setRunOutput("");
        setSubmission(null);
        setAiState({ loading: false, text: "" });
        setBusy(null);
        setBottomTab("testcase");
        setToast("");
    };

    const handleBusy = (b) => {
        setBusy(b);
        if (b) setBottomTab("result");
    };

    const handleRun = (data) => {
        if (data && typeof data === "object" && data.mode === "run") {
            setSubmission({ ...data, isRun: true });
            setRunOutput("");
        } else {
            setRunOutput(typeof data === "string" ? data : JSON.stringify(data, null, 2));
            setSubmission(null);
        }
        setBottomTab("result");
    };

    // On an all-pass submit: mark solved and keep the best-complexity code
    const analyzeBest = (q, rawCode, lang) => {
        if (!q || !rawCode) return;
        api.post("/gemini/complexity-only", { code: rawCode }, { timeout: 60000 })
            .then((res) => {
                const cx = extractCx(res.data && (res.data.complexity || res.data));
                const prev = bestRef.current;
                const old = prev[q.id];
                if (old && (!cx || cxRank(cx) >= cxRank(old.complexity))) return;
                const entry = {
                    code: rawCode,
                    language: lang || "java",
                    complexity: cx || (old && old.complexity) || "",
                    at: Date.now()
                };
                const next = { ...prev, [q.id]: entry };
                bestRef.current = next;
                setBest(next);
                localStorage.setItem(BEST_KEY, JSON.stringify(next));
                setToast(`🏆 Best solution saved${entry.complexity ? ` — ${entry.complexity}` : ""}`);
            })
            .catch(() => {});
    };

    const handleSubmit = (data) => {
        setSubmission(data);
        setRunOutput("");
        setBottomTab("result");
        const q = question;
        if (data && !data.error && q && data.total > 0 && data.passed === data.total) {
            setSolved((prev) => {
                if (prev.has(q.title)) return prev;
                const next = new Set(prev);
                next.add(q.title);
                localStorage.setItem(SOLVED_KEY, JSON.stringify([...next]));
                return next;
            });
            setToast("✅ Solved — all test cases passed!");
            if (data.code) analyzeBest(q, data.code, data.language);
        }
    };

    const handleAiLoading = () => {
        setAiState({ loading: true, text: "" });
        setSideTab("ai");
    };

    const handleAiDone = (text) => {
        setAiState({ loading: false, text });
    };

    const solveAgain = () => {
        setEditorCmd({ type: "reset", key: Date.now() });
        setSubmission(null);
        setRunOutput("");
        setBottomTab("testcase");
        setToast("↺ Editor reset — solve it again!");
    };

    const loadBest = () => {
        const b = best[question.id];
        if (!b) return;
        setEditorCmd({ type: "load", key: Date.now(), code: b.code, language: b.language });
        setToast(`🏆 Loaded best solution${b.complexity ? ` — ${b.complexity}` : ""}`);
    };

    // No question selected → show task browser
    if (!question) {
        return (
            <div className="coding-page">
                <CodingNavbar />
                <TaskBrowser onSelect={handleQuestionChange} solved={solved} />
            </div>
        );
    }

    const suite = allTestCases[question.id] || [];
    const bestEntry = best[question.id];
    const isSolved = solved.has(question.title);

    // Question selected → show editor
    return (
        <div className="coding-page">

            <CodingNavbar />

            <div className="coding-toolbar">
                <button className="back-btn" onClick={handleBack}>
                    <FaArrowLeft /> All Problems
                </button>
                <div className="coding-toolbar-title">
                    <FaCode /> {question.title}
                    <span className="toolbar-diff" style={{ color: DIFF_COLOR[question.difficulty] }}>
                        ● {question.difficulty}
                    </span>
                    {isSolved && <span className="chip chip-solved">✓ Solved</span>}
                    {bestEntry?.complexity && (
                        <span className="chip chip-best" title="Best saved time complexity">⏱ Best: {bestEntry.complexity}</span>
                    )}
                </div>
                <div className="toolbar-meta">
                    <button className="chip chip-action" onClick={solveAgain} title="Reset the editor and solve again">
                        🔄 Solve again
                    </button>
                    {bestEntry && (
                        <button className="chip chip-action" onClick={loadBest} title="Load your best saved solution">
                            🏆 Load best
                        </button>
                    )}
                </div>
                {toast && <div className="coding-toast" role="status">{toast}</div>}
            </div>

            <div className="coding-split">

                <aside className="coding-left">
                    <CodingSidePanel
                        question={question}
                        setQuestion={handleQuestionChange}
                        aiState={aiState}
                        sideTab={sideTab}
                        setSideTab={setSideTab}
                    />
                </aside>

                <main className="coding-right">
                    <EditorPanel
                        input={input}
                        onRun={handleRun}
                        onSubmit={handleSubmit}
                        onAiLoading={handleAiLoading}
                        onAiDone={handleAiDone}
                        question={question}
                        onBusyChange={handleBusy}
                        command={editorCmd}
                    />
                    <CodingBottomPanel
                        suite={suite}
                        input={input}
                        setInput={setInput}
                        runOutput={runOutput}
                        submission={submission}
                        busy={busy}
                        tab={bottomTab}
                        setTab={setBottomTab}
                    />
                </main>

            </div>

        </div>
    );
}

export default Coding;
