"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/lib/useIsMobile";
import { useBgTheme } from "@/lib/useBgTheme";

type BrushType = "pen" | "pencil" | "airbrush" | "calligraphy" | "marker" | "eraser" | "neon" | "rainbow" | "watercolor" | "fire" | "sparkle" | "galaxy" | "chalk" | "oil" | "confetti" | "snow" | "vines" | "electric" | "smoke" | "bubbles" | "stars" | "mosaic" | "dna" | "aurora" | "ink" | "charcoal" | "halftone" | "pixel" | "spray" | "glitch" | "ribbon" | "fur";
type ToolType = "brush" | "eyedropper" | "fill" | "blur" | "text";
type ShapeType = "none" | "line" | "rectangle" | "circle" | "triangle";

interface HistoryEntry {
  imageData: ImageData;
}

const BRUSH_PRESETS: { type: BrushType; name: string; icon: string; description: string; category: string }[] = [
  { type: "pen", name: "Pen", icon: "✏️", description: "Clean, smooth lines", category: "basic" },
  { type: "pencil", name: "Pencil", icon: "✏", description: "Soft, textured strokes", category: "basic" },
  { type: "airbrush", name: "Airbrush", icon: "💨", description: "Soft spray effect", category: "basic" },
  { type: "calligraphy", name: "Calligraphy", icon: "🖊", description: "Variable width nib", category: "basic" },
  { type: "marker", name: "Marker", icon: "🖍", description: "Bold, semi-transparent", category: "basic" },
  { type: "eraser", name: "Eraser", icon: "🧹", description: "Remove strokes", category: "basic" },
  { type: "ink", name: "Ink Pen", icon: "🖋", description: "Sharp, wet ink lines", category: "basic" },
  { type: "charcoal", name: "Charcoal", icon: "🪨", description: "Rough, dusty texture", category: "basic" },
  { type: "neon", name: "Neon Glow", icon: "💡", description: "Glowing neon effect", category: "creative" },
  { type: "rainbow", name: "Rainbow", icon: "🌈", description: "Color-shifting strokes", category: "creative" },
  { type: "watercolor", name: "Watercolor", icon: "🎨", description: "Soft, flowing paint", category: "creative" },
  { type: "fire", name: "Fire", icon: "🔥", description: "Fiery particle trails", category: "creative" },
  { type: "sparkle", name: "Sparkle", icon: "✨", description: "Glittering particles", category: "creative" },
  { type: "galaxy", name: "Galaxy", icon: "🌌", description: "Swirling dust particles", category: "creative" },
  { type: "aurora", name: "Aurora", icon: "🌠", description: "Northern lights flow", category: "creative" },
  { type: "electric", name: "Electric", icon: "⚡", description: "Lightning bolts", category: "creative" },
  { type: "confetti", name: "Confetti", icon: "🎊", description: "Colorful paper bits", category: "creative" },
  { type: "halftone", name: "Halftone", icon: "⚬", description: "Dot pattern shading", category: "creative" },
  { type: "glitch", name: "Glitch", icon: "📡", description: "Digital distortion", category: "creative" },
  { type: "ribbon", name: "Ribbon", icon: "🎀", description: "Flowing fabric strip", category: "creative" },
  { type: "fur", name: "Fur", icon: "🦊", description: "Soft fur strands", category: "creative" },
  { type: "snow", name: "Snow", icon: "❄️", description: "Falling snowflakes", category: "nature" },
  { type: "vines", name: "Vines", icon: "🌿", description: "Growing plant tendrils", category: "nature" },
  { type: "smoke", name: "Smoke", icon: "🌫️", description: "Wispy smoke trails", category: "nature" },
  { type: "bubbles", name: "Bubbles", icon: "🫧", description: "Floating soap bubbles", category: "nature" },
  { type: "stars", name: "Starfield", icon: "⭐", description: "Twinkling star map", category: "nature" },
  { type: "spray", name: "Spray Paint", icon: "🎨", description: "Aerosol paint speckle", category: "nature" },
  { type: "mosaic", name: "Mosaic", icon: "🔮", description: "Tile pattern effect", category: "textured" },
  { type: "dna", name: "DNA Helix", icon: "🧬", description: "Double helix pattern", category: "textured" },
  { type: "chalk", name: "Chalk", icon: "🖍", description: "Soft chalk texture", category: "textured" },
  { type: "oil", name: "Oil Paint", icon: "🖌", description: "Thick, buttery strokes", category: "textured" },
  { type: "pixel", name: "Pixel", icon: "🟩", description: "Retro pixel art", category: "textured" },
];

const COLOR_PALETTE = [
  ["#000000", "#a0d4b0", "#60b890", "#40a070", "rgba(0, 255, 136, 0.15)", "#fff"],
  ["#0369a1", "#0ea5e9", "#38bdf8", "var(--elovayne-nebula)", "#14b8a6", "#2dd4bf"],
  ["#065f46", "#059669", "#10b981", "#34d399", "#84cc16", "#a3e635"],
  ["#dc2626", "#ef4444", "#f97316", "#f59e0b", "#eab308", "#fbbf24"],
  ["#7c3aed", "#8b5cf6", "#a855f7", "#ec4899", "#f472b6", "#fb7185"],
  ["#78350f", "#92400e", "#b45309", "#d97706", "#fbbf24", "#fef3c7"],
];

const CANVAS_PRESETS = [
  { name: "Square", width: 1200, height: 1200 },
  { name: "Landscape", width: 1920, height: 1080 },
  { name: "Portrait", width: 1080, height: 1920 },
  { name: "HD", width: 1280, height: 720 },
  { name: "Full HD", width: 1920, height: 1080 },
  { name: "4K", width: 3840, height: 2160 },
  { name: "A4 Print", width: 2480, height: 3508 },
  { name: "Social Post", width: 1080, height: 1080 },
  { name: "Story", width: 1080, height: 1920 },
  { name: "Banner", width: 1500, height: 500 },
];

const EXPORT_FORMATS = [
  { value: "png", label: "PNG", description: "Lossless, transparent" },
  { value: "jpeg", label: "JPEG", description: "Smaller file size" },
  { value: "webp", label: "WebP", description: "Modern, efficient" },
];

