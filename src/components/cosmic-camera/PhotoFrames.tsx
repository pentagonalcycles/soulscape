"use client";

interface PhotoFramesProps {
  frameId: string;
  width: number;
  height: number;
}

export function drawFrame(ctx: CanvasRenderingContext2D, frameId: string, w: number, h: number) {
  const time = Date.now() * 0.001;

  switch (frameId) {
    case "none":
      break;

    case "galaxy-border": {
      // Swirling galaxy border
      const borderWidth = Math.min(w, h) * 0.04;
      for (let i = 0; i < 4; i++) {
        const t = time + i * 0.5;
        const hue = 260 + Math.sin(t) * 40;
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${0.3 + Math.sin(t * 2) * 0.1})`;
        ctx.lineWidth = borderWidth * (1 - i * 0.2);
        ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;
        ctx.shadowBlur = 20;
        const inset = borderWidth * i * 0.5;
        ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
      }
      ctx.shadowBlur = 0;
      break;
    }

    case "constellation-ring": {
      // Connected star points around the edge
      const points: { x: number; y: number }[] = [];
      const count = 16;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = Math.min(w, h) * 0.46 + Math.sin(time + i) * 5;
        points.push({
          x: w / 2 + Math.cos(angle) * radius * (w / h > 1 ? 1.2 : 1),
          y: h / 2 + Math.sin(angle) * radius * (h / w > 1 ? 1.2 : 1),
        });
      }

      // Lines
      ctx.strokeStyle = `hsla(270, 60%, 70%, 0.2)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      // Stars
      points.forEach((p, i) => {
        const pulse = Math.sin(time * 2 + i) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${270 + i * 10}, 80%, 80%, ${0.6 * pulse})`;
        ctx.fill();
      });
      break;
    }

    case "nebula-corners": {
      // Nebula glow in each corner
      const cornerSize = Math.min(w, h) * 0.25;
      const corners = [
        { x: 0, y: 0 },
        { x: w, y: 0 },
        { x: 0, y: h },
        { x: w, y: h },
      ];
      corners.forEach((c, i) => {
        const hue = 280 + i * 30 + Math.sin(time + i) * 10;
        const gradient = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, cornerSize);
        gradient.addColorStop(0, `hsla(${hue}, 60%, 50%, 0.2)`);
        gradient.addColorStop(1, `hsla(${hue}, 60%, 50%, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      });
      break;
    }

    case "star-field": {
      // Scattered stars around the border
      for (let i = 0; i < 30; i++) {
        const seed = i * 137.5;
        const angle = seed % (Math.PI * 2);
        const dist = Math.min(w, h) * 0.42 + (seed % 30);
        const px = w / 2 + Math.cos(angle + time * 0.1) * dist * (w / Math.min(w, h));
        const py = h / 2 + Math.sin(angle + time * 0.1) * dist * (h / Math.min(w, h));
        const pulse = Math.sin(time * 3 + i) * 0.4 + 0.6;
        const size = 1.5 + (seed % 3);

        ctx.beginPath();
        ctx.arc(px, py, size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${260 + (seed % 60)}, 70%, 80%, ${0.5 * pulse})`;
        ctx.fill();
      }
      break;
    }

    case "cosmic-halo": {
      // Ring of light around the center
      const radius = Math.min(w, h) * 0.44;
      const gradient = ctx.createRadialGradient(w / 2, h / 2, radius - 10, w / 2, h / 2, radius + 10);
      gradient.addColorStop(0, `hsla(280, 60%, 60%, 0)`);
      gradient.addColorStop(0.5, `hsla(280, 60%, 60%, ${0.15 + Math.sin(time) * 0.05})`);
      gradient.addColorStop(1, `hsla(280, 60%, 60%, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case "void-edge": {
      // Dark vignette with purple tint
      const gradient = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.min(w, h) * 0.7);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(0.7, "rgba(18,16,42,0.3)");
      gradient.addColorStop(1, "rgba(18,16,42,0.7)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case "aurora-ribbon": {
      // Wavy aurora at the top
      ctx.beginPath();
      ctx.moveTo(0, h * 0.1);
      for (let x = 0; x <= w; x += 5) {
        const wave = Math.sin(x * 0.01 + time) * 20 + Math.sin(x * 0.02 + time * 1.5) * 10;
        ctx.lineTo(x, h * 0.08 + wave);
      }
      ctx.lineTo(w, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, 0, 0, h * 0.15);
      gradient.addColorStop(0, `hsla(160, 70%, 60%, ${0.15 + Math.sin(time) * 0.05})`);
      gradient.addColorStop(0.5, `hsla(280, 70%, 60%, ${0.1 + Math.sin(time * 1.3) * 0.05})`);
      gradient.addColorStop(1, "hsla(280, 70%, 60%, 0)");
      ctx.fillStyle = gradient;
      ctx.fill();
      break;
    }

    case "crystal-border": {
      // Geometric crystal edges
      const segCount = 12;
      const segLen = (w * 2 + h * 2) / segCount;
      for (let i = 0; i < segCount; i++) {
        const progress = (i / segCount + time * 0.05) % 1;
        let px: number, py: number;
        const total = w * 2 + h * 2;
        const dist = progress * total;
        if (dist < w) { px = dist; py = 0; }
        else if (dist < w + h) { px = w; py = dist - w; }
        else if (dist < w * 2 + h) { px = w - (dist - w - h); py = h; }
        else { px = 0; py = h - (dist - w * 2 - h); }

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(200, 80%, 80%, ${0.5 + Math.sin(time * 2 + i) * 0.2})`;
        ctx.fill();

        // Crystal line
        const nextI = (i + 1) % segCount;
        const nextProgress = (nextI / segCount + time * 0.05) % 1;
        let nx: number, ny: number;
        const nd = nextProgress * total;
        if (nd < w) { nx = nd; ny = 0; }
        else if (nd < w + h) { nx = w; ny = nd - w; }
        else if (nd < w * 2 + h) { nx = w - (nd - w - h); ny = h; }
        else { nx = 0; ny = h - (nd - w * 2 - h); }

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = `hsla(200, 70%, 70%, 0.15)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      break;
    }

    case "moon-phase": {
      // Crescent moon in corner
      const mx = w - 60;
      const my = 60;
      const moonR = 25;
      ctx.beginPath();
      ctx.arc(mx, my, moonR, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(45, 80%, 80%, ${0.3 + Math.sin(time * 0.5) * 0.1})`;
      ctx.shadowColor = "hsla(45, 80%, 80%, 0.4)";
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Crescent cutout
      ctx.beginPath();
      ctx.arc(mx + 10, my - 5, moonR * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fill();

      // Stars around moon
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + time * 0.3;
        const dist = 40 + Math.sin(time + i) * 5;
        ctx.beginPath();
        ctx.arc(mx + Math.cos(angle) * dist, my + Math.sin(angle) * dist, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(45, 80%, 80%, ${0.4 + Math.sin(time * 2 + i) * 0.2})`;
        ctx.fill();
      }
      break;
    }

    case "solar-flare": {
      // Warm glow from bottom
      const gradient = ctx.createLinearGradient(0, h, 0, h * 0.6);
      gradient.addColorStop(0, `hsla(30, 90%, 60%, ${0.2 + Math.sin(time) * 0.05})`);
      gradient.addColorStop(0.5, `hsla(30, 90%, 60%, ${0.05 + Math.sin(time * 1.3) * 0.02})`);
      gradient.addColorStop(1, "hsla(30, 90%, 60%, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case "minimal-glow": {
      // Subtle corner dots
      const dotSize = 6;
      const positions = [
        { x: 20, y: 20 }, { x: w - 20, y: 20 },
        { x: 20, y: h - 20 }, { x: w - 20, y: h - 20 },
      ];
      positions.forEach((p, i) => {
        const pulse = Math.sin(time * 2 + i) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, dotSize * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(280, 60%, 70%, ${0.3 * pulse})`;
        ctx.fill();
      });
      break;
    }
  }
}

export default function PhotoFrames({ frameId, width, height }: PhotoFramesProps) {
  if (frameId === "none") return null;

  return (
    <canvas
      ref={(canvas) => {
        if (!canvas) return;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let raf: number;
        function render() {
          raf = requestAnimationFrame(render);
          ctx!.clearRect(0, 0, width, height);
          drawFrame(ctx!, frameId, width, height);
        }
        render();
        return () => cancelAnimationFrame(raf);
      }}
      width={width}
      height={height}
      className="cosmic-camera-frame"
    />
  );
}
