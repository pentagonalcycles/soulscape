"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface VideoRecorderProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isRecording: boolean;
  onStopRecording: (blob: Blob) => void;
  maxDuration?: number;
}

export default function VideoRecorder({ canvasRef, isRecording, onStopRecording, maxDuration = 10 }: VideoRecorderProps) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [countdown, setCountdown] = useState(maxDuration);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    chunksRef.current = [];

    try {
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        onStopRecording(blob);
        chunksRef.current = [];
      };

      recorder.start();
      recorderRef.current = recorder;
      setCountdown(maxDuration);

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Auto-stop at max duration
            if (recorderRef.current?.state === "recording") {
              recorderRef.current.stop();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      console.warn("Video recording not supported");
    }
  }, [canvasRef, maxDuration, onStopRecording]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
    return () => {
      stopRecording();
    };
  }, [isRecording, startRecording, stopRecording]);

  if (!isRecording) return null;

  return (
    <div className="cosmic-camera-recording-hud">
      <div className="cosmic-recording-dot" />
      <span className="cosmic-recording-time">{countdown}s</span>
    </div>
  );
}
