import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import api from "../services/api";
import questions from "../data/questions";
import allTestCases from "../data/testCases";
import { pickCases } from "../utils/pickCases";
import mcqBank, { MCQ_TOPICS } from "../data/mcqBank";

import EditorPanel from "../components/EditorPanel";
import "../styles/Coding.css";
import "../styles/WeeklyTest.css";

const DIFF_TIME = { Easy: 15, Medium: 25, Hard: 50 }; // minutes per coding question
const MCQ_TIME = 15; // minutes for 15 MCQs
const MAX_WARNINGS = 5;
const TOTAL_CODING = 3;
const TOTAL_MCQ = 15;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function WeeklyTest() {
  const navigate = useNavigate();

  // ---- phases: setup | intro | test | results ----
  const [phase, setPhase] = useState("setup");
  const [stage, setStage] = useState("coding"); // coding | mcq

  // Setup state
  const [topics, setTopics] = useState([]);
  const [slotDiffs, setSlotDiffs] = useState(["Easy", "Medium", "Medium"]);

  // Test content
  const [codingQs, setCodingQs] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [cqIndex, setCqIndex] = useState(0);

  // Answers
  const [runOutput, setRunOutput] = useState("");
  const [submission, setSubmission] = useState(null);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [codingResults, setCodingResults] = useState({}); // qid -> {passed,total}
  const [busy, setBusy] = useState(null); // null | "run" | "submit"

  // Proctoring / timers
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [warningFlash, setWarningFlash] = useState("");
  const [camOn, setCamOn] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fsPaused, setFsPaused] = useState(false);     // fullscreen exited → test paused overlay
  const [faceStatus, setFaceStatus] = useState("off"); // off | loading | ready | error

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const secondsRef = useRef(0);
  const warningsRef = useRef(0);
  const phaseRef = useRef(phase);
  const terminatedRef = useRef(false);
  const startedAtRef = useRef(null);
  const snapshotsRef = useRef([]);       // proctor frames captured on warnings
  const fsPausedRef = useRef(false);
  const lastWarnRef = useRef(0);         // cooldown for warning sources
  const faceMissRef = useRef(0);         // consecutive bad face detections
  const faceapiRef = useRef(null);
  const modelsRef = useRef(false);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // ---------- Setup helpers ----------
  const toggleTopic = (t) => {
    setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const startTest = () => {
    if (topics.length === 0) return;

    // One random coding question per slot, using that slot's own difficulty
    // (e.g. 1 Easy + 2 Medium) — topic-matched pool first, then any topic.
    const chosen = [];
    const used = new Set();
    slotDiffs.forEach(d => {
      let pool = questions.filter(q => q.difficulty === d && !used.has(q.id) && topics.includes(q.topic));
      if (pool.length === 0) pool = questions.filter(q => q.difficulty === d && !used.has(q.id));
      if (pool.length === 0) pool = questions.filter(q => !used.has(q.id));
      const pick = shuffle(pool)[0];
      if (pick) {
        chosen.push(pick);
        used.add(pick.id);
      }
    });
    if (chosen.length < slotDiffs.length) return;
    // Randomize presentation order per attempt (each question keeps its own difficulty)
    setCodingQs(shuffle(chosen));

    // 15 random MCQs from selected topics (fall back to all), with shuffled option order
    let poolQs = [];
    topics.forEach(t => { if (mcqBank[t]) poolQs = poolQs.concat(mcqBank[t]); });
    if (poolQs.length < TOTAL_MCQ) poolQs = Object.values(mcqBank).flat();
    setMcqs(shuffle(poolQs).slice(0, TOTAL_MCQ).map(m => {
      const order = shuffle(m.options.map((_, i) => i));
      return { q: m.q, options: order.map(i => m.options[i]), a: order.indexOf(m.a) };
    }));
    setMcqAnswers({});

    // Total time = sum of each slot's own minutes + MCQs
    const totalMin = slotDiffs.reduce((sum, d) => sum + DIFF_TIME[d], 0) + MCQ_TIME;
    secondsRef.current = totalMin * 60;
    setSecondsLeft(secondsRef.current);
    warningsRef.current = 0;
    setWarnings(0);
    setCqIndex(0);
    setCodingResults({});
    setSubmission(null);
    setRunOutput("");
    setBusy(null);
    terminatedRef.current = false;
    snapshotsRef.current = [];
    fsPausedRef.current = false;
    setFsPaused(false);
    faceMissRef.current = 0;
    lastWarnRef.current = 0;

    setPhase("intro");
  };

  // ---------- Webcam ----------
  const enableCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamOn(true);
    } catch {
      setWarningFlash("⚠️ Camera access is required to start the test.");
      setTimeout(() => setWarningFlash(""), 3000);
    }
  };

  const stopCam = () => {
    try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch { /* ignore */ }
    streamRef.current = null;
    setCamOn(false);
  };

  useEffect(() => () => stopCam(), []);

  // ---------- Proctor helpers ----------
  const captureSnapshot = () => {
    try {
      const v = videoRef.current;
      if (!v || !v.videoWidth || snapshotsRef.current.length >= 6) return;
      const c = document.createElement("canvas");
      const scale = 320 / v.videoWidth;
      c.width = 320;
      c.height = Math.round(v.videoHeight * scale);
      c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
      snapshotsRef.current.push(c.toDataURL("image/jpeg", 0.6));
    } catch { /* ignore capture errors */ }
  };

  const enterFullscreen = () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => { /* needs gesture */ });
      }
    } catch { /* unsupported */ }
  };

  const exitFullscreen = () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => { /* ignore */ });
      }
    } catch { /* ignore */ }
  };

  const loadFaceModels = async () => {
    if (modelsRef.current) return;
    setFaceStatus("loading");
    try {
      const fa = await import("@vladmandic/face-api");
      faceapiRef.current = fa;
      await fa.nets.tinyFaceDetector.loadFromUri(`${import.meta.env.BASE_URL || "/"}models`);
      modelsRef.current = true;
      setFaceStatus("ready");
    } catch {
      setFaceStatus("error");
    }
  };

  // ---------- Finalize (grade + save) ----------
  const finalize = useCallback(async (auto = false, forceWarnings) => {
    if (terminatedRef.current) return;
    terminatedRef.current = true;
    stopCam();
    exitFullscreen();

    const warnCount = typeof forceWarnings === "number" ? forceWarnings : warningsRef.current;

    // Grade MCQs
    let correct = 0;
    mcqs.forEach((m, i) => { if (mcqAnswers[i] === m.a) correct++; });

    // Grade coding — sum passed test cases
    let passedTotal = 0, caseTotal = 0;
    codingQs.forEach(q => {
      const r = codingResults[q.id];
      if (r) { passedTotal += r.passed; caseTotal += r.total; }
    });

    const codingScore = caseTotal > 0 ? Math.round((passedTotal / caseTotal) * 50) : 0;
    const mcqScore = Math.round((correct / TOTAL_MCQ) * 50);
    const score = codingScore + mcqScore;

    const durationSeconds = startedAtRef.current
      ? Math.floor((Date.now() - startedAtRef.current) / 1000)
      : 0;

    const snaps = [...snapshotsRef.current];
    const data = {
      topics: topics.join(", "),
      difficulty: slotDiffs.join(" + "),
      codingTotal: caseTotal,
      codingPassed: passedTotal,
      mcqTotal: TOTAL_MCQ,
      mcqCorrect: correct,
      score,
      warnings: warnCount,
      autoSubmitted: auto,
      durationSeconds,
      snapshots: snaps
    };

    setResults({ ...data, codingQs, mcqs, mcqAnswers, codingResults });
    setPhase("results");

    setSaving(true);
    try {
      await api.post("/weekly-test/submit", { ...data, snapshots: snaps.join("\n") });
    } catch { /* ignore */ }
    setSaving(false);
  }, [mcqs, mcqAnswers, codingQs, codingResults, topics, slotDiffs]);

  // Warning channel shared by blur / fullscreen / face checks.
  // Captures a proctor snapshot on every counted warning.
  const raiseWarning = useCallback((reason, opts = {}) => {
    if (terminatedRef.current) return;
    if (opts.cooldownMs) {
      const now = Date.now();
      if (now - lastWarnRef.current < opts.cooldownMs) return;
    }
    lastWarnRef.current = Date.now();
    warningsRef.current += 1;
    setWarnings(warningsRef.current);
    captureSnapshot();
    setWarningFlash(`⚠️ Warning ${warningsRef.current}/${MAX_WARNINGS} — ${reason}`);
    setTimeout(() => setWarningFlash(""), 3500);
    if (warningsRef.current >= MAX_WARNINGS) {
      setTimeout(() => finalize(true, MAX_WARNINGS), 900);
    }
  }, [finalize]);

  // ---------- Countdown (paused while fullscreen overlay is open) ----------
  useEffect(() => {
    if (phase !== "test") return;
    const id = setInterval(() => {
      if (fsPausedRef.current || terminatedRef.current) return;
      secondsRef.current -= 1;
      setSecondsLeft(Math.max(0, secondsRef.current));
      if (secondsRef.current <= 0) {
        clearInterval(id);
        finalize(true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, finalize]);

  // ---------- Proctoring: tab switch = instant end ----------
  useEffect(() => {
    if (phase !== "test") return;

    const onVisibility = () => {
      if (document.hidden && !terminatedRef.current) {
        finalize(true, warningsRef.current);
      }
    };

    // Window blur / looking away = warning (max 5, auto-submit)
    const onBlur = () => {
      if (phaseRef.current !== "test" || terminatedRef.current) return;
      raiseWarning("stay on the test screen");
    };

    // Fullscreen lock: exiting fullscreen pauses the test + counts a warning
    const onFsChange = () => {
      if (phaseRef.current !== "test" || terminatedRef.current) return;
      if (!document.fullscreenElement) {
        fsPausedRef.current = true;
        setFsPaused(true);
        raiseWarning("fullscreen is required — test paused");
      } else if (fsPausedRef.current) {
        fsPausedRef.current = false;
        setFsPaused(false);
      }
    };

    // Copy / paste / right-click blocked during the test (no warning count)
    const blockAction = (e) => {
      e.preventDefault();
      setWarningFlash("🔒 Copy, paste and right-click are disabled during the test");
      setTimeout(() => setWarningFlash(""), 2500);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("copy", blockAction);
    document.addEventListener("cut", blockAction);
    document.addEventListener("paste", blockAction);
    document.addEventListener("contextmenu", blockAction);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("copy", blockAction);
      document.removeEventListener("cut", blockAction);
      document.removeEventListener("paste", blockAction);
      document.removeEventListener("contextmenu", blockAction);
    };
  }, [phase, finalize, raiseWarning]);

  // ---------- Face presence check (face-api.js tiny detector) ----------
  useEffect(() => {
    if (phase !== "test") return;
    const id = setInterval(async () => {
      if (terminatedRef.current || fsPausedRef.current) return;
      const fa = faceapiRef.current;
      const v = videoRef.current;
      if (!modelsRef.current || !fa || !v || !v.videoWidth) return;
      try {
        const faces = await fa.detectAllFaces(
          v,
          new fa.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 })
        );
        if (faces.length !== 1) {
          faceMissRef.current += 1;
          // require 2 consecutive bad frames (~12s) before counting, 10s cooldown
          if (faceMissRef.current >= 2) {
            raiseWarning(
              faces.length === 0 ? "no face detected — stay visible to the camera" : "multiple faces detected",
              { cooldownMs: 10000 }
            );
          }
        } else {
          faceMissRef.current = 0;
        }
      } catch { /* skip bad frame */ }
    }, 6000);
    return () => clearInterval(id);
  }, [phase, raiseWarning]);

  // Preload face models during the camera-check phase
  useEffect(() => {
    if (phase !== "intro") return undefined;
    const t = setTimeout(() => loadFaceModels(), 0);
    return () => clearTimeout(t);
  }, [phase]);

  // Leave fullscreen if the component unmounts mid-test
  useEffect(() => () => exitFullscreen(), []);

  // ---------- Test content helpers ----------
  const currentQ = codingQs[cqIndex];
  const codingMin = slotDiffs.reduce((sum, d) => sum + DIFF_TIME[d], 0);
  const totalCodingMin = codingMin;
  const currentCases = currentQ && allTestCases[currentQ.id]
    ? pickCases(allTestCases[currentQ.id], 4)
    : [];

  const handleRun = (data) => {
    if (data && typeof data === "object" && data.mode === "run") {
      setSubmission({ ...data, isRun: true });
      setRunOutput("");
    } else {
      setRunOutput(typeof data === "string" ? data : JSON.stringify(data, null, 2));
      setSubmission(null);
    }
  };

  const handleSubmit = (data) => {
    setSubmission(data);
    setRunOutput("");
    if (currentQ && data && typeof data === "object" && !data.error) {
      setCodingResults(prev => ({
        ...prev,
        [currentQ.id]: { passed: data.passed || 0, total: data.total || 0 }
      }));
    }
  };

  const answeredMcqCount = Object.keys(mcqAnswers).length;

  // ================= RENDER =================

  if (phase === "setup") {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="page-container wt-page">
          <div className="page-header">
            <div className="page-header-left">
              <span className="badge-soft badge-blue">🏆 Weekly Test</span>
              <h1 className="page-title">Weekly Coding Test</h1>
              <p className="page-subtitle">
                3 coding questions + 15 MCQs · proctored with webcam · mix difficulties freely per question.
              </p>
            </div>
            <div className="page-actions">
              <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
            </div>
          </div>

          <div className="wt-setup fade-up">
            <section className="wt-card">
              <h2>1️⃣ Choose topics</h2>
              <p className="wt-hint">Select one or more — MCQs are picked from these, coding questions from your chosen difficulties.</p>
              <div className="wt-topics">
                {MCQ_TOPICS.map(t => (
                  <button
                    key={t}
                    className={`wt-chip ${topics.includes(t) ? "selected" : ""}`}
                    onClick={() => toggleTopic(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            <section className="wt-card">
              <h2>2️⃣ Coding question difficulty — custom mix</h2>
              <p className="wt-hint">
                Each question gets its own difficulty and timer. Mix freely — e.g. 1 Easy + 2 Medium.
              </p>
              <div className="wt-slots">
                {slotDiffs.map((d, i) => (
                  <div key={i} className="wt-slot">
                    <div className="wt-slot-head">
                      <span className="wt-slot-q">Coding Q{i + 1}</span>
                      <span className={`wt-slot-time ${d.toLowerCase()}`}>⏱ {DIFF_TIME[d]} min</span>
                    </div>
                    <div className="wt-slot-pills">
                      {["Easy", "Medium", "Hard"].map(opt => (
                        <button
                          key={opt}
                          className={`wt-pill ${opt.toLowerCase()} ${d === opt ? "selected" : ""}`}
                          onClick={() => setSlotDiffs(prev => {
                            const next = [...prev];
                            next[i] = opt;
                            return next;
                          })}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="wt-card">
              <h2>3️⃣ Test format</h2>
              <div className="wt-format">
                <div><strong>💻 {TOTAL_CODING} coding</strong><span>{codingMin} min total ({slotDiffs.join(" + ")})</span></div>
                <div><strong>📝 {TOTAL_MCQ} MCQs</strong><span>{MCQ_TIME} min</span></div>
                <div><strong>⏱ Total time</strong><span>{codingMin + MCQ_TIME} min</span></div>
                <div><strong>📷 Webcam</strong><span>Mandatory</span></div>
                <div><strong>🚫 Tab switch</strong><span>Contest ends instantly</span></div>
                <div><strong>⚠️ Warnings</strong><span>{MAX_WARNINGS} max, then auto-submit</span></div>
              </div>
            </section>

            <button
              className="btn-grad btn-block wt-start"
              onClick={startTest}
              disabled={topics.length === 0}
            >
              {topics.length === 0 ? "Select at least one topic" : "🚀 Start Weekly Test"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="page-container wt-page">
          <div className="wt-intro fade-up">
            <h1>📷 Camera check</h1>
            <p>Enable your webcam to begin. The test is proctored — leaving this tab ends the contest immediately, and {MAX_WARNINGS} focus warnings auto-submit your test.</p>

            <div className="wt-video-box">
              <video ref={videoRef} autoPlay playsInline muted className={camOn ? "" : "hidden"} />
              {!camOn && <div className="wt-video-off">📷 Camera off</div>}
            </div>

            <div className="wt-intro-actions">
              {!camOn ? (
                <button className="btn-grad" onClick={enableCam}>📷 Enable Camera</button>
              ) : (
                <button
                  className="btn-grad"
                  onClick={() => {
                    startedAtRef.current = Date.now();
                    fsPausedRef.current = false;
                    setFsPaused(false);
                    enterFullscreen();
                    setPhase("test");
                  }}
                >
                  ✅ Camera Ready — Begin Test
                </button>
              )}
              <button className="btn-ghost" onClick={() => { stopCam(); setPhase("setup"); }}>
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const r = results || {};
    return (
      <div className="page-shell">
        <Navbar />
        <div className="page-container wt-page">
          <div className="wt-results fade-up">
            <span className={`badge-soft ${r.autoSubmitted ? "badge-amber" : "badge-green"}`}>
              {r.autoSubmitted ? "⏱ Auto-submitted" : "✓ Submitted"}
            </span>
            <h1>🏆 Weekly Test Result</h1>

            <div className="wt-score-ring">
              <div className={`ring ${r.score >= 60 ? "good" : r.score >= 35 ? "mid" : "bad"}`}>
                <strong>{r.score}</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="wt-result-grid">
              <div className="wt-result-card">
                <span>💻 Coding test cases</span>
                <strong>{r.codingPassed}/{r.codingTotal}</strong>
              </div>
              <div className="wt-result-card">
                <span>📝 MCQ correct</span>
                <strong>{r.mcqCorrect}/{r.mcqTotal}</strong>
              </div>
              <div className="wt-result-card">
                <span>⚠️ Warnings</span>
                <strong>{r.warnings}/{MAX_WARNINGS}</strong>
              </div>
              <div className="wt-result-card">
                <span>⏱ Duration</span>
                <strong>{fmt(r.durationSeconds || 0)}</strong>
              </div>
              <div className="wt-result-card">
                <span>🎯 Topics</span>
                <strong>{r.topics}</strong>
              </div>
              <div className="wt-result-card">
                <span>📊 Difficulty</span>
                <strong>{r.difficulty}</strong>
              </div>
            </div>

            {/* MCQ review */}
            {r.mcqs && r.mcqs.length > 0 && (
              <section className="wt-review">
                <h2>📝 MCQ Review</h2>
                {r.mcqs.map((m, i) => {
                  const given = r.mcqAnswers ? r.mcqAnswers[i] : undefined;
                  const ok = given === m.a;
                  return (
                    <div key={i} className={`wt-review-item ${ok ? "ok" : "no"}`}>
                      <div className="wt-review-head">
                        <span className={`wt-badge ${ok ? "ok" : "no"}`}>{ok ? "✓ Correct" : "✗ Wrong"}</span>
                        <span>Q{i + 1}</span>
                      </div>
                      <p>{m.q}</p>
                      <ul>
                        {m.options.map((o, j) => (
                          <li key={j} className={j === m.a ? "right" : (j === given ? "chosen" : "")}>
                            {j === m.a ? "✓ " : (j === given ? "✗ " : "• ")}{o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </section>
            )}

            {/* Proctor snapshots captured during warnings */}
            {Array.isArray(r.snapshots) && r.snapshots.length > 0 && (
              <section className="wt-snaps">
                <h2>📸 Proctor snapshots ({r.snapshots.length})</h2>
                <p className="wt-hint">Captured automatically from your webcam during focus warnings.</p>
                <div className="wt-snap-row">
                  {r.snapshots.map((s, i) => (
                    <figure key={i} className="wt-snap">
                      <img src={s} alt={`Proctor snapshot ${i + 1}`} />
                      <figcaption>#{i + 1}</figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}

            {saving && <p className="wt-saving">💾 Saving result…</p>}

            <div className="wt-result-actions">
              <button className="btn-grad" onClick={() => { setPhase("setup"); setTopics([]); }}>
                🔄 Take Another Test
              </button>
              <button className="btn-ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= PHASE: TEST =================
  return (
    <div className="wt-test">
      {/* Header bar */}
      <header className="wt-bar">
        <div className="wt-bar-left">
          <span className="wt-logo">🏆 Weekly Test</span>
          <span className="wt-stage-pill">{stage === "coding" ? `💻 Coding ${cqIndex + 1}/${codingQs.length}` : `📝 MCQs`}</span>
          <span className="wt-topic-pill">{slotDiffs.join(" + ")} · {topics.join(", ")}</span>
        </div>

        <div className="wt-bar-right">
          <div className={`wt-clock ${secondsLeft < 300 ? "danger" : ""}`}>⏱ {fmt(secondsLeft)}</div>
          <div className={`wt-warn ${warnings > 0 ? "active" : ""}`}>⚠️ {warnings}/{MAX_WARNINGS}</div>
          <span
            className={`wt-face ${faceStatus}`}
            title={faceStatus === "ready"
              ? "Face presence check active"
              : faceStatus === "error"
                ? "Face check unavailable — focus warnings still active"
                : "Face presence check"}
          >
            👁 {faceStatus === "ready" ? "Face ✓" : faceStatus === "error" ? "Face —" : "Face…"}
          </span>
          <video ref={videoRef} autoPlay playsInline muted className="wt-cam" />
          <button className="btn-danger-soft" onClick={() => setConfirmFinish(true)}>🏁 Finish</button>
        </div>
      </header>

      {/* Progress tabs */}
      <div className="wt-tabs">
        <button
          className={`wt-tab ${stage === "coding" ? "active" : ""}`}
          onClick={() => setStage("coding")}
        >
          💻 Coding ({Object.keys(codingResults).length}/{codingQs.length})
        </button>
        <button
          className={`wt-tab ${stage === "mcq" ? "active" : ""}`}
          onClick={() => setStage("mcq")}
        >
          📝 MCQs ({answeredMcqCount}/{mcqs.length})
        </button>
        <div className="wt-tabs-fill" />
        <span className="wt-tab-note">Coding: {totalCodingMin}m · MCQs: {MCQ_TIME}m combined</span>
      </div>

      {/* Warning flash */}
      {warningFlash && (
        <div className="wt-flash">{warningFlash}</div>
      )}

      {/* Content */}
      <div className="wt-body">
        {stage === "coding" ? (
          currentQ ? (
            <div className="wt-coding">
              <div className="wt-q-nav">
                {codingQs.map((q, i) => (
                  <button
                    key={q.id}
                    className={`wt-q-btn ${i === cqIndex ? "active" : ""} ${codingResults[q.id] ? "done" : ""}`}
                    onClick={() => { setCqIndex(i); setSubmission(null); setRunOutput(""); }}
                  >
                    Q{i + 1}
                  </button>
                ))}
              </div>

              <div className="wt-editor-wrap">
                <EditorPanel
                  input=""
                  onRun={handleRun}
                  onSubmit={handleSubmit}
                  onAiLoading={() => {}}
                  onAiDone={() => {}}
                  question={currentQ}
                  hideAi
                  maxTestCases={4}
                  onBusyChange={setBusy}
                />
              </div>

              <aside className="wt-side">
                <div className="wt-qinfo glass">
                  <h3>📋 {currentQ.title}</h3>
                  <div className="wt-qmeta">
                    <span className="badge-soft badge-amber">⭐ {currentQ.difficulty}</span>
                    <span className="badge-soft">{currentQ.topic}</span>
                  </div>
                  <p className="wt-qdesc">{currentQ.problem}</p>
                  {currentQ.examples?.slice(0, 2).map((ex, i) => (
                    <div key={i} className="wt-ex">
                      <b>Example {i + 1}</b>
                      <div>Input: <code>{ex.input}</code></div>
                      <div>Output: <code>{ex.output}</code></div>
                    </div>
                  ))}
                </div>

                {currentCases.length > 0 && (
                  <div className="wt-testcases">
                    <h4>🧪 Grading test cases ({currentCases.length})</h4>
                    <p className="wt-tc-note">These 4 cases cover all hidden scenarios for this question.</p>
                    {currentCases.map((tc, i) => (
                      <div key={i} className="wt-tc">
                        <span className="wt-tc-num">Case {i + 1}</span>
                        <div>Input: <code>{tc.input}</code></div>
                        <div>Expected: <code>{tc.expected}</code></div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="wt-scores glass">
                  <h4>Test case scores</h4>
                  {codingQs.map((q, i) => {
                    const r = codingResults[q.id];
                    return (
                      <div key={q.id} className="wt-score-row">
                        <span>Q{i + 1} · {q.title.slice(0, 22)}</span>
                        <strong className={r ? (r.passed === r.total ? "ok" : "part") : ""}>
                          {r ? `${r.passed}/${r.total}` : "—"}
                        </strong>
                      </div>
                    );
                  })}
                </div>

                <div className="wt-side-panel">
                  <div className="wt-side-tabs">
                    <span>▶ Result</span>
                  </div>
                  {busy && (
                    <div className="busy-banner" role="status">
                      <span className="busy-spin" />
                      {busy === "submit" ? "Submitting — grading test cases…" : "Running — grading test cases…"}
                    </div>
                  )}
                  {submission ? (
                    <div className="wt-side-result">
                      <span className={`summary-pill ${submission.passed === submission.total && submission.total > 0 ? "all-pass" : "has-fail"}`}>
                        {submission.isRun
                          ? `${submission.passed} / ${submission.total} cases run`
                          : `${submission.passed} / ${submission.total} test cases passed`}
                      </span>
                      {submission.isRun && <span className="summary-note">Run output — not submitted</span>}
                      {(submission.results || []).slice(0, 3).map((t, i) => (
                        <div key={i} className={`wt-mini-case ${t.passed ? "ok" : "no"}`}>
                          <span>{t.passed ? "✓" : "✗"} Case {i + 1}</span>
                          <div>Expected: <code>{t.expected}</code></div>
                          <div>Actual: <code>{t.actual}</code></div>
                        </div>
                      ))}
                    </div>
                  ) : runOutput ? (
                    <pre className="console-pre">{runOutput}</pre>
                  ) : (
                    <p className="wt-side-empty">Hit Run or Submit in the editor to see results.</p>
                  )}
                </div>
              </aside>
            </div>
          ) : (
            <div className="wt-empty">No coding questions available for this selection.</div>
          )
        ) : (
          <div className="wt-mcq">
            <div className="wt-mcq-grid">
              <div className="wt-mcq-nums">
                {mcqs.map((_, i) => (
                  <button
                    key={i}
                    className={`wt-num ${mcqAnswers[i] !== undefined ? "answered" : ""}`}
                    onClick={() => {
                      document.getElementById(`mcq-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <div className="wt-mcq-list">
                {mcqs.map((m, i) => (
                  <div key={i} id={`mcq-${i}`} className="wt-mcq-card">
                    <div className="wt-mcq-q">
                      <b>Q{i + 1}.</b> {m.q}
                    </div>
                    <div className="wt-mcq-opts">
                      {m.options.map((o, j) => (
                        <label key={j} className={`wt-opt ${mcqAnswers[i] === j ? "selected" : ""}`}>
                          <input
                            type="radio"
                            name={`mcq-${i}`}
                            checked={mcqAnswers[i] === j}
                            onChange={() => setMcqAnswers(prev => ({ ...prev, [i]: j }))}
                          />
                          <span>{String.fromCharCode(65 + j)}. {o}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen pause overlay */}
      {fsPaused && (
        <div className="wt-fs-overlay">
          <div className="wt-fs-card">
            <div className="wt-fs-icon">⛶</div>
            <h2>Fullscreen required</h2>
            <p>
              The test is paused because fullscreen was exited. A warning has been recorded —
              resume fullscreen to continue.
            </p>
            <button className="btn-grad" onClick={() => enterFullscreen()}>
              ⛶ Resume Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* Finish confirm modal */}
      {confirmFinish && (
        <div className="wt-modal" onClick={() => setConfirmFinish(false)}>
          <div className="wt-modal-card" onClick={e => e.stopPropagation()}>
            <h2>🏁 Finish test?</h2>
            <p>You answered <b>{answeredMcqCount}/{mcqs.length}</b> MCQs and solved <b>{Object.keys(codingResults).length}/{codingQs.length}</b> coding questions.</p>
            <p className="wt-modal-warn">Submitting now ends the test permanently.</p>
            <div className="wt-modal-actions">
              <button className="btn-grad" onClick={() => { setConfirmFinish(false); finalize(false); }}>
                ✓ Yes, Submit
              </button>
              <button className="btn-ghost" onClick={() => setConfirmFinish(false)}>Keep working</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeeklyTest;
