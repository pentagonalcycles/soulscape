"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCamera } from "@/hooks/useCamera";
import { FILTER_PRESETS, FilterPreset } from "./filterPresets";
import FilterCanvas from "./FilterCanvas";
import { drawFrame } from "./PhotoFrames";
import { useIsPlus } from "@/lib/premium";

const CAPTURE_W = 1280;
const CAPTURE_H = 720;

interface CosmicCameraProps {
  mode?: "standalone" | "profile" | "post";
  onCapture?: (blob: Blob, dataUrl: string) => void;
}

export default function CosmicCamera({ mode = "standalone", onCapture }: CosmicCameraProps) {
  const { videoRef, isStreaming, facing, error, startCamera, switchCamera } = useCamera();
  const isPlus = useIsPlus();

  // Core state
  const [activeFilter, setActiveFilter] = useState<FilterPreset>(FILTER_PRESETS[0]);
  const [showFilters, setShowFilters] = useState(true);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [viewingFullscreen, setViewingFullscreen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Features
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [recentPhotos, setRecentPhotos] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "1:1" | "4:3">("16:9");
  const [showAspectMenu, setShowAspectMenu] = useState(false);
  const [exposure, setExposure] = useState(0);
  const [showExposure, setShowExposure] = useState(false);
  const [timerDuration, setTimerDuration] = useState<0 | 3 | 5 | 10>(0);
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  // New features
  const [nightMode, setNightMode] = useState(false);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [burstMode, setBurstMode] = useState(false);
  const [burstCount, setBurstCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#a78bfa");
  const [drawSize, setDrawSize] = useState(4);
  const [showDrawTools, setShowDrawTools] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState("none");
  const [showFrames, setShowFrames] = useState(false);
  const [doubleExposurePhoto, setDoubleExposurePhoto] = useState<string | null>(null);
  const [showDoubleExposure, setShowDoubleExposure] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const filterCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const burstRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => { startCamera(); }, 100);
    return () => clearTimeout(timer);
  }, []);

  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); }, []);

  const finalizeCapture = useCallback((cap: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    cap.toBlob((blob) => {
      if (!blob) return;
      setCapturedBlob(blob);
      const dataUrl = cap.toDataURL("image/jpeg", 0.92);
      setCapturedPhoto(dataUrl);
      setRecentPhotos(prev => [dataUrl, ...prev].slice(0, 12));
      setBurstCount(p => p + 1);
    }, "image/jpeg", 0.92);
  }, []);

  // Capture logic
  const doCapture = useCallback(() => {
    const fc = filterCanvasRef.current;
    if (!fc) return;
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 300);

    const cap = document.createElement("canvas");
    cap.width = CAPTURE_W; cap.height = CAPTURE_H;
    const ctx = cap.getContext("2d");
    if (!ctx) return;

    // If double exposure mode, blend with previous photo
    if (showDoubleExposure && doubleExposurePhoto) {
      const img = new Image();
      img.onload = () => {
        ctx.globalAlpha = 0.5;
        ctx.drawImage(img, 0, 0, CAPTURE_W, CAPTURE_H);
        ctx.globalAlpha = 0.5;
        ctx.drawImage(fc, 0, 0, CAPTURE_W, CAPTURE_H);
        ctx.globalAlpha = 1;
        if (selectedFrame !== "none") drawFrame(ctx, selectedFrame, CAPTURE_W, CAPTURE_H);
        finalizeCapture(cap, ctx);
      };
      img.src = doubleExposurePhoto;
    } else {
      ctx.drawImage(fc, 0, 0, CAPTURE_W, CAPTURE_H);
      if (selectedFrame !== "none") drawFrame(ctx, selectedFrame, CAPTURE_W, CAPTURE_H);
      finalizeCapture(cap, ctx);
    }
  }, [selectedFrame, showDoubleExposure, doubleExposurePhoto, finalizeCapture]);

  // Countdown
  const startCountdown = useCallback(() => {
    if (timerDuration === 0) { doCapture(); return; }
    setCountdown(timerDuration);
    let remaining = timerDuration;
    countdownRef.current = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setCountdown(null);
        doCapture();
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }, [timerDuration, doCapture]);

  const handleCapture = useCallback(() => {
    if (burstMode) {
      // Burst: 5 rapid captures
      let count = 0;
      setBurstCount(0);
      burstRef.current = setInterval(() => {
        doCapture();
        count++;
        if (count >= 5) {
          if (burstRef.current) clearInterval(burstRef.current);
          showToast("◈ Burst complete — 5 photos");
        }
      }, 300);
    } else {
      startCountdown();
    }
  }, [burstMode, startCountdown, doCapture, showToast]);

  const handleSave = useCallback(async () => {
    if (!capturedBlob) return;
    const fn = `cosmic-${Date.now()}.jpg`;
    const file = new File([capturedBlob], fn, { type: "image/jpeg" });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "Cosmic Photo" }); showToast("◈ Shared"); return; } catch {}
    }
    const url = URL.createObjectURL(capturedBlob);
    const a = document.createElement("a"); a.href = url; a.download = fn; a.click();
    URL.revokeObjectURL(url); showToast("◈ Saved");
    if (mode !== "standalone" && onCapture) onCapture(capturedBlob, capturedPhoto!);
  }, [capturedBlob, capturedPhoto, mode, onCapture, showToast]);

  const handleRetake = useCallback(() => {
    setCapturedPhoto(null); setCapturedBlob(null); setViewingFullscreen(false);
    setIsDrawing(false); setShowDrawTools(false); setBurstCount(0);
  }, []);

  // Drawing handlers
  const handleDrawStart = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawCanvasRef.current) return;
    isDrawingRef.current = true;
    const rect = drawCanvasRef.current.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    const scaleX = CAPTURE_W / rect.width;
    const scaleY = CAPTURE_H / rect.height;
    lastPosRef.current = { x: x * scaleX, y: y * scaleY };
  }, [isDrawing]);

  const handleDrawMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !drawCanvasRef.current || !lastPosRef.current) return;
    const ctx = drawCanvasRef.current.getContext("2d");
    if (!ctx) return;
    const rect = drawCanvasRef.current.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    const scaleX = CAPTURE_W / rect.width;
    const scaleY = CAPTURE_H / rect.height;
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(x * scaleX, y * scaleY);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = drawSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPosRef.current = { x: x * scaleX, y: y * scaleY };
  }, [drawColor, drawSize]);

  const handleDrawEnd = useCallback(() => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  // Merge drawing with photo
  const mergeDrawing = useCallback(() => {
    if (!capturedPhoto || !drawCanvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      const cap = document.createElement("canvas");
      cap.width = CAPTURE_W; cap.height = CAPTURE_H;
      const ctx = cap.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, CAPTURE_W, CAPTURE_H);
      ctx.drawImage(drawCanvasRef.current!, 0, 0, CAPTURE_W, CAPTURE_H);
      cap.toBlob((blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        setCapturedPhoto(cap.toDataURL("image/jpeg", 0.92));
        setIsDrawing(false);
        showToast("◈ Drawing saved");
      }, "image/jpeg", 0.92);
    };
    img.src = capturedPhoto;
  }, [capturedPhoto, showToast]);

  const DRAW_COLORS = ["#a78bfa", "#f093b8", "#10b981", "#2dd4a8", "#60a5fa", "#ffffff", "#ff4444", "#000000"];

  const aspectClass = aspectRatio === "1:1" ? "aspect-square" : aspectRatio === "4:3" ? "aspect-[4/3]" : "aspect-video";

  // Compute effective filter with night mode boost
  const effectiveFilter: FilterPreset = {
    ...activeFilter,
    brightness: activeFilter.brightness + exposure * 0.01 + (nightMode ? 1.5 : 0),
    contrast: activeFilter.contrast - (nightMode ? 0.5 : 0),
    saturate: activeFilter.saturate + (nightMode ? 0.8 : 0),
    blur: activeFilter.blur + (nightMode ? 0.5 : 0),
    tintColor: nightMode ? "rgba(80, 60, 180, 0.3)" : activeFilter.tintColor,
    tintOpacity: nightMode ? Math.max(activeFilter.tintOpacity, 0.3) : activeFilter.tintOpacity,
    vignetteStrength: nightMode ? Math.max(activeFilter.vignetteStrength, 0.4) : activeFilter.vignetteStrength,
    radialGlow: nightMode
      ? { color: "rgba(100, 80, 200, 0.2)", size: 0.7, opacity: 0.5 }
      : activeFilter.radialGlow,
  };

  return (
    <div ref={containerRef} className="cosmic-camera-viewport">
      <video ref={videoRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.01, zIndex: 0 }} playsInline muted />

      {/* ── LIVE VIEWFINDER ── */}
      {isStreaming && !capturedPhoto && (
        <div className={`cam-viewfinder ${aspectClass}`}>
          <FilterCanvas
            videoRef={videoRef}
            filter={effectiveFilter}
            width={CAPTURE_W}
            height={CAPTURE_H}
            isStreaming={isStreaming}
            ref={filterCanvasRef}
            mirrored={facing === "user" || mirrorMode}
          />
          {showGrid && (
            <div className="cam-grid-overlay">
              <div className="cam-grid-line cam-grid-v1" /><div className="cam-grid-line cam-grid-v2" />
              <div className="cam-grid-line cam-grid-h1" /><div className="cam-grid-line cam-grid-h2" />
            </div>
          )}
        </div>
      )}

      {/* ── DRAWING CANVAS (when in draw mode) ── */}
      {isDrawing && capturedPhoto && (
        <div className="cam-draw-container">
          <img src={capturedPhoto} alt="" className="cam-draw-bg" />
          <canvas
            ref={drawCanvasRef}
            width={CAPTURE_W}
            height={CAPTURE_H}
            className="cam-draw-canvas"
            onMouseDown={handleDrawStart}
            onMouseMove={handleDrawMove}
            onMouseUp={handleDrawEnd}
            onMouseLeave={handleDrawEnd}
            onTouchStart={handleDrawStart}
            onTouchMove={handleDrawMove}
            onTouchEnd={handleDrawEnd}
          />
          {/* Draw tools */}
          <div className="cam-draw-tools">
            <div className="cam-draw-colors">
              {DRAW_COLORS.map((c) => (
                <button key={c} onClick={() => setDrawColor(c)} className={`cam-draw-color ${drawColor === c ? "active" : ""}`} style={{ background: c }} />
              ))}
            </div>
            <div className="cam-draw-size-row">
              <span className="cam-draw-label">Size</span>
              <input type="range" min="1" max="20" value={drawSize} onChange={(e) => setDrawSize(parseInt(e.target.value))} className="cam-draw-slider" />
              <span className="cam-draw-value">{drawSize}</span>
            </div>
            <div className="cam-draw-actions">
              <button onClick={() => { setIsDrawing(false); setShowDrawTools(false); }} className="cam-draw-btn">Cancel</button>
              <button onClick={mergeDrawing} className="cam-draw-btn save">Save Drawing</button>
            </div>
          </div>
        </div>
      )}

      {/* ── START PROMPT ── */}
      {!isStreaming && !error && !capturedPhoto && (
        <div className="cosmic-camera-start">
          <motion.button onClick={() => startCamera()} className="cosmic-camera-start-btn" whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
            <span style={{ fontSize: 48 }}>◈</span>
          </motion.button>
          <p className="cosmic-camera-start-label">Tap to start camera</p>
          <p style={{ fontSize: 10, color: "rgba(139,92,246,0.3)", marginTop: 8 }}>Camera access required</p>
        </div>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div className="cosmic-camera-start">
          <div className="cosmic-camera-error-card">
            <span style={{ fontSize: 36, display: "block", marginBottom: 16, color: "rgba(255,100,100,0.7)" }}>⊗</span>
            <p style={{ color: "#f0eaf8", fontSize: 14, marginBottom: 16, textAlign: "center", maxWidth: 280 }}>{error}</p>
            <button onClick={() => startCamera()} className="cosmic-camera-retry-btn">Try Again</button>
          </div>
        </div>
      )}

      {/* ── FLASH ── */}
      <AnimatePresence>
        {flashActive && <motion.div className="cam-flash" initial={{ opacity: 1 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />}
      </AnimatePresence>

      {/* ── COUNTDOWN ── */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div className="cam-countdown" key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
            {countdown}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HUD ── */}
      <div className="cosmic-camera-hud">
        <span className="cosmic-hud-dot" />
        <span>{capturedPhoto ? "◈ CAPTURED" : isStreaming ? "◎ LIVE" : "◇ READY"}</span>
        {isStreaming && !capturedPhoto && (
          <>
            <span className="cosmic-hud-sep">│</span><span>{activeFilter.icon} {activeFilter.name}</span>
            <span className="cosmic-hud-sep">│</span><span>{aspectRatio}</span>
            {nightMode && <><span className="cosmic-hud-sep">│</span><span>NIGHT</span></>}
            {mirrorMode && <><span className="cosmic-hud-sep">│</span><span>Mirror</span></>}
            {burstMode && <><span className="cosmic-hud-sep">│</span><span>BURST</span></>}
            {exposure !== 0 && <><span className="cosmic-hud-sep">│</span><span>EV{exposure > 0 ? "+" : ""}{exposure}</span></>}
            {timerDuration > 0 && <><span className="cosmic-hud-sep">│</span><span>TMR::{timerDuration}s</span></>}
          </>
        )}
        {burstCount > 0 && burstMode && <><span className="cosmic-hud-sep">│</span><span>{burstCount}/5</span></>}
      </div>

      {/* ═══════════════════════════════════════
          MODE 1: LIVE CAMERA
          ═══════════════════════════════════════ */}
      {isStreaming && !capturedPhoto && (
        <div className="cosmic-camera-controls">
          {/* Filter row */}
          {showFilters && (
            <div className="cosmic-camera-filters">
              <div className="cosmic-camera-filters-scroll">
                {FILTER_PRESETS.map((f) => {
                  const canUse = f.isFree || isPlus;
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        if (!canUse) { showToast("Plus feature"); return; }
                        setActiveFilter(f);
                      }}
                      className={`cosmic-filter-pill ${activeFilter.id === f.id ? "active" : ""} ${!canUse ? "locked" : ""}`}
                    >
                      <span className="cosmic-filter-icon">{f.icon}</span>
                      <span className="cosmic-filter-name">{f.name}</span>
                      {!f.isFree && !isPlus && <span className="cosmic-filter-plus">+</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tools row 1 */}
          <div className="cam-tools-row">
            <button onClick={() => setShowGrid(p => !p)} className={`cam-tool-btn ${showGrid ? "on" : ""}`} title="Grid">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="1" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /></svg>
            </button>
            <button onClick={() => setShowTimerMenu(p => !p)} className={`cam-tool-btn ${timerDuration > 0 ? "on" : ""}`} title="Timer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M5 3L2 6" /><path d="M22 6l-3-3" /><path d="M12 5V3" /></svg>
              {timerDuration > 0 && <span className="cam-tool-badge">{timerDuration}s</span>}
            </button>
            <button onClick={() => { if (isPlus) setNightMode(p => !p); else showToast("Plus feature"); }} className={`cam-tool-btn ${nightMode ? "on" : ""} ${!isPlus ? "locked" : ""}`} title="Night mode" disabled={!isPlus}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
              {!isPlus && <span className="cam-tool-badge">+</span>}
            </button>
            <button onClick={() => { if (isPlus) setMirrorMode(p => !p); else showToast("Plus feature"); }} className={`cam-tool-btn ${mirrorMode ? "on" : ""} ${!isPlus ? "locked" : ""}`} title="Mirror" disabled={!isPlus}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v18M16 7l-4-4-4 4M8 17l4 4 4-4" /></svg>
              {!isPlus && <span className="cam-tool-badge">+</span>}
            </button>
            <button onClick={() => { if (isPlus) setBurstMode(p => !p); else showToast("Plus feature"); }} className={`cam-tool-btn ${burstMode ? "on" : ""} ${!isPlus ? "locked" : ""}`} title="Burst mode" disabled={!isPlus}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="6" height="12" rx="1" /><rect x="9" y="6" width="6" height="12" rx="1" /><rect x="16" y="6" width="6" height="12" rx="1" /></svg>
              {!isPlus && <span className="cam-tool-badge">+</span>}
            </button>
          </div>

          {/* Tools row 2 */}
          <div className="cam-tools-row">
            <button onClick={() => setShowAspectMenu(p => !p)} className="cam-tool-btn" title="Aspect ratio">
              <span className="cam-tool-text">{aspectRatio}</span>
            </button>
            <button onClick={() => { if (isPlus) setShowExposure(p => !p); else showToast("Plus feature"); }} className={`cam-tool-btn ${exposure !== 0 ? "on" : ""} ${!isPlus ? "locked" : ""}`} title="Exposure" disabled={!isPlus}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              {exposure !== 0 && <span className="cam-tool-badge">{exposure > 0 ? "+" : ""}{exposure}</span>}
              {!isPlus && <span className="cam-tool-badge">+</span>}
            </button>
            <button onClick={() => { if (isPlus) setShowDoubleExposure(p => !p); else showToast("Plus feature"); }} className={`cam-tool-btn ${showDoubleExposure ? "on" : ""} ${!isPlus ? "locked" : ""}`} title="Double exposure" disabled={!isPlus}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="9" r="7" opacity="0.5" /><circle cx="15" cy="15" r="7" opacity="0.5" /></svg>
              {!isPlus && <span className="cam-tool-badge">+</span>}
            </button>
            <button onClick={() => { if (isPlus) setShowFrames(p => !p); else showToast("Plus feature"); }} className={`cam-tool-btn ${showFrames ? "on" : ""} ${!isPlus ? "locked" : ""}`} title="Frames" disabled={!isPlus}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2" /><rect x="5" y="5" width="14" height="14" rx="1" /></svg>
              {!isPlus && <span className="cam-tool-badge">+</span>}
            </button>
            <button onClick={() => setShowFilters(p => !p)} className={`cam-tool-btn ${showFilters ? "on" : ""}`} title="Filters">
              ◎
            </button>
          </div>

          {/* Submenus */}
          <AnimatePresence>
            {showTimerMenu && (
              <motion.div className="cam-submenu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                {[0, 3, 5, 10].map((t) => (
                  <button key={t} onClick={() => { setTimerDuration(t as 0|3|5|10); setShowTimerMenu(false); }} className={`cam-submenu-btn ${timerDuration === t ? "active" : ""}`}>
                    {t === 0 ? "Off" : `${t}s`}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showAspectMenu && (
              <motion.div className="cam-submenu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                {(["16:9", "1:1", "4:3"] as const).map((r) => (
                  <button key={r} onClick={() => { setAspectRatio(r); setShowAspectMenu(false); }} className={`cam-submenu-btn ${aspectRatio === r ? "active" : ""}`}>{r}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showExposure && (
              <motion.div className="cam-exposure-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <span className="cam-exposure-label">EV</span>
                <input type="range" min="-50" max="50" value={exposure} onChange={(e) => setExposure(parseInt(e.target.value))} className="cam-exposure-slider" />
                <span className="cam-exposure-value">{exposure > 0 ? "+" : ""}{exposure}</span>
                <button onClick={() => { setExposure(0); setShowExposure(false); }} className="cam-exposure-reset">Reset</button>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showDoubleExposure && (
              <motion.div className="cam-submenu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <span className="cam-submenu-label">Double Exposure</span>
                <button onClick={() => { if (recentPhotos.length > 0) { setDoubleExposurePhoto(recentPhotos[0]); showToast("◈ Base photo set"); } else { showToast("Take a photo first"); } }} className="cam-submenu-btn">Use Last Photo</button>
                <button onClick={() => { setDoubleExposurePhoto(null); setShowDoubleExposure(false); }} className="cam-submenu-btn">Clear</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom */}
          <div className="cosmic-camera-bottom">
            <button onClick={() => setShowGallery(p => !p)} className="cam-gallery-btn" title="Recent photos">
              {recentPhotos.length > 0 ? (
                <img src={recentPhotos[0]} alt="" className="cam-gallery-thumb" />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
              )}
            </button>
            <motion.button onClick={handleCapture} className={`cosmic-camera-shutter ${burstMode ? "burst" : ""}`} whileTap={{ scale: 0.88 }} disabled={countdown !== null}>
              <div className="cosmic-camera-shutter-ring" />
              <div className="cosmic-camera-shutter-dot" />
            </motion.button>
            <button onClick={switchCamera} className="cosmic-camera-side-btn" title="Switch camera">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16.5 9.5l2.5-2.5 2.5 2.5" /><path d="M19 7v6a4 4 0 01-4 4H7" /><path d="M7.5 14.5L5 17l-2.5-2.5" /><path d="M5 17v-6a4 4 0 014-4h8" /></svg>
            </button>
          </div>

          {/* Gallery overlay */}
          <AnimatePresence>
            {showGallery && recentPhotos.length > 0 && (
              <motion.div className="cam-gallery-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                <div className="cam-gallery-scroll">
                  {recentPhotos.map((photo, i) => (
                    <button key={i} onClick={() => { setCapturedPhoto(photo); setShowGallery(false); }} className="cam-gallery-item">
                      <img src={photo} alt={`Photo ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MODE 2: PHOTO CAPTURED
          ═══════════════════════════════════════ */}
      {capturedPhoto && !viewingFullscreen && !isDrawing && (
        <>
          <img src={capturedPhoto} alt="Your photo" className="cosmic-camera-preview-img" />
          <div className="cosmic-camera-controls">
            {/* Edit tools */}
            <div className="cam-tools-row">
              <button onClick={() => { setIsDrawing(true); setShowDrawTools(true); }} className="cam-tool-btn" title="Draw">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /></svg>
              </button>
              <button onClick={() => setViewingFullscreen(true)} className="cam-tool-btn" title="View fullscreen">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
              </button>
              <button onClick={() => { setDoubleExposurePhoto(capturedPhoto); showToast("◈ Set as double exposure base"); }} className="cam-tool-btn" title="Use for double exposure">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="9" r="7" opacity="0.5" /><circle cx="15" cy="15" r="7" opacity="0.5" /></svg>
              </button>
            </div>

            <div className="cosmic-camera-bottom captured">
              <button onClick={handleRetake} className="cosmic-camera-side-btn" title="Retake">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
              </button>
              <motion.button onClick={() => setViewingFullscreen(true)} className="cosmic-camera-shutter view" whileTap={{ scale: 0.88 }}>
                <div className="cosmic-camera-shutter-ring view-ring" />
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ position: "relative", zIndex: 1 }}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
              </motion.button>
              <button onClick={handleSave} className="cosmic-camera-side-btn save" title="Save">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 15V3m0 12l-4-4m4 4l4-4" /><path d="M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" /></svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════
          MODE 3: FULLSCREEN VIEWER
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {viewingFullscreen && capturedPhoto && (
          <motion.div className="cosmic-photo-viewer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <img src={capturedPhoto} alt="Your cosmic photo" className="cosmic-photo-viewer-img" />
            <div className="cosmic-photo-viewer-actions">
              <button onClick={() => setViewingFullscreen(false)} className="cosmic-viewer-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                <span>Close</span>
              </button>
              <button onClick={handleSave} className="cosmic-viewer-btn save">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15V3m0 12l-4-4m4 4l4-4"/><path d="M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"/></svg>
                <span>Save</span>
              </button>
              <button onClick={handleRetake} className="cosmic-viewer-btn retake">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                <span>Retake</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <motion.div className="cosmic-camera-toast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{toast}</motion.div>}
      </AnimatePresence>
    </div>
  );
}
