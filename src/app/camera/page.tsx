"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type FilterType = "none" | "dreamy" | "cosmic" | "neon" | "ocean" | "sunset" | "aurora" | "glitch" | "vintage" | "noir" | "frost" | "ember" | "botanical" | "midnight" | "golden" | "infrared" | "softfocus" | "vivid" | "muted" | "holographic" | "solarflare" | "deepspace" | "prism" | "vaporwave" | "cinematic" | "rain" | "autumn" | "cherryblossom" | "desert" | "melancholy" | "euphoria" | "ethereal" | "noirchrome" | "lomo" | "polaroid" | "filmgrain";

const FILTERS: { type: FilterType; name: string; icon: string; css: string; overlay?: string; category: string }[] = [
  { type: "none", name: "None", icon: "📷", css: "none", category: "basic" },
  { type: "dreamy", name: "Dreamy", icon: "🌙", css: "brightness(1.2) contrast(0.82) saturate(1.5) blur(1px)", overlay: "radial-gradient(circle at 40% 40%, rgba(255,180,240,0.18) 0%, transparent 50%), radial-gradient(circle at 65% 60%, rgba(180,200,255,0.14) 0%, transparent 45%), radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)", category: "basic" },
  { type: "vintage", name: "Vintage", icon: "📜", css: "brightness(0.85) contrast(1.2) saturate(0.55) sepia(0.4)", overlay: "linear-gradient(180deg, rgba(180,110,30,0.14) 0%, rgba(120,70,20,0.08) 40%, transparent 70%), radial-gradient(circle, transparent 50%, rgba(80,40,10,0.18) 100%)", category: "basic" },
  { type: "noir", name: "Noir", icon: "🖤", css: "brightness(0.82) contrast(1.55) grayscale(1)", overlay: "radial-gradient(circle, transparent 30%, rgba(0,0,0,0.3) 100%), linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 30%, rgba(0,0,0,0.12) 100%)", category: "basic" },
  { type: "softfocus", name: "Soft Focus", icon: "🫧", css: "brightness(1.25) contrast(0.75) saturate(0.85) blur(1.5px)", overlay: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,240,250,0.12) 40%, transparent 75%)", category: "basic" },
  { type: "vivid", name: "Vivid", icon: "🔥", css: "brightness(1.1) contrast(1.45) saturate(2.0)", overlay: "radial-gradient(circle at 15% 85%, rgba(255,40,40,0.08) 0%, transparent 35%), radial-gradient(circle at 85% 15%, rgba(40,80,255,0.08) 0%, transparent 35%), radial-gradient(circle at 50% 50%, rgba(255,255,0,0.04) 0%, transparent 50%)", category: "basic" },
  { type: "muted", name: "Muted", icon: "🌫", css: "brightness(1.1) contrast(0.82) saturate(0.3) sepia(0.12)", overlay: "linear-gradient(180deg, rgba(160,165,180,0.12) 0%, rgba(180,175,165,0.08) 50%, rgba(150,155,170,0.06) 100%)", category: "basic" },
  { type: "cosmic", name: "Cosmic", icon: "🌌", css: "brightness(1.08) contrast(1.25) saturate(1.6) hue-rotate(25deg)", overlay: "radial-gradient(circle at 50% 50%, rgba(120,60,220,0.22) 0%, rgba(80,40,180,0.1) 40%, transparent 70%), radial-gradient(circle at 20% 80%, rgba(60,20,140,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(100,40,200,0.06) 0%, transparent 35%)", category: "creative" },
  { type: "neon", name: "Neon", icon: "💡", css: "brightness(1.3) contrast(1.5) saturate(2.4) hue-rotate(-12deg)", overlay: "radial-gradient(circle at 15% 85%, rgba(255,0,120,0.16) 0%, transparent 35%), radial-gradient(circle at 85% 15%, rgba(0,220,255,0.16) 0%, transparent 35%), radial-gradient(circle at 50% 50%, rgba(200,0,255,0.06) 0%, transparent 50%)", category: "creative" },
  { type: "aurora", name: "Aurora", icon: "🌠", css: "brightness(1.15) contrast(1.12) saturate(1.8) hue-rotate(65deg)", overlay: "linear-gradient(180deg, rgba(10,200,100,0.16) 0%, rgba(0,180,200,0.14) 25%, rgba(80,60,220,0.16) 50%, rgba(140,40,200,0.12) 75%, rgba(10,180,120,0.1) 100%)", category: "creative" },
  { type: "glitch", name: "Glitch", icon: "⚡", css: "brightness(1.18) contrast(1.55) saturate(2.0) hue-rotate(95deg)", overlay: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,80,0.04) 2px, rgba(255,0,80,0.04) 4px), repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(0,200,255,0.025) 6px, rgba(0,200,255,0.025) 8px)", category: "creative" },
  { type: "holographic", name: "Holographic", icon: "🌈", css: "brightness(1.14) contrast(1.12) saturate(1.6) hue-rotate(18deg)", overlay: "conic-gradient(from 0deg at 50% 50%, rgba(255,0,100,0.1), rgba(255,180,0,0.08), rgba(0,255,100,0.1), rgba(0,180,255,0.08), rgba(180,0,255,0.1), rgba(255,0,100,0.1))", category: "creative" },
  { type: "solarflare", name: "Solar Flare", icon: "☀️", css: "brightness(1.4) contrast(0.95) saturate(1.25) sepia(0.15)", overlay: "radial-gradient(ellipse at 75% 15%, rgba(255,220,60,0.3) 0%, rgba(255,140,0,0.15) 25%, rgba(255,60,0,0.06) 50%, transparent 75%), radial-gradient(circle at 30% 70%, rgba(255,200,100,0.06) 0%, transparent 40%)", category: "creative" },
  { type: "deepspace", name: "Deep Space", icon: "🕳", css: "brightness(0.45) contrast(1.6) saturate(0.6) hue-rotate(225deg)", overlay: "radial-gradient(circle, transparent 15%, rgba(5,5,50,0.3) 40%, rgba(2,2,20,0.6) 100%)", category: "creative" },
  { type: "prism", name: "Prism", icon: "🔺", css: "brightness(1.12) contrast(1.22) saturate(1.5) hue-rotate(50deg)", overlay: "conic-gradient(from 30deg at 50% 50%, rgba(255,40,40,0.08), rgba(255,200,40,0.07), rgba(40,255,40,0.08), rgba(40,200,255,0.07), rgba(100,40,255,0.08), rgba(255,40,200,0.07), rgba(255,40,40,0.08))", category: "creative" },
  { type: "vaporwave", name: "Vaporwave", icon: "🌸", css: "brightness(1.12) contrast(1.22) saturate(1.7) hue-rotate(-22deg) sepia(0.14)", overlay: "linear-gradient(180deg, rgba(255,60,180,0.14) 0%, rgba(180,40,255,0.1) 35%, rgba(60,100,255,0.08) 65%, rgba(0,220,240,0.12) 100%)", category: "creative" },
  { type: "cinematic", name: "Cinematic", icon: "🎬", css: "brightness(0.9) contrast(1.35) saturate(0.82) sepia(0.08)", overlay: "linear-gradient(180deg, rgba(0,50,90,0.14) 0%, transparent 30%, transparent 70%, rgba(200,100,30,0.1) 100%)", category: "creative" },
  { type: "ocean", name: "Ocean", icon: "🌊", css: "brightness(1.0) contrast(1.12) saturate(1.3) hue-rotate(185deg) saturate(1.7)", overlay: "linear-gradient(180deg, rgba(0,80,160,0.16) 0%, rgba(0,140,200,0.1) 35%, rgba(0,100,150,0.06) 65%, transparent 100%)", category: "nature" },
  { type: "sunset", name: "Sunset", icon: "🌅", css: "brightness(1.1) contrast(1.12) saturate(1.6) hue-rotate(-32deg) sepia(0.24)", overlay: "linear-gradient(180deg, rgba(255,120,20,0.16) 0%, rgba(255,60,80,0.12) 30%, rgba(160,40,160,0.1) 60%, rgba(40,20,100,0.08) 100%)", category: "nature" },
  { type: "frost", name: "Frost", icon: "❄️", css: "brightness(1.22) contrast(0.88) saturate(0.65) hue-rotate(12deg)", overlay: "radial-gradient(circle at 50% 50%, rgba(200,230,255,0.22) 0%, rgba(160,200,240,0.1) 40%, transparent 70%), radial-gradient(circle at 20% 30%, rgba(220,240,255,0.08) 0%, transparent 30%)", category: "nature" },
  { type: "ember", name: "Ember", icon: "🔥", css: "brightness(0.98) contrast(1.3) saturate(1.5) hue-rotate(-18deg) sepia(0.22)", overlay: "radial-gradient(ellipse at 50% 100%, rgba(255,50,0,0.2) 0%, rgba(220,30,0,0.1) 30%, rgba(180,20,0,0.04) 55%, transparent 75%)", category: "nature" },
  { type: "botanical", name: "Botanical", icon: "🌿", css: "brightness(1.08) contrast(1.1) saturate(1.4) hue-rotate(48deg)", overlay: "radial-gradient(circle at 25% 65%, rgba(15,110,45,0.14) 0%, rgba(10,80,30,0.06) 40%, transparent 65%), radial-gradient(circle at 75% 30%, rgba(20,100,40,0.06) 0%, transparent 35%)", category: "nature" },
  { type: "rain", name: "Rain", icon: "🌧", css: "brightness(0.82) contrast(1.12) saturate(0.48) hue-rotate(198deg)", overlay: "linear-gradient(180deg, rgba(70,90,130,0.18) 0%, rgba(55,75,110,0.12) 30%, rgba(40,55,85,0.08) 60%, rgba(30,40,60,0.05) 100%)", category: "nature" },
  { type: "autumn", name: "Autumn", icon: "🍂", css: "brightness(1.06) contrast(1.14) saturate(1.4) hue-rotate(-28deg) sepia(0.24)", overlay: "linear-gradient(180deg, rgba(230,150,30,0.12) 0%, rgba(200,80,10,0.08) 40%, rgba(150,40,5,0.05) 70%, transparent 100%)", category: "nature" },
  { type: "cherryblossom", name: "Cherry Blossom", icon: "🌸", css: "brightness(1.14) contrast(0.9) saturate(1.05) hue-rotate(-10deg)", overlay: "radial-gradient(circle at 65% 35%, rgba(255,160,195,0.18) 0%, rgba(255,120,160,0.08) 35%, transparent 65%), radial-gradient(circle at 30% 70%, rgba(255,180,210,0.06) 0%, transparent 30%)", category: "nature" },
  { type: "desert", name: "Desert", icon: "🏜", css: "brightness(1.25) contrast(0.85) saturate(0.6) sepia(0.35) hue-rotate(-10deg)", overlay: "linear-gradient(180deg, rgba(245,210,140,0.12) 0%, rgba(220,180,110,0.08) 40%, rgba(200,160,90,0.04) 70%, transparent 100%)", category: "nature" },
  { type: "midnight", name: "Midnight", icon: "🌑", css: "brightness(0.55) contrast(1.35) saturate(0.75) hue-rotate(215deg)", overlay: "linear-gradient(180deg, rgba(8,12,35,0.4) 0%, rgba(15,10,45,0.2) 40%, rgba(10,8,30,0.1) 70%, transparent 100%)", category: "mood" },
  { type: "golden", name: "Golden", icon: "✨", css: "brightness(1.22) contrast(1.1) saturate(1.3) sepia(0.2) hue-rotate(-14deg)", overlay: "radial-gradient(circle at 50% 45%, rgba(255,200,40,0.18) 0%, rgba(255,160,20,0.08) 40%, transparent 70%)", category: "mood" },
  { type: "infrared", name: "Infrared", icon: "🔴", css: "brightness(1.12) contrast(1.3) saturate(0.35) hue-rotate(335deg) saturate(2.4)", overlay: "radial-gradient(circle at 50% 50%, rgba(255,0,50,0.08) 0%, rgba(200,0,40,0.04) 40%, transparent 65%)", category: "mood" },
  { type: "melancholy", name: "Melancholy", icon: "💧", css: "brightness(0.75) contrast(1.12) saturate(0.35) hue-rotate(215deg) sepia(0.12)", overlay: "linear-gradient(180deg, rgba(35,55,95,0.18) 0%, rgba(28,40,75,0.14) 30%, rgba(22,30,55,0.1) 60%, rgba(15,20,40,0.06) 100%)", category: "mood" },
  { type: "euphoria", name: "Euphoria", icon: "💫", css: "brightness(1.24) contrast(0.98) saturate(1.5) hue-rotate(12deg)", overlay: "radial-gradient(circle at 35% 30%, rgba(255,180,50,0.18) 0%, rgba(255,100,70,0.1) 30%, rgba(220,60,140,0.06) 55%, transparent 80%)", category: "mood" },
  { type: "ethereal", name: "Ethereal", icon: "👻", css: "brightness(1.45) contrast(0.72) saturate(0.4) blur(0.5px)", overlay: "radial-gradient(circle, rgba(255,255,255,0.32) 0%, rgba(230,235,255,0.14) 35%, rgba(200,210,240,0.06) 60%, transparent 80%)", category: "mood" },
  { type: "noirchrome", name: "Noir Chrome", icon: "🔘", css: "brightness(0.9) contrast(1.6) grayscale(1) sepia(0.05) hue-rotate(188deg)", overlay: "linear-gradient(180deg, rgba(12,25,55,0.15) 0%, transparent 35%, transparent 65%, rgba(8,18,40,0.1) 100%), radial-gradient(circle, transparent 40%, rgba(0,0,0,0.2) 100%)", category: "mood" },
  { type: "lomo", name: "Lomo", icon: "📷", css: "brightness(1.14) contrast(1.4) saturate(1.8) sepia(0.14)", overlay: "radial-gradient(circle, transparent 28%, rgba(0,0,0,0.45) 100%)", category: "mood" },
  { type: "polaroid", name: "Polaroid", icon: "🖼", css: "brightness(1.08) contrast(1.1) saturate(0.72) sepia(0.18) hue-rotate(-6deg)", overlay: "linear-gradient(180deg, rgba(255,242,210,0.12) 0%, rgba(230,210,170,0.08) 35%, rgba(200,180,140,0.05) 65%, rgba(170,150,110,0.03) 100%)", category: "retro" },
  { type: "filmgrain", name: "Film Grain", icon: "🎞", css: "brightness(1.0) contrast(1.25) saturate(0.75) sepia(0.2)", overlay: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.02) 1px, rgba(0,0,0,0.02) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.015) 1px, rgba(0,0,0,0.015) 2px), linear-gradient(180deg, rgba(150,130,90,0.06) 0%, rgba(100,80,50,0.04) 100%)", category: "retro" },
];

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("none");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [photos, setPhotos] = useState<{ url: string; filter: string; timestamp: number }[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [timer, setTimer] = useState<0 | 3 | 5 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [isMirrored, setIsMirrored] = useState(true);
  const [resolution, setResolution] = useState<"720p" | "1080p" | "4K">("720p");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const getResolution = useCallback(() => {
    switch (resolution) {
      case "1080p": return { width: 1920, height: 1080 };
      case "4K": return { width: 3840, height: 2160 };
      default: return { width: 1280, height: 720 };
    }
  }, [resolution]);

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      const res = getResolution();
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: res.width }, height: { ideal: res.height } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setStream(s);
      setCameraError(null);
    } catch (err) {
      setCameraError("Camera access denied. Please allow camera permissions in your browser settings.");
    }
  }, [stream, getResolution]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [facingMode, resolution]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Apply manual adjustments
    const filterStr = `brightness(${brightness / 100}) contrast(${contrast / 100}) saturate(${saturation / 100})`;
    const filterCss = FILTERS.find(f => f.type === activeFilter);
    ctx.filter = filterCss && filterCss.css !== "none" ? `${filterCss.css} ${filterStr}` : filterStr;

    if (isMirrored && facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = "none";

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPhotos(prev => [{ url: dataUrl, filter: activeFilter, timestamp: Date.now() }, ...prev]);

    setIsCapturing(true);
    setTimeout(() => setIsCapturing(false), 200);
  }, [activeFilter, brightness, contrast, saturation, isMirrored, facingMode]);

  const handleCapture = useCallback(() => {
    if (timer > 0) {
      setCountdown(timer);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            capturePhoto();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      capturePhoto();
    }
  }, [timer, capturePhoto]);

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    setIsMirrored(prev => !prev);
  }, []);

  const downloadPhoto = useCallback((dataUrl: string) => {
    const link = document.createElement("a");
    link.download = `elovayne-${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();
  }, []);

  const deletePhoto = useCallback((index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }, []);

  const filteredFilters = filterCategory === "all" ? FILTERS : FILTERS.filter(f => f.category === filterCategory);
  const categories = ["all", "basic", "creative", "nature", "mood", "retro"];

  const currentFilter = FILTERS.find(f => f.type === activeFilter);
  const customFilter = `brightness(${brightness / 100}) contrast(${contrast / 100}) saturate(${saturation / 100}) ${currentFilter?.css !== "none" ? currentFilter?.css : ""}`;

  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 pt-14 h-screen flex flex-col">
        {/* Header */}
        <div className="px-4 py-2 flex items-center justify-between" style={{ background: "rgba(255, 255, 255, 0.95)", borderBottom: "1px solid rgba(0, 0, 0, 0.06)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold tracking-wide" style={{ color: "#0891b2" }}>Cosmic Camera</h1>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(8, 145, 178, 0.08)", color: "rgba(8, 145, 178, 0.6)", border: "1px solid rgba(8, 145, 178, 0.12)" }}>{resolution}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 rounded-lg transition-all text-sm"
              style={{ background: showSettings ? "rgba(8, 145, 178, 0.08)" : "transparent", color: showSettings ? "#0891b2" : "#94a3b8", border: "1px solid rgba(0, 0, 0, 0.06)" }}
            >⚙</button>
            <button onClick={() => setShowGallery(!showGallery)} className="p-1.5 rounded-lg transition-all text-sm"
              style={{ background: showGallery ? "rgba(8, 145, 178, 0.08)" : "transparent", color: showGallery ? "#0891b2" : "#94a3b8", border: "1px solid rgba(0, 0, 0, 0.06)" }}
            >
              🖼 {photos.length > 0 && <span className="text-[9px] ml-0.5">{photos.length}</span>}
            </button>
          </div>
        </div>

        {/* Camera view */}
        <div className="flex-1 relative overflow-hidden" style={{ background: "#000" }}>
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#f8fafc" }}>
              <div className="text-center p-8 max-w-md">
                <div className="text-5xl mb-4">📸</div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: "#0f172a" }}>Camera Access Required</h2>
                <p className="text-sm mb-6" style={{ color: "#64748b" }}>{cameraError}</p>
                <button onClick={() => startCamera(facingMode)} className="px-6 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ background: "rgba(8, 145, 178, 0.08)", border: "1px solid rgba(8, 145, 178, 0.2)", color: "#0891b2" }}
                >Try Again</button>
              </div>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: customFilter, transform: isMirrored && facingMode === "user" ? "scaleX(-1)" : "none" }}
              />

              {/* Filter overlay */}
              {currentFilter?.overlay && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: currentFilter.overlay, mixBlendMode: "screen" }} />
              )}

              {/* Flash */}
              {isCapturing && <div className="absolute inset-0 bg-white pointer-events-none z-10" style={{ animation: "flash 0.3s ease-out" }} />}

              {/* Grid overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div className="w-full h-full" style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
                    backgroundSize: "33.333% 33.333%",
                  }} />
                </div>
              )}

              {/* Countdown */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                    className="text-7xl font-bold" style={{ color: "#0891b2", textShadow: "0 2px 20px rgba(8, 145, 178, 0.3)" }}
                  >{countdown}</motion.div>
                </div>
              )}

              {/* Settings panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
                    className="absolute top-0 right-0 bottom-0 w-72 z-30 overflow-y-auto"
                    style={{ background: "rgba(255, 255, 255, 0.97)", borderLeft: "1px solid rgba(0, 0, 0, 0.06)", backdropFilter: "blur(16px)" }}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold" style={{ color: "#0f172a" }}>Settings</span>
                        <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                      </div>

                      {/* Resolution */}
                      <div className="mb-4">
                        <div className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: "#94a3b8" }}>Resolution</div>
                        <div className="flex gap-1">
                          {(["720p", "1080p", "4K"] as const).map(r => (
                            <button key={r} onClick={() => setResolution(r)} className="flex-1 px-2 py-1.5 rounded-lg text-xs transition-all font-medium"
                              style={{ background: resolution === r ? "rgba(8, 145, 178, 0.08)" : "transparent", color: resolution === r ? "#0891b2" : "#94a3b8", border: `1px solid ${resolution === r ? "rgba(8, 145, 178, 0.2)" : "rgba(0, 0, 0, 0.06)"}` }}
                            >{r}</button>
                          ))}
                        </div>
                      </div>

                      {/* Timer */}
                      <div className="mb-4">
                        <div className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: "#94a3b8" }}>Timer</div>
                        <div className="flex gap-1">
                          {([0, 3, 5, 10] as const).map(t => (
                            <button key={t} onClick={() => setTimer(t)} className="flex-1 px-2 py-1.5 rounded-lg text-xs transition-all font-medium"
                              style={{ background: timer === t ? "rgba(8, 145, 178, 0.08)" : "transparent", color: timer === t ? "#0891b2" : "#94a3b8", border: `1px solid ${timer === t ? "rgba(8, 145, 178, 0.2)" : "rgba(0, 0, 0, 0.06)"}` }}
                            >{t === 0 ? "Off" : `${t}s`}</button>
                          ))}
                        </div>
                      </div>

                      {/* Adjustments */}
                      <div className="mb-4">
                        <div className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: "#94a3b8" }}>Adjustments</div>
                        {[
                          { label: "Brightness", value: brightness, set: setBrightness, min: 50, max: 150 },
                          { label: "Contrast", value: contrast, set: setContrast, min: 50, max: 150 },
                          { label: "Saturation", value: saturation, set: setSaturation, min: 0, max: 200 },
                        ].map(adj => (
                          <div key={adj.label} className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px]" style={{ color: "#64748b" }}>{adj.label}</span>
                              <span className="text-[10px] font-mono" style={{ color: "#0891b2" }}>{adj.value}%</span>
                            </div>
                            <input type="range" min={adj.min} max={adj.max} value={adj.value}
                              onChange={e => adj.set(Number(e.target.value))} className="w-full" style={{ accentColor: "#0891b2" }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Toggles */}
                      <div className="space-y-2">
                        <button onClick={() => setShowGrid(!showGrid)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all"
                          style={{ background: showGrid ? "rgba(8, 145, 178, 0.06)" : "transparent", border: "1px solid rgba(0, 0, 0, 0.06)" }}
                        >
                          <span style={{ color: "#64748b" }}>Grid Overlay</span>
                          <span style={{ color: showGrid ? "#0891b2" : "#cbd5e1" }}>{showGrid ? "ON" : "OFF"}</span>
                        </button>
                        <button onClick={() => setIsMirrored(!isMirrored)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all"
                          style={{ background: "transparent", border: "1px solid rgba(0, 0, 0, 0.06)" }}
                        >
                          <span style={{ color: "#64748b" }}>Mirror</span>
                          <span style={{ color: isMirrored ? "#0891b2" : "#cbd5e1" }}>{isMirrored ? "ON" : "OFF"}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Filter selector */}
        <div className="px-2 py-2" style={{ background: "rgba(255, 255, 255, 0.95)", borderTop: "1px solid rgba(0, 0, 0, 0.06)", backdropFilter: "blur(12px)" }}>
          {/* Category tabs */}
          <div className="flex gap-1 mb-2 px-1">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)} className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider transition-all font-medium"
                style={{ background: filterCategory === cat ? "rgba(8, 145, 178, 0.08)" : "transparent", color: filterCategory === cat ? "#0891b2" : "#94a3b8", border: `1px solid ${filterCategory === cat ? "rgba(8, 145, 178, 0.15)" : "transparent"}` }}
              >{cat}</button>
            ))}
          </div>
          {/* Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {filteredFilters.map(f => (
              <button key={f.type} onClick={() => setActiveFilter(f.type)}
                className="flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all"
                style={{
                  background: activeFilter === f.type ? "rgba(8, 145, 178, 0.06)" : "transparent",
                  border: `1px solid ${activeFilter === f.type ? "rgba(8, 145, 178, 0.18)" : "rgba(0, 0, 0, 0.04)"}`,
                  minWidth: "52px",
                }}
              >
                <span className="text-base">{f.icon}</span>
                <span className="text-[8px] font-medium" style={{ color: activeFilter === f.type ? "#0891b2" : "#94a3b8" }}>{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Capture controls */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: "rgba(255, 255, 255, 0.95)" }}>
          {/* Last photo preview */}
          <div className="w-12 h-12 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0, 0, 0, 0.08)" }}>
            {photos.length > 0 ? (
              <img src={photos[0].url} alt="Last photo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: "#f1f5f9" }}>
                <span className="text-xs" style={{ color: "#cbd5e1" }}>📷</span>
              </div>
            )}
          </div>

          {/* Capture button */}
          <button onClick={handleCapture} disabled={!!cameraError}
            className="relative w-18 h-18 rounded-full transition-all flex items-center justify-center"
            style={{
              width: "72px",
              height: "72px",
              background: cameraError ? "#f1f5f9" : "rgba(8, 145, 178, 0.06)",
              border: `3px solid ${cameraError ? "#e2e8f0" : "rgba(8, 145, 178, 0.3)"}`,
              cursor: cameraError ? "not-allowed" : "pointer",
              boxShadow: cameraError ? "none" : "0 2px 12px rgba(8, 145, 178, 0.1)",
            }}
          >
            <div className="rounded-full" style={{
              width: "56px",
              height: "56px",
              background: cameraError ? "#e2e8f0" : "rgba(8, 145, 178, 0.15)",
              transition: "transform 0.1s",
            }} />
            {timer > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: "rgba(8, 145, 178, 0.12)", color: "#0891b2" }}
              >{timer}</div>
            )}
          </button>

          {/* Camera flip */}
          <button onClick={toggleCamera}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
            style={{ background: "#f1f5f9", border: "1px solid rgba(0, 0, 0, 0.06)", color: "#64748b" }}
          >🔄</button>
        </div>
      </div>

      {/* Gallery overlay */}
      <AnimatePresence>
        {showGallery && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(255, 255, 255, 0.97)", backdropFilter: "blur(16px)" }}
          >
            <div className="p-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6 pt-2">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: "#0f172a" }}>Gallery</h2>
                  <p className="text-[10px]" style={{ color: "#94a3b8" }}>{photos.length} photo{photos.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowGallery(false)} className="p-2 rounded-lg transition-all" style={{ color: "#94a3b8" }}>✕</button>
              </div>
              {photos.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-4xl mb-3">📸</div>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>No photos yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo, i) => (
                    <motion.div key={photo.timestamp} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="relative rounded-xl overflow-hidden group" style={{ border: "1px solid rgba(0, 0, 0, 0.06)" }}
                    >
                      <img src={photo.url} alt={`Photo ${i + 1}`} className="w-full aspect-[4/3] object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255, 255, 255, 0.9)", color: "#0891b2" }}>{photo.filter}</span>
                          <div className="flex gap-1.5">
                            <button onClick={() => downloadPhoto(photo.url)} className="p-1.5 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.9)" }}>⬇</button>
                            <button onClick={() => deletePhoto(i)} className="p-1.5 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.8)", color: "#fff" }}>🗑</button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />
      <style>{`
        @keyframes flash { 0% { opacity: 0.8; } 100% { opacity: 0; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
