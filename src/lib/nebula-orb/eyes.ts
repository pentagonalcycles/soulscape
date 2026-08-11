type EyeStyle = "happy" | "sparkle" | "hearts" | "sleepy" | "wink" | "blush" | "star" | "wisp" | "flare" | "aurora";

export function drawEyes(
  ctx: CanvasRenderingContext2D,
  r: number,
  eyeColor: string,
  style: EyeStyle,
  t: number
) {
  ctx.save();

  if (style === "happy") {
    // Visor eyes — horizontal glowing bars with HUD corners
    for (let side = -1; side <= 1; side += 2) {
      const ex = r * 0.22;
      const ey = side * r * 0.28;
      const eW = Math.max(4, r * 0.32);
      const eH = Math.max(2, r * 0.09);

      // Outer glow
      const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, eW * 1.5);
      glow.addColorStop(0, `${eyeColor}33`);
      glow.addColorStop(0.5, `${eyeColor}11`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(ex, ey, eW * 1.5, 0, Math.PI * 2); ctx.fill();

      // Visor background (dark recess)
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.roundRect(ex - eW * 0.55, ey - eH * 1.2, eW * 1.1, eH * 2.4, eH * 0.4);
      ctx.fill();

      // Main visor bar
      const bar = ctx.createLinearGradient(ex - eW * 0.5, ey, ex + eW * 0.5, ey);
      bar.addColorStop(0, `${eyeColor}00`);
      bar.addColorStop(0.15, eyeColor);
      bar.addColorStop(0.5, "#ffffff");
      bar.addColorStop(0.85, eyeColor);
      bar.addColorStop(1, `${eyeColor}00`);
      ctx.fillStyle = bar;
      ctx.beginPath();
      ctx.roundRect(ex - eW * 0.45, ey - eH * 0.5, eW * 0.9, eH, eH * 0.3);
      ctx.fill();

      // Scan line across visor
      const scanX = ex - eW * 0.4 + ((t * 40 + side * 20) % (eW * 0.8));
      ctx.strokeStyle = `rgba(255,255,255,0.6)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(scanX, ey - eH * 0.5);
      ctx.lineTo(scanX, ey + eH * 0.5);
      ctx.stroke();

      // HUD corner brackets
      const cS = eW * 0.15;
      ctx.strokeStyle = `${eyeColor}88`;
      ctx.lineWidth = Math.max(1, r * 0.015);
      // Top-left
      ctx.beginPath(); ctx.moveTo(ex - eW * 0.5, ey - eH * 0.8); ctx.lineTo(ex - eW * 0.5, ey - eH * 1.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex - eW * 0.5, ey - eH * 0.8); ctx.lineTo(ex - eW * 0.5 + cS, ey - eH * 0.8); ctx.stroke();
      // Bottom-right
      ctx.beginPath(); ctx.moveTo(ex + eW * 0.5, ey + eH * 0.8); ctx.lineTo(ex + eW * 0.5, ey + eH * 1.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex + eW * 0.5, ey + eH * 0.8); ctx.lineTo(ex + eW * 0.5 - cS, ey + eH * 0.8); ctx.stroke();

      // Central dot
      ctx.fillStyle = eyeColor;
      ctx.beginPath(); ctx.arc(ex, ey, eH * 0.3, 0, Math.PI * 2); ctx.fill();
    }
  } else if (style === "sparkle") {
    // Holographic projection eyes with scan lines and flicker
    for (let side = -1; side <= 1; side += 2) {
      const ex = r * 0.22;
      const ey = side * r * 0.28;
      const eR = Math.max(3, r * 0.16);

      // Projection cone (triangular glow behind eye)
      ctx.fillStyle = `${eyeColor}08`;
      ctx.beginPath();
      ctx.moveTo(ex - eR * 0.8, ey - eR * 1.5);
      ctx.lineTo(ex + eR * 0.8, ey - eR * 1.5);
      ctx.lineTo(ex + eR * 0.3, ey + eR * 0.3);
      ctx.lineTo(ex - eR * 0.3, ey + eR * 0.3);
      ctx.closePath(); ctx.fill();

      // Outer holographic ring (flickering)
      const flicker = 0.3 + Math.sin(t * 8 + side) * 0.15;
      ctx.strokeStyle = `${eyeColor}${Math.floor(flicker * 255).toString(16).padStart(2, "0")}`;
      ctx.lineWidth = Math.max(1, r * 0.02);
      ctx.beginPath(); ctx.arc(ex, ey, eR * 1.3, 0, Math.PI * 2); ctx.stroke();

      // Inner eye — horizontal scan bar
      const barH = eR * 0.25;
      const bar = ctx.createLinearGradient(ex - eR, ey, ex + eR, ey);
      bar.addColorStop(0, `${eyeColor}00`);
      bar.addColorStop(0.2, `${eyeColor}88`);
      bar.addColorStop(0.5, eyeColor);
      bar.addColorStop(0.8, `${eyeColor}88`);
      bar.addColorStop(1, `${eyeColor}00`);
      ctx.fillStyle = bar;
      ctx.beginPath();
      ctx.roundRect(ex - eR * 0.8, ey - barH * 0.5, eR * 1.6, barH, barH * 0.3);
      ctx.fill();

      // Scan lines overlay
      for (let i = 0; i < 4; i++) {
        const ly = ey - eR * 0.6 + i * eR * 0.35;
        ctx.strokeStyle = `rgba(255,255,255,${0.08 + Math.sin(t * 3 + i) * 0.04})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(ex - eR, ly); ctx.lineTo(ex + eR, ly); ctx.stroke();
      }

      // Holographic data fragments (small rectangles)
      for (let i = 0; i < 3; i++) {
        const fx = ex - eR * 0.6 + ((t * 15 + i * 30) % (eR * 1.2));
        const fy = ey + eR * 0.4 + i * eR * 0.2;
        const fw = eR * 0.15 + (i % 2) * eR * 0.1;
        ctx.fillStyle = `${eyeColor}33`;
        ctx.fillRect(fx, fy, fw, eR * 0.04);
      }
    }
  } else if (style === "hearts") {
    // Targeting reticle eyes — concentric rings with crosshairs
    for (let side = -1; side <= 1; side += 2) {
      const ex = r * 0.22;
      const ey = side * r * 0.28;
      const eR = Math.max(3, r * 0.16);

      // Outer targeting ring (rotating)
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(t * 0.5 + side);
      ctx.strokeStyle = `${eyeColor}55`;
      ctx.lineWidth = Math.max(1, r * 0.02);
      ctx.setLineDash([eR * 0.15, eR * 0.1]);
      ctx.beginPath(); ctx.arc(0, 0, eR * 1.4, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Inner ring (static)
      ctx.strokeStyle = `${eyeColor}88`;
      ctx.lineWidth = Math.max(1, r * 0.025);
      ctx.beginPath(); ctx.arc(ex, ey, eR * 0.9, 0, Math.PI * 2); ctx.stroke();

      // Crosshair lines
      const cLen = eR * 1.2;
      ctx.strokeStyle = `${eyeColor}66`;
      ctx.lineWidth = Math.max(0.5, r * 0.012);
      ctx.beginPath(); ctx.moveTo(ex - cLen, ey); ctx.lineTo(ex - eR * 0.3, ey); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex + eR * 0.3, ey); ctx.lineTo(ex + cLen, ey); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex, ey - cLen); ctx.lineTo(ex, ey - eR * 0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex, ey + eR * 0.3); ctx.lineTo(ex, ey + cLen); ctx.stroke();

      // Center targeting dot (pulsing)
      const pulse = 0.6 + Math.sin(t * 4) * 0.3;
      ctx.fillStyle = `${eyeColor}${Math.floor(pulse * 255).toString(16).padStart(2, "0")}`;
      ctx.beginPath(); ctx.arc(ex, ey, eR * 0.18, 0, Math.PI * 2); ctx.fill();

      // Corner brackets
      const bS = eR * 0.35;
      const bD = eR * 1.1;
      ctx.strokeStyle = `${eyeColor}44`;
      ctx.lineWidth = Math.max(0.5, r * 0.012);
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        ctx.beginPath();
        ctx.moveTo(ex + dx * bD, ey + dy * bD - dy * bS);
        ctx.lineTo(ex + dx * bD, ey + dy * bD);
        ctx.lineTo(ex + dx * bD - dx * bS, ey + dy * bD);
        ctx.stroke();
      }
    }
  } else if (style === "sleepy") {
    // Dimmed / low-power mode — thin fading scan lines
    for (let side = -1; side <= 1; side += 2) {
      const ex = r * 0.22;
      const ey = side * r * 0.28;
      const eW = Math.max(4, r * 0.28);

      // Dim glow
      const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, eW);
      glow.addColorStop(0, `${eyeColor}15`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(ex, ey, eW, 0, Math.PI * 2); ctx.fill();

      // Thin horizontal line (dimmed visor)
      const fade = 0.3 + Math.sin(t * 0.5 + side) * 0.1;
      const bar = ctx.createLinearGradient(ex - eW * 0.5, ey, ex + eW * 0.5, ey);
      bar.addColorStop(0, `${eyeColor}00`);
      bar.addColorStop(0.3, `${eyeColor}${Math.floor(fade * 255).toString(16).padStart(2, "0")}`);
      bar.addColorStop(0.5, `${eyeColor}${Math.floor(fade * 200).toString(16).padStart(2, "0")}`);
      bar.addColorStop(0.7, `${eyeColor}${Math.floor(fade * 255).toString(16).padStart(2, "0")}`);
      bar.addColorStop(1, `${eyeColor}00`);
      ctx.fillStyle = bar;
      ctx.beginPath();
      ctx.roundRect(ex - eW * 0.45, ey - 1, eW * 0.9, 2, 1);
      ctx.fill();

      // Occasional flicker
      if (Math.sin(t * 12 + side * 5) > 0.95) {
        ctx.fillStyle = `${eyeColor}44`;
        ctx.beginPath();
        ctx.roundRect(ex - eW * 0.3, ey - 0.5, eW * 0.6, 1, 0.5);
        ctx.fill();
      }
    }
  } else if (style === "wink") {
    // One active visor + one offline/dark
    const eW = Math.max(4, r * 0.32);
    const eH = Math.max(2, r * 0.09);

    // Active eye (top)
    const ex1 = r * 0.22;
    const ey1 = -r * 0.28;

    const glow = ctx.createRadialGradient(ex1, ey1, 0, ex1, ey1, eW * 1.5);
    glow.addColorStop(0, `${eyeColor}33`);
    glow.addColorStop(0.5, `${eyeColor}11`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(ex1, ey1, eW * 1.5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.roundRect(ex1 - eW * 0.55, ey1 - eH * 1.2, eW * 1.1, eH * 2.4, eH * 0.4);
    ctx.fill();

    const bar = ctx.createLinearGradient(ex1 - eW * 0.5, ey1, ex1 + eW * 0.5, ey1);
    bar.addColorStop(0, `${eyeColor}00`);
    bar.addColorStop(0.15, eyeColor);
    bar.addColorStop(0.5, "#ffffff");
    bar.addColorStop(0.85, eyeColor);
    bar.addColorStop(1, `${eyeColor}00`);
    ctx.fillStyle = bar;
    ctx.beginPath();
    ctx.roundRect(ex1 - eW * 0.45, ey1 - eH * 0.5, eW * 0.9, eH, eH * 0.3);
    ctx.fill();

    // Scan line
    const scanX = ex1 - eW * 0.4 + ((t * 40) % (eW * 0.8));
    ctx.strokeStyle = `rgba(255,255,255,0.6)`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(scanX, ey1 - eH * 0.5); ctx.lineTo(scanX, ey1 + eH * 0.5); ctx.stroke();

    // Offline eye (bottom) — dark with faint static
    const ex2 = r * 0.22;
    const ey2 = r * 0.28;

    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.roundRect(ex2 - eW * 0.55, ey2 - eH * 0.8, eW * 1.1, eH * 1.6, eH * 0.3);
    ctx.fill();

    // Static noise dots
    for (let i = 0; i < 5; i++) {
      const nx = ex2 - eW * 0.3 + (i * eW * 0.15);
      const ny = ey2 + Math.sin(t * 20 + i * 7) * eH * 0.3;
      ctx.fillStyle = `${eyeColor}22`;
      ctx.fillRect(nx, ny, eW * 0.04, 1);
    }
  } else if (style === "blush") {
    // Circuit trace eyes — eye bars with radiating circuit lines
    for (let side = -1; side <= 1; side += 2) {
      const ex = r * 0.22;
      const ey = side * r * 0.28;
      const eW = Math.max(4, r * 0.28);
      const eH = Math.max(2, r * 0.08);

      // Glow
      const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, eW * 1.2);
      glow.addColorStop(0, `${eyeColor}33`);
      glow.addColorStop(0.5, `${eyeColor}11`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(ex, ey, eW * 1.2, 0, Math.PI * 2); ctx.fill();

      // Visor bar
      const bar = ctx.createLinearGradient(ex - eW * 0.5, ey, ex + eW * 0.5, ey);
      bar.addColorStop(0, `${eyeColor}00`);
      bar.addColorStop(0.2, eyeColor);
      bar.addColorStop(0.5, "#ffffffcc");
      bar.addColorStop(0.8, eyeColor);
      bar.addColorStop(1, `${eyeColor}00`);
      ctx.fillStyle = bar;
      ctx.beginPath();
      ctx.roundRect(ex - eW * 0.45, ey - eH * 0.5, eW * 0.9, eH, eH * 0.3);
      ctx.fill();

      // Circuit traces radiating outward
      ctx.strokeStyle = `${eyeColor}44`;
      ctx.lineWidth = Math.max(0.5, r * 0.01);
      const traceLen = eW * 0.6;
      // Right trace
      ctx.beginPath();
      ctx.moveTo(ex + eW * 0.4, ey);
      ctx.lineTo(ex + eW * 0.4 + traceLen * 0.4, ey);
      ctx.lineTo(ex + eW * 0.4 + traceLen * 0.4, ey + side * traceLen * 0.3);
      ctx.lineTo(ex + eW * 0.4 + traceLen * 0.7, ey + side * traceLen * 0.3);
      ctx.stroke();
      // Left trace
      ctx.beginPath();
      ctx.moveTo(ex - eW * 0.4, ey);
      ctx.lineTo(ex - eW * 0.4 - traceLen * 0.4, ey);
      ctx.lineTo(ex - eW * 0.4 - traceLen * 0.4, ey - side * traceLen * 0.3);
      ctx.stroke();

      // Junction nodes
      ctx.fillStyle = `${eyeColor}66`;
      ctx.beginPath(); ctx.arc(ex + eW * 0.4 + traceLen * 0.7, ey + side * traceLen * 0.3, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex - eW * 0.4 - traceLen * 0.4, ey - side * traceLen * 0.3, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  } else if (style === "star") {
    // Quantum eyes — orbiting energy rings with pulsing core
    for (let side = -1; side <= 1; side += 2) {
      const ex = r * 0.22;
      const ey = side * r * 0.28;
      const eR = Math.max(3, r * 0.16);

      // Outer energy field
      const field = ctx.createRadialGradient(ex, ey, 0, ex, ey, eR * 2.5);
      field.addColorStop(0, `${eyeColor}22`);
      field.addColorStop(0.4, `${eyeColor}08`);
      field.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = field;
      ctx.beginPath(); ctx.arc(ex, ey, eR * 2.5, 0, Math.PI * 2); ctx.fill();

      // Orbiting ring 1 (fast)
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(t * 2.5 + side);
      ctx.strokeStyle = `${eyeColor}66`;
      ctx.lineWidth = Math.max(1, r * 0.02);
      ctx.beginPath(); ctx.ellipse(0, 0, eR * 1.3, eR * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      // Orbiting ring 2 (slow, perpendicular)
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(-t * 1.2 + side + Math.PI / 2);
      ctx.strokeStyle = `${eyeColor}44`;
      ctx.lineWidth = Math.max(0.5, r * 0.015);
      ctx.beginPath(); ctx.ellipse(0, 0, eR * 1.1, eR * 0.35, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      // Core eye — dark center with bright ring
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath(); ctx.arc(ex, ey, eR * 0.7, 0, Math.PI * 2); ctx.fill();

      const core = ctx.createRadialGradient(ex, ey, 0, ex, ey, eR * 0.7);
      core.addColorStop(0, "#ffffff");
      core.addColorStop(0.2, eyeColor);
      core.addColorStop(0.8, `${eyeColor}88`);
      core.addColorStop(1, `${eyeColor}00`);
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(ex, ey, eR * 0.7, 0, Math.PI * 2); ctx.fill();

      // Bright core dot (pulsing)
      const pulse = 0.7 + Math.sin(t * 5) * 0.3;
      ctx.fillStyle = `rgba(255,255,255,${pulse * 0.9})`;
      ctx.beginPath(); ctx.arc(ex, ey, eR * 0.15, 0, Math.PI * 2); ctx.fill();

      // Orbiting particles
      for (let i = 0; i < 2; i++) {
        const pAngle = t * (3 + i) + side * Math.PI + i * Math.PI * 0.7;
        const pDist = eR * (1.0 + i * 0.3);
        const px = ex + Math.cos(pAngle) * pDist;
        const py = ey + Math.sin(pAngle) * pDist * 0.5;
        ctx.fillStyle = `${eyeColor}88`;
        ctx.beginPath(); ctx.arc(px, py, eR * 0.06, 0, Math.PI * 2); ctx.fill();
      }
    }
  } else if (style === "wisp") {
    // Ghostly floating wisps — ethereal drifting orbs
    for (let side = -1; side <= 1; side += 2) {
      const ex = r * 0.22;
      const ey = side * r * 0.28;
      const eR = Math.max(3, r * 0.14);

      // Floating wisps orbiting loosely
      for (let i = 0; i < 3; i++) {
        const wAngle = t * (0.8 + i * 0.3) + side * Math.PI * 0.5 + i * 2.1;
        const wDist = eR * (0.6 + i * 0.35);
        const wx = ex + Math.cos(wAngle) * wDist;
        const wy = ey + Math.sin(wAngle) * wDist * 0.6;
        const wSize = eR * (0.15 + Math.sin(t * 2 + i) * 0.05);

        const wisp = ctx.createRadialGradient(wx, wy, 0, wx, wy, wSize * 3);
        wisp.addColorStop(0, `${eyeColor}55`);
        wisp.addColorStop(0.5, `${eyeColor}22`);
        wisp.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = wisp;
        ctx.beginPath(); ctx.arc(wx, wy, wSize * 3, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = `${eyeColor}88`;
        ctx.beginPath(); ctx.arc(wx, wy, wSize, 0, Math.PI * 2); ctx.fill();
      }

      // Central ghost core
      const core = ctx.createRadialGradient(ex, ey, 0, ex, ey, eR);
      core.addColorStop(0, `${eyeColor}44`);
      core.addColorStop(0.5, `${eyeColor}18`);
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(ex, ey, eR, 0, Math.PI * 2); ctx.fill();

      // Eyes — two small bright dots
      const eyeSpacing = eR * 0.25;
      const eyeY = -eR * 0.08;
      ctx.fillStyle = `rgba(255,255,255,0.8)`;
      ctx.beginPath(); ctx.arc(ex - eyeSpacing, ey + eyeY, eR * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(ex + eyeSpacing, ey + eyeY, eR * 0.1, 0, Math.PI * 2); ctx.fill();
    }
  } else if (style === "flare") {
    // Bright starburst flare — radiating beams from center
    for (let side = -1; side <= 1; side += 2) {
      const ex = r * 0.22;
      const ey = side * r * 0.28;
      const eR = Math.max(3, r * 0.16);

      // Outer glow
      const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, eR * 2.5);
      glow.addColorStop(0, `${eyeColor}30`);
      glow.addColorStop(0.5, `${eyeColor}10`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(ex, ey, eR * 2.5, 0, Math.PI * 2); ctx.fill();

      // Radiating beams (rotating)
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(t * 0.3);
      const beamCount = 8;
      for (let i = 0; i < beamCount; i++) {
        const bAngle = (Math.PI * 2 / beamCount) * i;
        const bLen = eR * (1.4 + Math.sin(t * 3 + i * 0.8) * 0.3);
        const bW = eR * 0.06;
        ctx.fillStyle = `${eyeColor}33`;
        ctx.beginPath();
        ctx.moveTo(Math.cos(bAngle) * eR * 0.3, Math.sin(bAngle) * eR * 0.3);
        ctx.lineTo(Math.cos(bAngle - bW) * bLen, Math.sin(bAngle - bW) * bLen);
        ctx.lineTo(Math.cos(bAngle + bW) * bLen, Math.sin(bAngle + bW) * bLen);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();

      // Core bright dot (pulsing)
      const pulse = 0.7 + Math.sin(t * 6) * 0.3;
      const coreGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, eR * 0.6);
      coreGlow.addColorStop(0, `rgba(255,255,255,${pulse})`);
      coreGlow.addColorStop(0.4, eyeColor);
      coreGlow.addColorStop(1, `${eyeColor}00`);
      ctx.fillStyle = coreGlow;
      ctx.beginPath(); ctx.arc(ex, ey, eR * 0.6, 0, Math.PI * 2); ctx.fill();

      // Cross flare spikes
      ctx.strokeStyle = `${eyeColor}55`;
      ctx.lineWidth = Math.max(1, r * 0.015);
      const spikeLen = eR * 1.8;
      ctx.beginPath(); ctx.moveTo(ex - spikeLen, ey); ctx.lineTo(ex + spikeLen, ey); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex, ey - spikeLen); ctx.lineTo(ex, ey + spikeLen); ctx.stroke();
    }
  } else if (style === "aurora") {
    // Flowing aurora borealis — wavy colorful bands
    for (let side = -1; side <= 1; side += 2) {
      const ex = r * 0.22;
      const ey = side * r * 0.28;
      const eR = Math.max(3, r * 0.16);

      // Aurora bands (3 wavy lines)
      for (let band = 0; band < 3; band++) {
        const bandOffset = (band - 1) * eR * 0.3;
        const bandAlpha = 0.3 + band * 0.1;
        ctx.beginPath();
        for (let x = -eR * 1.5; x <= eR * 1.5; x += 2) {
          const wave = Math.sin(x * 0.08 + t * 2 + band * 1.5) * eR * 0.15;
          const fade = 1 - Math.abs(x) / (eR * 1.5);
          const py = ey + bandOffset + wave;
          if (x === -eR * 1.5) ctx.moveTo(ex + x, py);
          else ctx.lineTo(ex + x, py);
        }
        ctx.strokeStyle = `${eyeColor}${Math.floor(bandAlpha * 255).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = Math.max(2, r * 0.03);
        ctx.stroke();
      }

      // Soft glow center
      const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, eR * 1.5);
      glow.addColorStop(0, `${eyeColor}25`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(ex, ey, eR * 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  ctx.restore();
}
