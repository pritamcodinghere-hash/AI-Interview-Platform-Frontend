import { useState, useMemo, useCallback, useEffect } from "react";
import questions from "../data/questions";
import VisualDiagram from "./VisualDiagram";

const TOPIC_ALL = "All Topics";

function pickQuestion(difficulty, topic) {
    let pool = topic === TOPIC_ALL
        ? questions.filter((q) => q.difficulty === difficulty)
        : questions.filter((q) => q.difficulty === difficulty && q.topic === topic);

    if (pool.length === 0) {
        pool = questions.filter((q) => q.topic === topic);
    }
    if (pool.length === 0) {
        pool = questions.filter((q) => q.difficulty === difficulty);
    }

    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

function ProblemPanel({ question, setQuestion }) {

    const [difficulty, setDifficulty] = useState("Medium");
    const [topic, setTopic] = useState(TOPIC_ALL);
    const [showHints, setShowHints] = useState(false);
    const [showApproach, setShowApproach] = useState(false);
    const [showBrowser, setShowBrowser] = useState(false);
    const [search, setSearch] = useState("");
    const [browserDifficulty, setBrowserDifficulty] = useState("All");
    const [browserTopic, setBrowserTopic] = useState(TOPIC_ALL);

    const topics = useMemo(() => {
        const unique = [...new Set(questions.map((q) => q.topic))].sort();
        return [TOPIC_ALL, ...unique];
    }, []);

    useEffect(() => {
        if (!question) {
            const t = setTimeout(() => {
                const initial = pickQuestion("Medium", TOPIC_ALL);
                setShowHints(false);
                setShowApproach(false);
                setQuestion(initial);
            }, 0);
            return () => clearTimeout(t);
        }
    }, [question, setQuestion]);

    const loadQuestion = useCallback(() => {
        const random = pickQuestion(difficulty, topic);
        setShowHints(false);
        setShowApproach(false);
        setQuestion(random);
    }, [difficulty, topic, setQuestion]);

    const handleDifficultyChange = (e) => {
        const d = e.target.value;
        setDifficulty(d);
        const random = pickQuestion(d, topic);
        setShowHints(false);
        setShowApproach(false);
        setQuestion(random);
    };

    const handleTopicChange = (e) => {
        const t = e.target.value;
        setTopic(t);
        const random = pickQuestion(difficulty, t);
        setShowHints(false);
        setShowApproach(false);
        setQuestion(random);
    };

    const selectQuestion = (q) => {
        setShowHints(false);
        setShowApproach(false);
        setShowBrowser(false);
        setQuestion(q);
    };

    const filteredBrowser = useMemo(() => {
        let list = questions;
        if (browserDifficulty !== "All") {
            list = list.filter((q) => q.difficulty === browserDifficulty);
        }
        if (browserTopic !== TOPIC_ALL) {
            list = list.filter((q) => q.topic === browserTopic);
        }
        if (search.trim()) {
            const s = search.trim().toLowerCase();
            list = list.filter((q) =>
                q.title.toLowerCase().includes(s) ||
                q.topic.toLowerCase().includes(s) ||
                String(q.id).includes(s)
            );
        }
        return list;
    }, [browserDifficulty, browserTopic, search]);

    const difficultyClass = question && typeof question === "object"
        ? (question.difficulty === "Medium" ? "medium" : question.difficulty === "Hard" ? "hard" : "")
        : "";

    const hasQuestion = question && typeof question === "object";
    const examples = hasQuestion && Array.isArray(question.examples) ? question.examples : [];
    const hints = hasQuestion && Array.isArray(question.hints) ? question.hints : [];

    return (
        <div className="problem-card">

            {showBrowser && (
                <div className="browser-overlay" onClick={() => setShowBrowser(false)}>
                    <div className="browser-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="browser-header">
                            <h3>Browse Questions ({filteredBrowser.length})</h3>
                            <button className="browser-close" onClick={() => setShowBrowser(false)}>✕</button>
                        </div>
                        <div className="browser-filters">
                            <input
                                className="browser-search"
                                type="text"
                                placeholder="Search by title, topic, or id…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <select
                                className="select-pill"
                                value={browserDifficulty}
                                onChange={(e) => setBrowserDifficulty(e.target.value)}
                            >
                                <option>All</option>
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                            <select
                                className="select-pill"
                                value={browserTopic}
                                onChange={(e) => setBrowserTopic(e.target.value)}
                            >
                                {topics.map((t) => (
                                    <option key={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="browser-list">
                            {filteredBrowser.length === 0 ? (
                                <div className="browser-empty">No questions match your filters.</div>
                            ) : (
                                filteredBrowser.map((q) => (
                                    <button
                                        key={q.id}
                                        className={`browser-item ${question && question.id === q.id ? "active" : ""}`}
                                        onClick={() => selectQuestion(q)}
                                    >
                                        <span className="browser-id">#{q.id}</span>
                                        <span className="browser-title">{q.title}</span>
                                        <span className={`browser-diff ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                                        <span className="browser-topic">{q.topic}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="problem-filters">

                <select
                    className="select-pill"
                    value={difficulty}
                    onChange={handleDifficultyChange}
                >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                </select>

                <select
                    className="select-pill"
                    value={topic}
                    onChange={handleTopicChange}
                >
                    {topics.map((t) => (
                        <option key={t}>{t}</option>
                    ))}
                </select>

                <button className="btn-ghost browse-btn" onClick={() => setShowBrowser(true)}>
                    📚 Browse
                </button>

                <button className="btn-ghost next-q-btn" onClick={loadQuestion}>
                    Next Question
                </button>

            </div>

            {hasQuestion ? (

                <div className="problem-body">

                    <div className="problem-head">
                        <h2>{question.title}</h2>
                        <div className="problem-badges">
                            <span className={`difficulty ${difficultyClass}`}>
                                {question.difficulty}
                            </span>
                            <span className="topic-tag">{question.topic}</span>
                        </div>
                    </div>

                    <p className="problem-desc">{question.problem}</p>

                    {examples.length > 0 && (
                        <div className="problem-block">
                            <b>Examples</b>
                            {examples.map((ex, i) => (
                                <div key={i} className="example-box">
                                    <div className="example-title">Example {i + 1}:</div>
                                    <VisualDiagram question={question} exampleInput={ex.input} />
                                    <div className="example-io">
                                        <div><span className="io-label">Input:</span> <code>{ex.input}</code></div>
                                        <div><span className="io-label">Output:</span> <code>{ex.output}</code></div>
                                        {ex.explanation && (
                                            <div className="io-explain"><span className="io-label">Explanation:</span> {ex.explanation}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {Array.isArray(question.constraints) && question.constraints.length > 0 && (
                        <div className="problem-block">
                            <b>Constraints</b>
                            <ul>
                                {question.constraints.map((c) => (
                                    <li key={c}>{c}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {hints.length > 0 && (
                        <div className="problem-block">
                            <button
                                className="hint-reveal-btn"
                                onClick={() => setShowHints((v) => !v)}
                            >
                                {showHints ? "Hide Hints" : `Show Hints (${hints.length})`}
                            </button>
                            {showHints && (
                                <div className="hints-list">
                                    {hints.map((h, i) => (
                                        <div key={i} className="hint-item">
                                            <span className="hint-badge">Hint {i + 1}</span>
                                            <p>{h}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {question.approach && (
                        <div className="problem-block">
                            <button
                                className="hint-reveal-btn"
                                onClick={() => setShowApproach((v) => !v)}
                            >
                                {showApproach ? "Hide Approach" : "Show Approach"}
                            </button>
                            {showApproach && (
                                <div className="approach-box">
                                    <p>{question.approach}</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>

            ) : question === null ? (

                <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3>No question found</h3>
                    <p>Try a different topic or difficulty combination.</p>
                </div>

            ) : null}

        </div>
    );
}

export default ProblemPanel;
