"use client";

import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { CanvasTool, CanvasLayer, SymmetryMode } from "./CanvasToolbar";

export interface DreamCanvasRef {
  exportImage: () => HTMLCanvasElement | null;
  loadDataURL: (dataURL: string) => void;
  clearActiveLayer: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyLabels: string[];
  historyIdx: number;
  setReferenceImage: (img: HTMLImageElement | null) => void;
  adjustBrightness: (value: number) => void;
  adjustContrast: (value: number) => void;
  adjustSaturation: (value: number) => void;
  adjustHue: (value: number) => void;
}

interface DreamCanvasProps {
  activeTool: CanvasTool;
  layers: CanvasLayer[];
  activeLayerId: string;
  zoom: number;
  panOffset: { x: number; y: number };
  canvasRotation: number;
  symmetryMode: SymmetryMode;
  onPanChange: (offset: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onColorPick: (color: string) => void;
  onHistoryUpdate: (labels: string[], index: number) => void;
  width: number;
  height: number;
}

interface HistoryEntry {
  layers: Map<string, ImageData>;
  label: string;
}

interface LassoPoint {
  x: number;
  y: number;
}

const MAX_HISTORY = 80;

function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

function hexToRGBA(hex: string, a: number): string {
  const { r, g, b } = hexToRGB(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function dist(x0: number, y0: number, x1: number, y1: number): number {
  return Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
}

function starPoints(cx: number, cy: number, outerR: number, innerR: number, points: number): [number, number][] {
  const pts: [number, number][] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  return pts;
}

function polygonPoints(cx: number, cy: number, r: number, sides: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  return pts;
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

const DreamCanvas = forwardRef<DreamCanvasRef, DreamCanvasProps>(
  (
    {
      activeTool,
      layers,
      activeLayerId,
      zoom,
      panOffset,
      canvasRotation,
      symmetryMode,
      onPanChange,
      onZoomChange,
      onColorPick,
      onHistoryUpdate,
      width,
      height,
    },
    ref
  ) => {
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const layerCanvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
    const marchingAntsRef = useRef<number>(0);
    const animFrameRef = useRef<number>(0);

    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
    const [lassoPoints, setLassoPoints] = useState<LassoPoint[]>([]);
    const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<{ x: number; y: number; ox: number; oy: number } | null>(null);
    const [textInput, setTextInput] = useState<{ x: number; y: number; show: boolean; text: string }>({
      x: 0,
      y: 0,
      show: false,
      text: "",
    });
    const [referenceImage, setReferenceImage] = useState<HTMLImageElement | null>(null);
    const [canvasVersion, setCanvasVersion] = useState(0);
    const [cloneSource, setCloneSource] = useState<{ x: number; y: number } | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
    const [lastSaveTime, setLastSaveTime] = useState(0);

    const bumpVersion = useCallback(() => setCanvasVersion((v) => v + 1), []);

    const getLayerCanvas = useCallback(
      (layerId: string): HTMLCanvasElement => {
        let canvas = layerCanvasRefs.current.get(layerId);
        if (!canvas) {
          canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          layerCanvasRefs.current.set(layerId, canvas);
        }
        return canvas;
      },
      [width, height]
    );

    useEffect(() => {
      layers.forEach((l) => {
        getLayerCanvas(l.id);
      });
    }, [layers, getLayerCanvas]);

    const composite = useCallback(() => {
      const compCanvas = compositeCanvasRef.current;
      if (!compCanvas) return;
      const ctx = compCanvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      const gs = 8;
      for (let y = 0; y < height; y += gs) {
        for (let x = 0; x < width; x += gs) {
          ctx.fillStyle = (Math.floor(x / gs) + Math.floor(y / gs)) % 2 === 0 ? "#e6f7f2" : "#d1f0e8";
          ctx.fillRect(x, y, gs, gs);
        }
      }

      for (const layer of layers) {
        if (!layer.visible) continue;
        const lc = layerCanvasRefs.current.get(layer.id);
        if (!lc) continue;
        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.globalCompositeOperation = layer.blendMode;
        ctx.drawImage(lc, 0, 0);
        ctx.restore();
      }
    }, [layers, width, height]);

    // Save canvas to localStorage
    const saveCanvas = useCallback(() => {
      try {
        const canvasData: Record<string, string> = {};
        layerCanvasRefs.current.forEach((canvas, id) => {
          canvasData[id] = canvas.toDataURL('image/png');
        });
        localStorage.setItem('dream-canvas-data', JSON.stringify(canvasData));
        localStorage.setItem('dream-canvas-layers', JSON.stringify(layers));
        setLastSaveTime(Date.now());
      } catch (err) {
        console.error('Failed to save canvas:', err);
      }
    }, [layers]);

    // Load canvas from localStorage
    const loadCanvas = useCallback(() => {
      try {
        const canvasData = localStorage.getItem('dream-canvas-data');
        const layersData = localStorage.getItem('dream-canvas-layers');
        
        if (canvasData && layersData) {
          const data = JSON.parse(canvasData);
          const savedLayers = JSON.parse(layersData);
          
          // Restore layers
          savedLayers.forEach((layer: CanvasLayer) => {
            const canvas = getLayerCanvas(layer.id);
            if (data[layer.id]) {
              const img = new Image();
              img.onload = () => {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0);
                  composite();
                  bumpVersion();
                }
              };
              img.src = data[layer.id];
            }
          });
          
          return savedLayers;
        }
      } catch (err) {
        console.error('Failed to load canvas:', err);
      }
      return null;
    }, [getLayerCanvas, composite, bumpVersion]);

    // Auto-save every 30 seconds
    useEffect(() => {
      const interval = setInterval(() => {
        if (canvasVersion > 0) {
          saveCanvas();
        }
      }, 30000);
      return () => clearInterval(interval);
    }, [canvasVersion, saveCanvas]);

    const drawPreview = useCallback(() => {
      const pv = previewCanvasRef.current;
      if (!pv) return;
      const ctx = pv.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      if (selectionRect) {
        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1 / zoom;
        const offset = marchingAntsRef.current;
        ctx.setLineDash([6 / zoom, 4 / zoom]);
        ctx.lineDashOffset = -offset;
        ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
        ctx.strokeStyle = "#000000";
        ctx.lineDashOffset = -offset + 5 / zoom;
        ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
        ctx.restore();
      }

      if (lassoPoints.length > 1) {
        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1 / zoom;
        const offset = marchingAntsRef.current;
        ctx.setLineDash([6 / zoom, 4 / zoom]);
        ctx.lineDashOffset = -offset;
        ctx.beginPath();
        ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
        for (let i = 1; i < lassoPoints.length; i++) {
          ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.strokeStyle = "#000000";
        ctx.lineDashOffset = -offset + 5 / zoom;
        ctx.stroke();
        ctx.restore();
      }
    }, [selectionRect, lassoPoints, zoom]);

    useEffect(() => {
      let running = true;
      const animate = () => {
        if (!running) return;
        marchingAntsRef.current = (marchingAntsRef.current + 0.5) % 20;
        drawPreview();
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
      return () => {
        running = false;
        cancelAnimationFrame(animFrameRef.current);
      };
    }, [drawPreview]);

    useEffect(() => {
      composite();
    }, [composite, canvasVersion]);

    const saveHistory = useCallback(
      (label: string) => {
        const entry: HistoryEntry = {
          layers: new Map(),
          label,
        };
        layers.forEach((l) => {
          const c = layerCanvasRefs.current.get(l.id);
          if (c) {
            const ctx = c.getContext("2d");
            if (ctx) {
              entry.layers.set(l.id, ctx.getImageData(0, 0, width, height));
            }
          }
        });
        setHistory((prev) => {
          const trimmed = prev.slice(0, historyIndex + 1);
          trimmed.push(entry);
          if (trimmed.length > MAX_HISTORY) trimmed.shift();
          const newIndex = trimmed.length - 1;
          const labels = trimmed.map((e) => e.label);
          onHistoryUpdate(labels, newIndex);
          return trimmed;
        });
        setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
      },
      [layers, historyIndex, width, height, onHistoryUpdate]
    );

    const restoreHistory = useCallback(
      (idx: number) => {
        if (idx < 0 || idx >= history.length) return;
        const entry = history[idx];
        entry.layers.forEach((imgData, layerId) => {
          const c = layerCanvasRefs.current.get(layerId);
          if (c) {
            const ctx = c.getContext("2d");
            if (ctx) ctx.putImageData(imgData, 0, 0);
          }
        });
        setHistoryIndex(idx);
        const labels = history.map((e) => e.label);
        onHistoryUpdate(labels, idx);
        bumpVersion();
      },
      [history, onHistoryUpdate, bumpVersion]
    );

    const undo = useCallback(() => {
      if (historyIndex <= 0) return;
      restoreHistory(historyIndex - 1);
    }, [historyIndex, restoreHistory]);

    const redo = useCallback(() => {
      if (historyIndex >= history.length - 1) return;
      restoreHistory(historyIndex + 1);
    }, [historyIndex, restoreHistory]);

    const clearActiveLayer = useCallback(() => {
      const c = layerCanvasRefs.current.get(activeLayerId);
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      saveHistory("Clear Layer");
      ctx.clearRect(0, 0, width, height);
      bumpVersion();
    }, [activeLayerId, width, height, saveHistory, bumpVersion]);

    const getCanvasPos = useCallback(
      (e: React.PointerEvent | PointerEvent): { x: number; y: number } => {
        const container = canvasContainerRef.current;
        if (!container) return { x: 0, y: 0 };
        const rect = container.getBoundingClientRect();
        const cx = (e.clientX - rect.left - panOffset.x) / zoom;
        const cy = (e.clientY - rect.top - panOffset.y) / zoom;
        return { x: cx, y: cy };
      },
      [zoom, panOffset]
    );

    const mirrorPoints = useCallback(
      (x: number, y: number): { x: number; y: number }[] => {
        const cx = width / 2;
        const cy = height / 2;
        const pts: { x: number; y: number }[] = [{ x, y }];
        if (symmetryMode === "vertical" || symmetryMode === "quad") {
          pts.push({ x: 2 * cx - x, y });
        }
        if (symmetryMode === "horizontal" || symmetryMode === "quad") {
          pts.push({ x, y: 2 * cy - y });
        }
        if (symmetryMode === "quad") {
          pts.push({ x: 2 * cx - x, y: 2 * cy - y });
        }
        if (symmetryMode === "radial") {
          for (let i = 1; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const dx = x - cx;
            const dy = y - cy;
            pts.push({
              x: cx + dx * Math.cos(angle) - dy * Math.sin(angle),
              y: cy + dx * Math.sin(angle) + dy * Math.cos(angle),
            });
          }
        }
        return pts;
      },
      [symmetryMode, width, height]
    );

    const drawBrushStamp = useCallback(
      (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        tool: CanvasTool,
        _mirrorCtx?: CanvasRenderingContext2D
      ) => {
        const size = tool.size;
        const halfSize = size / 2;
        const isEraser = tool.type === "eraser";
        const color = tool.color;
        const plusId = tool.plusId;

        ctx.save();

        const jitterSizeAmt = tool.jitter.size / 100;
        const actualSize = size * (1 + (Math.random() - 0.5) * 2 * jitterSizeAmt);

        if (isEraser) {
          ctx.globalCompositeOperation = "destination-out";
          ctx.fillStyle = "rgba(0,0,0,1)";
        }

        // ═══ PLUS TOOLS - Each has unique behavior ═══
        if (plusId) {
          ctx.globalAlpha = tool.opacity * tool.flow;
          
          switch (plusId) {
            // ─── DREAM BRUSH - Soft glowing strokes ───
            case "dream-brush": {
              const grad = ctx.createRadialGradient(x, y, 0, x, y, actualSize);
              grad.addColorStop(0, hexToRGBA(color, 0.8));
              grad.addColorStop(0.5, hexToRGBA(color, 0.4));
              grad.addColorStop(1, hexToRGBA(color, 0));
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(x, y, actualSize, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            
            // ─── STAR DUST - Sparkle particles ───
            case "star-dust": {
              const particles = 8;
              for (let i = 0; i < particles; i++) {
                const angle = (i / particles) * Math.PI * 2;
                const r = actualSize * 0.3 + Math.random() * actualSize * 0.5;
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;
                const pSize = 1 + Math.random() * 2;
                ctx.fillStyle = hexToRGBA(color, 0.6 + Math.random() * 0.4);
                ctx.beginPath();
                ctx.arc(px, py, pSize, 0, Math.PI * 2);
                ctx.fill();
              }
              // Center glow
              const centerGrad = ctx.createRadialGradient(x, y, 0, x, y, actualSize * 0.3);
              centerGrad.addColorStop(0, hexToRGBA(color, 0.5));
              centerGrad.addColorStop(1, hexToRGBA(color, 0));
              ctx.fillStyle = centerGrad;
              ctx.beginPath();
              ctx.arc(x, y, actualSize * 0.3, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            
            // ─── NEBULA MIST - Soft cloud effect ───
            case "nebula-mist": {
              for (let i = 0; i < 5; i++) {
                const ox = (Math.random() - 0.5) * actualSize;
                const oy = (Math.random() - 0.5) * actualSize;
                const r = actualSize * (0.3 + Math.random() * 0.4);
                const grad = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
                grad.addColorStop(0, hexToRGBA(color, 0.15));
                grad.addColorStop(1, hexToRGBA(color, 0));
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2);
                ctx.fill();
              }
              break;
            }
            
            // ─── COSMIC GLOW - Bright center with rays ───
            case "cosmic-glow": {
              // Bright center
              const centerGrad = ctx.createRadialGradient(x, y, 0, x, y, actualSize * 0.5);
              centerGrad.addColorStop(0, hexToRGBA(color, 0.9));
              centerGrad.addColorStop(0.5, hexToRGBA(color, 0.3));
              centerGrad.addColorStop(1, hexToRGBA(color, 0));
              ctx.fillStyle = centerGrad;
              ctx.beginPath();
              ctx.arc(x, y, actualSize * 0.5, 0, Math.PI * 2);
              ctx.fill();
              // Rays
              ctx.strokeStyle = hexToRGBA(color, 0.2);
              ctx.lineWidth = 1;
              for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(angle) * actualSize, y + Math.sin(angle) * actualSize);
                ctx.stroke();
              }
              break;
            }
            
            // ─── PETAL - Flower petal shape ───
            case "petal": {
              ctx.fillStyle = hexToRGBA(color, 0.7);
              ctx.beginPath();
              ctx.ellipse(x, y, actualSize * 0.3, actualSize * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            
            // ─── FROST - Crystalline patterns ───
            case "frost": {
              ctx.strokeStyle = hexToRGBA(color, 0.6);
              ctx.lineWidth = 1;
              for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const len = actualSize * (0.3 + Math.random() * 0.5);
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
                ctx.stroke();
                // Branch
                const midX = x + Math.cos(angle) * len * 0.6;
                const midY = y + Math.sin(angle) * len * 0.6;
                const branchAngle = angle + (Math.random() > 0.5 ? 1 : -1) * Math.PI / 4;
                ctx.beginPath();
                ctx.moveTo(midX, midY);
                ctx.lineTo(midX + Math.cos(branchAngle) * len * 0.3, midY + Math.sin(branchAngle) * len * 0.3);
                ctx.stroke();
              }
              break;
            }
            
            // ─── EMBER - Glowing particles ───
            case "ember": {
              for (let i = 0; i < 10; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * actualSize * 0.5;
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;
                const pSize = 1 + Math.random() * 2;
                const grad = ctx.createRadialGradient(px, py, 0, px, py, pSize * 2);
                grad.addColorStop(0, hexToRGBA("#ff6600", 0.8));
                grad.addColorStop(0.5, hexToRGBA(color, 0.4));
                grad.addColorStop(1, hexToRGBA(color, 0));
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(px, py, pSize * 2, 0, Math.PI * 2);
                ctx.fill();
              }
              break;
            }
            
            // ─── WAVE - Flowing wave pattern ───
            case "wave": {
              ctx.strokeStyle = hexToRGBA(color, 0.5);
              ctx.lineWidth = actualSize * 0.2;
              ctx.lineCap = "round";
              ctx.beginPath();
              for (let i = -actualSize; i <= actualSize; i += 2) {
                const waveY = y + Math.sin((x + i) * 0.1) * actualSize * 0.3;
                if (i === -actualSize) ctx.moveTo(x + i, waveY);
                else ctx.lineTo(x + i, waveY);
              }
              ctx.stroke();
              break;
            }
            
            // ─── AURORA - Shifting colors ───
            case "aurora": {
              const colors = ["var(--elovayne-nebula)", "#00ccff", "#8855ff", "#ff55aa"];
              for (let i = 0; i < 4; i++) {
                const ox = (Math.random() - 0.5) * actualSize * 0.5;
                const oy = (Math.random() - 0.5) * actualSize * 0.5;
                const grad = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, actualSize * 0.4);
                grad.addColorStop(0, hexToRGBA(colors[i], 0.3));
                grad.addColorStop(1, hexToRGBA(colors[i], 0));
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x + ox, y + oy, actualSize * 0.4, 0, Math.PI * 2);
                ctx.fill();
              }
              break;
            }
            
            // ─── PRISM - Rainbow refraction ───
            case "prism": {
              const rainbow = ["#ff0000", "#ff8800", "#ffff00", "#00ff00", "#0088ff", "#8800ff"];
              for (let i = 0; i < rainbow.length; i++) {
                const angle = (i / rainbow.length) * Math.PI * 2;
                const r = actualSize * 0.3;
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;
                ctx.fillStyle = hexToRGBA(rainbow[i], 0.4);
                ctx.beginPath();
                ctx.arc(px, py, actualSize * 0.15, 0, Math.PI * 2);
                ctx.fill();
              }
              break;
            }
            
            // ─── LIGHTNING - Electric bolts ───
            case "lightning": {
              ctx.strokeStyle = hexToRGBA(color, 0.8);
              ctx.lineWidth = 2;
              let lx = x, ly = y;
              for (let i = 0; i < 5; i++) {
                const nx = lx + (Math.random() - 0.5) * actualSize;
                const ny = ly + Math.random() * actualSize * 0.5;
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(nx, ny);
                ctx.stroke();
                lx = nx;
                ly = ny;
              }
              // Glow
              const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, actualSize * 0.3);
              glowGrad.addColorStop(0, hexToRGBA(color, 0.3));
              glowGrad.addColorStop(1, hexToRGBA(color, 0));
              ctx.fillStyle = glowGrad;
              ctx.beginPath();
              ctx.arc(x, y, actualSize * 0.3, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            
            // ─── BUTTERFLY - Wing pattern ───
            case "butterfly": {
              ctx.fillStyle = hexToRGBA(color, 0.6);
              // Left wing
              ctx.beginPath();
              ctx.ellipse(x - actualSize * 0.2, y, actualSize * 0.3, actualSize * 0.4, -0.3, 0, Math.PI * 2);
              ctx.fill();
              // Right wing
              ctx.beginPath();
              ctx.ellipse(x + actualSize * 0.2, y, actualSize * 0.3, actualSize * 0.4, 0.3, 0, Math.PI * 2);
              ctx.fill();
              // Body
              ctx.fillStyle = hexToRGBA(color, 0.8);
              ctx.beginPath();
              ctx.ellipse(x, y, actualSize * 0.05, actualSize * 0.3, 0, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            
            // ─── WATERCOLOR - Wet paint effect ───
            case "watercolor": {
              for (let i = 0; i < 3; i++) {
                const ox = (Math.random() - 0.5) * actualSize * 0.3;
                const oy = (Math.random() - 0.5) * actualSize * 0.3;
                const r = actualSize * (0.4 + Math.random() * 0.3);
                const grad = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
                grad.addColorStop(0, hexToRGBA(color, 0.2));
                grad.addColorStop(0.7, hexToRGBA(color, 0.1));
                grad.addColorStop(1, hexToRGBA(color, 0));
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2);
                ctx.fill();
              }
              break;
            }
            
            // ─── OIL PAINT - Thick textured strokes ───
            case "oil-paint": {
              ctx.fillStyle = hexToRGBA(color, 0.9);
              // Irregular blob shape
              ctx.beginPath();
              const points = 8;
              for (let i = 0; i <= points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const r = actualSize * (0.4 + Math.random() * 0.2);
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.fill();
              break;
            }
            
            // ─── CHARCOAL - Rough sketchy texture ───
            case "charcoal": {
              ctx.fillStyle = hexToRGBA(color, 0.5);
              for (let i = 0; i < 15; i++) {
                const ox = (Math.random() - 0.5) * actualSize;
                const oy = (Math.random() - 0.5) * actualSize;
                const len = 2 + Math.random() * 4;
                const angle = Math.random() * Math.PI;
                ctx.save();
                ctx.translate(x + ox, y + oy);
                ctx.rotate(angle);
                ctx.fillRect(-len / 2, -0.5, len, 1);
                ctx.restore();
              }
              break;
            }
            
            // ─── INK PEN - Clean precise lines ───
            case "ink-pen": {
              ctx.strokeStyle = hexToRGBA(color, 0.9);
              ctx.lineWidth = actualSize * 0.15;
              ctx.lineCap = "round";
              ctx.beginPath();
              ctx.moveTo(x - actualSize * 0.3, y);
              ctx.lineTo(x + actualSize * 0.3, y);
              ctx.stroke();
              break;
            }
            
            // ─── VORTEX - Swirling pattern ───
            case "vortex": {
              ctx.strokeStyle = hexToRGBA(color, 0.4);
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 4;
                const r = (i / 30) * actualSize * 0.5;
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.stroke();
              break;
            }
            
            // ─── SPARKLE - Glitter dots ───
            case "sparkle": {
              for (let i = 0; i < 12; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * actualSize * 0.6;
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;
                const pSize = Math.random() * 2;
                ctx.fillStyle = `rgba(255,255,255,${0.5 + Math.random() * 0.5})`;
                ctx.beginPath();
                ctx.arc(px, py, pSize, 0, Math.PI * 2);
                ctx.fill();
              }
              // Central glow
              const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, actualSize * 0.2);
              glowGrad.addColorStop(0, hexToRGBA(color, 0.4));
              glowGrad.addColorStop(1, hexToRGBA(color, 0));
              ctx.fillStyle = glowGrad;
              ctx.beginPath();
              ctx.arc(x, y, actualSize * 0.2, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            
            // ─── CRYSTAL - Geometric facets ───
            case "crystal": {
              ctx.fillStyle = hexToRGBA(color, 0.5);
              ctx.strokeStyle = hexToRGBA(color, 0.8);
              ctx.lineWidth = 1;
              // Hexagonal shape
              ctx.beginPath();
              for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
                const px = x + Math.cos(angle) * actualSize * 0.4;
                const py = y + Math.sin(angle) * actualSize * 0.4;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
              // Inner lines
              ctx.strokeStyle = hexToRGBA(color, 0.3);
              for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(angle) * actualSize * 0.4, y + Math.sin(angle) * actualSize * 0.4);
                ctx.stroke();
              }
              break;
            }
            
            // ─── MOONLIGHT - Soft lunar glow ───
            case "moonlight": {
              // Outer glow
              const outerGrad = ctx.createRadialGradient(x, y, 0, x, y, actualSize);
              outerGrad.addColorStop(0, hexToRGBA(color, 0.15));
              outerGrad.addColorStop(0.5, hexToRGBA(color, 0.05));
              outerGrad.addColorStop(1, hexToRGBA(color, 0));
              ctx.fillStyle = outerGrad;
              ctx.beginPath();
              ctx.arc(x, y, actualSize, 0, Math.PI * 2);
              ctx.fill();
              // Inner bright
              const innerGrad = ctx.createRadialGradient(x, y, 0, x, y, actualSize * 0.3);
              innerGrad.addColorStop(0, hexToRGBA(color, 0.6));
              innerGrad.addColorStop(1, hexToRGBA(color, 0));
              ctx.fillStyle = innerGrad;
              ctx.beginPath();
              ctx.arc(x, y, actualSize * 0.3, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            
            // ─── GRUNGE - Rough texture ───
            case "grunge": {
              ctx.fillStyle = hexToRGBA(color, 0.6);
              for (let i = 0; i < 20; i++) {
                const ox = (Math.random() - 0.5) * actualSize;
                const oy = (Math.random() - 0.5) * actualSize;
                const w = 2 + Math.random() * 6;
                const h = 2 + Math.random() * 6;
                ctx.fillRect(x + ox - w / 2, y + oy - h / 2, w, h);
              }
              break;
            }
            
            // ─── ORGANIC - Natural flowing shapes ───
            case "organic": {
              ctx.fillStyle = hexToRGBA(color, 0.5);
              ctx.beginPath();
              for (let i = 0; i <= 20; i++) {
                const angle = (i / 20) * Math.PI * 2;
                const r = actualSize * (0.3 + Math.sin(angle * 3) * 0.15 + Math.random() * 0.1);
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.fill();
              break;
            }
            
            // ─── ELECTRIC - Sparking effect ───
            case "electric": {
              ctx.strokeStyle = hexToRGBA(color, 0.8);
              ctx.lineWidth = 1.5;
              for (let i = 0; i < 4; i++) {
                let lx = x, ly = y;
                for (let j = 0; j < 4; j++) {
                  const nx = lx + (Math.random() - 0.5) * actualSize * 0.5;
                  const ny = ly + (Math.random() - 0.5) * actualSize * 0.5;
                  ctx.beginPath();
                  ctx.moveTo(lx, ly);
                  ctx.lineTo(nx, ny);
                  ctx.stroke();
                  lx = nx;
                  ly = ny;
                }
              }
              break;
            }
            
            // ─── MYSTIC - Ethereal pattern ───
            case "mystic": {
              // Concentric rings
              for (let i = 3; i > 0; i--) {
                const r = actualSize * (i / 3) * 0.5;
                ctx.strokeStyle = hexToRGBA(color, 0.2 / i);
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.stroke();
              }
              // Center dot
              ctx.fillStyle = hexToRGBA(color, 0.6);
              ctx.beginPath();
              ctx.arc(x, y, 2, 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            
            default:
              // Regular brush for unknown plusId
              drawRegularBrush(ctx, x, y, tool, actualSize, isEraser, color);
              break;
          }
        }
        // ═══ REGULAR TOOLS ═══
        else if (tool.type === "pencil") {
          ctx.fillStyle = isEraser ? "rgba(0,0,0,1)" : color;
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
          const pencilSize = Math.max(1, Math.floor(size / 3));
          ctx.fillRect(Math.round(x - pencilSize/2), Math.round(y - pencilSize/2), pencilSize, pencilSize);
        }
        else if (tool.type === "spray") {
          const density = Math.round(size * 2);
          const scatterR = size * 0.8;
          for (let i = 0; i < density; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * scatterR;
            const sx = x + Math.cos(angle) * r;
            const sy = y + Math.sin(angle) * r;
            const alpha = 0.3 + Math.random() * 0.5;
            ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
            ctx.fillStyle = isEraser ? `rgba(0,0,0,${alpha})` : hexToRGBA(color, alpha);
            ctx.beginPath();
            ctx.arc(sx, sy, 1 + Math.random(), 0, Math.PI * 2);
            ctx.fill();
          }
        }
        else if (tool.type === "airbrush") {
          const density = Math.round(size * 1.5);
          const scatterR = size * 0.6;
          for (let i = 0; i < density; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * scatterR;
            const sx = x + Math.cos(angle) * r;
            const sy = y + Math.sin(angle) * r;
            const dist = r / scatterR;
            const alpha = (1 - dist) * 0.4;
            ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
            ctx.fillStyle = isEraser ? `rgba(0,0,0,${alpha})` : hexToRGBA(color, alpha);
            ctx.beginPath();
            ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        else if (tool.type === "calligraphy") {
          const angleRad = (tool.angle * Math.PI) / 180;
          const rx = halfSize;
          const ry = halfSize * 0.15;
          ctx.fillStyle = isEraser ? "rgba(0,0,0,1)" : color;
          ctx.globalAlpha = tool.opacity * tool.flow;
          ctx.beginPath();
          ctx.ellipse(x, y, rx, ry, angleRad, 0, Math.PI * 2);
          ctx.fill();
        }
        else if (tool.type === "stamp") {
          ctx.fillStyle = isEraser ? "rgba(0,0,0,1)" : color;
          ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
          ctx.globalAlpha = tool.opacity * tool.flow;
          const points = 5;
          const outerR = actualSize * 0.5;
          const innerR = outerR * 0.4;
          ctx.beginPath();
          for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        }
        else {
          drawRegularBrush(ctx, x, y, tool, actualSize, isEraser, color);
        }
        ctx.restore();

        // Handle symmetry
        if (symmetryMode !== "none") {
          const pts = mirrorPoints(x, y);
          for (let i = 1; i < pts.length; i++) {
            ctx.save();
            ctx.globalAlpha = tool.opacity * tool.flow;
            ctx.fillStyle = isEraser ? "rgba(0,0,0,1)" : color;
            ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
            ctx.beginPath();
            ctx.arc(pts[i].x, pts[i].y, actualSize / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      },
      [symmetryMode, mirrorPoints]
    );

    // Helper for regular brush
    const drawRegularBrush = useCallback(
      (ctx: CanvasRenderingContext2D, x: number, y: number, tool: CanvasTool, actualSize: number, isEraser: boolean, color: string) => {
        ctx.globalAlpha = tool.opacity * tool.flow;
        if (tool.hardness >= 0.95) {
          ctx.fillStyle = isEraser ? "rgba(0,0,0,1)" : color;
          ctx.beginPath();
          ctx.arc(x, y, actualSize / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const grad = ctx.createRadialGradient(x, y, 0, x, y, actualSize / 2);
          const hardStop = Math.max(0.01, tool.hardness);
          if (isEraser) {
            grad.addColorStop(0, "rgba(0,0,0,1)");
            grad.addColorStop(hardStop, "rgba(0,0,0,1)");
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.globalCompositeOperation = "destination-out";
          } else {
            grad.addColorStop(0, hexToRGBA(color, 1));
            grad.addColorStop(hardStop, hexToRGBA(color, 1));
            grad.addColorStop(1, hexToRGBA(color, 0));
          }
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, actualSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      []
    );

    const drawBrushStroke = useCallback(
      (
        ctx: CanvasRenderingContext2D,
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        tool: CanvasTool
      ) => {
        const d = dist(x0, y0, x1, y1);
        const spacingPx = Math.max(1, (tool.spacing / 100) * tool.size);
        const steps = Math.max(1, Math.ceil(d / spacingPx));
        for (let i = 0; i <= steps; i++) {
          const t = steps === 0 ? 0 : i / steps;
          const x = x0 + (x1 - x0) * t;
          const y = y0 + (y1 - y0) * t;
          const scatterR = (tool.scatter / 100) * tool.size;
          const sx = x + (Math.random() - 0.5) * scatterR * 2;
          const sy = y + (Math.random() - 0.5) * scatterR * 2;
          drawBrushStamp(ctx, sx, sy, tool);
        }
      },
      [drawBrushStamp]
    );

    const floodFill = useCallback(
      (ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string, tolerance: number) => {
        const sx = Math.floor(startX);
        const sy = Math.floor(startY);
        if (sx < 0 || sx >= width || sy < 0 || sy >= height) return;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const idx = (sy * width + sx) * 4;
        const sr = data[idx], sg = data[idx + 1], sb = data[idx + 2], sa = data[idx + 3];
        const fill = hexToRGB(fillColor);
        if (sr === fill.r && sg === fill.g && sb === fill.b && sa === 255) return;
        const stack: [number, number][] = [[sx, sy]];
        const visited = new Uint8Array(width * height);
        while (stack.length > 0) {
          const [cx, cy] = stack.pop()!;
          if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
          const key = cy * width + cx;
          if (visited[key]) continue;
          const ci = key * 4;
          if (colorDistance(data[ci], data[ci + 1], data[ci + 2], sr, sg, sb) > tolerance) continue;
          visited[key] = 1;
          data[ci] = fill.r;
          data[ci + 1] = fill.g;
          data[ci + 2] = fill.b;
          data[ci + 3] = 255;
          stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
        ctx.putImageData(imageData, 0, 0);
      },
      [width, height]
    );

    const magicWandSelect = useCallback(
      (ctx: CanvasRenderingContext2D, startX: number, startY: number, tolerance: number, contiguous: boolean) => {
        const sx = Math.floor(startX);
        const sy = Math.floor(startY);
        if (sx < 0 || sx >= width || sy < 0 || sy >= height) return null;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const idx = (sy * width + sx) * 4;
        const sr = data[idx], sg = data[idx + 1], sb = data[idx + 2], sa = data[idx + 3];
        const visited = new Uint8Array(width * height);
        const matched = new Uint8Array(width * height);
        if (contiguous) {
          const stack: [number, number][] = [[sx, sy]];
          while (stack.length > 0) {
            const [cx, cy] = stack.pop()!;
            if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
            const key = cy * width + cx;
            if (visited[key]) continue;
            visited[key] = 1;
            const ci = key * 4;
            if (colorDistance(data[ci], data[ci + 1], data[ci + 2], sr, sg, sb) > tolerance) continue;
            matched[key] = 1;
            stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
          }
        } else {
          for (let i = 0; i < width * height; i++) {
            const ci = i * 4;
            if (colorDistance(data[ci], data[ci + 1], data[ci + 2], sr, sg, sb) <= tolerance) {
              matched[i] = 1;
            }
          }
        }
        let minX = width, minY = height, maxX = 0, maxY = 0;
        let found = false;
        for (let y2 = 0; y2 < height; y2++) {
          for (let x2 = 0; x2 < width; x2++) {
            if (matched[y2 * width + x2]) {
              found = true;
              if (x2 < minX) minX = x2;
              if (x2 > maxX) maxX = x2;
              if (y2 < minY) minY = y2;
              if (y2 > maxY) maxY = y2;
            }
          }
        }
        if (!found) return null;
        return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
      },
      [width, height]
    );

    const colorReplace = useCallback(
      (ctx: CanvasRenderingContext2D, x: number, y: number, newColor: string, tolerance: number) => {
        const sx = Math.floor(x);
        const sy = Math.floor(y);
        if (sx < 0 || sx >= width || sy < 0 || sy >= height) return;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const idx = (sy * width + sx) * 4;
        const sr = data[idx], sg = data[idx + 1], sb = data[idx + 2];
        const fill = hexToRGB(newColor);
        for (let i = 0; i < data.length; i += 4) {
          if (colorDistance(data[i], data[i + 1], data[i + 2], sr, sg, sb) <= tolerance) {
            data[i] = fill.r;
            data[i + 1] = fill.g;
            data[i + 2] = fill.b;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      },
      [width, height]
    );

    const applySmudge = useCallback(
      (ctx: CanvasRenderingContext2D, x: number, y: number, lx: number, ly: number) => {
        const size = activeTool.size;
        const half = size / 2;
        const sx = Math.max(0, Math.floor(lx - half));
        const sy = Math.max(0, Math.floor(ly - half));
        const sw = Math.min(size, width - sx);
        const sh = Math.min(size, height - sy);
        if (sw <= 0 || sh <= 0) return;
        ctx.save();
        ctx.globalAlpha = activeTool.opacity * activeTool.flow * 0.6;
        ctx.drawImage(ctx.canvas, sx, sy, sw, sh, Math.floor(x - half), Math.floor(y - half), sw, sh);
        ctx.restore();
      },
      [activeTool, width, height]
    );

    const applyBlur = useCallback(
      (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        const size = activeTool.size;
        const sx = Math.max(0, Math.floor(x - size));
        const sy = Math.max(0, Math.floor(y - size));
        const sw = Math.min(size * 2, width - sx);
        const sh = Math.min(size * 2, height - sy);
        if (sw <= 0 || sh <= 0) return;
        ctx.save();
        ctx.filter = `blur(${size / 10}px)`;
        ctx.globalAlpha = activeTool.opacity * activeTool.flow * 0.4;
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(ctx.canvas, sx, sy, sw, sh, sx, sy, sw, sh);
        ctx.restore();
      },
      [activeTool, width, height]
    );

    const applySharpen = useCallback(
      (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        const size = activeTool.size;
        const sx = Math.max(0, Math.floor(x - size));
        const sy = Math.max(0, Math.floor(y - size));
        const sw = Math.min(size * 2, width - sx);
        const sh = Math.min(size * 2, height - sy);
        if (sw <= 0 || sh <= 0) return;
        const imgData = ctx.getImageData(sx, sy, sw, sh);
        const d = imgData.data;
        const orig = new Uint8ClampedArray(d);
        for (let py = 1; py < sh - 1; py++) {
          for (let px = 1; px < sw - 1; px++) {
            const i = (py * sw + px) * 4;
            for (let c = 0; c < 3; c++) {
              const val = 5 * orig[i + c] - orig[i - 4 + c] - orig[i + 4 + c] - orig[i - sw * 4 + c] - orig[i + sw * 4 + c];
              d[i + c] = Math.max(0, Math.min(255, val));
            }
          }
        }
        ctx.save();
        ctx.globalAlpha = activeTool.opacity * activeTool.flow * 0.5;
        ctx.putImageData(imgData, sx, sy);
        ctx.restore();
      },
      [activeTool, width, height]
    );

    const applyDodgeBurn = useCallback(
      (ctx: CanvasRenderingContext2D, x: number, y: number, isDodge: boolean) => {
        const size = activeTool.size;
        const sx = Math.max(0, Math.floor(x - size / 2));
        const sy = Math.max(0, Math.floor(y - size / 2));
        const sw = Math.min(size, width - sx);
        const sh = Math.min(size, height - sy);
        if (sw <= 0 || sh <= 0) return;
        const imgData = ctx.getImageData(sx, sy, sw, sh);
        const d = imgData.data;
        const amount = activeTool.opacity * activeTool.flow * 30;
        for (let i = 0; i < d.length; i += 4) {
          const px = sx + ((i / 4) % sw);
          const py = sy + Math.floor(i / 4 / sw);
          const ddx = px - x;
          const ddy = py - y;
          const distFactor = Math.max(0, 1 - Math.sqrt(ddx * ddx + ddy * ddy) / (size / 2));
          const adj = isDodge ? amount * distFactor : -amount * distFactor;
          d[i] = Math.max(0, Math.min(255, d[i] + adj));
          d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + adj));
          d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + adj));
        }
        ctx.putImageData(imgData, sx, sy);
      },
      [activeTool, width, height]
    );

    const drawShapeOnCtx = useCallback(
      (ctx: CanvasRenderingContext2D, start: { x: number; y: number }, end: { x: number; y: number }) => {
        ctx.save();
        ctx.strokeStyle = activeTool.color;
        ctx.fillStyle = activeTool.color;
        ctx.lineWidth = activeTool.size;
        ctx.globalAlpha = activeTool.opacity;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const type = activeTool.type;

        if (type === "line") {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        } else if (type === "arrow") {
          const angle = Math.atan2(end.y - start.y, end.x - start.x);
          const headLen = activeTool.size * 3;
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6), end.y - headLen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6), end.y - headLen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        } else if (type === "rectangle") {
          ctx.beginPath();
          ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
          ctx.stroke();
        } else if (type === "circle") {
          const rx = Math.abs(end.x - start.x) / 2;
          const ry = Math.abs(end.y - start.y) / 2;
          const cx = (start.x + end.x) / 2;
          const cy = (start.y + end.y) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (type === "triangle") {
          const mx = (start.x + end.x) / 2;
          ctx.beginPath();
          ctx.moveTo(mx, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.lineTo(start.x, end.y);
          ctx.closePath();
          ctx.stroke();
        } else if (type === "star") {
          const cx = (start.x + end.x) / 2;
          const cy = (start.y + end.y) / 2;
          const outerR = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y)) / 2;
          const innerR = outerR * activeTool.starInner;
          const pts = starPoints(cx, cy, outerR, innerR, activeTool.starPoints);
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i][0], pts[i][1]);
          }
          ctx.closePath();
          ctx.stroke();
        } else if (type === "polygon") {
          const cx = (start.x + end.x) / 2;
          const cy = (start.y + end.y) / 2;
          const r = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y)) / 2;
          const pts = polygonPoints(cx, cy, r, activeTool.polygonSides);
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i][0], pts[i][1]);
          }
          ctx.closePath();
          ctx.stroke();
        }
        ctx.restore();
      },
      [activeTool]
    );

    const commitShape = useCallback(
      (start: { x: number; y: number }, end: { x: number; y: number }) => {
        const c = layerCanvasRefs.current.get(activeLayerId);
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        saveHistory(activeTool.type);
        drawShapeOnCtx(ctx, start, end);
        bumpVersion();
      },
      [activeLayerId, activeTool.type, saveHistory, drawShapeOnCtx, bumpVersion]
    );

    const commitGradient = useCallback(
      (start: { x: number; y: number }, end: { x: number; y: number }) => {
        const c = layerCanvasRefs.current.get(activeLayerId);
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        saveHistory("Gradient");
        ctx.save();
        ctx.globalAlpha = activeTool.opacity;
        let grad: CanvasGradient;
        if (activeTool.gradientType === "radial") {
          const r = dist(start.x, start.y, end.x, end.y);
          grad = ctx.createRadialGradient(start.x, start.y, 0, start.x, start.y, r);
        } else {
          grad = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        }
        grad.addColorStop(0, activeTool.color);
        grad.addColorStop(1, activeTool.color2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
        bumpVersion();
      },
      [activeLayerId, activeTool, width, height, saveHistory, bumpVersion]
    );

    const moveSelectionContent = useCallback(
      (dx: number, dy: number) => {
        if (!selectionRect) return;
        const c = layerCanvasRefs.current.get(activeLayerId);
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        saveHistory("Move Selection");
        const imgData = ctx.getImageData(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
        ctx.clearRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
        ctx.putImageData(imgData, selectionRect.x + dx, selectionRect.y + dy);
        setSelectionRect({ x: selectionRect.x + dx, y: selectionRect.y + dy, w: selectionRect.w, h: selectionRect.h });
        bumpVersion();
      },
      [selectionRect, activeLayerId, saveHistory, bumpVersion]
    );

    const isPaintTool = useCallback(
      (type: string) =>
        ["brush", "pencil", "airbrush", "calligraphy", "spray", "stamp", "eraser"].includes(type),
      []
    );

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        const pos = getCanvasPos(e);
        const activeLayer = layers.find((l) => l.id === activeLayerId);

        if (e.button === 1 || (e.button === 0 && e.altKey && activeTool.type !== "clone")) {
          setIsPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY, ox: panOffset.x, oy: panOffset.y });
          return;
        }

        if (!activeLayer || activeLayer.locked) return;

        const canvas = layerCanvasRefs.current.get(activeLayerId);
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (activeTool.type === "eyedropper") {
          const pixel = ctx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1).data;
          const hex = `#${pixel[0].toString(16).padStart(2, "0")}${pixel[1].toString(16).padStart(2, "0")}${pixel[2].toString(16).padStart(2, "0")}`;
          onColorPick(hex);
          return;
        }

        if (activeTool.type === "fill") {
          saveHistory("Fill");
          floodFill(ctx, pos.x, pos.y, activeTool.color, activeTool.tolerance);
          bumpVersion();
          return;
        }

        if (activeTool.type === "colorreplace") {
          saveHistory("Color Replace");
          colorReplace(ctx, pos.x, pos.y, activeTool.color, activeTool.tolerance);
          bumpVersion();
          return;
        }

        if (activeTool.type === "text") {
          setTextInput({ x: pos.x, y: pos.y, show: true, text: "" });
          return;
        }

        if (activeTool.type === "magicwand") {
          const rect = magicWandSelect(ctx, pos.x, pos.y, activeTool.tolerance, activeTool.magicContiguous);
          if (rect) {
            setSelectionRect(rect);
            setSelectionStart(null);
          }
          return;
        }

        if (activeTool.type === "select") {
          setSelectionStart(pos);
          setSelectionRect(null);
          setIsDrawing(true);
          return;
        }

        if (activeTool.type === "lasso") {
          setLassoPoints([pos]);
          setIsDrawing(true);
          return;
        }

        if (activeTool.type === "move") {
          if (selectionRect) {
            setIsDrawing(true);
            setLastPos(pos);
          }
          return;
        }

        if (activeTool.type === "clone" || activeTool.type === "heal") {
          if (e.altKey || (!cloneSource && activeTool.type === "clone")) {
            setCloneSource(pos);
            return;
          }
          setIsDrawing(true);
          setLastPos(pos);
          saveHistory(activeTool.type === "clone" ? "Clone Stamp" : "Heal");
          return;
        }

        if (["line", "rectangle", "circle", "triangle", "star", "polygon", "arrow"].includes(activeTool.type)) {
          setShapeStart(pos);
          setIsDrawing(true);
          return;
        }

        if (activeTool.type === "gradient") {
          setShapeStart(pos);
          setIsDrawing(true);
          return;
        }

        if (isPaintTool(activeTool.type) || activeTool.type === "smudge" || activeTool.type === "blur" || activeTool.type === "sharpen" || activeTool.type === "dodge" || activeTool.type === "burn") {
          setIsDrawing(true);
          setLastPos(pos);
          if (isPaintTool(activeTool.type) || activeTool.type === "smudge") {
            saveHistory(activeTool.type);
          }
          if (isPaintTool(activeTool.type)) {
            drawBrushStamp(ctx, pos.x, pos.y, activeTool);
            bumpVersion();
          }
          return;
        }
      },
      [
        activeTool,
        activeLayerId,
        layers,
        getCanvasPos,
        panOffset,
        onColorPick,
        floodFill,
        colorReplace,
        magicWandSelect,
        saveHistory,
        drawBrushStamp,
        bumpVersion,
        isPaintTool,
        cloneSource,
        selectionRect,
      ]
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (isPanning && panStart) {
          const dx = e.clientX - panStart.x;
          const dy = e.clientY - panStart.y;
          onPanChange({ x: panStart.ox + dx, y: panStart.oy + dy });
          return;
        }

        if (!isDrawing) return;

        const pos = getCanvasPos(e);
        const canvas = layerCanvasRefs.current.get(activeLayerId);
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (activeTool.type === "select" && selectionStart) {
          setSelectionRect({
            x: Math.min(selectionStart.x, pos.x),
            y: Math.min(selectionStart.y, pos.y),
            w: Math.abs(pos.x - selectionStart.x),
            h: Math.abs(pos.y - selectionStart.y),
          });
          return;
        }

        if (activeTool.type === "lasso") {
          setLassoPoints((prev) => [...prev, pos]);
          return;
        }

        if (activeTool.type === "move" && selectionRect && lastPos) {
          const dx = pos.x - lastPos.x;
          const dy = pos.y - lastPos.y;
          moveSelectionContent(dx, dy);
          setLastPos(pos);
          return;
        }

        if (["line", "rectangle", "circle", "triangle", "star", "polygon", "arrow"].includes(activeTool.type) && shapeStart) {
          const pv = previewCanvasRef.current;
          if (pv) {
            const pvCtx = pv.getContext("2d");
            if (pvCtx) {
              pvCtx.clearRect(0, 0, width, height);
              drawShapeOnCtx(pvCtx, shapeStart, pos);
            }
          }
          return;
        }

        if (activeTool.type === "gradient" && shapeStart) {
          const pv = previewCanvasRef.current;
          if (pv) {
            const pvCtx = pv.getContext("2d");
            if (pvCtx) {
              pvCtx.clearRect(0, 0, width, height);
              pvCtx.save();
              pvCtx.globalAlpha = 0.5;
              let grad: CanvasGradient;
              if (activeTool.gradientType === "radial") {
                const r = dist(shapeStart.x, shapeStart.y, pos.x, pos.y);
                grad = pvCtx.createRadialGradient(shapeStart.x, shapeStart.y, 0, shapeStart.x, shapeStart.y, r);
              } else {
                grad = pvCtx.createLinearGradient(shapeStart.x, shapeStart.y, pos.x, pos.y);
              }
              grad.addColorStop(0, activeTool.color);
              grad.addColorStop(1, activeTool.color2);
              pvCtx.fillStyle = grad;
              pvCtx.fillRect(0, 0, width, height);
              pvCtx.restore();
            }
          }
          return;
        }

        if (activeTool.type === "clone" && cloneSource && lastPos) {
          ctx.save();
          ctx.globalAlpha = activeTool.opacity * activeTool.flow;
          const dx = pos.x - cloneSource.x;
          const dy = pos.y - cloneSource.y;
          const size = activeTool.size;
          const srcCanvas = layerCanvasRefs.current.get(activeLayerId);
          if (srcCanvas) {
            ctx.drawImage(srcCanvas, cloneSource.x - size / 2, cloneSource.y - size / 2, size, size, pos.x - size / 2, pos.y - size / 2, size, size);
          }
          ctx.restore();
          if (symmetryMode !== "none") {
            const pts = mirrorPoints(pos.x, pos.y);
            for (const pt of pts) {
              ctx.save();
              ctx.globalAlpha = activeTool.opacity * activeTool.flow;
              ctx.drawImage(srcCanvas!, cloneSource.x - size / 2, cloneSource.y - size / 2, size, size, pt.x - size / 2, pt.y - size / 2, size, size);
              ctx.restore();
            }
          }
          setLastPos(pos);
          bumpVersion();
          return;
        }

        if (activeTool.type === "heal" && lastPos) {
          ctx.save();
          ctx.globalAlpha = activeTool.opacity * activeTool.flow * 0.5;
          const size = activeTool.size;
          ctx.drawImage(ctx.canvas, pos.x - size / 2, pos.y - size / 2, size, size, pos.x - size / 2, pos.y - size / 2, size, size);
          ctx.restore();
          setLastPos(pos);
          bumpVersion();
          return;
        }

        if (isPaintTool(activeTool.type) && lastPos) {
          drawBrushStroke(ctx, lastPos.x, lastPos.y, pos.x, pos.y, activeTool);
          setLastPos(pos);
          bumpVersion();
          return;
        }

        if (activeTool.type === "smudge" && lastPos) {
          applySmudge(ctx, pos.x, pos.y, lastPos.x, lastPos.y);
          setLastPos(pos);
          bumpVersion();
          return;
        }

        if (activeTool.type === "blur") {
          applyBlur(ctx, pos.x, pos.y);
          bumpVersion();
          setLastPos(pos);
          return;
        }

        if (activeTool.type === "sharpen") {
          applySharpen(ctx, pos.x, pos.y);
          bumpVersion();
          setLastPos(pos);
          return;
        }

        if (activeTool.type === "dodge") {
          applyDodgeBurn(ctx, pos.x, pos.y, true);
          bumpVersion();
          setLastPos(pos);
          return;
        }

        if (activeTool.type === "burn") {
          applyDodgeBurn(ctx, pos.x, pos.y, false);
          bumpVersion();
          setLastPos(pos);
          return;
        }
      },
      [
        isDrawing,
        isPanning,
        panStart,
        lastPos,
        activeTool,
        activeLayerId,
        getCanvasPos,
        drawBrushStroke,
        applySmudge,
        applyBlur,
        applySharpen,
        applyDodgeBurn,
        onPanChange,
        selectionStart,
        shapeStart,
        cloneSource,
        selectionRect,
        moveSelectionContent,
        drawShapeOnCtx,
        symmetryMode,
        mirrorPoints,
        bumpVersion,
        width,
        height,
      ]
    );

    const handlePointerUp = useCallback(
      (e: React.PointerEvent) => {
        if (isPanning) {
          setIsPanning(false);
          setPanStart(null);
          return;
        }

        const pos = getCanvasPos(e);

        if (activeTool.type === "select" && selectionStart) {
          setSelectionStart(null);
        }

        if (activeTool.type === "lasso" && lassoPoints.length > 2) {
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          for (const p of lassoPoints) {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
          }
          setSelectionRect({ x: minX, y: minY, w: maxX - minX, h: maxY - minY });
          setLassoPoints([]);
        } else if (activeTool.type === "lasso") {
          setLassoPoints([]);
        }

        if (activeTool.type === "move") {
          setIsDrawing(false);
          setLastPos(null);
          return;
        }

        if (["line", "rectangle", "circle", "triangle", "star", "polygon", "arrow"].includes(activeTool.type) && shapeStart) {
          commitShape(shapeStart, pos);
          const pv = previewCanvasRef.current;
          if (pv) {
            const pvCtx = pv.getContext("2d");
            if (pvCtx) pvCtx.clearRect(0, 0, width, height);
          }
          setShapeStart(null);
        }

        if (activeTool.type === "gradient" && shapeStart) {
          commitGradient(shapeStart, pos);
          const pv = previewCanvasRef.current;
          if (pv) {
            const pvCtx = pv.getContext("2d");
            if (pvCtx) pvCtx.clearRect(0, 0, width, height);
          }
          setShapeStart(null);
        }

        if (activeTool.type === "clone" || activeTool.type === "heal") {
          if (!cloneSource && activeTool.type === "clone") {
          } else {
            setCloneSource(null);
          }
        }

        setIsDrawing(false);
        setLastPos(null);
      },
      [
        isPanning,
        activeTool,
        getCanvasPos,
        selectionStart,
        lassoPoints,
        shapeStart,
        commitShape,
        commitGradient,
        cloneSource,
        width,
        height,
      ]
    );

    const handleTextSubmit = useCallback(() => {
      if (!textInput.text.trim()) {
        setTextInput({ x: 0, y: 0, show: false, text: "" });
        return;
      }
      const c = layerCanvasRefs.current.get(activeLayerId);
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      saveHistory("Text");
      ctx.save();
      const fontWeight = activeTool.textBold ? "bold " : "";
      const fontStyle = activeTool.textItalic ? "italic " : "";
      ctx.font = `${fontStyle}${fontWeight}${activeTool.textSize}px ${activeTool.textFont}`;
      ctx.fillStyle = activeTool.color;
      ctx.globalAlpha = activeTool.opacity;
      ctx.textBaseline = "top";
      ctx.fillText(textInput.text, textInput.x, textInput.y);
      ctx.restore();
      setTextInput({ x: 0, y: 0, show: false, text: "" });
      bumpVersion();
    }, [textInput, activeTool, activeLayerId, saveHistory, bumpVersion]);

    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (textInput.show) return;
        if ((e.ctrlKey || e.metaKey) && e.key === "z") {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
        }
        if (e.key === "Delete" && selectionRect) {
          const c = layerCanvasRefs.current.get(activeLayerId);
          if (c) {
            const ctx = c.getContext("2d");
            if (ctx) {
              saveHistory("Delete Selection");
              ctx.clearRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
              setSelectionRect(null);
              bumpVersion();
            }
          }
        }
        if (e.key === "Escape") {
          setSelectionRect(null);
          setLassoPoints([]);
          setTextInput({ x: 0, y: 0, show: false, text: "" });
          setShapeStart(null);
        }
        if (e.key === "[") {
          onZoomChange(Math.max(0.1, zoom - 0.1));
        }
        if (e.key === "]") {
          onZoomChange(Math.min(5, zoom + 0.1));
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "a") {
          e.preventDefault();
          setSelectionRect({ x: 0, y: 0, w: width, h: height });
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "d") {
          e.preventDefault();
          setSelectionRect(null);
          setLassoPoints([]);
        }
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, [undo, redo, textInput.show, selectionRect, activeLayerId, saveHistory, bumpVersion, zoom, onZoomChange, width, height]);

    useEffect(() => {
      const container = canvasContainerRef.current;
      if (!container) return;
      const handler = (e: WheelEvent) => {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          const scaleFactor = 1 - e.deltaY * 0.005;
          const newZoom = Math.max(0.1, Math.min(5, zoom * scaleFactor));
          onZoomChange(newZoom);
        } else {
          onPanChange({ x: panOffset.x - e.deltaX, y: panOffset.y - e.deltaY });
        }
      };
      container.addEventListener("wheel", handler, { passive: false });
      return () => container.removeEventListener("wheel", handler);
    }, [zoom, panOffset, onZoomChange, onPanChange]);

    useImperativeHandle(ref, () => ({
      exportImage: () => compositeCanvasRef.current,
      loadDataURL: (dataURL: string) => {
        const img = new Image();
        img.onload = () => {
          const c = layerCanvasRefs.current.get(activeLayerId);
          if (c) {
            const ctx = c.getContext("2d");
            if (ctx) {
              saveHistory("Load Image");
              ctx.drawImage(img, 0, 0);
              bumpVersion();
            }
          }
        };
        img.src = dataURL;
      },
      clearActiveLayer,
      undo,
      redo,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1,
      historyLabels: history.map((e) => e.label),
      historyIdx: historyIndex,
      setReferenceImage: (img: HTMLImageElement | null) => setReferenceImage(img),
      adjustBrightness: (value: number) => {
        const c = layerCanvasRefs.current.get(activeLayerId);
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        saveHistory("Brightness");
        const imageData = ctx.getImageData(0, 0, c.width, c.height);
        const d = imageData.data;
        const factor = value * 2.55;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = Math.max(0, Math.min(255, d[i] + factor));
          d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + factor));
          d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + factor));
        }
        ctx.putImageData(imageData, 0, 0);
        bumpVersion();
      },
      adjustContrast: (value: number) => {
        const c = layerCanvasRefs.current.get(activeLayerId);
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        saveHistory("Contrast");
        const imageData = ctx.getImageData(0, 0, c.width, c.height);
        const d = imageData.data;
        const factor = (259 * (value + 255)) / (255 * (259 - value));
        for (let i = 0; i < d.length; i += 4) {
          d[i] = Math.max(0, Math.min(255, factor * (d[i] - 128) + 128));
          d[i + 1] = Math.max(0, Math.min(255, factor * (d[i + 1] - 128) + 128));
          d[i + 2] = Math.max(0, Math.min(255, factor * (d[i + 2] - 128) + 128));
        }
        ctx.putImageData(imageData, 0, 0);
        bumpVersion();
      },
      adjustSaturation: (value: number) => {
        const c = layerCanvasRefs.current.get(activeLayerId);
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        saveHistory("Saturation");
        const imageData = ctx.getImageData(0, 0, c.width, c.height);
        const d = imageData.data;
        const factor = 1 + value / 100;
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.2989 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          d[i] = Math.max(0, Math.min(255, gray + factor * (d[i] - gray)));
          d[i + 1] = Math.max(0, Math.min(255, gray + factor * (d[i + 1] - gray)));
          d[i + 2] = Math.max(0, Math.min(255, gray + factor * (d[i + 2] - gray)));
        }
        ctx.putImageData(imageData, 0, 0);
        bumpVersion();
      },
      adjustHue: (value: number) => {
        const c = layerCanvasRefs.current.get(activeLayerId);
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        saveHistory("Hue Rotate");
        const imageData = ctx.getImageData(0, 0, c.width, c.height);
        const d = imageData.data;
        const angle = (value * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          d[i] = Math.max(0, Math.min(255, r * (0.213 + cos * 0.787 - sin * 0.213) + g * (0.715 - cos * 0.715 - sin * 0.715) + b * (0.072 - cos * 0.072 + sin * 0.928)));
          d[i + 1] = Math.max(0, Math.min(255, r * (0.213 - cos * 0.213 + sin * 0.143) + g * (0.715 + cos * 0.285 + sin * 0.140) + b * (0.072 - cos * 0.072 - sin * 0.283)));
          d[i + 2] = Math.max(0, Math.min(255, r * (0.213 - cos * 0.213 - sin * 0.787) + g * (0.715 - cos * 0.715 + sin * 0.715) + b * (0.072 + cos * 0.928 + sin * 0.072)));
        }
        ctx.putImageData(imageData, 0, 0);
        bumpVersion();
      },
    }));

    const cursorStyle = (() => {
      if (isPanning) return "grab";
      if (activeTool.type === "eyedropper" || activeTool.type === "fill" || activeTool.type === "magicwand") return "crosshair";
      if (activeTool.type === "text") return "text";
      if (activeTool.type === "move") return "move";
      return "crosshair";
    })();

    return (
      <div
        ref={canvasContainerRef}
        className="dream-canvas-container"
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          cursor: "none",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(0, 255, 136, 0.04)",
          border: "1px solid rgba(0, 255, 136, 0.08)",
          background: `
            radial-gradient(ellipse at 15% 15%, rgba(0, 255, 136, 0.15) 0%, transparent 45%),
            radial-gradient(ellipse at 85% 85%, rgba(0, 204, 106, 0.12) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 25%, rgba(96, 165, 250, 0.1) 0%, transparent 40%),
            radial-gradient(ellipse at 25% 75%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
            radial-gradient(ellipse at 75% 45%, rgba(34, 211, 238, 0.08) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, rgba(0, 255, 136, 0.05) 0%, transparent 60%),
            #ffffff
          `,
        }}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onPointerLeave={() => setMousePos(null)}
      >
        {/* Brush cursor indicator */}
        {mousePos && (
          <div
            style={{
              position: "absolute",
              left: mousePos.x,
              top: mousePos.y,
              width: activeTool.size * zoom,
              height: activeTool.size * zoom,
              borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.6)",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 1000,
              boxShadow: "0 0 4px rgba(255,255,255,0.3)",
            }}
          />
        )}
        {referenceImage && (
          <img
            src={referenceImage.src}
            alt="Reference"
            style={{
              position: "absolute",
              top: panOffset.y,
              left: panOffset.x,
              width: referenceImage.width * zoom,
              height: referenceImage.height * zoom,
              opacity: 0.3,
              pointerEvents: "none",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            top: panOffset.y,
            left: panOffset.x,
            width: width * zoom,
            height: height * zoom,
            transformOrigin: "0 0",
            transform: `rotate(${canvasRotation}deg)`,
          }}
        >
          <canvas
            ref={compositeCanvasRef}
            width={width}
            height={height}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              touchAction: "none",
            }}
          />
          <canvas
            ref={previewCanvasRef}
            width={width}
            height={height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />
        </div>

        {textInput.show && (
          <div
            style={{
              position: "absolute",
              top: textInput.y * zoom + panOffset.y,
              left: textInput.x * zoom + panOffset.x,
              zIndex: 100,
            }}
          >
            <input
              type="text"
              value={textInput.text}
              onChange={(e) => setTextInput({ ...textInput, text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTextSubmit();
                if (e.key === "Escape") setTextInput({ x: 0, y: 0, show: false, text: "" });
              }}
              onBlur={handleTextSubmit}
              autoFocus
              style={{
                background: "rgba(5,5,16,0.8)",
                border: "1px solid rgba(157,124,216,0.5)",
                borderRadius: 4,
                padding: "4px 8px",
                color: activeTool.color,
                fontSize: `${activeTool.textSize * zoom}px`,
                fontFamily: activeTool.textFont,
                fontWeight: activeTool.textBold ? "bold" : "normal",
                fontStyle: activeTool.textItalic ? "italic" : "normal",
                outline: "none",
                minWidth: 100,
              }}
              placeholder="Type text..."
            />
          </div>
        )}
      </div>
    );
  }
);

DreamCanvas.displayName = "DreamCanvas";

export default DreamCanvas;
