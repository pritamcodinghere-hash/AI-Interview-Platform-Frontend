import { useMemo } from "react";

const STATE_META = {
  idle: { label: "Tap to start", color: "#64748b", emoji: "🎤" },
  listening: { label: "Listening… speak now", color: "#22c55e", emoji: "👂" },
  thinking: { label: "Thinking…", color: "#f59e0b", emoji: "🧠" },
  speaking: { label: "Speaking — interrupt anytime", color: "#8b5cf6", emoji: "🔊" },
};

function Bar({ index, volume, active }) {
  const h = useMemo(() => {
    if (!active) return 6;
    return 8 + Math.abs(Math.sin(index * 1.7 + volume * 8)) * 26 * (0.4 + volume * 0.6);
  }, [index, volume, active]);
  const delay = useMemo(() => `${index * 0.06}s`, [index]);
  return (
    <span
      className={`vorb-bar ${active ? "on" : ""}`}
      style={{ height: `${h}px`, animationDelay: delay }}
    />
  );
}

export default function VoiceOrb({ state, volume, interim, voiceName, supported, onToggle, onInterrupt }) {
  const meta = STATE_META[state] || STATE_META.idle;
  const active = state === "listening" || state === "speaking";
  const bars = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);

  if (!supported) {
    return (
      <div className="vorb-wrap">
        <div className="vorb orb-unsupported">
          <span>🎙️</span>
        </div>
        <p className="vorb-status">Voice not supported in this browser. Use Chrome or Edge.</p>
      </div>
    );
  }

  return (
    <div className="vorb-wrap">
      <div className="vorb-stage">
        {/* outer rings */}
        <div className={`vorb-ring r1 ${state}`} style={{ animationDuration: state === "speaking" ? "1.2s" : state === "listening" ? "2s" : "4s" }} />
        <div className={`vorb-ring r2 ${state}`} style={{ animationDuration: state === "speaking" ? "1.8s" : state === "listening" ? "2.8s" : "5s" }} />
        <div className={`vorb-ring r3 ${state}`} style={{ animationDuration: state === "speaking" ? "2.4s" : state === "listening" ? "3.6s" : "6s" }} />

        {/* orbit dots */}
        {state !== "idle" && (
          <>
            <div className={`vorb-orbit o1 ${state}`}><span /></div>
            <div className={`vorb-orbit o2 ${state}`}><span /></div>
            <div className={`vorb-orbit o3 ${state}`}><span /></div>
          </>
        )}

        {/* core orb */}
        <button
          type="button"
          className={`vorb orb-${state}`}
          onClick={onToggle}
          aria-label={state === "idle" ? "Start voice assistant" : "Stop voice assistant"}
        >
          <span className="vorb-core-glow" />
          <span className="vorb-emoji">{meta.emoji}</span>
        </button>

        {/* volume bars */}
        <div className="vorb-bars">
          {bars.map((i) => (
            <Bar key={i} index={i} volume={volume} active={active} />
          ))}
        </div>
      </div>

      <p className="vorb-status" style={{ color: meta.color }}>
        {meta.label}
        {voiceName ? <span className="vorb-voice"> · {voiceName}</span> : null}
      </p>

      {interim && (
        <p className="vorb-interim">“{interim}”</p>
      )}

      {state === "speaking" && (
        <button type="button" className="vorb-interrupt" onClick={onInterrupt}>
          ✋ Interrupt
        </button>
      )}
    </div>
  );
}
