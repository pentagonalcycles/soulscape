"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface AREffectsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  width: number;
  height: number;
  isActive: boolean;
}

export default function AREffects({ videoRef, width, height, isActive }: AREffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<unknown>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const rafRef = useRef<number>(0);
  const renderEffectsRef = useRef<(() => void) | null>(null);

  // Lazy load MediaPipe on first activation
  useEffect(() => {
    if (!isActive || faceLandmarkerRef.current) return;

    let cancelled = false;

    async function load() {
      try {
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        if (cancelled) return;

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );
        if (cancelled) return;

        const landmarker = await FaceLandmarker.createFromModelPath(
          vision,
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
        );
        if (cancelled) return;

        faceLandmarkerRef.current = landmarker;
        setIsLoaded(true);
      } catch {
        console.warn("AR effects: MediaPipe failed to load");
      }
    }

    load();
    return () => { cancelled = true; };
  }, [isActive]);

  const renderEffects = useCallback(() => {
    rafRef.current = requestAnimationFrame(() => renderEffectsRef.current?.());

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = faceLandmarkerRef.current;
    if (!video || !canvas || !landmarker || video.readyState < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Detect face landmarks
    try {
      const results = (landmarker as { detect: (v: HTMLVideoElement) => { faceLandmarks?: { x: number; y: number }[][] } }).detect(video);
      if (!results.faceLandmarks || results.faceLandmarks.length === 0) return;

      const landmarks = results.faceLandmarks[0];

      // Crown effect on forehead (landmarks near top of face)
      const forehead = landmarks[10]; // top of forehead
      if (forehead) {
        const cx = forehead.x * width;
        const cy = forehead.y * height - 30;
        const time = Date.now() * 0.001;

        // Glowing crown
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI - Math.PI;
          const radius = 40 + Math.sin(time * 2 + i) * 5;
          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius * 0.4;

          ctx.beginPath();
          ctx.arc(px, py, 4 + Math.sin(time * 3 + i) * 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${270 + i * 15}, 80%, 70%, ${0.6 + Math.sin(time * 2 + i) * 0.2})`;
          ctx.fill();

          // Glow
          ctx.beginPath();
          ctx.arc(px, py, 12, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${270 + i * 15}, 80%, 70%, 0.15)`;
          ctx.fill();
        }

        // Crown connecting lines
        ctx.strokeStyle = `hsla(280, 70%, 65%, ${0.4 + Math.sin(time * 2) * 0.1})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i <= 5; i++) {
          const angle = (i / 5) * Math.PI - Math.PI;
          const radius = 40 + Math.sin(time * 2 + i) * 5;
          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius * 0.4;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Cosmic aura around face outline
      const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];
      const time = Date.now() * 0.001;

      ctx.beginPath();
      faceOval.forEach((idx, i) => {
        const lm = landmarks[idx];
        if (!lm) return;
        const x = lm.x * width;
        const y = lm.y * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = `hsla(280, 60%, 60%, ${0.2 + Math.sin(time) * 0.1})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = "hsla(280, 80%, 60%, 0.4)";
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Star shimmer on eyes
      const leftEye = landmarks[468]; // left eye center
      const rightEye = landmarks[473]; // right eye center
      [leftEye, rightEye].forEach((eye, idx) => {
        if (!eye) return;
        const ex = eye.x * width;
        const ey = eye.y * height;
        for (let j = 0; j < 3; j++) {
          const angle = time * 2 + j * (Math.PI * 2 / 3) + idx * Math.PI;
          const dist = 8 + Math.sin(time * 3 + j) * 3;
          const sx = ex + Math.cos(angle) * dist;
          const sy = ey + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${50 + j * 20}, 90%, 80%, ${0.7 + Math.sin(time * 4 + j) * 0.3})`;
          ctx.fill();
        }
      });
    } catch {
      // Detection failed for this frame, skip
    }
  }, [videoRef, width, height]);

  // Keep ref updated
  useEffect(() => { renderEffectsRef.current = renderEffects; });

  useEffect(() => {
    if (isActive && isLoaded) {
      rafRef.current = requestAnimationFrame(renderEffects);
    }
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, isLoaded, renderEffects]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="cosmic-camera-ar"
    />
  );
}
