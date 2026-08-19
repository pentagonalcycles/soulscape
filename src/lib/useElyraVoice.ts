"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "paused" | "error";

interface UseVoiceOptions {
  onTranscript: (text: string) => void;
  onSpeakComplete?: () => void;
  language?: string;
}

export function useElyraVoice({ onTranscript, onSpeakComplete, language = "en-US" }: UseVoiceOptions) {
  const [state, setState] = useState<VoiceState>("idle");
  const [interimText, setInterimText] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("elyra_voice_mute") === "true";
  });
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isListeningRef = useRef(false);
  const shouldAutoRestart = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, []);

  const getRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    if (recognitionRef.current) return recognitionRef.current;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setInterimText(interimTranscript);

      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim());
        setInterimText("");
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        if (shouldAutoRestart.current && isListeningRef.current) {
          try { recognition.start(); } catch {}
          return;
        }
      }
      if (event.error === "not-allowed") {
        setError("Microphone access is needed to talk with Luna.");
        setState("error");
      } else if (event.error !== "aborted") {
        setError("Voice connection was interrupted.");
        setState("error");
      }
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      if (shouldAutoRestart.current && isListeningRef.current) {
        try { recognition.start(); } catch {}
      } else {
        isListeningRef.current = false;
        if (state === "listening") setState("idle");
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [language, onTranscript, state]);

  const startListening = useCallback(() => {
    const recognition = getRecognition();
    if (!recognition) {
      setError("Voice input is not supported in this browser.");
      setState("error");
      return;
    }

    stopSpeaking();
    setError(null);
    shouldAutoRestart.current = true;

    try {
      recognition.start();
      isListeningRef.current = true;
      setState("listening");
    } catch {
      try { recognition.stop(); } catch {}
      setTimeout(() => {
        try { recognition.start(); isListeningRef.current = true; setState("listening"); } catch {}
      }, 100);
    }
  }, [getRecognition]);

  const stopListening = useCallback(() => {
    shouldAutoRestart.current = false;
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setInterimText("");
    if (state === "listening") setState("idle");
  }, [state]);

  const speak = useCallback((text: string) => {
    if (muted || !synthRef.current || !text.trim()) return;

    synthRef.current.cancel();

    const cleanText = text
      .replace(/```[\s\S]*?```/g, " I've added the code below for you. ")
      .replace(/`[^`]+`/g, (match) => match.slice(1, -1))
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[•·]/g, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (!cleanText) return;

    const chunks = splitIntoChunks(cleanText, 200);
    let chunkIndex = 0;

    const speakNextChunk = () => {
      if (chunkIndex >= chunks.length || !synthRef.current) {
        setState("idle");
        currentUtteranceRef.current = null;
        onSpeakComplete?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
      const savedVolume = parseInt(localStorage.getItem("elyra_voice_volume") || "90") / 100;
      const savedSpeed = parseInt(localStorage.getItem("elyra_voice_speed") || "95") / 100;
      utterance.rate = savedSpeed;
      utterance.pitch = 1.0;
      utterance.volume = savedVolume;
      utterance.lang = language;

      const voices = synthRef.current.getVoices();
      const preferred = voices.find(v =>
        v.name.includes("Samantha") ||
        v.name.includes("Google UK English Female") ||
        v.name.includes("Microsoft Zira") ||
        v.name.includes("Karen") ||
        (v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
      );
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        chunkIndex++;
        speakNextChunk();
      };

      utterance.onerror = (e) => {
        if (e.error !== "canceled") {
          chunkIndex++;
          speakNextChunk();
        }
      };

      currentUtteranceRef.current = utterance;
      setState("speaking");
      synthRef.current.speak(utterance);
    };

    speakNextChunk();
  }, [muted, language, onSpeakComplete]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    currentUtteranceRef.current = null;
    if (state === "speaking") setState("idle");
  }, [state]);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      if (!prev && synthRef.current) {
        synthRef.current.cancel();
        if (state === "speaking") setState("idle");
      }
      return !prev;
    });
  }, [state]);

  const interrupt = useCallback(() => {
    stopSpeaking();
    setTimeout(() => startListening(), 150);
  }, [stopSpeaking, startListening]);

  const enableVoice = useCallback(() => {
    setVoiceEnabled(true);
    setError(null);
  }, []);

  const disableVoice = useCallback(() => {
    setVoiceEnabled(false);
    stopListening();
    stopSpeaking();
    setState("idle");
    setError(null);
  }, [stopListening, stopSpeaking]);

  return {
    state,
    interimText,
    voiceEnabled,
    muted,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleMute,
    interrupt,
    enableVoice,
    disableVoice,
    setThinking: () => setState("thinking"),
    clearError: () => setError(null),
  };
}

function splitIntoChunks(text: string, maxLen: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? current + " " + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}
