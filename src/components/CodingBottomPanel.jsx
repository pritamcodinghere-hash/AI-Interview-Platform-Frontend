import { useEffect, useRef, useState } from "react";
import { pickCases } from "../utils/pickCases";

const SAMPLE = 4;

function CodingBottomPanel({
    suite,
    input,
    setInput,
    runOutput,
    submission,
    busy,
    tab,
    setTab
}) {
    const [filter, setFilter] = useState("all"); // all | failed
    const bodyRef = useRef(null);

    const total = suite ? suite.length : 0;
    const sample = total > 0 ? pickCases(suite, SAMPLE) : [];
    const results = (submission && submission.results) || [];
    const failedCount = results.filter(r => !r.passed).length;
    const isRun = submission && submission.isRun;

    // Switch to "failed" view automatically when a submission has failures
    useEffect(() => {
        if (!submission || results.length === 0) return undefined;
        const t = setTimeout(() => setFilter(failedCount > 0 ? "failed" : "all"), 0);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submission]);

    useEffect(() => {
        if (bodyRef.current) bodyRef.current.scrollTop = 0;
    }, [tab, submission, filter]);

    const shown = filter === "failed" ? results.filter(r => !r.passed) : results;

    return (
        <div className="bottom-panel">

            <div className="bp-tabs">
                <button
                    className={`bp-tab ${tab === "testcase" ? "active" : ""}`}
                    onClick={() => setTab("testcase")}
                >
                    🧪 Testcase
                </button>
                <button
                    className={`bp-tab ${tab === "result" ? "active" : ""}`}
                    onClick={() => setTab("result")}
                >
                    ▶ Result
                </button>

                <div className="bp-tabs-fill" />

                {submission && typeof submission.passed === "number" && (
                    <button
                        className={`bp-summary-chip ${submission.passed === submission.total && submission.total > 0 ? "ok" : "bad"}`}
                        onClick={() => setTab("result")}
                    >
                        {submission.passed} / {submission.total} {isRun ? "run" : "passed"}
                    </button>
                )}
            </div>

            <div className="bp-body" ref={bodyRef}>

                {tab === "testcase" && (
                    <div className="bp-testcase">
                        {total > 0 ? (
                            <>
                                <div className="bp-note">
                                    Run &amp; Submit grade <b>all {total} test cases</b> (including edge cases).
                                    Showing {sample.length} sample cases.
                                </div>
                                <div className="bp-samples">
                                    {sample.map((tc, i) => (
                                        <div key={i} className="bp-sample">
                                            <span className="bp-sample-num">Case {i + 1}</span>
                                            <div className="bp-io">
                                                <label>Input</label>
                                                <code>{tc.input}</code>
                                            </div>
                                            <div className="bp-io">
                                                <label>Expected</label>
                                                <code>{tc.expected}</code>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="bp-note">This question has no fixed test suite — use the custom input below.</div>
                        )}

                        <div className="bp-custom">
                            <label>Custom input <span className="bp-hint">(used only when there is no test suite)</span></label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type input for your program here…"
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {tab === "result" && (
                    <div className="bp-result">

                        {busy && (
                            <div className="busy-banner" role="status">
                                <span className="busy-spin" />
                                {busy === "submit"
                                    ? "Submitting — grading all test cases…"
                                    : "Running — grading all test cases…"}
                            </div>
                        )}

                        {!submission && !runOutput && (
                            <div className="bp-result-empty">
                                <span>▶</span>
                                <p>Hit <b>Run</b> to grade your code against all {total || "the"} test cases — your output vs expected output shows here.</p>
                            </div>
                        )}

                        {runOutput && (
                            <pre className="console-pre">{runOutput}</pre>
                        )}

                        {submission && (
                            <div className="bp-result-wrap">

                                <div className={`bp-verdict ${submission.passed === submission.total && submission.total > 0 ? "ok" : "bad"}`}>
                                    <strong>
                                        {submission.passed} / {submission.total} test cases {isRun ? "run" : "passed"}
                                    </strong>
                                    <span>
                                        {isRun
                                            ? "Run output — not submitted"
                                            : submission.passed === submission.total && submission.total > 0
                                                ? "✓ All test cases passed (including edge cases)"
                                                : `${failedCount} failed — check your output vs expected below`}
                                    </span>
                                    {!isRun && submission.total > 0 && (
                                        <span className="bp-of-total">
                                            graded against all {submission.total} test cases of this question
                                        </span>
                                    )}
                                </div>

                                {submission.error && (
                                    <pre className="console-pre error-pre">{submission.error}</pre>
                                )}

                                {results.length > 0 && (
                                    <>
                                        <div className="bp-filters">
                                            <button
                                                className={`bp-filter ${filter === "all" ? "active" : ""}`}
                                                onClick={() => setFilter("all")}
                                            >
                                                All ({results.length})
                                            </button>
                                            <button
                                                className={`bp-filter ${filter === "failed" ? "active" : ""} ${failedCount === 0 ? "is-zero" : ""}`}
                                                onClick={() => setFilter("failed")}
                                                disabled={failedCount === 0}
                                            >
                                                Failed ({failedCount})
                                            </button>
                                        </div>

                                        <div className="bp-cases">
                                            {shown.map((r, i) => (
                                                <div key={i} className={`bp-case ${r.passed ? "ok" : "no"}`}>
                                                    <div className="bp-case-head">
                                                        <span className="bp-case-badge">{r.passed ? "✓ Passed" : "✗ Failed"}</span>
                                                        <span className="bp-case-title">
                                                            Test Case {results.indexOf(r) + 1}
                                                        </span>
                                                    </div>
                                                    {!r.passed && (
                                                        <div className="bp-case-grid">
                                                            <div>
                                                                <label>Input</label>
                                                                <pre>{r.input}</pre>
                                                            </div>
                                                            <div>
                                                                <label>Expected</label>
                                                                <pre>{r.expected}</pre>
                                                            </div>
                                                            <div>
                                                                <label>Your output</label>
                                                                <pre className="bp-actual">{r.actual}</pre>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {shown.length === 0 && (
                                                <div className="bp-result-empty small">No failed cases — nice work!</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}

export default CodingBottomPanel;
