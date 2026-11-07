import { useState, useRef, useCallback, useEffect } from "react";

const SR = typeof window !== "undefined"
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;
const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

const VOICE_PREFS = [
  (v) => v.lang.startsWith("en") && v.name.includes("Natural"),
  (v) => v.lang.startsWith("en") && v.name.includes("Google") && v.name.includes("Female"),
  (v) => v.lang.startsWith("en") && v.name.includes("Google") && v.name.includes("Male"),
  (v) => v.lang.startsWith("en") && v.name.includes("Microsoft") && v.name.includes("Aria"),
  (v) => v.lang.startsWith("en") && v.name.includes("Microsoft") && v.name.includes("Jenny"),
  (v) => v.lang.startsWith("en") && v.name.includes("Microsoft"),
  (v) => v.lang.startsWith("en") && v.name.includes("Samantha"),
  (v) => v.lang.startsWith("en"),
];

function pickVoice() {
  if (!synth) return null;
  const voices = synth.getVoices();
  for (const pref of VOICE_PREFS) {
    const found = voices.find(pref);
    if (found) return found;
  }
  return voices[0] || null;
}

function normalizeWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function isLikelyEcho(candidate, reference) {
  if (!candidate || !reference) return false;
  const a = normalizeWords(candidate);
  const b = normalizeWords(reference);
  if (a.length === 0) return true;
  if (b.length === 0) return false;
  const bSet = new Set(b);
  const overlap = a.filter((w) => bSet.has(w)).length;
  return overlap / a.length > 0.6;
}