export default function DreamCanvasPage() {
  const { darkBg } = useBgTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [brushType, setBrushType] = useState<BrushType>("pen");
  const [activeTool, setActiveTool] = useState<ToolType>("brush");
  const [opacity, setOpacity] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [symmetry, setSymmetry] = useState(false);
  const [shapeMode, setShapeMode] = useState<ShapeType>("none");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushPanel, setShowBrushPanel] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canvasSize, setCanvasSize] = useState({ width: 2400, height: 1600 });
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [textInput, setTextInput] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [textValue, setTextValue] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const shapeStart = useRef<{ x: number; y: number } | null>(null);
  const panStart = useRef<{ x: number; y: number } | null>(null);
  const panOffsetStart = useRef<{ x: number; y: number } | null>(null);
  const [recentColors, setRecentColors] = useState<string[]>(["#e0f5e8", "#fff", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [exportQuality, setExportQuality] = useState(92);
  const [showCanvasPresets, setShowCanvasPresets] = useState(false);
  const [showCustomSize, setShowCustomSize] = useState(false);
  const [customWidth, setCustomWidth] = useState(2400);
  const [customHeight, setCustomHeight] = useState(1600);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [secondaryColor, setSecondaryColor] = useState("#fff");
  const [smoothing, setSmoothing] = useState(30);
  const [canvasRotation, setCanvasRotation] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [mouseScreenPos, setMouseScreenPos] = useState<{ x: number; y: number } | null>(null);
  const smoothBuffer = useRef<{ x: number; y: number }[]>([]);
  const isRightClicking = useRef(false);
  const prevToolRef = useRef<ToolType>("brush");
  const skipCanvasInit = useRef(false);
  const pendingCanvasContent = useRef<HTMLCanvasElement | null>(null);
  const brushSizeRef = useRef(brushSize);

  useEffect(() => { brushSizeRef.current = brushSize; }, [brushSize]);
  const [brushHardness, setBrushHardness] = useState(80);
  const [pressureEnabled, setPressureEnabled] = useState(true);
  const [canvasBg, setCanvasBg] = useState<"white" | "light-gray" | "dark-gray" | "black" | "checker">("white");
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showColorWheel, setShowColorWheel] = useState(false);
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(0);
  const [val, setVal] = useState(13);
  const speedRef = useRef(0);
  const lastDrawTime = useRef(0);
  const eyedropperRef = useRef<HTMLDivElement>(null);
  const [eyedropperColor, setEyedropperColor] = useState("#000000");
  const [paperTexture, setPaperTexture] = useState<"none" | "smooth" | "rough" | "cold-press" | "canvas" | "kraft" | "linen" | "cardstock">("none");
  const [showPaperPicker, setShowPaperPicker] = useState(false);
  const textureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [textureDataUrl, setTextureDataUrl] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<"tools" | "brush" | "color" | "settings">("tools");
  const touchDistance = useRef(0);
  const touchMidpoint = useRef({ x: 0, y: 0 });
  const touchPanStart = useRef<{ x: number; y: number } | null>(null);
  const touchPanOffsetStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (paperTexture === "none") { setTextureDataUrl(null); return; }
    const url = generatePaperTexture(paperTexture, 512, 512);
    setTextureDataUrl(url);
  }, [paperTexture]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayCanvasRef.current;
    if (!canvas || !overlay) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    overlay.width = canvasSize.width;
    overlay.height = canvasSize.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!skipCanvasInit.current) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    } else if (pendingCanvasContent.current) {
      ctx.drawImage(pendingCanvasContent.current, 0, 0);
      pendingCanvasContent.current = null;
    }
    skipCanvasInit.current = false;

    const container = containerRef.current;
    if (container) {
      const cw = container.offsetWidth;
      const ch = container.offsetHeight;
      const fitZoom = Math.min(cw / canvasSize.width, ch / canvasSize.height) * 0.9;
      setZoom(fitZoom);
      setPanOffset({
        x: (cw - canvasSize.width * fitZoom) / 2,
        y: (ch - canvasSize.height * fitZoom) / 2,
      });
    }

    const imageData = ctx.getImageData(0, 0, canvasSize.width, canvasSize.height);
    setHistory([{ imageData }]);
    setHistoryIndex(0);
  }, [canvasSize]);

  useEffect(() => {
    const minimap = minimapCanvasRef.current;
    const canvas = canvasRef.current;
    if (!minimap || !canvas) return;
    minimap.width = 150;
    minimap.height = 100;
    const ctx = minimap.getContext("2d");
    if (!ctx) return;
    const sx = 0, sy = 0, sw = canvas.width, sh = canvas.height;
    const dw = 150, dh = 100;
    const scale = Math.min(dw / sw, dh / sh);
    const dwScaled = sw * scale;
    const dhScaled = sh * scale;
    ctx.fillStyle = "#e4e4e7";
    ctx.fillRect(0, 0, dw, dh);
    ctx.drawImage(canvas, sx, sy, sw, sh, (dw - dwScaled) / 2, (dh - dhScaled) / 2, dwScaled, dhScaled);
  });

  const getCanvasPos = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: (clientX - rect.left - panOffset.x) / zoom,
      y: (clientY - rect.top - panOffset.y) / zoom,
    };
  }, [zoom, panOffset]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ imageData });
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex].imageData, 0, 0);
    setHistoryIndex(newIndex);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex].imageData, 0, 0);
    setHistoryIndex(newIndex);
  }, [history, historyIndex]);

  const drawBrushStroke = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, lastX: number, lastY: number) => {
    ctx.save();
    ctx.globalAlpha = opacity;
    const brushSize = brushSizeRef.current;
    if (brushType === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1;
    }

    const dx = x - lastX;
    const dy = y - lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    switch (brushType) {
      case "pen":
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if (brushHardness < 100) {
          ctx.shadowColor = color;
          ctx.shadowBlur = brushSize * (1 - brushHardness / 100) * 1.5;
        }
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.shadowBlur = 0;
        break;
      case "pencil":
        for (let i = 0; i < 5; i++) {
          const offset = (Math.random() - 0.5) * brushSize * 0.5;
          const jitter = (Math.random() - 0.5) * brushSize * 0.15;
          ctx.globalAlpha = opacity * (0.15 + Math.random() * 0.4);
          ctx.strokeStyle = color;
          ctx.lineWidth = brushSize * (0.3 + Math.random() * 0.4);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(lastX + offset, lastY + jitter);
          ctx.lineTo(x + offset, y + jitter);
          ctx.stroke();
        }
        break;
      case "airbrush":
        for (let i = 0; i < Math.max(1, Math.floor(dist)); i++) {
          const t = i / Math.max(1, Math.floor(dist));
          const px = lastX + dx * t + (Math.random() - 0.5) * brushSize * 2;
          const py = lastY + dy * t + (Math.random() - 0.5) * brushSize * 2;
          ctx.globalAlpha = opacity * (0.02 + Math.random() * 0.05);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(px, py, Math.random() * brushSize * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case "calligraphy":
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize * (0.5 + Math.abs(Math.sin(angle)) * 0.5);
        ctx.lineCap = "butt";
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        break;
      case "marker":
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize * 1.5;
        ctx.lineCap = "round";
        ctx.globalAlpha = opacity * 0.4;
        if (brushHardness < 100) {
          ctx.shadowColor = color;
          ctx.shadowBlur = brushSize * (1 - brushHardness / 100) * 2;
        }
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.shadowBlur = 0;
        break;
      case "eraser":
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = brushSize * 2;
        ctx.lineCap = "round";
        if (brushHardness < 100) {
          ctx.shadowColor = "#fff";
          ctx.shadowBlur = brushSize * (1 - brushHardness / 100) * 2;
        }
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.shadowBlur = 0;
        break;
      case "neon":
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize * 3;
        ctx.lineCap = "round";
        ctx.globalAlpha = opacity * 0.1;
        ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
        ctx.lineWidth = brushSize * 2;
        ctx.globalAlpha = opacity * 0.3;
        ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
        ctx.lineWidth = brushSize;
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = "#fff";
        ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
        ctx.lineWidth = brushSize * 0.5;
        ctx.strokeStyle = color;
        ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
        break;
      case "rainbow":
        const hue = (Date.now() / 10) % 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
        ctx.globalAlpha = opacity * 0.3;
        ctx.strokeStyle = `hsl(${(hue + 60) % 360}, 100%, 70%)`;
        ctx.lineWidth = brushSize * 0.5;
        ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
        break;
      case "watercolor":
        for (let i = 0; i < Math.max(1, Math.floor(dist / 2)); i++) {
          const t = i / Math.max(1, Math.floor(dist / 2));
          const px = lastX + dx * t;
          const py = lastY + dy * t;
          const bleed = brushSize * (0.6 + Math.random() * 1.2);
          ctx.globalAlpha = opacity * (0.01 + Math.random() * 0.04);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(px + (Math.random() - 0.5) * brushSize * 0.6, py + (Math.random() - 0.5) * brushSize * 0.6, bleed, 0, Math.PI * 2);
          ctx.fill();
          if (Math.random() > 0.6) {
            ctx.globalAlpha = opacity * 0.008;
            ctx.beginPath();
            ctx.arc(px + (Math.random() - 0.5) * brushSize, py + (Math.random() - 0.5) * brushSize, bleed * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      case "fire":
        for (let i = 0; i < Math.max(1, Math.floor(dist)); i++) {
          const t = i / Math.max(1, Math.floor(dist));
          const px = lastX + dx * t + (Math.random() - 0.5) * brushSize;
          const py = lastY + dy * t - Math.random() * brushSize * 2;
          ctx.globalAlpha = opacity * (0.1 + Math.random() * 0.2);
          ctx.fillStyle = `hsl(${Math.random() * 60}, 100%, ${50 + Math.random() * 30}%)`;
          ctx.beginPath();
          ctx.arc(px, py, Math.random() * brushSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case "sparkle":
        for (let i = 0; i < Math.max(1, Math.floor(dist / 3)); i++) {
          const t = i / Math.max(1, Math.floor(dist / 3));
          const px = lastX + dx * t + (Math.random() - 0.5) * brushSize * 3;
          const py = lastY + dy * t + (Math.random() - 0.5) * brushSize * 3;
          const size = Math.random() * brushSize * 0.3;
          ctx.globalAlpha = opacity * (0.3 + Math.random() * 0.7);
          ctx.fillStyle = color;
          ctx.beginPath();
          for (let j = 0; j < 8; j++) {
            const a = (j * Math.PI) / 4;
            const r = j % 2 === 0 ? size : size * 0.3;
            const sx = px + Math.cos(a) * r;
            const sy = py + Math.sin(a) * r;
            if (j === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fill();
        }
        break;
      case "galaxy":
        for (let i = 0; i < Math.max(1, Math.floor(dist / 2)); i++) {
          const t = i / Math.max(1, Math.floor(dist / 2));
          const a2 = Date.now() / 200 + t * 5;
          const r = brushSize * (0.5 + Math.random());
          const px = lastX + dx * t + Math.cos(a2) * r;
          const py = lastY + dy * t + Math.sin(a2) * r;
          ctx.globalAlpha = opacity * (0.05 + Math.random() * 0.15);
          ctx.fillStyle = `hsl(${(Date.now() / 20 + i * 30) % 360}, 80%, ${60 + Math.random() * 30}%)`;
          ctx.beginPath();
          ctx.arc(px, py, Math.random() * brushSize * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case "aurora":
        for (let i = 0; i < Math.max(1, Math.floor(dist / 3)); i++) {
          const t = i / Math.max(1, Math.floor(dist / 3));
          const px = lastX + dx * t;
          const py = lastY + dy * t;
          const wave = Math.sin(px * 0.01 + Date.now() * 0.001) * brushSize * 3;
          const h = (Date.now() / 20 + px * 0.5) % 360;
          ctx.globalAlpha = opacity * (0.05 + Math.random() * 0.1);
          ctx.fillStyle = `hsl(${h}, 80%, 60%)`;
          ctx.beginPath();
          ctx.ellipse(px, py + wave, brushSize * 2, brushSize * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case "electric":
        for (let i = 0; i < Math.max(1, Math.floor(dist / 5)); i++) {
          const t = i / Math.max(1, Math.floor(dist / 5));
          const sx = lastX + dx * t;
          const sy = lastY + dy * t;
          const ex = lastX + dx * (t + 1 / Math.max(1, Math.floor(dist / 5)));
          const ey = lastY + dy * (t + 1 / Math.max(1, Math.floor(dist / 5)));
          const mx = (sx + ex) / 2 + (Math.random() - 0.5) * brushSize * 3;
          const my = (sy + ey) / 2 + (Math.random() - 0.5) * brushSize * 3;
          ctx.globalAlpha = opacity * 0.8;
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = brushSize * 0.3;
          ctx.shadowColor = "#fbbf24";
          ctx.shadowBlur = brushSize * 2;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(mx, my); ctx.lineTo(ex, ey); ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = opacity * 0.2;
          ctx.strokeStyle = "#fde68a";
          ctx.lineWidth = brushSize;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(mx, my); ctx.lineTo(ex, ey); ctx.stroke();
        }
        break;
      case "confetti":
        for (let i = 0; i < Math.max(1, Math.floor(dist / 4)); i++) {
          const t = i / Math.max(1, Math.floor(dist / 4));
          const px = lastX + dx * t + (Math.random() - 0.5) * brushSize * 3;
          const py = lastY + dy * t + (Math.random() - 0.5) * brushSize * 3;
          const w = Math.random() * brushSize * 0.4 + 2;
          const h = Math.random() * brushSize * 0.2 + 1;
          ctx.globalAlpha = opacity * (0.5 + Math.random() * 0.5);
          ctx.fillStyle = `hsl(${Math.random() * 360}, 80%, 60%)`;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(Math.random() * Math.PI);
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.restore();
        }
        break;
      case "snow":
        for (let i = 0; i < Math.max(1, Math.floor(dist / 5)); i++) {
          const t = i / Math.max(1, Math.floor(dist / 5));
          const px = lastX + dx * t + (Math.random() - 0.5) * brushSize * 2;
          const py = lastY + dy * t + Math.random() * brushSize;
          const size = Math.random() * brushSize * 0.3 + 1;
          ctx.globalAlpha = opacity * (0.3 + Math.random() * 0.5);
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = "rgba(200, 220, 255, 0.6)";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          for (let j = 0; j < 6; j++) {
            const a = (j * Math.PI) / 3;
            ctx.moveTo(px, py);
            ctx.lineTo(px + Math.cos(a) * size, py + Math.sin(a) * size);
          }
          ctx.stroke();
          ctx.beginPath(); ctx.arc(px, py, size * 0.3, 0, Math.PI * 2); ctx.fill();
        }
        break;
      case "vines":
        ctx.globalAlpha = opacity * 0.6;
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize * 0.5;
        ctx.beginPath(); ctx.moveTo(lastX, lastY);
        ctx.quadraticCurveTo(x + (Math.random() - 0.5) * brushSize * 2, y + (Math.random() - 0.5) * brushSize, x, y);
        ctx.stroke();
        if (Math.random() > 0.7) {
          ctx.globalAlpha = opacity * 0.4;
          ctx.fillStyle = `hsl(${120 + Math.random() * 40}, 60%, ${40 + Math.random() * 30}%)`;
          ctx.beginPath();
          ctx.ellipse(x + (Math.random() - 0.5) * brushSize, y + (Math.random() - 0.5) * brushSize, brushSize * 0.4, brushSize * 0.2, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case "smoke":
        for (let i = 0; i < Math.max(1, Math.floor(dist / 4)); i++) {
          const t = i / Math.max(1, Math.floor(dist / 4));
          const px = lastX + dx * t + (Math.random() - 0.5) * brushSize;
          const py = lastY + dy * t - Math.random() * brushSize * 2;
          ctx.globalAlpha = opacity * (0.01 + Math.random() * 0.03);
          ctx.fillStyle = `rgba(${100 + Math.random() * 50}, ${100 + Math.random() * 50}, ${110 + Math.random() * 50}, 1)`;
          ctx.beginPath();
          ctx.arc(px, py, brushSize * (0.5 + Math.random() * 1.5), 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case "bubbles":
        for (let i = 0; i < Math.max(1, Math.floor(dist / 6)); i++) {
          const t = i / Math.max(1, Math.floor(dist / 6));
          const px = lastX + dx * t + (Math.random() - 0.5) * brushSize * 2;
          const py = lastY + dy * t + (Math.random() - 0.5) * brushSize * 2;
          const r = Math.random() * brushSize * 0.5 + 2;
          ctx.globalAlpha = opacity * (0.1 + Math.random() * 0.2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = opacity * 0.3;
          ctx.fillStyle = "#fff";
          ctx.beginPath(); ctx.arc(px - r * 0.3, py - r * 0.3, r * 0.2, 0, Math.PI * 2); ctx.fill();
        }
        break;
      case "stars":
        for (let i = 0; i < Math.max(1, Math.floor(dist / 8)); i++) {
          const t = i / Math.max(1, Math.floor(dist / 8));
          const px = lastX + dx * t + (Math.random() - 0.5) * brushSize * 4;
          const py = lastY + dy * t + (Math.random() - 0.5) * brushSize * 4;
          const size = Math.random() * brushSize * 0.3 + 1;
          ctx.globalAlpha = opacity * (0.5 + Math.random() * 0.5);
          ctx.fillStyle = `hsl(${40 + Math.random() * 40}, 100%, ${70 + Math.random() * 30}%)`;
          ctx.beginPath();
          for (let j = 0; j < 10; j++) {
            const a = (j * Math.PI) / 5 - Math.PI / 2;
            const r = j % 2 === 0 ? size : size * 0.4;
            const sx = px + Math.cos(a) * r;
            const sy = py + Math.sin(a) * r;
            if (j === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fill();
        }
        break;
      case "mosaic":
        const tileSize = Math.max(4, brushSize);
        for (let i = 0; i < Math.max(1, Math.floor(dist / tileSize)); i++) {
          const t = i / Math.max(1, Math.floor(dist / tileSize));
          const px = lastX + dx * t;
          const py = lastY + dy * t;
          ctx.globalAlpha = opacity * (0.5 + Math.random() * 0.5);
          ctx.fillStyle = `hsl(${Math.random() * 360}, 60%, ${40 + Math.random() * 40}%)`;
          ctx.fillRect(Math.floor(px / tileSize) * tileSize, Math.floor(py / tileSize) * tileSize, tileSize - 1, tileSize - 1);
        }
        break;
      case "dna":
        for (let i = 0; i < Math.max(1, Math.floor(dist / 2)); i++) {
          const t = i / Math.max(1, Math.floor(dist / 2));
          const px = lastX + dx * t;
          const py = lastY + dy * t;
          const wave = Math.sin(py * 0.05 + Date.now() * 0.002) * brushSize * 2;
          ctx.globalAlpha = opacity * 0.6;
          ctx.fillStyle = color;
          ctx.beginPath(); ctx.arc(px + wave, py, brushSize * 0.3, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `hsl(${(Date.now() / 10) % 360}, 70%, 50%)`;
          ctx.beginPath(); ctx.arc(px - wave, py, brushSize * 0.3, 0, Math.PI * 2); ctx.fill();
          if (i % 3 === 0) {
            ctx.globalAlpha = opacity * 0.2;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(px + wave, py); ctx.lineTo(px - wave, py); ctx.stroke();
          }
        }
        break;
      case "chalk":
        for (let i = 0; i < Math.max(1, Math.floor(dist * 1.5)); i++) {
          const t = i / Math.max(1, Math.floor(dist * 1.5));
          const px = lastX + dx * t;
          const py = lastY + dy * t;
          for (let j = 0; j < 4; j++) {
            const angle2 = Math.random() * Math.PI * 2;
            const r = Math.random() * brushSize * 0.6;
            ctx.globalAlpha = opacity * (0.08 + Math.random() * 0.18);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(px + Math.cos(angle2) * r, py + Math.sin(angle2) * r, Math.random() * brushSize * 0.35 + 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      case "oil":
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize * 1.8;
        ctx.lineCap = "round";
        ctx.globalAlpha = opacity * 0.7;
        ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
        for (let i = 0; i < Math.max(1, Math.floor(dist / 2)); i++) {
          const t = i / Math.max(1, Math.floor(dist / 2));
          const perpX = -dy / (dist || 1);
          const perpY = dx / (dist || 1);
          const offset = (Math.random() - 0.5) * brushSize * 0.8;
          ctx.globalAlpha = opacity * (0.15 + Math.random() * 0.15);
          ctx.fillStyle = Math.random() > 0.7 ? "#fff" : color;
          ctx.beginPath();
          ctx.ellipse(
            lastX + dx * t + perpX * offset, lastY + dy * t + perpY * offset,
            brushSize * (0.2 + Math.random() * 0.3), brushSize * (0.05 + Math.random() * 0.1),
            Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5, 0, Math.PI * 2
          );
          ctx.fill();
        }
        break;
      case "ink":
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize * (0.6 + Math.abs(Math.sin(angle)) * 0.8);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = opacity * 0.9;
        ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
        if (Math.random() > 0.85) {
          const splatX = x + (Math.random() - 0.5) * brushSize * 2;
          const splatY = y + (Math.random() - 0.5) * brushSize * 2;
          ctx.globalAlpha = opacity * (0.1 + Math.random() * 0.2);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(splatX, splatY, Math.random() * brushSize * 0.4 + 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case "charcoal":
        for (let i = 0; i < Math.max(1, Math.floor(dist * 2)); i++) {
          const t = i / Math.max(1, Math.floor(dist * 2));
          const px = lastX + dx * t;
          const py = lastY + dy * t;
          for (let j = 0; j < 3; j++) {
            const a = Math.random() * Math.PI * 2;
            const r = Math.random() * brushSize * 0.7;
            const grain = Math.random() * brushSize * 0.15 + 0.5;
            ctx.globalAlpha = opacity * (0.06 + Math.random() * 0.14);
            ctx.fillStyle = Math.random() > 0.3 ? color : "#000000";
            ctx.beginPath();
            ctx.arc(px + Math.cos(a) * r, py + Math.sin(a) * r, grain, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      case "halftone":
        const dotSpacing = Math.max(4, brushSize * 0.5);
        for (let sx2 = -brushSize; sx2 <= brushSize; sx2 += dotSpacing) {
          for (let sy2 = -brushSize; sy2 <= brushSize; sy2 += dotSpacing) {
            const px2 = x + sx2;
            const py2 = y + sy2;
            const d = Math.sqrt(sx2 * sx2 + sy2 * sy2);
            if (d > brushSize) continue;
            const dotR = (1 - d / brushSize) * dotSpacing * 0.4;
            if (dotR < 0.5) continue;
            ctx.globalAlpha = opacity * 0.8;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(px2, py2, dotR, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      case "spray":
        for (let i = 0; i < Math.max(1, Math.floor(dist * 1.2)); i++) {
          const t = i / Math.max(1, Math.floor(dist * 1.2));
          const px = lastX + dx * t + (Math.random() - 0.5) * brushSize * 3;
          const py = lastY + dy * t + (Math.random() - 0.5) * brushSize * 3;
          const d2 = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
          const fade = Math.max(0, 1 - d2 / (brushSize * 1.5));
          ctx.globalAlpha = opacity * fade * 0.6;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(px, py, Math.random() * 1.5 + 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case "glitch":
        const sliceH = Math.max(2, brushSize * 0.3);
        for (let i = 0; i < Math.max(1, Math.floor(dist / sliceH)); i++) {
          const t = i / Math.max(1, Math.floor(dist / sliceH));
          const px = lastX + dx * t;
          const py = lastY + dy * t;
          const shiftX = (Math.random() - 0.5) * brushSize * 4;
          ctx.globalAlpha = opacity * (0.3 + Math.random() * 0.5);
          ctx.fillStyle = Math.random() > 0.5 ? color : `hsl(${Math.random() * 360}, 100%, 50%)`;
          ctx.fillRect(px + shiftX, py - sliceH / 2, brushSize * (0.5 + Math.random()), sliceH);
        }
        break;
      case "ribbon":
        const ribbonWidth = brushSize * 0.8;
        const perpX2 = -dy / (dist || 1);
        const perpY2 = dx / (dist || 1);
        const wave = Math.sin(Date.now() * 0.005) * ribbonWidth * 0.5;
        ctx.globalAlpha = opacity * 0.5;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(lastX + perpX2 * ribbonWidth, lastY + perpY2 * ribbonWidth);
        ctx.lineTo(x + perpX2 * ribbonWidth + wave, y + perpY2 * ribbonWidth + wave);
        ctx.lineTo(x - perpX2 * ribbonWidth - wave, y - perpY2 * ribbonWidth - wave);
        ctx.lineTo(lastX - perpX2 * ribbonWidth, lastY - perpY2 * ribbonWidth);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = opacity * 0.15;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lastX + perpX2 * ribbonWidth * 0.5, lastY + perpY2 * ribbonWidth * 0.5);
        ctx.lineTo(x + perpX2 * ribbonWidth * 0.5 + wave * 0.5, y + perpY2 * ribbonWidth * 0.5 + wave * 0.5);
        ctx.stroke();
        break;
      case "fur":
        for (let i = 0; i < Math.max(1, Math.floor(dist * 1.5)); i++) {
          const t = i / Math.max(1, Math.floor(dist * 1.5));
          const px = lastX + dx * t;
          const py = lastY + dy * t;
          const strandAngle = angle + (Math.random() - 0.5) * 1.2;
          const strandLen = brushSize * (0.4 + Math.random() * 0.8);
          ctx.globalAlpha = opacity * (0.2 + Math.random() * 0.4);
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.random() * 1.5 + 0.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + Math.cos(strandAngle) * strandLen, py + Math.sin(strandAngle) * strandLen);
          ctx.stroke();
        }
        break;
      case "pixel":
        const pixSize = Math.max(3, Math.floor(brushSize * 0.4));
        const gridX = Math.floor(x / pixSize) * pixSize;
        const gridY = Math.floor(y / pixSize) * pixSize;
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.fillRect(gridX, gridY, pixSize, pixSize);
        const steps = Math.max(1, Math.floor(dist / pixSize));
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const sx3 = Math.floor((lastX + dx * t) / pixSize) * pixSize;
          const sy3 = Math.floor((lastY + dy * t) / pixSize) * pixSize;
          ctx.fillRect(sx3, sy3, pixSize, pixSize);
        }
        break;
    }
    ctx.restore();
  }, [color, brushType, opacity, brushHardness]);

  const selectColor = useCallback((c: string) => {
    setColor(c);
    const hsv = hexToHsv(c);
    setHue(hsv.h);
    setSat(hsv.s);
    setVal(hsv.v);
    setRecentColors(prev => {
      const filtered = prev.filter(rc => rc !== c);
      return [c, ...filtered].slice(0, 12);
    });
  }, []);

  const handleEyedropper = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    const hex = "#" + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, "0")).join("");
    setEyedropperColor(hex);
    selectColor(hex);
    setActiveTool("brush");
  }, [selectColor]);

  const handleFill = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const targetColor = getPixelColor(data, Math.floor(x), Math.floor(y), canvas.width);
    const fillColor = hexToRgb(color);
    if (!fillColor || colorsMatch(targetColor, fillColor)) return;

    const stack: [number, number][] = [[Math.floor(x), Math.floor(y)]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [px, py] = stack.pop()!;
      const key = `${px},${py}`;
      if (visited.has(key)) continue;
      if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) continue;

      const currentColor = getPixelColor(data, px, py, canvas.width);
      if (!colorsMatch(currentColor, targetColor, 32)) continue;

      visited.add(key);
      const idx = (py * canvas.width + px) * 4;
      data[idx] = fillColor.r;
      data[idx + 1] = fillColor.g;
      data[idx + 2] = fillColor.b;
      data[idx + 3] = Math.round(opacity * 255);

      stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
  }, [color, opacity, saveToHistory]);

  const handleBlur = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const r = brushSize * 2;
    const sx = Math.max(0, Math.floor(x - r));
    const sy = Math.max(0, Math.floor(y - r));
    const sw = Math.min(canvas.width - sx, Math.ceil(r * 2));
    const sh = Math.min(canvas.height - sy, Math.ceil(r * 2));
    if (sw <= 0 || sh <= 0) return;
    const imageData = ctx.getImageData(sx, sy, sw, sh);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const px = (i / 4) % sw;
      const py = Math.floor((i / 4) / sw);
      const dist = Math.sqrt((px - r) ** 2 + (py - r) ** 2);
      if (dist > r) continue;
      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = px + dx;
          const ny = py + dy;
          if (nx >= 0 && nx < sw && ny >= 0 && ny < sh) {
            const ni = (ny * sw + nx) * 4;
            sumR += data[ni];
            sumG += data[ni + 1];
            sumB += data[ni + 2];
            count++;
          }
        }
      }
      data[i] = sumR / count;
      data[i + 1] = sumG / count;
      data[i + 2] = sumB / count;
    }
    ctx.putImageData(imageData, sx, sy);
  }, [brushSize]);

  const handleTextAdd = useCallback((x: number, y: number, text: string) => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.fillText(text, x, y);
    saveToHistory();
  }, [color, opacity, fontSize, saveToHistory]);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning) return;
    e.preventDefault();
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
      if ("button" in e && e.button === 2) {
        isRightClicking.current = true;
        prevToolRef.current = activeTool;
        setActiveTool("eyedropper");
        const pos = getCanvasPos(clientX, clientY);
        handleEyedropper(pos.x, pos.y);
        return;
      }
    }
    const pos = getCanvasPos(clientX, clientY);

    if (activeTool === "eyedropper") {
      handleEyedropper(pos.x, pos.y);
      return;
    }
    if (activeTool === "fill") {
      handleFill(pos.x, pos.y);
      return;
    }
    if (activeTool === "text") {
      setTextInput({ x: pos.x, y: pos.y, active: true });
      setTextValue("");
      return;
    }

    setIsDrawing(true);
    lastPos.current = pos;
    smoothBuffer.current = [];
    if (shapeMode !== "none") {
      shapeStart.current = pos;
    }
  }, [isPanning, getCanvasPos, activeTool, shapeMode, handleEyedropper, handleFill]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isPanning) return;
    e.preventDefault();
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const pos = getCanvasPos(clientX, clientY);
    const canvas = canvasRef.current;
    if (!canvas || !lastPos.current) return;

    if (activeTool === "blur") {
      const ctx = canvas.getContext("2d");
      if (ctx) handleBlur(pos.x, pos.y);
      lastPos.current = pos;
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let drawPos = pos;
    if (smoothing > 0 && activeTool === "brush" && shapeMode === "none") {
      smoothBuffer.current.push(pos);
      const bufLen = Math.max(2, Math.floor(smoothing / 5));
      while (smoothBuffer.current.length > bufLen) smoothBuffer.current.shift();
      const avg = smoothBuffer.current.reduce((a, b) => ({ x: a.x + b.x, y: a.y + b.y }), { x: 0, y: 0 });
      drawPos = { x: avg.x / smoothBuffer.current.length, y: avg.y / smoothBuffer.current.length };
    } else {
      smoothBuffer.current = [];
    }

    let pressureMult = 1;
    if (pressureEnabled && activeTool === "brush" && shapeMode === "none") {
      const now = performance.now();
      const dt = now - lastDrawTime.current;
      if (dt > 0 && dt < 200) {
        const dx2 = drawPos.x - (lastPos.current?.x ?? drawPos.x);
        const dy2 = drawPos.y - (lastPos.current?.y ?? drawPos.y);
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        speedRef.current = speedRef.current * 0.7 + (dist2 / dt) * 0.3;
      }
      lastDrawTime.current = now;
      const normalizedSpeed = Math.min(1, speedRef.current / 2);
      pressureMult = 0.3 + (1 - normalizedSpeed) * 0.7;
    }

    if (shapeMode !== "none" && shapeStart.current && overlayCanvasRef.current) {
      const overlayCtx = overlayCanvasRef.current.getContext("2d");
      if (!overlayCtx) return;
      overlayCtx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      overlayCtx.strokeStyle = color;
      overlayCtx.lineWidth = brushSize;
      overlayCtx.setLineDash([5, 5]);
      const startX = shapeStart.current.x;
      const startY = shapeStart.current.y;
      switch (shapeMode) {
        case "line":
          overlayCtx.beginPath(); overlayCtx.moveTo(startX, startY); overlayCtx.lineTo(drawPos.x, drawPos.y); overlayCtx.stroke();
          break;
        case "rectangle":
          overlayCtx.strokeRect(startX, startY, drawPos.x - startX, drawPos.y - startY);
          break;
        case "circle":
          const rx = Math.abs(drawPos.x - startX) / 2;
          const ry = Math.abs(drawPos.y - startY) / 2;
          overlayCtx.beginPath();
          overlayCtx.ellipse(startX + (drawPos.x - startX) / 2, startY + (drawPos.y - startY) / 2, rx, ry, 0, 0, Math.PI * 2);
          overlayCtx.stroke();
          break;
        case "triangle":
          overlayCtx.beginPath();
          overlayCtx.moveTo(startX + (drawPos.x - startX) / 2, startY);
          overlayCtx.lineTo(drawPos.x, drawPos.y);
          overlayCtx.lineTo(startX, drawPos.y);
          overlayCtx.closePath();
          overlayCtx.stroke();
          break;
      }
      overlayCtx.setLineDash([]);
    } else {
      if (pressureEnabled && activeTool === "brush" && shapeMode === "none") {
        brushSizeRef.current = Math.max(1, Math.round(brushSize * pressureMult));
      } else {
        brushSizeRef.current = brushSize;
      }
      if (symmetry) {
        const w = canvasSize.width;
        const h = canvasSize.height;
        drawBrushStroke(ctx, drawPos.x, drawPos.y, lastPos.current.x, lastPos.current.y);
        drawBrushStroke(ctx, w - drawPos.x, drawPos.y, w - lastPos.current.x, lastPos.current.y);
        drawBrushStroke(ctx, drawPos.x, h - drawPos.y, lastPos.current.x, h - lastPos.current.y);
        drawBrushStroke(ctx, w - drawPos.x, h - drawPos.y, w - lastPos.current.x, h - lastPos.current.y);
      } else {
        drawBrushStroke(ctx, drawPos.x, drawPos.y, lastPos.current.x, lastPos.current.y);
      }
    }
    lastPos.current = drawPos;
  }, [isDrawing, isPanning, getCanvasPos, activeTool, shapeMode, canvasSize, color, symmetry, drawBrushStroke, handleBlur, smoothing, pressureEnabled]);

  const endDraw = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (isRightClicking.current) {
      isRightClicking.current = false;
      setActiveTool(prevToolRef.current);
      return;
    }
    if (shapeMode !== "none" && shapeStart.current && lastPos.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        const startX = shapeStart.current.x;
        const startY = shapeStart.current.y;
        const endX = lastPos.current.x;
        const endY = lastPos.current.y;
        switch (shapeMode) {
          case "line":
            ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();
            break;
          case "rectangle":
            ctx.strokeRect(startX, startY, endX - startX, endY - startY);
            break;
          case "circle":
            const rx = Math.abs(endX - startX) / 2;
            const ry = Math.abs(endY - startY) / 2;
            ctx.beginPath();
            ctx.ellipse(startX + (endX - startX) / 2, startY + (endY - startY) / 2, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case "triangle":
            ctx.beginPath();
            ctx.moveTo(startX + (endX - startX) / 2, startY);
            ctx.lineTo(endX, endY);
            ctx.lineTo(startX, endY);
            ctx.closePath();
            ctx.stroke();
            break;
        }
      }
      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.getContext("2d")?.clearRect(0, 0, canvasSize.width, canvasSize.height);
      }
      shapeStart.current = null;
    }
    setIsDrawing(false);
    lastPos.current = null;
    smoothBuffer.current = [];
    saveToHistory();
  }, [shapeMode, color, brushSize, canvasSize, saveToHistory]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bgMap: Record<string, string> = { "white": "#ffffff", "light-gray": "#f0f0f0", "dark-gray": "#333333", "black": "#000000", "checker": "#ffffff" };
    ctx.fillStyle = bgMap[canvasBg] || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, [saveToHistory, canvasBg]);

  const resizeCanvas = useCallback((newWidth: number, newHeight: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) tempCtx.drawImage(canvas, 0, 0);
    pendingCanvasContent.current = tempCanvas;
    skipCanvasInit.current = true;
    setCanvasSize({ width: newWidth, height: newHeight });
  }, []);

  const exportCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mimeType = exportFormat === "jpeg" ? "image/jpeg" : exportFormat === "webp" ? "image/webp" : "image/png";
    const ext = exportFormat === "jpeg" ? "jpg" : exportFormat;
    const quality = exportFormat === "png" ? undefined : exportQuality / 100;
    const link = document.createElement("a");
    link.download = `dream-canvas.${ext}`;
    link.href = canvas.toDataURL(mimeType, quality);
    link.click();
    setShowExportModal(false);
  }, [exportFormat, exportQuality]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
        if (e.key === "s") { e.preventDefault(); exportCanvas(); }
        if (e.key === "=" || e.key === "+") { e.preventDefault(); setZoom(z => Math.min(5, z + 0.1)); }
        if (e.key === "-") { e.preventDefault(); setZoom(z => Math.max(0.1, z - 0.1)); }
        if (e.key === "0") { e.preventDefault(); setZoom(1); setPanOffset({ x: 0, y: 0 }); }
      }
      if (e.key === "?") { e.preventDefault(); setShowShortcuts(s => !s); return; }
      if (e.key === "Escape") { setShowShortcuts(false); return; }
      if (showShortcuts) return;
      if (e.key === "b") { setActiveTool("brush"); setBrushType("pen"); }
      if (e.key === "p") { setActiveTool("brush"); setBrushType("pencil"); }
      if (e.key === "a") { setActiveTool("brush"); setBrushType("airbrush"); }
      if (e.key === "x") setActiveTool("eyedropper");
      if (e.key === "f") setActiveTool("fill");
      if (e.key === "l") setActiveTool("blur");
      if (e.key === "t") setActiveTool("text");
      if (e.key === "e") { setActiveTool("brush"); setBrushType("eraser"); }
      if (e.key === "g") setShowGrid(g => !g);
      if (e.key === "[") setBrushSize(s => Math.max(1, s - 1));
      if (e.key === "]") setBrushSize(s => Math.min(100, s + 1));
      if (e.key === " ") { e.preventDefault(); setIsPanning(true); }
      if (e.key === "r" && !e.metaKey && !e.ctrlKey) { setCanvasRotation(0); }
      if (e.key === "d") {
        const temp = color;
        setColor(secondaryColor);
        setSecondaryColor(temp);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") setIsPanning(false);
    };
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("contextmenu", handleContextMenu);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [undo, redo, exportCanvas, showShortcuts, color, secondaryColor]);

  const fitZoom = useCallback(() => {
    const container = containerRef.current;
    if (container && canvasSize.width > 0) {
      const cw = container.offsetWidth;
      const ch = container.offsetHeight;
      const z = Math.min(cw / canvasSize.width, ch / canvasSize.height) * 0.9;
      setZoom(z);
      setPanOffset({ x: (cw - canvasSize.width * z) / 2, y: (ch - canvasSize.height * z) / 2 });
    }
  }, [canvasSize]);

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: darkBg ? "#000000" : "transparent" }}>
      <div className="pt-14 h-screen flex flex-col">
        {/* Toolbar - hidden on mobile */}
        {!isMobile && <div className="flex items-center gap-1 px-3 py-2 flex-wrap" style={{ background: "#0a0f0b", borderBottom: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          {/* Tools */}
          <div className="flex items-center gap-0.5">
            <span className="text-[9px] text-gray-400 uppercase tracking-wider mr-1 font-medium">Tools</span>
            {[
              { tool: "brush" as ToolType, icon: "✏️", label: "Brush (B)" },
              { tool: "eyedropper" as ToolType, icon: "💧", label: "Eyedropper (X)" },
              { tool: "fill" as ToolType, icon: "🪣", label: "Fill (F)" },
              { tool: "blur" as ToolType, icon: "🌫", label: "Blur (L)" },
              { tool: "text" as ToolType, icon: "T", label: "Text (T)" },
            ].map(t => (
              <button key={t.tool} onClick={() => setActiveTool(t.tool)} className="relative p-1.5 rounded-lg text-sm transition-all hover:bg-gray-50"
                style={{ background: activeTool === t.tool ? "rgba(0, 255, 136, 0.08)" : "transparent", border: `1px solid ${activeTool === t.tool ? "rgba(0, 255, 136, 0.2)" : "1px solid transparent"}`, color: activeTool === t.tool ? "var(--elovayne-nebula)" : "#60b890" }}
                title={t.label}
              >
                {t.icon}
                {activeTool === t.tool && <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--elovayne-nebula)]" />}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-100 mx-1" />

          {/* Basic brushes */}
          {activeTool === "brush" && (
            <>
              <div className="flex items-center gap-0.5">
                <span className="text-[9px] text-gray-400 uppercase tracking-wider mr-1 font-medium">Brush</span>
                {BRUSH_PRESETS.filter(b => b.category === "basic").map(p => (
                  <button key={p.type} onClick={() => setBrushType(p.type)} className="p-1.5 rounded-lg text-sm transition-all hover:bg-gray-50"
                    style={{ background: brushType === p.type ? "rgba(0, 255, 136, 0.08)" : "transparent", border: `1px solid ${brushType === p.type ? "rgba(0, 255, 136, 0.2)" : "1px solid transparent"}`, color: brushType === p.type ? "var(--elovayne-nebula)" : "#60b890" }}
                    title={`${p.name} — ${p.description}`}
                  >{p.icon}</button>
                ))}
              </div>
              <div className="w-px h-5 bg-gray-100 mx-1" />
              {/* Creative/Nature/Textured dropdown */}
              <div className="relative">
                <button onClick={() => setShowBrushPanel(!showBrushPanel)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-all hover:bg-gray-50"
                  style={{ background: BRUSH_PRESETS.some(b => ["creative","nature","textured"].includes(b.category) && b.type === brushType) ? "rgba(0, 255, 136, 0.08)" : "transparent", border: "1px solid rgba(0,0,0,0.06)", color: "#60b890" }}
                >
                  <span>{BRUSH_PRESETS.find(b => b.type === brushType)?.icon || "✨"}</span>
                  <span className="font-medium">{BRUSH_PRESETS.find(b => b.type === brushType)?.name || "More"}</span>
                  <span className="text-[10px] opacity-50">▾</span>
                </button>
                {showBrushPanel && (
                  <motion.div initial={{ opacity: 0, y: -5, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full left-0 mt-1 z-50 p-2 rounded-xl shadow-2xl max-h-[60vh] overflow-y-auto min-w-[200px]"
                    style={{ background: "#0a0f0b", border: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    {["creative", "nature", "textured"].map(cat => (
                      <div key={cat}>
                        <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1 px-2 mt-2 font-medium">{cat}</div>
                        {BRUSH_PRESETS.filter(b => b.category === cat).map(p => (
                          <button key={p.type} onClick={() => { setBrushType(p.type); setShowBrushPanel(false); }}
                            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-all hover:bg-gray-50"
                            style={{ background: brushType === p.type ? "rgba(0, 255, 136, 0.06)" : "transparent" }}
                          >
                            <span className="text-base">{p.icon}</span>
                            <div>
                              <div className="text-xs font-medium" style={{ color: brushType === p.type ? "var(--elovayne-nebula)" : "#a0d4b0" }}>{p.name}</div>
                              <div className="text-[9px] text-gray-400">{p.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
              <div className="w-px h-5 bg-gray-100 mx-1" />
            </>
          )}

          {/* Shape tools */}
          <div className="flex items-center gap-0.5">
            <span className="text-[9px] text-gray-400 uppercase tracking-wider mr-1 font-medium">Shape</span>
            {[
              { type: "none" as ShapeType, icon: "✎", label: "Freehand" },
              { type: "line" as ShapeType, icon: "╲", label: "Line" },
              { type: "rectangle" as ShapeType, icon: "□", label: "Rectangle" },
              { type: "circle" as ShapeType, icon: "○", label: "Circle" },
              { type: "triangle" as ShapeType, icon: "△", label: "Triangle" },
            ].map(s => (
              <button key={s.type} onClick={() => setShapeMode(s.type)} className="p-1.5 rounded-lg text-sm transition-all hover:bg-gray-50"
                style={{ background: shapeMode === s.type ? "rgba(0, 255, 136, 0.08)" : "transparent", border: `1px solid ${shapeMode === s.type ? "rgba(0, 255, 136, 0.2)" : "1px solid transparent"}`, color: shapeMode === s.type ? "var(--elovayne-nebula)" : "#60b890" }}
                title={s.label}
              >{s.icon}</button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-100 mx-1" />

          {/* Size */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Size</span>
            <div className="relative w-20">
              <input type="range" min="1" max="100" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: "var(--elovayne-nebula)", background: "linear-gradient(to right, var(--elovayne-nebula) 0%, var(--elovayne-nebula) " + ((brushSize/100)*100) + "%, rgba(0, 255, 136, 0.12) " + ((brushSize/100)*100) + "%, rgba(0, 255, 136, 0.12) 100%)" }} />
            </div>
            <span className="text-[10px] text-gray-500 w-6 text-right font-mono bg-gray-50 px-1 py-0.5 rounded">{brushSize}</span>
          </div>

          {/* Opacity */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Opacity</span>
            <div className="relative w-16">
              <input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: "var(--elovayne-nebula)", background: "linear-gradient(to right, var(--elovayne-nebula) 0%, var(--elovayne-nebula) " + (opacity*100) + "%, rgba(0, 255, 136, 0.12) " + (opacity*100) + "%, rgba(0, 255, 136, 0.12) 100%)" }} />
            </div>
            <span className="text-[10px] text-gray-500 w-8 text-right font-mono bg-gray-50 px-1 py-0.5 rounded">{Math.round(opacity * 100)}%</span>
          </div>

          <div className="w-px h-5 bg-gray-100 mx-1" />

          {/* Smoothing */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium" title="Line stabilization for cleaner strokes">Smooth</span>
            <div className="relative w-16">
              <input type="range" min="0" max="100" value={smoothing} onChange={e => setSmoothing(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: "var(--elovayne-nebula)", background: "linear-gradient(to right, var(--elovayne-nebula) 0%, var(--elovayne-nebula) " + smoothing + "%, rgba(0, 255, 136, 0.12) " + smoothing + "%, rgba(0, 255, 136, 0.12) 100%)" }} />
            </div>
            <span className="text-[10px] text-gray-500 w-8 text-right font-mono bg-gray-50 px-1 py-0.5 rounded">{smoothing}%</span>
          </div>

          <div className="w-px h-5 bg-gray-100 mx-1" />

          {/* Hardness */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium" title="Brush edge softness">Hard</span>
            <div className="relative w-16">
              <input type="range" min="0" max="100" value={brushHardness} onChange={e => setBrushHardness(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: "var(--elovayne-nebula)", background: "linear-gradient(to right, var(--elovayne-nebula) 0%, var(--elovayne-nebula) " + brushHardness + "%, rgba(0, 255, 136, 0.12) " + brushHardness + "%, rgba(0, 255, 136, 0.12) 100%)" }} />
            </div>
            <span className="text-[10px] text-gray-500 w-8 text-right font-mono bg-gray-50 px-1 py-0.5 rounded">{brushHardness}%</span>
          </div>

          <div className="w-px h-5 bg-gray-100 mx-1" />

          {/* Pressure toggle */}
          <button onClick={() => setPressureEnabled(p => !p)} className="p-1.5 rounded-lg text-[10px] font-medium transition-all hover:bg-gray-50"
            style={{ background: pressureEnabled ? "rgba(0, 255, 136, 0.08)" : "transparent", color: pressureEnabled ? "var(--elovayne-nebula)" : "#40a070", border: `1px solid ${pressureEnabled ? "rgba(0, 255, 136, 0.2)" : "1px solid transparent"}` }}
            title="Speed-based pressure simulation"
          >◉</button>

          <div className="w-px h-5 bg-gray-100 mx-1" />

          {/* Color swatches (foreground/background) */}
          <div className="relative w-10 h-10">
            <button onClick={() => setShowColorPicker(!showColorPicker)} className="absolute top-0 left-0 w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 hover:shadow-md z-10"
              style={{ background: color, borderColor: showColorPicker ? "var(--elovayne-nebula)" : "rgba(0,0,0,0.15)" }} title="Foreground color" />
            <button onClick={() => { const t = color; setColor(secondaryColor); setSecondaryColor(t); }}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 hover:shadow-md"
              style={{ background: secondaryColor, borderColor: "rgba(0,0,0,0.15)" }} title="Background color (D to swap)" />
            <button onClick={() => { const t = color; setColor(secondaryColor); setSecondaryColor(t); }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[7px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all shadow-sm" title="Swap colors (D)">⇄</button>
          </div>

          <div className="w-px h-5 bg-gray-100 mx-1" />

          {/* Toggles */}
          <button onClick={() => setSymmetry(!symmetry)} className="p-1.5 rounded-lg text-sm transition-all hover:bg-gray-50"
            style={{ background: symmetry ? "rgba(0, 255, 136, 0.08)" : "transparent", color: symmetry ? "var(--elovayne-nebula)" : "#60b890", border: `1px solid ${symmetry ? "rgba(0, 255, 136, 0.2)" : "1px solid transparent"}` }}
            title="Symmetry (4-way)"
          >✦</button>
          <button onClick={() => setShowGrid(g => !g)} className="p-1.5 rounded-lg text-sm transition-all hover:bg-gray-50"
            style={{ background: showGrid ? "rgba(0, 255, 136, 0.08)" : "transparent", color: showGrid ? "var(--elovayne-nebula)" : "#60b890", border: `1px solid ${showGrid ? "rgba(0, 255, 136, 0.2)" : "1px solid transparent"}` }}
            title="Grid (G)"
          >#</button>

          {/* Canvas background */}
          <div className="relative">
            <button onClick={() => setShowBgPicker(!showBgPicker)} className="p-1.5 rounded-lg text-sm transition-all hover:bg-gray-50"
              style={{ background: showBgPicker ? "rgba(0, 255, 136, 0.08)" : "transparent", color: "#60b890", border: "1px solid rgba(0,0,0,0.06)" }}
              title="Canvas background"
            >
              <div className="w-4 h-4 rounded border border-gray-300" style={{ background: canvasBg === "checker" ? "repeating-conic-gradient(#d4d4d8 0% 25%, #e4e4e7 0% 50%) 50% / 8px 8px" : BG_OPTIONS.find(b => b.value === canvasBg)?.color }} />
            </button>
            {showBgPicker && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-1 z-50 p-1.5 rounded-xl shadow-2xl"
                style={{ background: "#0a0f0b", border: "1px solid rgba(0,0,0,0.08)" }}
              >
                {BG_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setCanvasBg(opt.value); setShowBgPicker(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all hover:bg-gray-50"
                    style={{ background: canvasBg === opt.value ? "rgba(0, 255, 136, 0.06)" : "transparent" }}
                  >
                    <div className="w-4 h-4 rounded border border-gray-200" style={{ background: opt.color === "checker" ? "repeating-conic-gradient(#d4d4d8 0% 25%, #e4e4e7 0% 50%) 50% / 8px 8px" : opt.color }} />
                    <span className="text-[10px] font-medium text-gray-600">{opt.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Paper texture */}
          <div className="relative">
            <button onClick={e => { e.stopPropagation(); setShowPaperPicker(!showPaperPicker); }} className="p-1.5 rounded-lg text-[10px] font-medium transition-all hover:bg-gray-50"
              style={{ background: showPaperPicker ? "rgba(0, 255, 136, 0.08)" : paperTexture !== "none" ? "rgba(0, 255, 136, 0.06)" : "transparent", color: paperTexture !== "none" ? "var(--elovayne-nebula)" : "#60b890", border: `1px solid ${paperTexture !== "none" ? "rgba(0, 255, 136, 0.2)" : "rgba(0,0,0,0.06)"}` }}
              title="Paper texture"
            >⊞</button>
            {showPaperPicker && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-1 z-50 p-1.5 rounded-xl shadow-2xl min-w-[200px]"
                style={{ background: "#0a0f0b", border: "1px solid rgba(0,0,0,0.08)" }}
              >
                {PAPER_TEXTURES.map(opt => (
                  <button key={opt.value} onClick={() => { setPaperTexture(opt.value); setShowPaperPicker(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all hover:bg-gray-50"
                    style={{ background: paperTexture === opt.value ? "rgba(0, 255, 136, 0.06)" : "transparent" }}
                  >
                    <span className="text-sm">{opt.icon}</span>
                    <div>
                      <div className="text-[11px] font-medium" style={{ color: paperTexture === opt.value ? "var(--elovayne-nebula)" : "#a0d4b0" }}>{opt.label}</div>
                      <div className="text-[9px] text-gray-400">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Color wheel toggle */}
          <button onClick={() => { setShowColorWheel(!showColorWheel); setShowColorPicker(false); }} className="p-1.5 rounded-lg text-sm transition-all hover:bg-gray-50"
            style={{ background: showColorWheel ? "rgba(0, 255, 136, 0.08)" : "transparent", color: showColorWheel ? "var(--elovayne-nebula)" : "#60b890", border: `1px solid ${showColorWheel ? "rgba(0, 255, 136, 0.2)" : "1px solid transparent"}` }}
            title="Color wheel"
          >◎</button>

          <div className="w-px h-5 bg-gray-100 mx-1" />

          {/* Zoom */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="w-6 h-6 rounded-md flex items-center justify-center text-sm text-gray-500 hover:bg-gray-100 transition-all">−</button>
            <span className="text-[10px] text-gray-500 w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="w-6 h-6 rounded-md flex items-center justify-center text-sm text-gray-500 hover:bg-gray-100 transition-all">+</button>
            <button onClick={fitZoom} className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] text-gray-500 hover:bg-gray-100 transition-all" title="Fit to screen">⊡</button>
          </div>

          <div className="w-px h-5 bg-gray-100 mx-1" />

          {/* Rotation */}
          <div className="flex items-center gap-0.5">
            <span className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Rotate</span>
            <button onClick={() => setCanvasRotation(r => r - 15)} className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] text-gray-500 hover:bg-gray-100 transition-all" title="Rotate left 15°">↺</button>
            <span className="text-[10px] text-gray-500 w-10 text-center font-mono">{canvasRotation}°</span>
            <button onClick={() => setCanvasRotation(r => r + 15)} className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] text-gray-500 hover:bg-gray-100 transition-all" title="Rotate right 15°">↻</button>
            <button onClick={() => setCanvasRotation(0)} className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] text-gray-500 hover:bg-gray-100 transition-all" title="Reset rotation (R)">0</button>
          </div>

          <div className="flex-1" />

          {/* Canvas presets */}
          <div className="relative">
            <button onClick={() => setShowCanvasPresets(!showCanvasPresets)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:bg-gray-50"
              style={{ border: "1px solid rgba(0,0,0,0.06)", color: "#60b890" }}
            >
              <span className="font-mono">{canvasSize.width}×{canvasSize.height}</span>
              <span className="text-[10px] opacity-50">▾</span>
            </button>
            {showCanvasPresets && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="absolute top-full right-0 mt-1 z-50 p-1.5 rounded-xl shadow-2xl min-w-[180px]"
                style={{ background: "#0a0f0b", border: "1px solid rgba(0,0,0,0.08)" }}
              >
                {CANVAS_PRESETS.map(p => (
                  <button key={p.name} onClick={() => { setShowCanvasPresets(false); resizeCanvas(p.width, p.height); }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-all hover:bg-gray-50"
                    style={{ background: canvasSize.width === p.width && canvasSize.height === p.height ? "rgba(0, 255, 136, 0.06)" : "transparent" }}
                  >
                    <span className="text-xs font-medium text-gray-700">{p.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{p.width}×{p.height}</span>
                  </button>
                ))}
                <div className="h-px bg-gray-100 my-1" />
                <button onClick={() => { setShowCanvasPresets(false); setShowCustomSize(true); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-all hover:bg-gray-50"
                >
                  <span className="text-xs font-medium" style={{ color: "var(--elovayne-nebula)" }}>Custom Size</span>
                  <span className="text-[10px] text-gray-400">✎</span>
                </button>
              </motion.div>
            )}
          </div>

          <div className="w-px h-5 bg-gray-100 mx-1" />

          {/* Actions */}
          <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 rounded-lg text-sm transition-all hover:bg-gray-50" style={{ color: historyIndex <= 0 ? "rgba(0, 255, 136, 0.1)" : "#60b890" }} title="Undo (⌘Z)">↩</button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 rounded-lg text-sm transition-all hover:bg-gray-50" style={{ color: historyIndex >= history.length - 1 ? "rgba(0, 255, 136, 0.1)" : "#60b890" }} title="Redo (⌘⇧Z)">↪</button>
          <button onClick={clearCanvas} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:bg-red-50" style={{ background: "rgba(239, 68, 68, 0.06)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.1)" }}>Clear</button>
          <button onClick={() => setShowShortcuts(!showShortcuts)} className="p-1.5 rounded-lg text-[10px] font-medium transition-all hover:bg-gray-50" style={{ color: "#60b890", border: "1px solid rgba(0,0,0,0.06)" }} title="Keyboard shortcuts (?)">?</button>
          <button onClick={() => setShowExportModal(true)} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all hover:bg-teal-50" style={{ background: "rgba(0, 255, 136, 0.08)", color: "var(--elovayne-nebula)", border: "1px solid rgba(0, 255, 136, 0.15)" }}>Export</button>
        </div>}

        {/* Color picker */}
        <AnimatePresence>
          {showColorPicker && (
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-28 left-4 z-50 p-4 rounded-2xl shadow-2xl max-w-[90vw]" style={{ background: "#0a0f0b", border: "1px solid rgba(0,0,0,0.08)", minWidth: "260px" }}
            >
              {/* Current color preview */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl shadow-inner" style={{ background: color, border: "2px solid rgba(0,0,0,0.1)" }} />
                <div className="flex-1">
                  <input type="color" value={color} onChange={e => selectColor(e.target.value)} className="w-full h-8 rounded-lg cursor-pointer border-0" />
                </div>
                <input type="text" value={color} onChange={e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) selectColor(e.target.value); }}
                  className="w-20 px-2 py-1.5 rounded-lg text-[11px] font-mono border border-gray-200 outline-none focus:border-teal-400 text-center"
                  maxLength={7}
                />
              </div>

              {/* Recent colors */}
              {recentColors.length > 0 && (
                <div className="mb-3">
                  <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1.5 font-medium">Recent</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {recentColors.map((c, i) => (
                      <button key={`${c}-${i}`} onClick={() => selectColor(c)}
                        className="w-7 h-7 rounded-lg transition-all hover:scale-110 hover:shadow-md"
                        style={{ background: c, border: color === c ? "2px solid var(--elovayne-nebula)" : "1px solid rgba(0,0,0,0.1)" }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Palette */}
              <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1.5 font-medium">Palette</div>
              {COLOR_PALETTE.map((row, i) => (
                <div key={i} className="flex gap-1 mb-1">
                  {row.map(c => (
                    <button key={c} onClick={() => selectColor(c)}
                      className="w-7 h-7 rounded-lg transition-all hover:scale-110 hover:shadow-md"
                      style={{ background: c, border: color === c ? "2px solid var(--elovayne-nebula)" : "1px solid rgba(0,0,0,0.08)" }}
                    />
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Color wheel */}
        <AnimatePresence>
          {showColorWheel && (
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-28 left-4 z-50 p-4 rounded-2xl shadow-2xl max-w-[90vw]" style={{ background: "#0a0f0b", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-2 font-medium">Color Wheel</div>
              {/* SV square */}
              <div className="relative w-[200px] h-[200px] rounded-xl overflow-hidden mb-3 cursor-crosshair" style={{ touchAction: "none" }}
                onPointerDown={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const update = (clientX: number, clientY: number) => {
                    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
                    setSat(Math.round(x * 100));
                    setVal(Math.round((1 - y) * 100));
                    selectColor(hsvToHex(hue, Math.round(x * 100), Math.round((1 - y) * 100)));
                  };
                  update(e.clientX, e.clientY);
                  const onMove = (ev: PointerEvent) => update(ev.clientX, ev.clientY);
                  const onUp = () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
                  window.addEventListener("pointermove", onMove);
                  window.addEventListener("pointerup", onUp);
                }}
              >
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))` }} />
                <div className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-md pointer-events-none" style={{
                  left: `${sat}%`, top: `${100 - val}%`, transform: "translate(-50%, -50%)",
                  background: hsvToHex(hue, sat, val), boxShadow: "0 0 0 1px rgba(0,0,0,0.3)"
                }} />
              </div>
              {/* Hue ring */}
              <div className="relative w-[200px] h-5 rounded-full cursor-pointer mb-3" style={{
                background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)"
              }}
                onPointerDown={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const update = (clientX: number) => {
                    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                    const h = Math.round(x * 360);
                    setHue(h);
                    selectColor(hsvToHex(h, sat, val));
                  };
                  update(e.clientX);
                  const onMove = (ev: PointerEvent) => update(ev.clientX);
                  const onUp = () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
                  window.addEventListener("pointermove", onMove);
                  window.addEventListener("pointerup", onUp);
                }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none" style={{
                  left: `${(hue / 360) * 100}%`, transform: "translate(-50%, -50%)",
                  background: `hsl(${hue}, 100%, 50%)`, boxShadow: "0 0 0 1px rgba(0,0,0,0.3)"
                }} />
              </div>
              {/* Hex input */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg shadow-inner" style={{ background: color, border: "2px solid rgba(0,0,0,0.1)" }} />
                <input type="text" value={color} onChange={e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) selectColor(e.target.value); }}
                  className="flex-1 px-2 py-1.5 rounded-lg text-[11px] font-mono border border-gray-200 outline-none focus:border-teal-400 text-center"
                  maxLength={7}
                />
                <button onClick={() => setShowColorWheel(false)} className="text-[10px] text-gray-400 hover:text-gray-600 px-1">✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text input overlay */}
        {textInput.active && (
          <div className="absolute z-40" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
            <div className="bg-white rounded-2xl shadow-2xl p-5" style={{ border: "1px solid rgba(0,0,0,0.08)", minWidth: "300px" }}>
              <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Add Text</div>
              <input type="text" value={textValue} onChange={e => setTextValue(e.target.value)} autoFocus
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all"
                placeholder="Write something beautiful..."
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleTextAdd(textInput.x, textInput.y, textValue);
                    setTextInput({ x: 0, y: 0, active: false });
                  }
                  if (e.key === "Escape") setTextInput({ x: 0, y: 0, active: false });
                }}
              />
              <div className="flex items-center gap-3 mt-3">
                <span className="text-[10px] text-gray-400 font-medium">Size</span>
                <input type="range" min="8" max="120" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: "var(--elovayne-nebula)" }} />
                <span className="text-[10px] text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded">{fontSize}px</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setTextInput({ x: 0, y: 0, active: false })} className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-50 transition-all border border-gray-100">Cancel</button>
                <button onClick={() => { handleTextAdd(textInput.x, textInput.y, textValue); setTextInput({ x: 0, y: 0, active: false }); }} className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all" style={{ background: "var(--elovayne-nebula)" }}>Add</button>
              </div>
            </div>
          </div>
        )}

        {/* Export modal */}
        <AnimatePresence>
          {showExportModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowExportModal(false)}
            >
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-2xl shadow-2xl p-6 w-[90vw] max-w-[360px]" style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Export Canvas</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{canvasSize.width} × {canvasSize.height}px</p>
                  </div>
                  <button onClick={() => setShowExportModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">✕</button>
                </div>

                {/* Format */}
                <div className="mb-4">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-medium">Format</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {EXPORT_FORMATS.map(f => (
                      <button key={f.value} onClick={() => setExportFormat(f.value as typeof exportFormat)}
                        className="px-3 py-2.5 rounded-xl text-center transition-all"
                        style={{ background: exportFormat === f.value ? "rgba(0, 255, 136, 0.08)" : "#1f3828", border: `1px solid ${exportFormat === f.value ? "rgba(0, 255, 136, 0.25)" : "rgba(0,0,0,0.06)"}` }}
                      >
                        <div className="text-xs font-semibold" style={{ color: exportFormat === f.value ? "var(--elovayne-nebula)" : "#a0d4b0" }}>{f.label}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5">{f.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality (for JPEG/WebP) */}
                {exportFormat !== "png" && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Quality</span>
                      <span className="text-[10px] text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded">{exportQuality}%</span>
                    </div>
                    <input type="range" min="10" max="100" step="5" value={exportQuality} onChange={e => setExportQuality(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: "var(--elovayne-nebula)", background: `linear-gradient(to right, var(--elovayne-nebula) 0%, var(--elovayne-nebula) ${exportQuality}%, rgba(0, 255, 136, 0.12) ${exportQuality}%, rgba(0, 255, 136, 0.12) 100%)` }} />
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-gray-300">Smaller file</span>
                      <span className="text-[9px] text-gray-300">Higher quality</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => setShowExportModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-50 transition-all border border-gray-100">Cancel</button>
                  <button onClick={exportCanvas} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90" style={{ background: "var(--elovayne-nebula)" }}>
                    Download {exportFormat.toUpperCase()}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom canvas size dialog */}
        <AnimatePresence>
          {showCustomSize && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowCustomSize(false)}
            >
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-2xl shadow-2xl p-6 w-[90vw] max-w-[320px]" style={{ border: "1px solid rgba(0,0,0,0.06)" }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-gray-900">Custom Canvas Size</h3>
                  <button onClick={() => setShowCustomSize(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">✕</button>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1 block">Width</label>
                    <input type="number" min="100" max="10000" value={customWidth} onChange={e => setCustomWidth(Math.max(100, Math.min(10000, Number(e.target.value))))}
                      className="w-full px-3 py-2 rounded-xl text-sm border border-gray-200 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all font-mono text-center" />
                  </div>
                  <span className="text-gray-300 mt-5">×</span>
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1 block">Height</label>
                    <input type="number" min="100" max="10000" value={customHeight} onChange={e => setCustomHeight(Math.max(100, Math.min(10000, Number(e.target.value))))}
                      className="w-full px-3 py-2 rounded-xl text-sm border border-gray-200 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 transition-all font-mono text-center" />
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  {[{ w: 1200, h: 1200, l: "Square" }, { w: 1920, h: 1080, l: "Landscape" }, { w: 1080, h: 1920, l: "Portrait" }].map(p => (
                    <button key={p.l} onClick={() => { setCustomWidth(p.w); setCustomHeight(p.h); }}
                      className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:bg-gray-50"
                      style={{ border: "1px solid rgba(0,0,0,0.06)", color: "#60b890" }}
                    >{p.l}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowCustomSize(false)} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-50 transition-all border border-gray-100">Cancel</button>
                  <button onClick={() => { setShowCustomSize(false); resizeCanvas(customWidth, customHeight); }}
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90" style={{ background: "var(--elovayne-nebula)" }}>
                    Apply Size
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden" style={{ background: "#ffffff", cursor: isPanning ? "grab" : activeTool === "eyedropper" ? "crosshair" : activeTool === "fill" ? "crosshair" : activeTool === "text" ? "text" : "none", touchAction: "none", paddingBottom: isMobile ? "110px" : "0" }}
          onWheel={e => {
            e.preventDefault();
            // Trackpad pinch-to-zoom sends wheel events with ctrlKey
            const isPinch = e.ctrlKey;
            const delta = isPinch ? -e.deltaY * 0.01 : (e.deltaY > 0 ? -0.05 : 0.05);
            const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
            const container = containerRef.current;
            if (container) {
              const rect = container.getBoundingClientRect();
              const mx = e.clientX - rect.left;
              const my = e.clientY - rect.top;
              const scale = newZoom / zoom;
              setPanOffset({ x: mx - (mx - panOffset.x) * scale, y: my - (my - panOffset.y) * scale });
            }
            setZoom(newZoom);
          }}
          onTouchStart={e => {
            if (e.touches.length === 2) {
              e.preventDefault();
              const dx = e.touches[0].clientX - e.touches[1].clientX;
              const dy = e.touches[0].clientY - e.touches[1].clientY;
              touchDistance.current = Math.sqrt(dx * dx + dy * dy);
              touchMidpoint.current = {
                x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
              };
              touchPanStart.current = { ...panOffset };
              return;
            }
          }}
          onTouchMove={e => {
            if (e.touches.length === 2) {
              e.preventDefault();
              const dx = e.touches[0].clientX - e.touches[1].clientX;
              const dy = e.touches[0].clientY - e.touches[1].clientY;
              const newDist = Math.sqrt(dx * dx + dy * dy);
              const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
              const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
              if (touchDistance.current > 0) {
                const scale = newDist / touchDistance.current;
                const newZoom = Math.max(0.1, Math.min(5, zoom * scale));
                const container = containerRef.current;
                if (container && touchPanStart.current) {
                  const rect = container.getBoundingClientRect();
                  const mx = midX - rect.left;
                  const my = midY - rect.top;
                  const zoomScale = newZoom / zoom;
                  setPanOffset({
                    x: mx - (mx - touchPanStart.current.x) * zoomScale + (midX - touchMidpoint.current.x),
                    y: my - (my - touchPanStart.current.y) * zoomScale + (midY - touchMidpoint.current.y),
                  });
                }
                setZoom(newZoom);
              }
              touchDistance.current = newDist;
              touchMidpoint.current = { x: midX, y: midY };
              touchPanStart.current = { ...panOffset };
            }
          }}
          onTouchEnd={e => {
            if (e.touches.length < 2) {
              touchDistance.current = 0;
              touchPanStart.current = null;
            }
          }}
          onMouseDown={e => {
            if (e.button === 1) {
              e.preventDefault();
              setIsPanning(true);
              panStart.current = { x: e.clientX, y: e.clientY };
              panOffsetStart.current = { ...panOffset };
            }
          }}
          onMouseMove={e => {
            if (isPanning && panStart.current && panOffsetStart.current) {
              setPanOffset({ x: panOffsetStart.current.x + (e.clientX - panStart.current.x), y: panOffsetStart.current.y + (e.clientY - panStart.current.y) });
            }
            const pos = getCanvasPos(e.clientX, e.clientY);
            setCursorPos({ x: Math.round(pos.x), y: Math.round(pos.y) });
            const container = containerRef.current;
            if (container) {
              const rect = container.getBoundingClientRect();
              setMouseScreenPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }
            if (activeTool === "eyedropper" && !isPanning) {
              const canvas = canvasRef.current;
              if (canvas) {
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  const px = Math.floor(pos.x), py = Math.floor(pos.y);
                  if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
                    const pixel = ctx.getImageData(px, py, 1, 1).data;
                    setEyedropperColor("#" + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, "0")).join(""));
                  }
                }
              }
            }
          }}
          onMouseLeave={() => { setCursorPos(null); setMouseScreenPos(null); }}
          onMouseUp={e => { if (e.button === 1) { setIsPanning(false); panStart.current = null; } }}
        >
          {/* Checkered transparency background */}
          <div style={{ position: "absolute", left: panOffset.x, top: panOffset.y, width: canvasSize.width * zoom, height: canvasSize.height * zoom, transform: `rotate(${canvasRotation}deg)`, transformOrigin: "center center" }}>
            <div style={{ width: "100%", height: "100%", background: "repeating-conic-gradient(#d4d4d8 0% 25%, #e4e4e7 0% 50%) 50% / 16px 16px", borderRadius: "2px" }} />
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} style={{ width: "100%", height: "100%", background: "#ffffff", display: "block", position: "absolute", top: 0, left: 0 }}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
            />
            <canvas ref={overlayCanvasRef} width={canvasSize.width} height={canvasSize.height} className="pointer-events-none" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
          </div>

          {/* Grid overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none" style={{
              left: panOffset.x, top: panOffset.y, width: canvasSize.width * zoom, height: canvasSize.height * zoom,
              backgroundImage: "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
              backgroundSize: `${50 * zoom}px ${50 * zoom}px`,
            }} />
          )}

          {/* Paper texture overlay */}
          {textureDataUrl && (
            <div className="absolute inset-0 pointer-events-none" style={{
              left: panOffset.x, top: panOffset.y, width: canvasSize.width * zoom, height: canvasSize.height * zoom,
              backgroundImage: `url(${textureDataUrl})`,
              backgroundSize: `${256 * zoom}px ${256 * zoom}px`,
              opacity: 0.5,
            }} />
          )}

          {/* Status bar - hidden on mobile */}
          {!isMobile && <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
            {cursorPos && (
              <>
                <span className="text-[10px] text-gray-500 font-mono">X: {cursorPos.x} Y: {cursorPos.y}</span>
                <span className="text-[10px] text-gray-200">│</span>
              </>
            )}
            <span className="text-[10px] text-gray-500 font-mono">{canvasSize.width}×{canvasSize.height}</span>
            <span className="text-[10px] text-gray-200">│</span>
            <span className="text-[10px] text-gray-500 font-mono">{Math.round(zoom*100)}%</span>
            {canvasRotation !== 0 && (
              <>
                <span className="text-[10px] text-gray-200">│</span>
                <span className="text-[10px] text-gray-500 font-mono">{canvasRotation}°</span>
              </>
            )}
            <span className="text-[10px] text-gray-200">│</span>
            <span className="text-[10px] text-gray-500 font-mono">{activeTool === "brush" ? brushType : activeTool}</span>
            {paperTexture !== "none" && (
              <>
                <span className="text-[10px] text-gray-200">│</span>
                <span className="text-[10px] text-gray-500 font-mono">{paperTexture}</span>
              </>
            )}
            <span className="text-[10px] text-gray-200">│</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: color, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{color}</span>
          </div>}

          {/* History indicator - hidden on mobile */}
          {!isMobile && <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
            <span className="text-[10px] text-gray-400">History</span>
            <span className="text-[10px] text-gray-500 font-mono">{historyIndex + 1}/{history.length}</span>
          </div>}

          {/* Brush cursor preview */}
          {mouseScreenPos && !isPanning && activeTool === "brush" && (
            <div className="pointer-events-none absolute z-30" style={{
              left: mouseScreenPos.x - (brushSize * zoom) / 2,
              top: mouseScreenPos.y - (brushSize * zoom) / 2,
              width: brushSize * zoom,
              height: brushSize * zoom,
              border: `1.5px solid ${brushType === "eraser" ? "#ef4444" : "rgba(0,0,0,0.4)"}`,
              borderRadius: "50%",
              boxShadow: brushType === "eraser" ? "0 0 0 1px rgba(239,68,68,0.3)" : "0 0 0 1px rgba(255,255,255,0.5)",
            }} />
          )}

          {/* Eyedropper magnifier loupe */}
          {mouseScreenPos && activeTool === "eyedropper" && cursorPos && (
            <div ref={eyedropperRef} className="pointer-events-none absolute z-40" style={{
              left: mouseScreenPos.x + 20, top: mouseScreenPos.y - 60,
              width: 80, height: 80, borderRadius: "50%", overflow: "hidden",
              border: "2px solid white", boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}>
              <div className="absolute inset-0" style={{
                background: eyedropperColor, borderRadius: "50%",
              }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border border-white/60 rounded-sm" style={{ background: eyedropperColor }} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-center py-0.5">
                <span className="text-[7px] text-white font-mono">{eyedropperColor}</span>
              </div>
              <div className="absolute inset-0 rounded-full" style={{
                background: "repeating-conic-gradient(rgba(255,255,255,0.1) 0% 25%, transparent 0% 50%) 50% / 8px 8px",
              }} />
            </div>
          )}

          {/* Minimap - hidden on mobile */}
          {!isMobile && (
          <div className="absolute bottom-14 left-3 bg-white/90 backdrop-blur-md rounded-xl shadow-lg overflow-hidden cursor-pointer" style={{ border: "1px solid rgba(0,0,0,0.08)", width: 150, height: 100 }}
            onClick={e => {
              const container = containerRef.current;
              const canvas = canvasRef.current;
              if (!container || !canvas) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const clickY = e.clientY - rect.top;
              const scaleX = canvasSize.width / 150;
              const scaleY = canvasSize.height / 100;
              const canvasX = clickX * scaleX;
              const canvasY = clickY * scaleY;
              const cw = container.offsetWidth;
              const ch = container.offsetHeight;
              setPanOffset({ x: cw / 2 - canvasX * zoom, y: ch / 2 - canvasY * zoom });
            }}
          >
            <div className="absolute top-0.5 left-1 text-[7px] text-gray-400 font-medium z-10 pointer-events-none">Overview</div>
            <canvas ref={minimapCanvasRef} width={150} height={100} className="block" />
            <div className="pointer-events-none absolute" style={{
              left: `${Math.max(0, (-panOffset.x / (canvasSize.width * zoom)) * 150)}px`,
              top: `${Math.max(0, (-panOffset.y / (canvasSize.height * zoom)) * 100)}px`,
              width: `${Math.min(150, (1 / zoom) * 150)}px`,
              height: `${Math.min(100, (1 / zoom) * 100)}px`,
              border: "1.5px solid var(--elovayne-nebula)",
              borderRadius: 2,
              background: "rgba(0, 255, 136, 0.08)",
              minWidth: 8,
              minHeight: 8,
            }} />
          </div>
          )}
        </div>
      </div>

      {/* Keyboard shortcuts overlay */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-[90vw] max-w-[480px] max-h-[80vh] overflow-y-auto" style={{ border: "1px solid rgba(0,0,0,0.06)" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Keyboard Shortcuts</h3>
                <button onClick={() => setShowShortcuts(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">✕</button>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Tools", shortcuts: [
                    { key: "B", desc: "Brush (Pen)" },
                    { key: "P", desc: "Pencil" },
                    { key: "A", desc: "Airbrush" },
                    { key: "E", desc: "Eraser" },
                    { key: "X", desc: "Eyedropper" },
                    { key: "F", desc: "Fill bucket" },
                    { key: "L", desc: "Blur tool" },
                    { key: "T", desc: "Text tool" },
                  ]},
                  { title: "Canvas", shortcuts: [
                    { key: "⌘/Ctrl + Z", desc: "Undo" },
                    { key: "⌘/Ctrl + ⇧ + Z", desc: "Redo" },
                    { key: "⌘/Ctrl + S", desc: "Export" },
                    { key: "⌘/Ctrl + 0", desc: "Reset zoom" },
                    { key: "[ / ]", desc: "Decrease / Increase brush size" },
                    { key: "R", desc: "Reset rotation" },
                    { key: "D", desc: "Swap foreground/background" },
                    { key: "G", desc: "Toggle grid" },
                  ]},
                  { title: "Navigation", shortcuts: [
                    { key: "Space + Drag", desc: "Pan canvas" },
                    { key: "Middle click", desc: "Pan canvas" },
                    { key: "Scroll", desc: "Zoom in/out" },
                    { key: "Right-click", desc: "Eyedropper (hold)" },
                    { key: "?", desc: "Toggle this panel" },
                  ]},
                ].map(section => (
                  <div key={section.title}>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-medium">{section.title}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {section.shortcuts.map(s => (
                        <div key={s.key} className="flex items-center justify-between py-1">
                          <span className="text-[11px] text-gray-600">{s.desc}</span>
                          <kbd className="text-[9px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">{s.key}</kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background: "#0a0f0b", borderTop: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 -2px 12px rgba(0,0,0,0.06)" }}>
          {/* Active tool content area */}
          {mobileTab === "tools" && (
            <div className="flex items-center justify-around px-2 py-2 gap-1">
              {[
                { tool: "brush" as ToolType, icon: "✏️", label: "Brush" },
                { tool: "eyedropper" as ToolType, icon: "💧", label: "Pick" },
                { tool: "fill" as ToolType, icon: "🪣", label: "Fill" },
                { tool: "blur" as ToolType, icon: "🌫", label: "Blur" },
                { tool: "text" as ToolType, icon: "T", label: "Text" },
              ].map(t => (
                <button key={t.tool} onClick={() => setActiveTool(t.tool)} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
                  style={{ background: activeTool === t.tool ? "rgba(0, 255, 136, 0.1)" : "transparent" }}>
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-[9px] font-medium" style={{ color: activeTool === t.tool ? "var(--elovayne-nebula)" : "#40a070" }}>{t.label}</span>
                </button>
              ))}
            </div>
          )}
          {mobileTab === "brush" && (
            <div className="px-3 py-2">
              <div className="flex gap-1 overflow-x-auto pb-1 mb-2">
                {BRUSH_PRESETS.filter(b => b.category === "basic").map(p => (
                  <button key={p.type} onClick={() => setBrushType(p.type)} className="flex-shrink-0 p-2 rounded-lg text-lg transition-all"
                    style={{ background: brushType === p.type ? "rgba(0, 255, 136, 0.1)" : "#1f3828", border: `1px solid ${brushType === p.type ? "rgba(0, 255, 136, 0.3)" : "rgba(0,0,0,0.06)"}` }}
                    title={p.name}
                  >{p.icon}</button>
                ))}
                <button onClick={() => setShowBrushPanel(true)} className="flex-shrink-0 p-2 rounded-lg text-sm transition-all" style={{ background: "#1f3828", border: "1px solid rgba(0,0,0,0.06)", color: "#60b890" }}>+</button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 w-10">Size</span>
                <input type="range" min="1" max="100" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="flex-1 h-2 rounded-full appearance-none" style={{ accentColor: "var(--elovayne-nebula)" }} />
                <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{brushSize}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-gray-400 w-10">Opacity</span>
                <input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="flex-1 h-2 rounded-full appearance-none" style={{ accentColor: "var(--elovayne-nebula)" }} />
                <span className="text-[10px] text-gray-500 font-mono w-8 text-right">{Math.round(opacity * 100)}%</span>
              </div>
            </div>
          )}
          {mobileTab === "color" && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative w-12 h-12">
                  <div className="absolute top-0 left-0 w-9 h-9 rounded-xl border-2" style={{ background: color, borderColor: "rgba(0,0,0,0.15)" }} />
                  <div className="absolute bottom-0 right-0 w-9 h-9 rounded-xl border-2" style={{ background: secondaryColor, borderColor: "rgba(0,0,0,0.15)" }} />
                </div>
                <div className="flex-1">
                  <input type="color" value={color} onChange={e => selectColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer border-0" />
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {COLOR_PALETTE.flat().map((c, i) => (
                  <button key={`${c}-${i}`} onClick={() => selectColor(c)} className="w-8 h-8 rounded-lg transition-all active:scale-90"
                    style={{ background: c, border: color === c ? "2px solid var(--elovayne-nebula)" : "1px solid rgba(0,0,0,0.08)" }} />
                ))}
              </div>
            </div>
          )}
          {mobileTab === "settings" && (
            <div className="px-3 py-2 space-y-2">
              <div className="flex items-center gap-2">
                <button onClick={undo} disabled={historyIndex <= 0} className="flex-1 py-2 rounded-xl text-xs font-medium transition-all" style={{ background: historyIndex <= 0 ? "rgba(0, 255, 136, 0.06)" : "#1f3828", color: historyIndex <= 0 ? "#cbd5e1" : "#60b890", border: "1px solid rgba(0,0,0,0.06)" }}>↩ Undo</button>
                <button onClick={redo} disabled={historyIndex >= history.length - 1} className="flex-1 py-2 rounded-xl text-xs font-medium transition-all" style={{ background: historyIndex >= history.length - 1 ? "rgba(0, 255, 136, 0.06)" : "#1f3828", color: historyIndex >= history.length - 1 ? "#cbd5e1" : "#60b890", border: "1px solid rgba(0,0,0,0.06)" }}>↪ Redo</button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSymmetry(s => !s)} className="flex-1 py-2 rounded-xl text-xs font-medium transition-all" style={{ background: symmetry ? "rgba(0,255,136,0.08)" : "#1f3828", color: symmetry ? "var(--elovayne-nebula)" : "#60b890", border: `1px solid ${symmetry ? "rgba(0,255,136,0.2)" : "rgba(0,0,0,0.06)"}` }}>✦ Symmetry</button>
                <button onClick={() => setShowGrid(g => !g)} className="flex-1 py-2 rounded-xl text-xs font-medium transition-all" style={{ background: showGrid ? "rgba(0,255,136,0.08)" : "#1f3828", color: showGrid ? "var(--elovayne-nebula)" : "#60b890", border: `1px solid ${showGrid ? "rgba(0,255,136,0.2)" : "rgba(0,0,0,0.06)"}` }}># Grid</button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="py-2 px-3 rounded-xl text-xs font-medium transition-all" style={{ background: "#1f3828", color: "#60b890", border: "1px solid rgba(0,0,0,0.06)" }}>−</button>
                <span className="flex-1 text-center text-xs font-mono" style={{ color: "#60b890" }}>{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="py-2 px-3 rounded-xl text-xs font-medium transition-all" style={{ background: "#1f3828", color: "#60b890", border: "1px solid rgba(0,0,0,0.06)" }}>+</button>
                <button onClick={fitZoom} className="py-2 px-3 rounded-xl text-xs font-medium transition-all" style={{ background: "#1f3828", color: "#60b890", border: "1px solid rgba(0,0,0,0.06)" }}>⊡</button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowExportModal(true)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-all" style={{ background: "var(--elovayne-nebula)" }}>Export</button>
                <button onClick={clearCanvas} className="py-2.5 px-4 rounded-xl text-xs font-medium transition-all" style={{ background: "rgba(239,68,68,0.06)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.1)" }}>Clear</button>
              </div>
            </div>
          )}
          {/* Tab bar */}
          <div className="flex items-center border-t border-gray-100">
            {[
              { id: "tools" as const, icon: "✏️", label: "Tools" },
              { id: "brush" as const, icon: "🖌", label: "Brush" },
              { id: "color" as const, icon: "🎨", label: "Color" },
              { id: "settings" as const, icon: "⚙️", label: "More" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setMobileTab(tab.id)} className="flex-1 flex flex-col items-center py-2 transition-all"
                style={{ color: mobileTab === tab.id ? "var(--elovayne-nebula)" : "#40a070" }}>
                <span className="text-base">{tab.icon}</span>
                <span className="text-[9px] font-medium">{tab.label}</span>
                {mobileTab === tab.id && <div className="w-4 h-0.5 rounded-full bg-[var(--elovayne-nebula)] mt-0.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function getPixelColor(data: Uint8ClampedArray, x: number, y: number, width: number): { r: number; g: number; b: number; a: number } {
  const idx = (y * width + x) * 4;
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

function colorsMatch(a: { r: number; g: number; b: number; a: number }, b: { r: number; g: number; b: number }, tolerance = 0): boolean {
  return Math.abs(a.r - b.r) <= tolerance && Math.abs(a.g - b.g) <= tolerance && Math.abs(a.b - b.b) <= tolerance;
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, v: 0 };
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : Math.round((d / max) * 100);
  const v = Math.round(max * 100);
  return { h, s, v };
}

function hsvToHex(h: number, s: number, v: number): string {
  s /= 100; v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const BG_OPTIONS = [
  { value: "white" as const, label: "White", color: "#ffffff" },
  { value: "light-gray" as const, label: "Light Gray", color: "#f0f0f0" },
  { value: "dark-gray" as const, label: "Dark Gray", color: "#333333" },
  { value: "black" as const, label: "Black", color: "#000000" },
  { value: "checker" as const, label: "Transparent", color: "checker" },
];

const PAPER_TEXTURES = [
  { value: "none" as const, label: "No Texture", desc: "Plain surface", icon: "📄" },
  { value: "smooth" as const, label: "Smooth", desc: "Bristol board, ultra-fine", icon: "📃" },
  { value: "rough" as const, label: "Rough", desc: "Heavy grain watercolor", icon: "🧱" },
  { value: "cold-press" as const, label: "Cold Press", desc: "Medium texture, versatile", icon: "🧊" },
  { value: "canvas" as const, label: "Canvas", desc: "Woven fabric texture", icon: "🎨" },
  { value: "kraft" as const, label: "Kraft", desc: "Brown paper, warm tone", icon: "📦" },
  { value: "linen" as const, label: "Linen", desc: "Fine woven textile", icon: "🧵" },
  { value: "cardstock" as const, label: "Cardstock", desc: "Thick, slightly textured", icon: "🃏" },
];

function generatePaperTexture(type: string, width: number, height: number): string | null {
  if (type === "none") return null;
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  // Seeded random for consistent textures
  let seed = 0;
  for (let i = 0; i < type.length; i++) seed = ((seed << 5) - seed + type.charCodeAt(i)) | 0;
  const rand = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed & 0x7fffffff) / 2147483647; };

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  switch (type) {
    case "smooth": {
      // Ultra-fine barely-visible grain — almost flat
      for (let i = 0; i < data.length; i += 4) {
        const noise = (rand() - 0.5) * 8;
        const v = Math.max(0, Math.min(255, 230 + noise));
        data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 50;
      }
      break;
    }
    case "rough": {
      // Heavy stucco/plaster — large irregular bumps with deep shadows
      const cells: { x: number; y: number; h: number }[] = [];
      for (let i = 0; i < 80; i++) cells.push({ x: rand() * width, y: rand() * height, h: rand() * 80 - 20 });
      for (let i = 0; i < data.length; i += 4) {
        const px = (i / 4) % width, py = Math.floor((i / 4) / width);
        let minDist = 9999, secondDist = 9999, closestH = 0;
        for (const cell of cells) {
          const d = Math.sqrt((px - cell.x) ** 2 + (py - cell.y) ** 2);
          if (d < minDist) { secondDist = minDist; minDist = d; closestH = cell.h; }
          else if (d < secondDist) secondDist = d;
        }
        const edge = Math.min(1, (secondDist - minDist) / 20);
        const bump = closestH * edge + (rand() - 0.5) * 30;
        const v = Math.max(0, Math.min(255, 170 + bump));
        data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 200;
      }
      break;
    }
    case "cold-press": {
      // Horizontal waves with grain — directional watercolor texture
      for (let i = 0; i < data.length; i += 4) {
        const px = (i / 4) % width, py = Math.floor((i / 4) / width);
        const wave = Math.sin(px * 0.03 + Math.sin(py * 0.01) * 5) * 25;
        const grain = (rand() - 0.5) * 35;
        const fiber = Math.sin(py * 0.15 + px * 0.02) * 8;
        const v = Math.max(0, Math.min(255, 190 + wave + grain + fiber));
        data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 160;
      }
      break;
    }
    case "canvas": {
      // Clear woven fabric — visible thread grid with warp/weft
      const threadW = 8, gap = 2;
      for (let i = 0; i < data.length; i += 4) {
        const px = (i / 4) % width, py = Math.floor((i / 4) / width);
        const warp = Math.sin((px / threadW) * Math.PI * 2);
        const weft = Math.sin((py / threadW) * Math.PI * 2);
        const threadX = (px % threadW) < threadW - gap ? 1 : 0.5;
        const threadY = (py % threadW) < threadW - gap ? 1 : 0.5;
        const weave = (warp > 0 ? threadX : threadY) * 0.5 + 0.5;
        const fiber = (rand() - 0.5) * 10;
        const v = Math.max(0, Math.min(255, 140 + weave * 80 + fiber));
        data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 190;
      }
      break;
    }
    case "kraft": {
      // Warm brown with fiber streaks and organic spots
      for (let i = 0; i < data.length; i += 4) {
        const px = (i / 4) % width, py = Math.floor((i / 4) / width);
        const fiber1 = Math.sin(px * 0.02 + py * 0.008 + Math.sin(py * 0.005) * 3) * 20;
        const fiber2 = Math.sin(px * 0.005 - py * 0.015) * 15;
        const spot = Math.sin(px * 0.08) * Math.sin(py * 0.06) * 12;
        const grain = (rand() - 0.5) * 25;
        const v = Math.max(0, Math.min(255, 175 + fiber1 + fiber2 + spot + grain));
        // Warm brown tint
        data[i] = v + 8; data[i + 1] = v - 2; data[i + 2] = v - 15; data[i + 3] = 190;
      }
      break;
    }
    case "linen": {
      // Tight fine weave — smaller than canvas, dress-shirt fabric
      const lw = 4, lg = 1;
      for (let i = 0; i < data.length; i += 4) {
        const px = (i / 4) % width, py = Math.floor((i / 4) / width);
        const warpL = Math.sin((px / lw) * Math.PI * 2);
        const weftL = Math.sin((py / lw) * Math.PI * 2);
        const tx = (px % lw) < lw - lg ? 1 : 0.4;
        const ty = (py % lw) < lw - lg ? 1 : 0.4;
        const weave = (warpL > 0 ? tx : ty) * 0.4 + 0.6;
        const micro = (rand() - 0.5) * 8;
        const v = Math.max(0, Math.min(255, 160 + weave * 70 + micro));
        data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 170;
      }
      break;
    }
    case "cardstock": {
      // Pebbled/embossed — gentle rounded bumps like leather or fine leatherette
      const pebDots: { x: number; y: number; r: number; h: number }[] = [];
      for (let i = 0; i < 200; i++) pebDots.push({ x: rand() * width, y: rand() * height, r: 8 + rand() * 15, h: 10 + rand() * 25 });
      for (let i = 0; i < data.length; i += 4) {
        const px = (i / 4) % width, py = Math.floor((i / 4) / width);
        let bump = 0;
        for (const d of pebDots) {
          const dist = Math.sqrt((px - d.x) ** 2 + (py - d.y) ** 2);
          if (dist < d.r) {
            const t = 1 - dist / d.r;
            bump += d.h * t * t * (3 - 2 * t); // smooth hermite
          }
        }
        const grain = (rand() - 0.5) * 10;
        const v = Math.max(0, Math.min(255, 185 + bump + grain));
        data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 160;
      }
      break;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return c.toDataURL();
}
