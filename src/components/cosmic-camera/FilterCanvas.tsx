"use client";

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { FilterPreset, getFilterCSS } from "./filterPresets";

interface FilterCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  filter: FilterPreset;
  width: number;
  height: number;
  isStreaming: boolean;
  mirrored?: boolean;
}

const FilterCanvas = forwardRef<HTMLCanvasElement, FilterCanvasProps>(
  ({ videoRef, filter, width, height, isStreaming, mirrored = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const lastFrameTime = useRef<number>(0);
    const timeRef = useRef<number>(0);
    const TARGET_FPS = 30;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

    const renderFrame = useCallback(
      (timestamp: number) => {
        rafRef.current = requestAnimationFrame(renderFrame);

        const elapsed = timestamp - lastFrameTime.current;
        if (elapsed < FRAME_INTERVAL) return;
        lastFrameTime.current = timestamp - (elapsed % FRAME_INTERVAL);
        timeRef.current = timestamp * 0.001;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        if (video.readyState < 2) {
          if (video.error) {
            console.error("Video error:", video.error);
          }
          return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (mirrored) {
          ctx.save();
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }

        // Step 1: Draw video with CSS filters
        ctx.filter = getFilterCSS(filter);
        ctx.drawImage(video, 0, 0, width, height);
        ctx.filter = "none";

        // Step 2: Color tint — three-pass for strong dreamy grading
        if (filter.tintOpacity > 0) {
          ctx.globalCompositeOperation = "multiply";
          ctx.fillStyle = filter.tintColor;
          ctx.fillRect(0, 0, width, height);

          ctx.globalCompositeOperation = "overlay";
          ctx.fillStyle = filter.tintColor;
          ctx.globalAlpha = filter.tintOpacity * 0.6;
          ctx.fillRect(0, 0, width, height);

          ctx.globalCompositeOperation = "color";
          ctx.fillStyle = filter.tintColor;
          ctx.globalAlpha = filter.tintOpacity * 0.3;
          ctx.fillRect(0, 0, width, height);

          ctx.globalAlpha = 1;
        }

        // Step 3: Radial glow (magical center orb)
        if (filter.radialGlow) {
          const t = timeRef.current;
          const breathe = 0.85 + Math.sin(t * 0.8) * 0.15;
          const size = filter.radialGlow.size * breathe;
          ctx.globalCompositeOperation = "screen";
          const glow = ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, width * size
          );
          glow.addColorStop(0, filter.radialGlow.color.replace(/[\d.]+\)$/, `${filter.radialGlow.opacity})`));
          glow.addColorStop(0.4, filter.radialGlow.color.replace(/[\d.]+\)$/, `${filter.radialGlow.opacity * 0.4})`));
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, width, height);
        }

        // Step 4: Edge glow (pulsing border light)
        if (filter.edgeGlow) {
          const t = timeRef.current;
          const pulse = 0.7 + Math.sin(t * 1.2) * 0.3;
          ctx.globalCompositeOperation = "screen";
          const edgeGrad = ctx.createRadialGradient(
            width / 2, height / 2, width * 0.3,
            width / 2, height / 2, width * 0.7
          );
          edgeGrad.addColorStop(0, "rgba(0,0,0,0)");
          edgeGrad.addColorStop(0.6, "rgba(0,0,0,0)");
          edgeGrad.addColorStop(1, filter.edgeGlow.color.replace(/[\d.]+\)$/, `${filter.edgeGlow.strength * pulse})`));
          ctx.fillStyle = edgeGrad;
          ctx.fillRect(0, 0, width, height);
        }

        // Step 5: Center soft glow for dreamy look
        if (filter.blur > 0) {
          ctx.globalCompositeOperation = "screen";
          const centerGlow = ctx.createRadialGradient(
            width / 2, height * 0.4, 0,
            width / 2, height * 0.4, width * 0.4
          );
          centerGlow.addColorStop(0, `rgba(255,255,255,${filter.tintOpacity * 0.1})`);
          centerGlow.addColorStop(0.5, `rgba(255,255,255,${filter.tintOpacity * 0.03})`);
          centerGlow.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = centerGlow;
          ctx.fillRect(0, 0, width, height);
        }

        // Step 6: Vignette
        if (filter.vignetteStrength > 0) {
          ctx.globalCompositeOperation = "multiply";
          const gradient = ctx.createRadialGradient(
            width / 2, height / 2, width * 0.12,
            width / 2, height / 2, width * 0.6
          );
          gradient.addColorStop(0, "rgba(255,255,255,1)");
          gradient.addColorStop(0.4, "rgba(220,220,220,1)");
          gradient.addColorStop(0.7, "rgba(120,120,120,1)");
          gradient.addColorStop(1, `rgba(0,0,0,${filter.vignetteStrength})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        }

        ctx.globalCompositeOperation = "source-over";

        if (mirrored) {
          ctx.restore();
        }
      },
      [videoRef, filter, width, height, mirrored]
    );

    useEffect(() => {
      if (isStreaming) {
        rafRef.current = requestAnimationFrame(renderFrame);
      }
      return () => {
        cancelAnimationFrame(rafRef.current);
      };
    }, [isStreaming, renderFrame]);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="cosmic-camera-canvas"
      />
    );
  }
);

FilterCanvas.displayName = "FilterCanvas";
export default FilterCanvas;
