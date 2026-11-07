import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import VoiceOrb from "../components/VoiceOrb";
import useVoiceAssistant from "../hooks/useVoiceAssistant";
import api from "../services/api";

import "../styles/Learn.css";

const SUGGESTIONS = [
  "Explain Big-O complexity with examples",
  "How does HashMap work internally in Java?",
  "Difference between processes and threads",
  "Explain SQL joins with real examples",
  "What is dynamic programming? Give a full walkthrough",
  "How does garbage collection work in JVM?",
  "Explain REST API design best practices",
  "What is caching? Explain cache-aside pattern",
  "How do sliding window problems work?",
  "Explain React hooks in detail",
];

// Minimal rich-text renderer: **bold**, `code`, indented code blocks, numbered/bullet lines
function renderRich(text) {
  const lines = text.split("\n");
  const blocks = [];
  let codeLines = null;

  const inline = (s, keyBase) => {
    const parts = s.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((p, i) => {
      const key = `${keyBase}-${i}`;
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={key}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("`") && p.endsWith("`")) return <code key={key}>{p.slice(1, -1)}</code>;
      if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={key}>{p.slice(1, -1)}</em>;
      return <span key={key}>{p}</span>;
    });
  };

  lines.forEach((line, idx) => {
    const isCodeLine = /^ {4}|\t/.test(line) && line.trim().length > 0;
    if (isCodeLine) {
      if (!codeLines) codeLines = [];
      codeLines.push(line.replace(/^\t/, "    "));
      return;
    }
    if (codeLines) {
      blocks.push({ type: "code", text: codeLines.join("\n"), key: `c${idx}` });
      codeLines = null;
    }
    if (!line.trim()) {
      blocks.push({ type: "gap", key: `g${idx}` });
      return;
    }
    blocks.push({ type: "p", text: line, key: `p${idx}` });
  });
  if (codeLines) blocks.push({ type: "code", text: codeLines.join("\n"), key: "cEnd" });

  return blocks.map(b => {
    if (b.type === "gap") return <div key={b.key} className="learn-gap" />;
    if (b.type === "code") {
      return (
        <div key={b.key} className="learn-code">
          <div className="learn-code-head">
            <span className="learn-code-lang">code</span>
            <button
              className="learn-copy"
              onClick={() => navigator.clipboard?.writeText(b.text)}
            >
              📄 Copy
            </button>
          </div>
          <pre>{b.text}</pre>
        </div>
      );
    }
    const t = b.text;
    const isHeading = /^[0-9]+\.\s+[A-Z][A-Z &/-]{3,}$/.test(t.trim())
      || /^(OPENING|CORE CONCEPTS|HOW IT WORKS|EXAMPLE|COMMON MISTAKES|QUICK RECAP|INTRO)/i.test(t.trim());
    const isBullet = /^(\d+\.|[-•*])\s+/.test(t.trim());

    if (isHeading) return <h3 key={b.key} className="learn-h">{t}</h3>;
    if (isBullet) return <p key={b.key} className="learn-li">{inline(t, b.key)}</p>;
    return <p key={b.key}>{inline(t, b.key)}</p>;
  });
}

