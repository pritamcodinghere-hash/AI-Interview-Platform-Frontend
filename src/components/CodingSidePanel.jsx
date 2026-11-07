import ProblemPanel from "./ProblemPanel";

const TABS = [
    { key: "problem", label: "Problem", icon: "📋" },
    { key: "ai", label: "AI", icon: "🤖" }
];

function CodingSidePanel({
    question,
    setQuestion,
    aiState,
    sideTab,
    setSideTab
}) {

    return (
        <div className="side-panel">

            <div className="side-tabs">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        className={`side-tab ${sideTab === t.key ? "active" : ""}`}
                        onClick={() => setSideTab(t.key)}
                    >
                        <span className="tab-icon">{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="side-content">

                {sideTab === "problem" && (
                    <ProblemPanel
                        question={question}
                        setQuestion={setQuestion}
                    />
                )}

                {sideTab === "ai" && (
                    <div className="tab-ai">

                        {aiState.loading ? (
                            <div className="ai-loading">
                                <span className="ai-spinner" />
                                Thinking…
                            </div>
                        ) : aiState.text ? (
                            <pre className="console-pre ai-pre">{aiState.text}</pre>
                        ) : (
                            <div className="empty-state compact">
                                <div className="empty-icon">🤖</div>
                                <h3>AI Assistant</h3>
                                <p>Use the AI Tools menu above the editor to explain, optimize, find bugs, get hints and more.</p>
                            </div>
                        )}

                    </div>
                )}

            </div>

        </div>
    );
}

export default CodingSidePanel;
