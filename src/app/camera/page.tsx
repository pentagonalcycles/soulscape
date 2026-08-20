"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type FilterType = "none" | "dreamy" | "cosmic" | "neon" | "ocean" | "sunset" | "aurora" | "glitch" | "vintage" | "noir" | "frost" | "ember" | "botanical" | "midnight" | "golden" | "infrared" | "softfocus" | "vivid" | "muted" | "holographic" | "solarflare" | "deepspace" | "prism" | "vaporwave" | "cinematic" | "rain" | "autumn" | "cherryblossom" | "desert" | "melancholy" | "euphoria" | "ethereal" | "noirchrome" | "lomo" | "polaroid" | "filmgrain";

const FILTERS: { type: FilterType; name: string; icon: string; css: string; overlay?: string; category: string }[] = [
  { type: "none", name: "None", icon: "📷", css: "none", category: "basic" },
  { type: "dreamy", name: "Dreamy", icon: "🌙", css: "brightness(1.25) contrast(0.8) saturate(1.6) blur(1.2px)", overlay: "radial-gradient(circle at 40% 35%, rgba(255,170,240,0.25) 0%, transparent 45%), radial-gradient(circle at 68% 55%, rgba(160,190,255,0.2) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 65%), linear-gradient(180deg, rgba(255,200,255,0.06) 0%, transparent 40%)", category: "basic" },
  { type: "vintage", name: "Vintage", icon: "📜", css: "brightness(0.88) contrast(1.25) saturate(0.5) sepia(0.45)", overlay: "linear-gradient(180deg, rgba(200,120,30,0.18) 0%, rgba(140,80,20,0.1) 35%, transparent 60%), radial-gradient(circle, transparent 35%, rgba(100,50,10,0.25) 100%), radial-gradient(ellipse at 80% 20%, rgba(255,200,100,0.08) 0%, transparent 30%)", category: "basic" },
  { type: "noir", name: "Noir", icon: "🖤", css: "brightness(0.8) contrast(1.6) grayscale(1)", overlay: "radial-gradient(circle, transparent 25%, rgba(0,0,0,0.4) 100%), linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.15) 100%), repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 4px)", category: "basic" },
  { type: "softfocus", name: "Soft Focus", icon: "🫧", css: "brightness(1.3) contrast(0.72) saturate(0.9) blur(1.8px)", overlay: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,240,250,0.15) 35%, transparent 70%), radial-gradient(ellipse at 30% 20%, rgba(255,220,240,0.08) 0%, transparent 30%)", category: "basic" },
  { type: "vivid", name: "Vivid", icon: "🔥", css: "brightness(1.12) contrast(1.5) saturate(2.2)", overlay: "radial-gradient(circle at 10% 90%, rgba(255,30,30,0.12) 0%, transparent 30%), radial-gradient(circle at 90% 10%, rgba(30,70,255,0.12) 0%, transparent 30%), radial-gradient(circle at 50% 50%, rgba(255,255,0,0.06) 0%, transparent 45%), radial-gradient(circle at 50% 100%, rgba(255,100,0,0.06) 0%, transparent 30%)", category: "basic" },
  { type: "muted", name: "Muted", icon: "🌫", css: "brightness(1.08) contrast(0.8) saturate(0.28) sepia(0.14)", overlay: "linear-gradient(180deg, rgba(170,175,190,0.16) 0%, rgba(190,185,175,0.1) 45%, rgba(160,165,180,0.08) 100%), radial-gradient(circle at 50% 50%, rgba(200,200,210,0.06) 0%, transparent 60%)", category: "basic" },
  { type: "cosmic", name: "Cosmic", icon: "🌌", css: "brightness(1.1) contrast(1.3) saturate(1.7) hue-rotate(25deg)", overlay: "radial-gradient(circle at 50% 45%, rgba(130,50,230,0.28) 0%, rgba(80,30,190,0.12) 35%, transparent 65%), radial-gradient(circle at 15% 85%, rgba(60,15,150,0.12) 0%, transparent 35%), radial-gradient(circle at 85% 15%, rgba(110,30,210,0.1) 0%, transparent 30%), radial-gradient(circle at 50% 50%, rgba(180,100,255,0.06) 0%, transparent 50%)", category: "creative" },
  { type: "neon", name: "Neon", icon: "💡", css: "brightness(1.35) contrast(1.55) saturate(2.6) hue-rotate(-12deg)", overlay: "radial-gradient(circle at 12% 88%, rgba(255,0,130,0.2) 0%, transparent 30%), radial-gradient(circle at 88% 12%, rgba(0,230,255,0.2) 0%, transparent 30%), radial-gradient(circle at 50% 50%, rgba(200,0,255,0.08) 0%, transparent 45%), repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,0,200,0.015) 4px, rgba(255,0,200,0.015) 5px)", category: "creative" },
  { type: "aurora", name: "Aurora", icon: "🌠", css: "brightness(1.18) contrast(1.15) saturate(1.9) hue-rotate(65deg)", overlay: "linear-gradient(180deg, rgba(10,210,110,0.2) 0%, rgba(0,190,210,0.18) 20%, rgba(90,50,230,0.2) 45%, rgba(150,30,210,0.16) 70%, rgba(10,190,130,0.12) 100%), radial-gradient(ellipse at 30% 40%, rgba(0,255,180,0.06) 0%, transparent 30%)", category: "creative" },
  { type: "glitch", name: "Glitch", icon: "⚡", css: "brightness(1.2) contrast(1.6) saturate(2.2) hue-rotate(95deg)", overlay: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,80,0.06) 2px, rgba(255,0,80,0.06) 4px), repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(0,210,255,0.04) 6px, rgba(0,210,255,0.04) 8px), linear-gradient(180deg, rgba(255,0,80,0.04) 0%, transparent 15%, transparent 85%, rgba(0,200,255,0.04) 100%)", category: "creative" },
  { type: "holographic", name: "Holographic", icon: "🌈", css: "brightness(1.16) contrast(1.15) saturate(1.7) hue-rotate(18deg)", overlay: "conic-gradient(from 0deg at 50% 50%, rgba(255,0,100,0.14), rgba(255,200,0,0.1), rgba(0,255,120,0.14), rgba(0,200,255,0.1), rgba(200,0,255,0.14), rgba(255,0,100,0.14)), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 50%)", category: "creative" },
  { type: "solarflare", name: "Solar Flare", icon: "☀️", css: "brightness(1.45) contrast(0.92) saturate(1.3) sepia(0.18)", overlay: "radial-gradient(ellipse at 78% 12%, rgba(255,230,60,0.35) 0%, rgba(255,150,0,0.2) 20%, rgba(255,60,0,0.08) 45%, transparent 70%), radial-gradient(circle at 25% 75%, rgba(255,200,100,0.08) 0%, transparent 35%), linear-gradient(180deg, rgba(255,200,50,0.04) 0%, transparent 30%)", category: "creative" },
  { type: "deepspace", name: "Deep Space", icon: "🕳", css: "brightness(0.42) contrast(1.65) saturate(0.55) hue-rotate(225deg)", overlay: "radial-gradient(circle, transparent 10%, rgba(5,5,55,0.35) 35%, rgba(2,2,25,0.65) 100%), radial-gradient(circle at 30% 40%, rgba(60,20,120,0.06) 0%, transparent 25%)", category: "creative" },
  { type: "prism", name: "Prism", icon: "🔺", css: "brightness(1.14) contrast(1.25) saturate(1.6) hue-rotate(50deg)", overlay: "conic-gradient(from 30deg at 50% 50%, rgba(255,40,40,0.1), rgba(255,210,40,0.08), rgba(40,255,50,0.1), rgba(40,210,255,0.08), rgba(110,40,255,0.1), rgba(255,40,210,0.08), rgba(255,40,40,0.1)), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 40%)", category: "creative" },
  { type: "vaporwave", name: "Vaporwave", icon: "🌸", css: "brightness(1.14) contrast(1.25) saturate(1.8) hue-rotate(-22deg) sepia(0.16)", overlay: "linear-gradient(180deg, rgba(255,60,190,0.18) 0%, rgba(190,30,255,0.14) 30%, rgba(50,90,255,0.1) 60%, rgba(0,230,245,0.14) 100%), radial-gradient(circle at 70% 30%, rgba(255,100,200,0.06) 0%, transparent 25%)", category: "creative" },
  { type: "cinematic", name: "Cinematic", icon: "🎬", css: "brightness(0.88) contrast(1.4) saturate(0.8) sepia(0.1)", overlay: "linear-gradient(180deg, rgba(0,50,100,0.18) 0%, transparent 25%, transparent 75%, rgba(210,110,30,0.12) 100%), radial-gradient(circle, transparent 40%, rgba(0,0,0,0.15) 100%)", category: "creative" },
  { type: "ocean", name: "Ocean", icon: "🌊", css: "brightness(1.02) contrast(1.15) saturate(1.4) hue-rotate(185deg) saturate(1.8)", overlay: "linear-gradient(180deg, rgba(0,90,170,0.2) 0%, rgba(0,150,210,0.14) 30%, rgba(0,110,160,0.08) 60%, transparent 100%), radial-gradient(circle at 60% 80%, rgba(0,180,220,0.06) 0%, transparent 30%)", category: "nature" },
  { type: "sunset", name: "Sunset", icon: "🌅", css: "brightness(1.12) contrast(1.15) saturate(1.7) hue-rotate(-32deg) sepia(0.26)", overlay: "linear-gradient(180deg, rgba(255,130,20,0.2) 0%, rgba(255,60,90,0.16) 25%, rgba(170,30,170,0.12) 55%, rgba(40,15,110,0.1) 100%), radial-gradient(ellipse at 50% 15%, rgba(255,200,100,0.06) 0%, transparent 30%)", category: "nature" },
  { type: "frost", name: "Frost", icon: "❄️", css: "brightness(1.25) contrast(0.86) saturate(0.6) hue-rotate(12deg)", overlay: "radial-gradient(circle at 50% 45%, rgba(210,235,255,0.28) 0%, rgba(170,210,245,0.12) 35%, transparent 65%), radial-gradient(circle at 18% 28%, rgba(230,245,255,0.1) 0%, transparent 25%), linear-gradient(180deg, rgba(200,220,255,0.06) 0%, transparent 30%)", category: "nature" },
  { type: "ember", name: "Ember", icon: "🔥", css: "brightness(1.0) contrast(1.35) saturate(1.6) hue-rotate(-18deg) sepia(0.24)", overlay: "radial-gradient(ellipse at 50% 100%, rgba(255,55,0,0.25) 0%, rgba(230,35,0,0.14) 25%, rgba(190,20,0,0.06) 50%, transparent 70%), radial-gradient(circle at 40% 60%, rgba(255,100,0,0.04) 0%, transparent 25%)", category: "nature" },
  { type: "botanical", name: "Botanical", icon: "🌿", css: "brightness(1.1) contrast(1.12) saturate(1.5) hue-rotate(48deg)", overlay: "radial-gradient(circle at 22% 68%, rgba(15,120,50,0.18) 0%, rgba(10,90,35,0.08) 35%, transparent 60%), radial-gradient(circle at 78% 28%, rgba(20,110,45,0.08) 0%, transparent 30%), linear-gradient(180deg, rgba(30,120,50,0.04) 0%, transparent 25%)", category: "nature" },
  { type: "rain", name: "Rain", icon: "🌧", css: "brightness(0.8) contrast(1.15) saturate(0.45) hue-rotate(198deg)", overlay: "linear-gradient(180deg, rgba(75,95,140,0.22) 0%, rgba(60,80,120,0.16) 25%, rgba(45,60,95,0.1) 55%, rgba(35,45,70,0.06) 100%), repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(150,180,220,0.02) 8px, rgba(150,180,220,0.02) 9px)", category: "nature" },
  { type: "autumn", name: "Autumn", icon: "🍂", css: "brightness(1.08) contrast(1.16) saturate(1.5) hue-rotate(-28deg) sepia(0.26)", overlay: "linear-gradient(180deg, rgba(240,160,30,0.16) 0%, rgba(210,90,10,0.1) 35%, rgba(160,45,5,0.06) 65%, transparent 100%), radial-gradient(circle at 70% 60%, rgba(200,100,20,0.04) 0%, transparent 25%)", category: "nature" },
  { type: "cherryblossom", name: "Cherry Blossom", icon: "🌸", css: "brightness(1.16) contrast(0.88) saturate(1.1) hue-rotate(-10deg)", overlay: "radial-gradient(circle at 62% 32%, rgba(255,165,200,0.22) 0%, rgba(255,125,165,0.1) 30%, transparent 60%), radial-gradient(circle at 28% 72%, rgba(255,185,215,0.08) 0%, transparent 25%), radial-gradient(circle at 80% 80%, rgba(255,200,220,0.04) 0%, transparent 20%)", category: "nature" },
  { type: "desert", name: "Desert", icon: "🏜", css: "brightness(1.28) contrast(0.82) saturate(0.55) sepia(0.38) hue-rotate(-10deg)", overlay: "linear-gradient(180deg, rgba(250,215,145,0.16) 0%, rgba(225,185,115,0.1) 35%, rgba(205,165,95,0.05) 65%, transparent 100%), radial-gradient(circle at 50% 30%, rgba(255,230,150,0.04) 0%, transparent 25%)", category: "nature" },
  { type: "midnight", name: "Midnight", icon: "🌑", css: "brightness(0.52) contrast(1.4) saturate(0.7) hue-rotate(215deg)", overlay: "linear-gradient(180deg, rgba(8,12,40,0.45) 0%, rgba(18,10,50,0.25) 35%, rgba(12,8,35,0.12) 65%, transparent 100%), radial-gradient(circle at 50% 20%, rgba(40,20,80,0.06) 0%, transparent 25%)", category: "mood" },
  { type: "golden", name: "Golden", icon: "✨", css: "brightness(1.25) contrast(1.12) saturate(1.35) sepia(0.22) hue-rotate(-14deg)", overlay: "radial-gradient(circle at 50% 42%, rgba(255,210,40,0.22) 0%, rgba(255,170,20,0.1) 35%, transparent 65%), radial-gradient(circle at 30% 70%, rgba(255,200,60,0.04) 0%, transparent 20%)", category: "mood" },
  { type: "infrared", name: "Infrared", icon: "🔴", css: "brightness(1.14) contrast(1.35) saturate(0.3) hue-rotate(335deg) saturate(2.6)", overlay: "radial-gradient(circle at 50% 50%, rgba(255,0,55,0.1) 0%, rgba(210,0,45,0.05) 35%, transparent 60%), linear-gradient(180deg, rgba(255,0,30,0.04) 0%, transparent 25%)", category: "mood" },
  { type: "melancholy", name: "Melancholy", icon: "💧", css: "brightness(0.72) contrast(1.15) saturate(0.32) hue-rotate(215deg) sepia(0.14)", overlay: "linear-gradient(180deg, rgba(40,60,100,0.22) 0%, rgba(30,45,80,0.18) 25%, rgba(25,35,60,0.12) 55%, rgba(18,22,45,0.08) 100%), radial-gradient(circle at 50% 50%, rgba(60,80,130,0.04) 0%, transparent 40%)", category: "mood" },
  { type: "euphoria", name: "Euphoria", icon: "💫", css: "brightness(1.28) contrast(0.96) saturate(1.6) hue-rotate(12deg)", overlay: "radial-gradient(circle at 32% 28%, rgba(255,185,55,0.22) 0%, rgba(255,105,75,0.12) 25%, rgba(230,65,145,0.06) 50%, transparent 75%), radial-gradient(circle at 70% 70%, rgba(255,150,100,0.04) 0%, transparent 20%)", category: "mood" },
  { type: "ethereal", name: "Ethereal", icon: "👻", css: "brightness(1.5) contrast(0.7) saturate(0.35) blur(0.6px)", overlay: "radial-gradient(circle, rgba(255,255,255,0.38) 0%, rgba(235,240,255,0.16) 30%, rgba(210,218,245,0.06) 55%, transparent 75%), radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.08) 0%, transparent 30%)", category: "mood" },
  { type: "noirchrome", name: "Noir Chrome", icon: "🔘", css: "brightness(0.88) contrast(1.65) grayscale(1) sepia(0.06) hue-rotate(188deg)", overlay: "linear-gradient(180deg, rgba(12,28,60,0.18) 0%, transparent 30%, transparent 70%, rgba(8,20,45,0.12) 100%), radial-gradient(circle, transparent 35%, rgba(0,0,0,0.25) 100%)", category: "mood" },
  { type: "lomo", name: "Lomo", icon: "📷", css: "brightness(1.16) contrast(1.45) saturate(1.9) sepia(0.16)", overlay: "radial-gradient(circle, transparent 22%, rgba(0,0,0,0.5) 100%), radial-gradient(circle at 50% 50%, rgba(255,200,100,0.04) 0%, transparent 40%)", category: "mood" },
  { type: "polaroid", name: "Polaroid", icon: "🖼", css: "brightness(1.1) contrast(1.12) saturate(0.7) sepia(0.2) hue-rotate(-6deg)", overlay: "linear-gradient(180deg, rgba(255,245,215,0.16) 0%, rgba(235,215,175,0.1) 30%, rgba(205,185,145,0.06) 60%, rgba(175,155,115,0.03) 100%), radial-gradient(circle at 50% 50%, rgba(255,240,200,0.04) 0%, transparent 40%)", category: "retro" },
  { type: "filmgrain", name: "Film Grain", icon: "🎞", css: "brightness(1.02) contrast(1.28) saturate(0.72) sepia(0.22)", overlay: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0.03) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.02) 1px, rgba(0,0,0,0.02) 2px), linear-gradient(180deg, rgba(160,140,95,0.08) 0%, rgba(110,90,55,0.05) 100%), radial-gradient(circle, transparent 50%, rgba(0,0,0,0.12) 100%)", category: "retro" },
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
  const [faceSmooth, setFaceSmooth] = useState(false);
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

  const faceSmoothFilter = faceSmooth ? "brightness(1.08) contrast(0.92) saturate(1.05) blur(0.4px)" : "";

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const filterStr = `brightness(${brightness / 100}) contrast(${contrast / 100}) saturate(${saturation / 100})`;
    const filterCss = FILTERS.find(f => f.type === activeFilter);
    const filterParts = [
      filterCss && filterCss.css !== "none" ? filterCss.css : "",
      filterStr,
      faceSmooth ? "brightness(1.08) contrast(0.92) saturate(1.05) blur(0.4px)" : "",
    ].filter(Boolean);
    ctx.filter = filterParts.join(" ") || "none";

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
  }, [activeFilter, brightness, contrast, saturation, isMirrored, facingMode, faceSmooth]);

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
  const customFilter = [
    `brightness(${brightness / 100})`,
    `contrast(${contrast / 100})`,
    `saturate(${saturation / 100})`,
    currentFilter?.css !== "none" ? currentFilter?.css : "",
    faceSmooth ? "brightness(1.08) contrast(0.92) saturate(1.05) blur(0.4px)" : "",
  ].filter(Boolean).join(" ");

  return (
    <main className="relative min-h-screen overflow-hidden" style={{
      background: "transparent",
    }}>
      {/* Magical animated background */}
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            top: "-15%",
            left: "-10%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "lobbyFloat1 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            bottom: "-10%",
            right: "-10%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)",
            filter: "blur(70px)",
            animation: "lobbyFloat2 25s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            top: "50%",
            left: "60%",
            background: "radial-gradient(circle, rgba(0, 212, 170, 0.2) 0%, transparent 70%)",
            filter: "blur(60px)",
            animation: "lobbyFloat3 18s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[350px] h-[350px] rounded-full"
          style={{
            top: "30%",
            right: "15%",
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)",
            filter: "blur(55px)",
            animation: "lobbyFloat4 22s ease-in-out infinite",
          }}
        />
      </div>
      )}

      <div className="relative z-10 pt-14 h-screen flex flex-col">
        {/* Header */}
        <div className="px-4 py-2 flex items-center justify-between" style={{ background: "rgba(20, 10, 40, 0.9)", borderBottom: "1px solid rgba(168, 85, 247, 0.15)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold tracking-wide" style={{ color: "#a855f7" }}>Cosmic Camera</h1>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(168, 85, 247, 0.08)", color: "rgba(168, 85, 247, 0.6)", border: "1px solid rgba(168, 85, 247, 0.12)" }}>{resolution}</span>
            {faceSmooth && (
              <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,180,220,0.1)", color: "rgba(255,180,220,0.7)", border: "1px solid rgba(255,180,220,0.15)" }}>✦ Smooth</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 rounded-lg transition-all text-sm"
              style={{ background: showSettings ? "rgba(168, 85, 247, 0.08)" : "transparent", color: showSettings ? "#a855f7" : "#7c3aed", border: "1px solid rgba(168, 85, 247, 0.08)" }}
            >⚙</button>
            <button onClick={() => setShowGallery(!showGallery)} className="p-1.5 rounded-lg transition-all text-sm"
              style={{ background: showGallery ? "rgba(168, 85, 247, 0.08)" : "transparent", color: showGallery ? "#a855f7" : "#7c3aed", border: "1px solid rgba(168, 85, 247, 0.08)" }}
            >
              🖼 {photos.length > 0 && <span className="text-[9px] ml-0.5">{photos.length}</span>}
            </button>
          </div>
        </div>

        {/* Camera view */}
        <div className="flex-1 relative overflow-hidden" style={{ background: "rgba(10, 5, 20, 0.95)" }}>
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(59, 130, 246, 0.05), rgba(0, 212, 170, 0.05))" }}>
              <div className="text-center p-8 max-w-md">
                <div className="text-5xl mb-4">📸</div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: "#e0f5e8" }}>Camera Access Required</h2>
                <p className="text-sm mb-6" style={{ color: "#a78bfa" }}>{cameraError}</p>
                <button onClick={() => startCamera(facingMode)} className="px-6 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.2)", color: "#a855f7" }}
                >Try Again</button>
              </div>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted
                className="absolute inset-0 w-full h-full object-contain"
                style={{ filter: customFilter, transform: isMirrored && facingMode === "user" ? "scaleX(-1)" : "none" }}
              />

              {/* Filter overlay */}
              {currentFilter?.overlay && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: currentFilter.overlay, mixBlendMode: "screen" }} />
              )}

              {/* Face smooth indicator overlay */}
              {faceSmooth && (
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,200,230,0.06) 0%, transparent 50%)", mixBlendMode: "screen" }} />
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
                    className="text-7xl font-bold" style={{ color: "#a855f7", textShadow: "0 2px 20px rgba(168, 85, 247, 0.3)" }}
                  >{countdown}</motion.div>
                </div>
              )}

              {/* Settings panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
                    className="absolute top-0 right-0 bottom-0 w-72 z-30 overflow-y-auto"
                    style={{ background: "rgba(20, 10, 40, 0.97)", borderLeft: "1px solid rgba(168, 85, 247, 0.08)", backdropFilter: "blur(16px)", boxShadow: "-4px 0 30px rgba(0, 0, 0, 0.4)" }}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold" style={{ color: "#e0f5e8" }}>Settings</span>
                        <button onClick={() => setShowSettings(false)} className="text-[#7c3aed] hover:text-[#a855f7] transition-colors">✕</button>
                      </div>

                      {/* Face Smooth */}
                      <div className="mb-4 p-3 rounded-xl" style={{ background: faceSmooth ? "rgba(255,180,220,0.06)" : "rgba(168, 85, 247, 0.03)", border: `1px solid ${faceSmooth ? "rgba(255,180,220,0.15)" : "rgba(168, 85, 247, 0.08)"}` }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider font-medium" style={{ color: faceSmooth ? "rgba(255,180,220,0.8)" : "#7c3aed" }}>Face Smooth</div>
                            <div className="text-[9px] mt-0.5" style={{ color: faceSmooth ? "rgba(255,180,220,0.5)" : "rgba(168, 85, 247, 0.3)" }}>Softens skin & reduces lines</div>
                          </div>
                          <button onClick={() => setFaceSmooth(!faceSmooth)}
                            className="relative w-10 h-5 rounded-full transition-all"
                            style={{ background: faceSmooth ? "rgba(255,180,220,0.25)" : "rgba(168, 85, 247, 0.1)", border: `1px solid ${faceSmooth ? "rgba(255,180,220,0.3)" : "rgba(168, 85, 247, 0.15)"}` }}
                          >
                            <div className="absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all"
                              style={{ background: faceSmooth ? "rgba(255,180,220,0.8)" : "rgba(168, 85, 247, 0.3)", left: faceSmooth ? "22px" : "2px" }}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Resolution */}
                      <div className="mb-4">
                        <div className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: "#7c3aed" }}>Resolution</div>
                        <div className="flex gap-1">
                          {(["720p", "1080p", "4K"] as const).map(r => (
                            <button key={r} onClick={() => setResolution(r)} className="flex-1 px-2 py-1.5 rounded-lg text-xs transition-all font-medium"
                              style={{ background: resolution === r ? "rgba(168, 85, 247, 0.08)" : "transparent", color: resolution === r ? "#a855f7" : "#7c3aed", border: `1px solid ${resolution === r ? "rgba(168, 85, 247, 0.2)" : "rgba(168, 85, 247, 0.08)"}` }}
                            >{r}</button>
                          ))}
                        </div>
                      </div>

                      {/* Timer */}
                      <div className="mb-4">
                        <div className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: "#7c3aed" }}>Timer</div>
                        <div className="flex gap-1">
                          {([0, 3, 5, 10] as const).map(t => (
                            <button key={t} onClick={() => setTimer(t)} className="flex-1 px-2 py-1.5 rounded-lg text-xs transition-all font-medium"
                              style={{ background: timer === t ? "rgba(168, 85, 247, 0.08)" : "transparent", color: timer === t ? "#a855f7" : "#7c3aed", border: `1px solid ${timer === t ? "rgba(168, 85, 247, 0.2)" : "rgba(168, 85, 247, 0.08)"}` }}
                            >{t === 0 ? "Off" : `${t}s`}</button>
                          ))}
                        </div>
                      </div>

                      {/* Adjustments */}
                      <div className="mb-4">
                        <div className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: "#7c3aed" }}>Adjustments</div>
                        {[
                          { label: "Brightness", value: brightness, set: setBrightness, min: 50, max: 150 },
                          { label: "Contrast", value: contrast, set: setContrast, min: 50, max: 150 },
                          { label: "Saturation", value: saturation, set: setSaturation, min: 0, max: 200 },
                        ].map(adj => (
                          <div key={adj.label} className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px]" style={{ color: "#a78bfa" }}>{adj.label}</span>
                              <span className="text-[10px] font-mono" style={{ color: "#a855f7" }}>{adj.value}%</span>
                            </div>
                            <input type="range" min={adj.min} max={adj.max} value={adj.value}
                              onChange={e => adj.set(Number(e.target.value))} className="w-full" style={{ accentColor: "#a855f7" }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Toggles */}
                      <div className="space-y-2">
                        <button onClick={() => setShowGrid(!showGrid)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all"
                          style={{ background: showGrid ? "rgba(168, 85, 247, 0.06)" : "transparent", border: "1px solid rgba(168, 85, 247, 0.08)" }}
                        >
                          <span style={{ color: "#a78bfa" }}>Grid Overlay</span>
                          <span style={{ color: showGrid ? "#a855f7" : "rgba(168, 85, 247, 0.15)" }}>{showGrid ? "ON" : "OFF"}</span>
                        </button>
                        <button onClick={() => setIsMirrored(!isMirrored)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all"
                          style={{ background: "transparent", border: "1px solid rgba(168, 85, 247, 0.08)" }}
                        >
                          <span style={{ color: "#a78bfa" }}>Mirror</span>
                          <span style={{ color: isMirrored ? "#a855f7" : "rgba(168, 85, 247, 0.15)" }}>{isMirrored ? "ON" : "OFF"}</span>
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
        <div className="px-2 py-2" style={{ background: "rgba(20, 10, 40, 0.9)", borderTop: "1px solid rgba(168, 85, 247, 0.15)", backdropFilter: "blur(12px)", boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.3)" }}>
          {/* Category tabs */}
          <div className="flex gap-1 mb-2 px-1">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)} className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider transition-all font-medium"
                style={{ background: filterCategory === cat ? "rgba(168, 85, 247, 0.08)" : "transparent", color: filterCategory === cat ? "#a855f7" : "#7c3aed", border: `1px solid ${filterCategory === cat ? "rgba(168, 85, 247, 0.15)" : "transparent"}` }}
              >{cat}</button>
            ))}
          </div>
          {/* Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {filteredFilters.map(f => (
              <button key={f.type} onClick={() => setActiveFilter(f.type)}
                className="flex-shrink-0 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all"
                style={{
                  background: activeFilter === f.type ? "rgba(168, 85, 247, 0.06)" : "transparent",
                  border: `1px solid ${activeFilter === f.type ? "rgba(168, 85, 247, 0.18)" : "rgba(168, 85, 247, 0.06)"}`,
                  minWidth: "52px",
                }}
              >
                <span className="text-base">{f.icon}</span>
                <span className="text-[8px] font-medium" style={{ color: activeFilter === f.type ? "#a855f7" : "#7c3aed" }}>{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Capture controls */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: "rgba(20, 10, 40, 0.95)", borderTop: "1px solid rgba(168, 85, 247, 0.08)", boxShadow: "0 -2px 20px rgba(0, 0, 0, 0.2)" }}>
          {/* Last photo preview */}
          <div className="w-12 h-12 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(168, 85, 247, 0.1)" }}>
            {photos.length > 0 ? (
              <img src={photos[0].url} alt="Last photo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(168, 85, 247, 0.06)" }}>
                <span className="text-xs" style={{ color: "rgba(168, 85, 247, 0.15)" }}>📷</span>
              </div>
            )}
          </div>

          {/* Capture button */}
          <button onClick={handleCapture} disabled={!!cameraError}
            className="relative w-18 h-18 rounded-full transition-all flex items-center justify-center"
            style={{
              width: "72px",
              height: "72px",
              background: cameraError ? "rgba(168, 85, 247, 0.06)" : "rgba(168, 85, 247, 0.06)",
              border: `3px solid ${cameraError ? "rgba(168, 85, 247, 0.1)" : "rgba(168, 85, 247, 0.3)"}`,
              cursor: cameraError ? "not-allowed" : "pointer",
              boxShadow: cameraError ? "none" : "0 2px 12px rgba(168, 85, 247, 0.1)",
            }}
          >
            <div className="rounded-full" style={{
              width: "56px",
              height: "56px",
              background: cameraError ? "rgba(168, 85, 247, 0.1)" : "rgba(168, 85, 247, 0.15)",
              transition: "transform 0.1s",
            }} />
            {timer > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: "rgba(168, 85, 247, 0.12)", color: "#a855f7" }}
              >{timer}</div>
            )}
          </button>

          {/* Camera flip */}
          <button onClick={toggleCamera}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(168, 85, 247, 0.06)", border: "1px solid rgba(168, 85, 247, 0.08)", color: "#a78bfa" }}
          >🔄</button>
        </div>
      </div>

      {/* Gallery overlay */}
      <AnimatePresence>
        {showGallery && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(20, 10, 40, 0.97)", backdropFilter: "blur(16px)" }}
          >
            <div className="p-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6 pt-2">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: "#e0f5e8" }}>Gallery</h2>
                  <p className="text-[10px]" style={{ color: "#7c3aed" }}>{photos.length} photo{photos.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowGallery(false)} className="p-2 rounded-lg transition-all" style={{ color: "#7c3aed" }}>✕</button>
              </div>
              {photos.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-4xl mb-3">📸</div>
                  <p className="text-sm" style={{ color: "#7c3aed" }}>No photos yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo, i) => (
                    <motion.div key={photo.timestamp} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="relative rounded-xl overflow-hidden group" style={{ border: "1px solid rgba(168, 85, 247, 0.08)" }}
                    >
                      <img src={photo.url} alt={`Photo ${i + 1}`} className="w-full aspect-[4/3] object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(168, 85, 247, 0.12)", color: "#a855f7" }}>{photo.filter}</span>
                          <div className="flex gap-1.5">
                            <button onClick={() => downloadPhoto(photo.url)} className="p-1.5 rounded-lg text-xs" style={{ background: "rgba(168, 85, 247, 0.12)" }}>⬇</button>
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
