import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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

// Markdown-lite renderer: fenced code blocks (```), inline code, bold, headings, lists,
// and heuristic code detection for models that emit code without fences.
function renderRich(text) {
  const lines = (text || "").split("\n");
  const blocks = [];

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

  const push = (type, payload) => blocks.push({ type, ...payload, key: `${type}-${blocks.length}` });

  // Code-line heuristics for un-fenced code the model emits as prose
  const CODE_START = /^(import |package |public |private |protected |static |class |interface |enum |void |int |long |String |boolean |char |double |float |short |byte |const |let |var |function |fn |func |Map<|List<|Set<|HashMap|TreeMap|HashSet|ArrayList|LinkedList|Arrays|Collections|Collection|Optional|Stream|System\.|console\.|print\(|println\(|fmt\.)/;
  const looksCode = (line) => {
    if (!line.trim()) return false;
    if (CODE_START.test(line)) return true;
    const t = line.trim();
    return /[;{}]$/.test(t) && /[a-zA-Z_0-9]+\s*(\(|\.|=)/.test(t);
  };
  const LANG_TAG = /^(java|python|javascript|typescript|ts|js|go|rust|c|cpp|csharp|kotlin|scala|swift|sql|bash|shell|html|css)$/i;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Fenced code block (```lang or ```)
    const fence = line.match(/^\s*```([a-zA-Z0-9+#-]*)\s*$/);
    if (fence) {
      const lang = fence[1] || "code";
      i++;
      const body = [];
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) { body.push(lines[i]); i++; }
      i++; // consume closing fence
      push("code", { lang, text: body.join("\n") });
      continue;
    }
    // Language-tag line followed by code lines (e.g. "java\nSome.code();")
    const tag = line.trim().match(LANG_TAG);
    if (tag) {
      const lang = tag[1].toLowerCase();
      let j = i + 1;
      const body = [];
      // Skip one blank line if present between tag and code
      while (j < lines.length && !lines[j].trim()) j++;
      while (j < lines.length && (looksCode(lines[j]) || !lines[j].trim())) { body.push(lines[j]); j++; }
      if (body.filter(l => l.trim()).length >= 2) {
        push("code", { lang, text: body.join("\n").replace(/^\s*\r?\n+|\r?\n+\s*$/g, "") });
        i = j;
        continue;
      }
    }
    // Legacy: 4-space indented code block (for safety)
    const indentRe = /^( {1,4}|\t)\S/;
    if (indentRe.test(line) && line.trim()) {
      const body = [];
      while (i < lines.length && (indentRe.test(lines[i]) || !lines[i].trim())) { body.push(lines[i].replace(/^( {1,4}|\t)/g, "")); i++; }
      push("code", { lang: "code", text: body.join("\n").replace(/\r?\n$/, "") });
      continue;
    }
    // Heuristic: 2+ consecutive code-looking lines become a code block
    if (looksCode(line) && lines[i + 1] && (looksCode(lines[i + 1]) || lines[i + 1].trim() === "")) {
      const body = [];
      while (i < lines.length && (looksCode(lines[i]) || !lines[i].trim())) { body.push(lines[i]); i++; }
      if (body.filter(l => looksCode(l)).length >= 2) { push("code", { lang: "code", text: body.join("\n").replace(/^\s*\r?\n+|\r?\n+\s*$/g, "") }); continue; }
      body.forEach(l => push("p", { text: l }));
      continue;
    }
    if (!line.trim()) { push("gap", {}); i++; continue; }
    push("p", { text: line });
    i++;
  }

  // Compact gaps (max one blank line)
  const compacted = [];
  for (const b of blocks) {
    if (b.type === "gap" && compacted.length && compacted[compacted.length - 1].type === "gap") continue;
    compacted.push(b);
  }

  return compacted.map(b => {
    if (b.type === "gap") return <div key={b.key} className="learn-gap" />;
    if (b.type === "code") {
      return (
        <div key={b.key} className="learn-code">
          <div className="learn-code-head">
            <span className="learn-code-lang">{b.lang}</span>
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
    const isHeading = /^(OPENING|CORE CONCEPTS|HOW IT WORKS|EXAMPLE|COMMON MISTAKES|QUICK RECAP|INTRO|RECAP)\b/i.test(t.trim())
      || /^\d+\.\s+[A-Z][A-Z &/-]{2,}$/.test(t.trim());
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
      text: "👋 Welcome to the **AI Learn Hub**.\n\nAsk me ANYTHING — Java, DSA, DBMS, OS, React, System Design, HR topics, or anything else you're preparing for.\n\nShort answers by default — say \"in detail\", \"deep dive\" or \"full lesson\" when you want the complete breakdown.\n\nWhat would you like to learn today?"
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
    const el = scrollRef.current;
    if (!el) return;
    const msgs = el.querySelectorAll(".learn-msg");
    const last = msgs[msgs.length - 1];
    if (!last) return;
    const elRect = el.getBoundingClientRect();
    const lastRect = last.getBoundingClientRect();
    // Align the START of the newest message with the top of the chat viewport so
    // the reader begins from the beginning (not the end) of long answers.
    el.scrollTop = el.scrollTop + (lastRect.top - elRect.top) - 6;
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
      <div className="page-container learn-page ai-learn">

        <div className="page-header">
          <div className="page-header-left">
            <span className="badge-soft badge-blue">📚 AI Learn Hub</span>
            <h1 className="page-title">Learn Anything with AI</h1>
            <p className="page-subtitle">
              Ask any topic — short answers by default, detailed lessons only when you ask for them.
            </p>
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
                placeholder={voice.state !== "idle" ? "Listening… or type here" : "Ask anything… e.g. What is a HashMap? (add 'in detail' for a full lesson)"}
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
