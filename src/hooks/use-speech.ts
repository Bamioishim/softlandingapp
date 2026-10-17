import { useCallback, useEffect, useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = any;

export function useSpeechRecognition(onFinal: (text: string) => void) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<AnyRec>(null);
  const finalRef = useRef(onFinal);
  finalRef.current = onFinal;

  useEffect(() => {
    const w = window as AnyRec;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    setSupported(!!SR);
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    let latest = "";
    rec.onresult = (e: AnyRec) => {
      latest = Array.from(e.results).map((r: AnyRec) => r[0].transcript).join("");
      setTranscript(latest);
    };
    rec.onend = () => {
      setListening(false);
      if (latest.trim()) finalRef.current(latest.trim());
      latest = "";
      setTranscript("");
    };
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => rec.abort();
  }, []);

  const start = useCallback(() => {
    if (!recRef.current) return;
    window.speechSynthesis?.cancel();
    setTranscript("");
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      /* already started */
    }
  }, []);
  const stop = useCallback(() => recRef.current?.stop(), []);

  return { supported, listening, transcript, start, stop };
}

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const speak = useCallback((text: string) => {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    s.speak(u);
  }, []);
  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);
  return { speaking, speak, cancel };
}
