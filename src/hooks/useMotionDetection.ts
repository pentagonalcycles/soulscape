"use client";

import { useRef, useCallback } from "react";

export interface MotionRegions {
  left: number;
  right: number;
  top: number;
  bottom: number;
  center: number;
}

const DEFAULT_REGIONS: MotionRegions = { left: 0, right: 0, top: 0, bottom: 0, center: 0 };

export function useMotionDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options?: { sensitivity?: number; downscale?: number }
) {
  const prevFrameRef = useRef<ImageData | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const sensitivity = options?.sensitivity ?? 30;
  const downscale = options?.downscale ?? 8;

  const detectMotion = useCallback((): MotionRegions => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return DEFAULT_REGIONS;

    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement("canvas");
    }
    const canvas = offscreenRef.current;
    const w = Math.floor(video.videoWidth / downscale);
    const h = Math.floor(video.videoHeight / downscale);
    if (w <= 0 || h <= 0) return DEFAULT_REGIONS;

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return DEFAULT_REGIONS;

    ctx.drawImage(video, 0, 0, w, h);
    const currentFrame = ctx.getImageData(0, 0, w, h);

    if (!prevFrameRef.current) {
      prevFrameRef.current = currentFrame;
      return DEFAULT_REGIONS;
    }

    const prev = prevFrameRef.current.data;
    const curr = currentFrame.data;
    const halfW = w / 2;
    const halfH = h / 2;

    let leftSum = 0, rightSum = 0, topSum = 0, bottomSum = 0, centerSum = 0;
    let leftN = 0, rightN = 0, topN = 0, bottomN = 0, centerN = 0;

    for (let i = 0; i < curr.length; i += 4) {
      const diff =
        Math.abs(curr[i] - prev[i]) +
        Math.abs(curr[i + 1] - prev[i + 1]) +
        Math.abs(curr[i + 2] - prev[i + 2]);
      const val = diff > sensitivity ? diff / 765 : 0;
      const px = (i / 4) % w;
      const py = Math.floor(i / 4 / w);

      if (px < halfW) { leftSum += val; leftN++; }
      else { rightSum += val; rightN++; }
      if (py < halfH) { topSum += val; topN++; }
      else { bottomSum += val; bottomN++; }
      if (Math.abs(px - halfW) < w * 0.25 && Math.abs(py - halfH) < h * 0.25) {
        centerSum += val; centerN++;
      }
    }

    prevFrameRef.current = currentFrame;

    return {
      left: leftN ? leftSum / leftN : 0,
      right: rightN ? rightSum / rightN : 0,
      top: topN ? topSum / topN : 0,
      bottom: bottomN ? bottomSum / bottomN : 0,
      center: centerN ? centerSum / centerN : 0,
    };
  }, [videoRef, sensitivity, downscale]);

  return { detectMotion };
}