export default function useVoiceAssistant({
  onFinalTranscript,
  onThinkingStart,
  onSpeakingStart,
  onSpeakingEnd,
  speakIntro,
} = {}) {
  const [state, setState] = useState("idle");
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");
  const [voiceName, setVoiceName] = useState("");
  const [supported] = useState(() => !!SR && !!synth);
  const [volume, setVolume] = useState(0);

  const recRef = useRef(null);
  const utterRef = useRef(null);
  const speakingRef = useRef(false);
  const wantListenRef = useRef(false);
  const cooldownRef = useRef(0);
  const lastSpokenRef = useRef("");
  const finalBufferRef = useRef("");
  const volumeTimerRef = useRef(null);
  const stateRef = useRef("idle");
  const callbacksRef = useRef({});
  const restartTimerRef = useRef(null);

  useEffect(() => {
    callbacksRef.current = { onFinalTranscript, onThinkingStart, onSpeakingStart, onSpeakingEnd };
  });

  const setStateSafe = useCallback((s) => {
    if (stateRef.current !== s) {
      stateRef.current = s;
      setState(s);
    }
  }, []);

  const stopVolumeMeter = useCallback(() => {
    if (volumeTimerRef.current) {
      clearInterval(volumeTimerRef.current);
      volumeTimerRef.current = null;
    }
    setVolume(0);
  }, []);

  const startVolumeMeter = useCallback(() => {
    stopVolumeMeter();
    volumeTimerRef.current = setInterval(() => {
      if (speakingRef.current) {
        setVolume(0.4 + Math.random() * 0.6);
      } else if (stateRef.current === "listening") {
        setVolume(0.15 + Math.random() * 0.35);
      } else {
        setVolume(0);
      }
    }, 80);
  }, [stopVolumeMeter]);

  const speak = useCallback((text) => {
    if (!synth || !text) {
      callbacksRef.current.onSpeakingEnd?.();
      return;
    }
    synth.cancel();
    const clean = text
      .replace(/```[\s\S]*?```/g, " (code block omitted for speech) ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/#{1,6}\s*/g, "")
      .replace(/^\s*[-•*]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/https?:\/\/\S+/g, "link")
      .replace(/_/g, " ")
      .replace(/\s{3,}/g, ". ")
      .trim();

    if (!clean) {
      callbacksRef.current.onSpeakingEnd?.();
      return;
    }

    lastSpokenRef.current = clean;
    const u = new SpeechSynthesisUtterance(clean);
    const voice = pickVoice();
    if (voice) {
      u.voice = voice;
      setVoiceName(voice.name);
    }
    u.rate = 1.04;
    u.pitch = 1.0;
    u.volume = 1.0;

    u.onstart = () => {
      speakingRef.current = true;
      setStateSafe("speaking");
      startVolumeMeter();
      callbacksRef.current.onSpeakingStart?.();
    };
    u.onend = () => {
      speakingRef.current = false;
      cooldownRef.current = Date.now() + 400;
      stopVolumeMeter();
      if (wantListenRef.current) {
        setStateSafe("listening");
        callbacksRef.current.onSpeakingEnd?.();
      } else {
        setStateSafe("idle");
        callbacksRef.current.onSpeakingEnd?.();
      }
    };
    u.onerror = () => {
      speakingRef.current = false;
      cooldownRef.current = Date.now() + 400;
      stopVolumeMeter();
      if (wantListenRef.current) {
        setStateSafe("listening");
        callbacksRef.current.onSpeakingEnd?.();
      } else {
        setStateSafe("idle");
        callbacksRef.current.onSpeakingEnd?.();
      }
    };

    utterRef.current = u;
    synth.speak(u);
  }, [setStateSafe, startVolumeMeter, stopVolumeMeter]);

  const stopSpeaking = useCallback(() => {
    if (synth) synth.cancel();
    speakingRef.current = false;
    cooldownRef.current = Date.now() + 300;
    stopVolumeMeter();
  }, [stopVolumeMeter]);

  const processFinal = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (Date.now() < cooldownRef.current && isLikelyEcho(trimmed, lastSpokenRef.current)) return;
    if (speakingRef.current) {
      stopSpeaking();
    }
    setFinalText(trimmed);
    setInterim("");
    finalBufferRef.current = "";
    setStateSafe("thinking");
    callbacksRef.current.onThinkingStart?.();
    callbacksRef.current.onFinalTranscript?.(trimmed);
  }, [setStateSafe, stopSpeaking]);

  const ensureRecognition = useCallback(() => {
    if (recRef.current) return recRef.current;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      let interimVal = "";
      let finalVal = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalVal += r[0].transcript;
        else interimVal += r[0].transcript;
      }
      if (interimVal) {
        setInterim(interimVal);
        if (speakingRef.current && interimVal.trim().length > 2 && !isLikelyEcho(interimVal, lastSpokenRef.current)) {
          stopSpeaking();
        }
      }
      if (finalVal) processFinal(finalVal);
    };

    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        wantListenRef.current = false;
        setStateSafe("idle");
        stopVolumeMeter();
      }
    };

    rec.onend = () => {
      if (wantListenRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          try { rec.start(); } catch { /* already started */ }
        }, 120);
      } else {
        setStateSafe("idle");
        stopVolumeMeter();
      }
    };

    recRef.current = rec;
    return rec;
  }, [processFinal, setStateSafe, stopSpeaking, stopVolumeMeter]);

  const start = useCallback(() => {
    if (!SR) return;
    wantListenRef.current = true;
    setStateSafe("listening");
    startVolumeMeter();
    const rec = ensureRecognition();
    try { rec.start(); } catch { /* already started */ }
    if (speakIntro) speak(speakIntro);
  }, [ensureRecognition, setStateSafe, startVolumeMeter, speak, speakIntro]);

  const stop = useCallback(() => {
    wantListenRef.current = false;
    stopSpeaking();
    if (recRef.current) {
      try { recRef.current.stop(); } catch { /* noop */ }
    }
    setStateSafe("idle");
    stopVolumeMeter();
    setInterim("");
    setFinalText("");
  }, [setStateSafe, stopSpeaking, stopVolumeMeter]);

  const toggle = useCallback(() => {
    if (stateRef.current === "idle") start();
    else stop();
  }, [start, stop]);

  const interrupt = useCallback(() => {
    stopSpeaking();
  }, [stopSpeaking]);

  useEffect(() => {
    if (!synth) return undefined;
    const handler = () => pickVoice();
    synth.addEventListener?.("voiceschanged", handler);
    return () => {
      synth.removeEventListener?.("voiceschanged", handler);
      synth.cancel();
    };
  }, []);

  useEffect(() => () => {
    if (recRef.current) {
      try { recRef.current.stop(); } catch { /* noop */ }
    }
    if (synth) synth.cancel();
    clearTimeout(restartTimerRef.current);
    stopVolumeMeter();
  }, [stopVolumeMeter]);

  return {
    state,
    interim,
    finalText,
    voiceName,
    supported,
    volume,
    start,
    stop,
    toggle,
    interrupt,
    speak,
    stopSpeaking,
  };
}