function Learn() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "👋 Welcome to the **AI Learn Hub**.\n\nAsk me ANYTHING — Java, DSA, DBMS, OS, React, System Design, HR topics, or anything else you're preparing for.\n\nI'll give you a complete, detailed, interview-ready lesson with examples and code.\n\nWhat topic should we cover today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [lastSpoken, setLastSpoken] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const voiceActiveRef = useRef(false);
  const loadingRef = useRef(false);
  const sendRef = useRef(null);
  const voiceRef = useRef(null);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const send = async (textOverride) => {
    const q = (textOverride || input).trim();
    if (!q || loadingRef.current) return;
    const voiceMode = voiceActiveRef.current;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await api.post("/learn/ask", { question: q, topic: "" }, { timeout: 120000 });
      const answer = res.data.answer || res.data.response || "No answer received.";
      setHistory(prev => [q, ...prev.filter(h => h !== q)].slice(0, 12));
      if (voiceMode) {
        setLastSpoken(answer);
        voiceRef.current?.speak(answer);
      } else {
        setMessages(prev => [...prev, { role: "ai", text: answer }]);
      }
    } catch (e) {
      const msg = e.response?.data?.message || "Could not reach the AI tutor. Please try again.";
      if (voiceMode) {
        setLastSpoken("");
        voiceRef.current?.speak("Sorry, I couldn't reach the AI service. Please try again.");
      } else {
        setMessages(prev => [...prev, { role: "ai", text: "⚠️ " + msg }]);
      }
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    sendRef.current = send;
  });

  const handleVoiceTranscript = useCallback((text) => {
    setInput(text);
    sendRef.current?.(text);
  }, []);

  const voice = useVoiceAssistant({
    onFinalTranscript: handleVoiceTranscript,
    speakIntro: "Hi! I'm your AI tutor. Ask me anything about programming, DSA, system design, or any topic you're preparing for. Just speak naturally — I'll listen and answer out loud.",
  });

  useEffect(() => {
    voiceRef.current = voice;
  });

  useEffect(() => {
    voiceActiveRef.current = voice.state !== "idle";
  }, [voice.state]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendRef.current();
    }
  };

  const aiCount = useMemo(() => messages.filter(m => m.role === "ai").length, [messages]);

  return (
    <div className="page-shell">
      <Navbar />
      <div className="page-container learn-page ai-learn">

        <div className="page-header">
          <div className="page-header-left">
            <span className="badge-soft badge-blue">📚 AI Learn Hub</span>
            <h1 className="page-title">Learn Anything with AI</h1>
            <p className="page-subtitle">
              Ask any topic — get a detailed, professional, interview-ready lesson instantly.
            </p>
          </div>
          <div className="page-actions">
            <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
          </div>
        </div>

        <div className="ai-learn-layout fade-up">

          {/* Chat */}
          <section className="learn-chat glass">
            <div className="learn-chat-head">
              <div className="learn-chat-avatar">🎓</div>
              <div>
                <h2>AI Tutor</h2>
                <span className="learn-chat-status">
                  <span className="learn-dot" /> Online · {aiCount} answers
                </span>
              </div>
            </div>

            <div className="learn-msgs" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`learn-msg ${m.role}`}>
                  <div className="learn-msg-who">
                    {m.role === "user" ? "🧑 You" : "🎓 AI Tutor"}
                  </div>
                  <div className="learn-msg-body">
                    {m.role === "ai" ? renderRich(m.text) : <p>{m.text}</p>}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="learn-msg ai">
                  <div className="learn-msg-who">🎓 AI Tutor</div>
                  <div className="learn-msg-body learn-thinking">
                    <span className="learn-pulse" />
                    {voice.state !== "idle" ? "Thinking…" : "Researching and writing your detailed lesson…"}
                  </div>
                </div>
              )}

              {!loading && voice.state === "speaking" && (
                <div className="learn-msg ai">
                  <div className="learn-msg-who">🎓 AI Tutor · 🔊 Speaking</div>
                  <div className="learn-msg-body learn-voice-speaking">
                    <div className="vorb-mini-bars">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />
                      ))}
                    </div>
                    <span className="learn-voice-hint">Listen… interrupt anytime by speaking or tapping ✋</span>
                  </div>
                </div>
              )}

              {!loading && voice.state !== "idle" && voice.state !== "speaking" && lastSpoken && (
                <div className="learn-msg ai">
                  <div className="learn-msg-who">🎓 AI Tutor · 🎙️ Voice answer</div>
                  <div className="learn-msg-body learn-voice-answer">
                    <p>{lastSpoken.length > 200 ? lastSpoken.slice(0, 200) + "…" : lastSpoken}</p>
                    <span className="learn-voice-note">Full answer spoken aloud · tap 🎙️ to type instead</span>
                  </div>
                </div>
              )}
            </div>

            <div className="learn-composer">
              <button
                type="button"
                className={`learn-mic ${voice.state !== "idle" ? "active" : ""}`}
                onClick={voice.toggle}
                title={voice.state === "idle" ? "Start voice mode" : "Stop voice mode"}
              >
                {voice.state === "idle" ? "🎙️" : voice.state === "speaking" ? "🔊" : voice.state === "thinking" ? "🧠" : "👂"}
              </button>
              <textarea
                ref={inputRef}
                className="learn-input"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder={voice.state !== "idle" ? "Listening… or type here" : "Ask anything… e.g. Explain B-Trees with a Java example"}
                disabled={loading}
              />
              <button className="btn-grad learn-send" onClick={() => sendRef.current()} disabled={loading || !input.trim()}>
                {loading ? "…" : "➤ Ask AI"}
              </button>
            </div>
          </section>

          {/* Side rail */}
          <aside className="learn-rail">
            <div className="learn-rail-card">
              <h3>⚡ Quick topics</h3>
              <div className="learn-suggests">
                {SUGGESTIONS.map(s => (
                  <button key={s} className="learn-suggest" onClick={() => sendRef.current(s)} disabled={loading}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {history.length > 0 && (
              <div className="learn-rail-card">
                <h3>🕘 Recent questions</h3>
                <div className="learn-suggests">
                  {history.map(h => (
                    <button key={h} className="learn-suggest" onClick={() => sendRef.current(h)} disabled={loading}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="learn-rail-card learn-rail-info">
              <h3>💡 Tips for best answers</h3>
              <ul>
                <li>Name the topic precisely (<code>Heap vs Stack memory</code>)</li>
                <li>Ask for code in a language (<code>…in Python</code>)</li>
                <li>Request interview focus (<code>…with common interview Q&amp;A</code>)</li>
                <li>Follow up — I remember this conversation</li>
              </ul>
            </div>
          </aside>

        </div>

        {/* Floating Voice Assistant Orb */}
        {voice.state !== "idle" && (
          <div className="vorb-float fade-up">
            <VoiceOrb
              state={voice.state}
              volume={voice.volume}
              interim={voice.interim}
              voiceName={voice.voiceName}
              supported={voice.supported}
              onToggle={voice.toggle}
              onInterrupt={voice.interrupt}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Learn;
