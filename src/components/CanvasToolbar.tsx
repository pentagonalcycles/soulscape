"use client";

import { motion } from "framer-motion";
import { useState, useCallback } from "react";

export type ToolType =
  | "brush" | "pencil" | "airbrush" | "calligraphy" | "spray"
  | "eraser" | "smudge" | "blur" | "sharpen" | "dodge" | "burn"
  | "clone" | "heal"
  | "select" | "lasso" | "magicwand" | "move"
  | "line" | "rectangle" | "circle" | "triangle" | "star" | "polygon" | "arrow"
  | "eyedropper" | "fill" | "gradient" | "colorreplace"
  | "text" | "stamp";

export interface CanvasTool {
  type: ToolType;
  size: number;
  color: string;
  color2: string;
  opacity: number;
  hardness: number;
  flow: number;
  scatter: number;
  angle: number;
  spacing: number;
  jitter: { size: number; opacity: number; color: number };
  gradientType: "linear" | "radial";
  cloneOffset: { x: number; y: number };
  tolerance: number;
  magicContiguous: boolean;
  polygonSides: number;
  starPoints: number;
  starInner: number;
  textFont: string;
  textSize: number;
  textBold: boolean;
  textItalic: boolean;
  plusId?: string; // For Plus tools: dream-brush, star-dust, etc.
}

export interface CanvasLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  locked: boolean;
  blendMode: GlobalCompositeOperation;
  hasMask: boolean;
}

export interface BrushPreset {
  id: string;
  name: string;
  icon: string;
  tool: CanvasTool;
  createdAt: number;
}

export type SymmetryMode = "none" | "vertical" | "horizontal" | "quad" | "radial";

interface CanvasToolbarProps {
  activeTool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  layers: CanvasLayer[];
  activeLayerId: string;
  onLayerAdd: () => void;
  onLayerRemove: (id: string) => void;
  onLayerToggle: (id: string) => void;
  onLayerOpacity: (id: string, opacity: number) => void;
  onLayerLock: (id: string) => void;
  onLayerBlendMode: (id: string, mode: GlobalCompositeOperation) => void;
  onActiveLayerChange: (id: string) => void;
  onLayerReorder: (from: number, to: number) => void;
  onLayerMask: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onFlattenLayers: () => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  canvasRotation: number;
  onCanvasRotationChange: (rotation: number) => void;
  onFitToScreen: () => void;
  symmetryMode: SymmetryMode;
  onSymmetryChange: (mode: SymmetryMode) => void;
  onLoadReference: (file: File) => void;
  onRemoveReference: () => void;
  hasReference: boolean;
  historyEntries: string[];
  historyIndex: number;
  onHistoryJump: (index: number) => void;
  onAdjustBrightness: (value: number) => void;
  onAdjustContrast: (value: number) => void;
  onAdjustSaturation: (value: number) => void;
  onAdjustHue: (value: number) => void;
  onClearSelection: () => void;
  isPlus?: boolean;
  showLeftPanel?: boolean;
  onToggleLeftPanel?: () => void;
  showRightPanel?: boolean;
  onToggleRightPanel?: () => void;
}

const cosmicColors = [
  "#ffffff", "#1a1a3e", "#2d1b69",
  "#6b3fa0", "#00ff88", "#c4b5fd",
  "#00cc6a", "#f472b6",
  "#10b981", "#fbbf24",
  "#60a5fa", "#818cf8",
  "#ffffff", "#e8e0f0",
  "#7a6b99",
];

const recentColorsList = [
  "#ffffff", "#00cc6a", "#00ff88", "#00e68a", "#10b981", "#60a5fa",
];

const blendModes: { value: GlobalCompositeOperation; label: string }[] = [
  { value: "source-over", label: "Normal" },
  { value: "multiply", label: "Multiply" },
  { value: "screen", label: "Screen" },
  { value: "overlay", label: "Overlay" },
  { value: "darken", label: "Darken" },
  { value: "lighten", label: "Lighten" },
  { value: "color-dodge", label: "Color Dodge" },
  { value: "color-burn", label: "Color Burn" },
  { value: "hard-light", label: "Hard Light" },
  { value: "soft-light", label: "Soft Light" },
  { value: "difference", label: "Difference" },
  { value: "exclusion", label: "Exclusion" },
  { value: "hue", label: "Hue" },
  { value: "saturation", label: "Saturation" },
  { value: "color", label: "Color" },
  { value: "luminosity", label: "Luminosity" },
];

const toolGroups: { label: string; tools: { type: ToolType; icon: string; name: string; key: string; plusId?: string }[] }[] = [
  {
    label: "Paint",
    tools: [
      { type: "brush", icon: "✏", name: "Brush", key: "B" },
      { type: "pencil", icon: "✎", name: "Pencil", key: "N" },
      { type: "airbrush", icon: "◉", name: "Airbrush", key: "A" },
      { type: "calligraphy", icon: "✒", name: "Calligraphy", key: "C" },
      { type: "spray", icon: "⁂", name: "Spray", key: "" },
    ],
  },
  {
    label: "Retouch",
    tools: [
      { type: "eraser", icon: "◻", name: "Eraser", key: "E" },
      { type: "smudge", icon: "≋", name: "Smudge", key: "S" },
      { type: "blur", icon: "○", name: "Blur", key: "L" },
      { type: "sharpen", icon: "△", name: "Sharpen", key: "" },
      { type: "dodge", icon: "◐", name: "Dodge", key: "" },
      { type: "burn", icon: "◑", name: "Burn", key: "" },
    ],
  },
  {
    label: "Clone",
    tools: [
      { type: "clone", icon: "⌘", name: "Clone", key: "K" },
      { type: "heal", icon: "♥", name: "Heal", key: "" },
    ],
  },
  {
    label: "Select",
    tools: [
      { type: "select", icon: "⊡", name: "Marquee", key: "M" },
      { type: "lasso", icon: "⌇", name: "Lasso", key: "" },
      { type: "magicwand", icon: "✧", name: "Magic Wand", key: "" },
      { type: "move", icon: "✥", name: "Move", key: "V" },
    ],
  },
  {
    label: "Shape",
    tools: [
      { type: "line", icon: "╱", name: "Line", key: "U" },
      { type: "rectangle", icon: "□", name: "Rectangle", key: "R" },
      { type: "circle", icon: "○", name: "Ellipse", key: "O" },
      { type: "triangle", icon: "△", name: "Triangle", key: "T" },
      { type: "star", icon: "★", name: "Star", key: "" },
      { type: "polygon", icon: "⬡", name: "Polygon", key: "" },
      { type: "arrow", icon: "→", name: "Arrow", key: "" },
    ],
  },
  {
    label: "Color",
    tools: [
      { type: "eyedropper", icon: "◉", name: "Eyedropper", key: "I" },
      { type: "fill", icon: "◆", name: "Fill", key: "G" },
      { type: "gradient", icon: "▤", name: "Gradient", key: "" },
      { type: "colorreplace", icon: "◑", name: "Color Replace", key: "" },
    ],
  },
  {
    label: "Artistic",
    tools: [
      { type: "stamp", icon: "✿", name: "Stamp", key: "" },
    ],
  },
  {
    label: "Text",
    tools: [
      { type: "text", icon: "T", name: "Text", key: "X" },
    ],
  },
];

const plusToolGroups: typeof toolGroups = [
  {
    label: "Dream ✦",
    tools: [
      { type: "brush", icon: "✧", name: "Dream Brush", key: "", plusId: "dream-brush" },
      { type: "brush", icon: "❋", name: "Star Dust", key: "", plusId: "star-dust" },
      { type: "brush", icon: "◌", name: "Nebula Mist", key: "", plusId: "nebula-mist" },
      { type: "brush", icon: "✶", name: "Cosmic Glow", key: "", plusId: "cosmic-glow" },
    ],
  },
  {
    label: "Nature ✦",
    tools: [
      { type: "brush", icon: "🌸", name: "Petal", key: "", plusId: "petal" },
      { type: "brush", icon: "❄", name: "Frost", key: "", plusId: "frost" },
      { type: "brush", icon: "🔥", name: "Ember", key: "", plusId: "ember" },
      { type: "brush", icon: "🌊", name: "Wave", key: "", plusId: "wave" },
    ],
  },
  {
    label: "Effects ✦",
    tools: [
      { type: "brush", icon: "💫", name: "Aurora", key: "", plusId: "aurora" },
      { type: "brush", icon: "🌈", name: "Prism", key: "", plusId: "prism" },
      { type: "brush", icon: "⚡", name: "Lightning", key: "", plusId: "lightning" },
      { type: "brush", icon: "🦋", name: "Butterfly", key: "", plusId: "butterfly" },
    ],
  },
  {
    label: "Pro ✦",
    tools: [
      { type: "brush", icon: "💧", name: "Watercolor", key: "", plusId: "watercolor" },
      { type: "brush", icon: "🖌", name: "Oil Paint", key: "", plusId: "oil-paint" },
      { type: "brush", icon: "✏", name: "Charcoal", key: "", plusId: "charcoal" },
      { type: "brush", icon: "🖊", name: "Ink Pen", key: "", plusId: "ink-pen" },
    ],
  },
  {
    label: "Abstract ✦",
    tools: [
      { type: "brush", icon: "🌀", name: "Vortex", key: "", plusId: "vortex" },
      { type: "brush", icon: "✨", name: "Sparkle", key: "", plusId: "sparkle" },
      { type: "brush", icon: "💎", name: "Crystal", key: "", plusId: "crystal" },
      { type: "brush", icon: "🌙", name: "Moonlight", key: "", plusId: "moonlight" },
    ],
  },
  {
    label: "Texture ✦",
    tools: [
      { type: "brush", icon: "🧱", name: "Grunge", key: "", plusId: "grunge" },
      { type: "brush", icon: "🌿", name: "Organic", key: "", plusId: "organic" },
      { type: "brush", icon: "⚡", name: "Electric", key: "", plusId: "electric" },
      { type: "brush", icon: "🔮", name: "Mystic", key: "", plusId: "mystic" },
    ],
  },
];

const symmetryOptions: { value: SymmetryMode; label: string; icon: string }[] = [
  { value: "none", label: "Off", icon: "—" },
  { value: "vertical", label: "Vertical", icon: "⫽" },
  { value: "horizontal", label: "Horizontal", icon: "⫿" },
  { value: "quad", label: "Quad", icon: "⊞" },
  { value: "radial", label: "Radial", icon: "◎" },
];

const fontOptions = [
  "Inter", "Cormorant Garamond", "Caveat", "Georgia", "Arial",
  "Times New Roman", "Courier New", "Verdana", "Impact", "Comic Sans MS",
];

const defaultPresets: BrushPreset[] = [
  {
    id: "p1", name: "Soft Round", icon: "✏",
    tool: { type: "brush", size: 20, color: "#e8e0f0", color2: "#6b3fa0", opacity: 1, hardness: 0, flow: 1, scatter: 0, angle: 0, spacing: 25, jitter: { size: 0, opacity: 0, color: 0 }, gradientType: "linear", cloneOffset: { x: 0, y: 0 }, tolerance: 0, magicContiguous: true, polygonSides: 6, starPoints: 5, starInner: 0.5, textFont: "Inter", textSize: 24, textBold: false, textItalic: false },
    createdAt: Date.now(),
  },
  {
    id: "p2", name: "Hard Round", icon: "●",
    tool: { type: "brush", size: 10, color: "#e8e0f0", color2: "#6b3fa0", opacity: 1, hardness: 1, flow: 1, scatter: 0, angle: 0, spacing: 25, jitter: { size: 0, opacity: 0, color: 0 }, gradientType: "linear", cloneOffset: { x: 0, y: 0 }, tolerance: 0, magicContiguous: true, polygonSides: 6, starPoints: 5, starInner: 0.5, textFont: "Inter", textSize: 24, textBold: false, textItalic: false },
    createdAt: Date.now(),
  },
  {
    id: "p3", name: "Airbrush", icon: "◉",
    tool: { type: "airbrush", size: 60, color: "#e8e0f0", color2: "#6b3fa0", opacity: 0.4, hardness: 0, flow: 0.3, scatter: 30, angle: 0, spacing: 25, jitter: { size: 10, opacity: 20, color: 0 }, gradientType: "linear", cloneOffset: { x: 0, y: 0 }, tolerance: 0, magicContiguous: true, polygonSides: 6, starPoints: 5, starInner: 0.5, textFont: "Inter", textSize: 24, textBold: false, textItalic: false },
    createdAt: Date.now(),
  },
  {
    id: "p4", name: "Nebula Mist", icon: "✧",
    tool: { type: "airbrush", size: 120, color: "#00ff88", color2: "#00cc6a", opacity: 0.15, hardness: 0, flow: 0.15, scatter: 50, angle: 0, spacing: 30, jitter: { size: 20, opacity: 30, color: 25 }, gradientType: "radial", cloneOffset: { x: 0, y: 0 }, tolerance: 0, magicContiguous: true, polygonSides: 6, starPoints: 5, starInner: 0.5, textFont: "Inter", textSize: 24, textBold: false, textItalic: false },
    createdAt: Date.now(),
  },
  {
    id: "p5", name: "Cosmic Spray", icon: "⁂",
    tool: { type: "spray", size: 80, color: "#10b981", color2: "#00cc6a", opacity: 0.5, hardness: 0, flow: 0.4, scatter: 60, angle: 0, spacing: 20, jitter: { size: 30, opacity: 40, color: 35 }, gradientType: "linear", cloneOffset: { x: 0, y: 0 }, tolerance: 0, magicContiguous: true, polygonSides: 6, starPoints: 5, starInner: 0.5, textFont: "Inter", textSize: 24, textBold: false, textItalic: false },
    createdAt: Date.now(),
  },
  {
    id: "p6", name: "Calligraphy Pen", icon: "✒",
    tool: { type: "calligraphy", size: 12, color: "#e8e0f0", color2: "#6b3fa0", opacity: 1, hardness: 0.8, flow: 1, scatter: 0, angle: 45, spacing: 25, jitter: { size: 0, opacity: 0, color: 0 }, gradientType: "linear", cloneOffset: { x: 0, y: 0 }, tolerance: 0, magicContiguous: true, polygonSides: 6, starPoints: 5, starInner: 0.5, textFont: "Inter", textSize: 24, textBold: false, textItalic: false },
    createdAt: Date.now(),
  },
];

function createDefaultTool(): CanvasTool {
  return {
    type: "brush",
    size: 20,
    color: "#e8e0f0",
    color2: "#6b3fa0",
    opacity: 1,
    hardness: 0.5,
    flow: 1,
    scatter: 0,
    angle: 0,
    spacing: 25,
    jitter: { size: 0, opacity: 0, color: 0 },
    gradientType: "linear",
    cloneOffset: { x: 0, y: 0 },
    tolerance: 32,
    magicContiguous: true,
    polygonSides: 6,
    starPoints: 5,
    starInner: 0.5,
    textFont: "Inter",
    textSize: 24,
    textBold: false,
    textItalic: false,
  };
}

export default function CanvasToolbar({
  activeTool,
  onToolChange,
  layers,
  activeLayerId,
  onLayerAdd,
  onLayerRemove,
  onLayerToggle,
  onLayerOpacity,
  onLayerLock,
  onLayerBlendMode,
  onActiveLayerChange,
  onLayerReorder,
  onLayerMask,
  onDuplicateLayer,
  onFlattenLayers,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  onZoomChange,
  canvasRotation,
  onCanvasRotationChange,
  onFitToScreen,
  symmetryMode,
  onSymmetryChange,
  onLoadReference,
  onRemoveReference,
  hasReference,
  historyEntries,
  historyIndex,
  onHistoryJump,
  onAdjustBrightness,
  onAdjustContrast,
  onAdjustSaturation,
  onAdjustHue,
  onClearSelection,
  isPlus = false,
  showLeftPanel = true,
  onToggleLeftPanel,
  showRightPanel = true,
  onToggleRightPanel,
}: CanvasToolbarProps) {
  const premiumRetouchTypes = new Set(["smudge", "blur", "sharpen", "dodge", "burn"]);
  const premiumCloneTypes = new Set(["clone", "heal"]);
  
  const filteredToolGroups = [...toolGroups, ...plusToolGroups];
  const filteredSymmetryOptions = isPlus ? symmetryOptions : symmetryOptions.filter((o) => o.value === "none");
  const [leftTab, setLeftTab] = useState<"tools" | "brush" | "presets">("tools");
  const [rightTab, setRightTab] = useState<"color" | "layers" | "history" | "adjust">("color");
  const [hexInput, setHexInput] = useState(activeTool.color);
  const [hexInput2, setHexInput2] = useState(activeTool.color2);
  const [editingLayerName, setEditingLayerName] = useState<string | null>(null);
  const [recentColors, setRecentColors] = useState<string[]>(recentColorsList);
  const [presets, setPresets] = useState<BrushPreset[]>(defaultPresets);
  const [newPresetName, setNewPresetName] = useState("");
  const [showPresetInput, setShowPresetInput] = useState(false);

  const handleToolTypeChange = useCallback((type: ToolType) => {
    // Set appropriate defaults when switching tools
    let updates: Partial<CanvasTool> = { type };
    
    if (type === "spray") {
      updates = { ...updates, scatter: 60, opacity: 0.5, flow: 0.4, size: 40 };
    } else if (type === "airbrush") {
      updates = { ...updates, scatter: 30, opacity: 0.4, flow: 0.3, size: 60 };
    } else if (type === "pencil") {
      updates = { ...updates, hardness: 1, opacity: 1, flow: 1 };
    } else if (type === "calligraphy") {
      updates = { ...updates, angle: 45, size: 12 };
    } else if (type === "eraser") {
      updates = { ...updates, opacity: 1, flow: 1 };
    }
    
    onToolChange({ ...activeTool, ...updates });
  }, [activeTool, onToolChange]);

  const handleSizeChange = useCallback((value: number) => {
    onToolChange({ ...activeTool, size: value });
  }, [activeTool, onToolChange]);

  const handleOpacityChange = useCallback((value: number) => {
    onToolChange({ ...activeTool, opacity: value / 100 });
  }, [activeTool, onToolChange]);

  const handleFlowChange = useCallback((value: number) => {
    onToolChange({ ...activeTool, flow: value / 100 });
  }, [activeTool, onToolChange]);

  const handleHardnessChange = useCallback((value: number) => {
    onToolChange({ ...activeTool, hardness: value / 100 });
  }, [activeTool, onToolChange]);

  const handleScatterChange = useCallback((value: number) => {
    onToolChange({ ...activeTool, scatter: value });
  }, [activeTool, onToolChange]);

  const handleAngleChange = useCallback((value: number) => {
    onToolChange({ ...activeTool, angle: value });
  }, [activeTool, onToolChange]);

  const handleSpacingChange = useCallback((value: number) => {
    onToolChange({ ...activeTool, spacing: value });
  }, [activeTool, onToolChange]);

  const handleJitterSizeChange = useCallback((value: number) => {
    onToolChange({ ...activeTool, jitter: { ...activeTool.jitter, size: value } });
  }, [activeTool, onToolChange]);

  const handleJitterOpacityChange = useCallback((value: number) => {
    onToolChange({ ...activeTool, jitter: { ...activeTool.jitter, opacity: value } });
  }, [activeTool, onToolChange]);

  const handleJitterColorChange = useCallback((value: number) => {
    onToolChange({ ...activeTool, jitter: { ...activeTool.jitter, color: value } });
  }, [activeTool, onToolChange]);

  const handleColorChange = useCallback((color: string) => {
    onToolChange({ ...activeTool, color });
    setHexInput(color);
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== color);
      return [color, ...filtered].slice(0, 12);
    });
  }, [activeTool, onToolChange]);

  const handleColor2Change = useCallback((color: string) => {
    onToolChange({ ...activeTool, color2: color });
    setHexInput2(color);
  }, [activeTool, onToolChange]);

  const handleHexSubmit = useCallback(() => {
    const cleaned = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
    if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
      handleColorChange(cleaned);
    }
  }, [hexInput, handleColorChange]);

  const handleHexSubmit2 = useCallback(() => {
    const cleaned = hexInput2.startsWith("#") ? hexInput2 : `#${hexInput2}`;
    if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
      handleColor2Change(cleaned);
    }
  }, [hexInput2, handleColor2Change]);

  const handleHueChange = useCallback((hue: number) => {
    const hsl = hexToHSL(activeTool.color);
    const newColor = hslToHex(hue, hsl.s, hsl.l);
    handleColorChange(newColor);
  }, [activeTool.color, handleColorChange]);

  const handleSatChange = useCallback((sat: number) => {
    const hsl = hexToHSL(activeTool.color);
    const newColor = hslToHex(hsl.h, sat, hsl.l);
    handleColorChange(newColor);
  }, [activeTool.color, handleColorChange]);

  const handleLightChange = useCallback((light: number) => {
    const hsl = hexToHSL(activeTool.color);
    const newColor = hslToHex(hsl.h, hsl.s, light);
    handleColorChange(newColor);
  }, [activeTool.color, handleColorChange]);

  const handleGradientTypeChange = useCallback((gradientType: "linear" | "radial") => {
    onToolChange({ ...activeTool, gradientType });
  }, [activeTool, onToolChange]);

  const handleToleranceChange = useCallback((tolerance: number) => {
    onToolChange({ ...activeTool, tolerance });
  }, [activeTool, onToolChange]);

  const handleMagicContiguousChange = useCallback((contiguous: boolean) => {
    onToolChange({ ...activeTool, magicContiguous: contiguous });
  }, [activeTool, onToolChange]);

  const handlePolygonSidesChange = useCallback((sides: number) => {
    onToolChange({ ...activeTool, polygonSides: sides });
  }, [activeTool, onToolChange]);

  const handleStarPointsChange = useCallback((points: number) => {
    onToolChange({ ...activeTool, starPoints: points });
  }, [activeTool, onToolChange]);

  const handleStarInnerChange = useCallback((inner: number) => {
    onToolChange({ ...activeTool, starInner: inner / 100 });
  }, [activeTool, onToolChange]);

  const handleTextFontChange = useCallback((font: string) => {
    onToolChange({ ...activeTool, textFont: font });
  }, [activeTool, onToolChange]);

  const handleTextSizeChange = useCallback((size: number) => {
    onToolChange({ ...activeTool, textSize: size });
  }, [activeTool, onToolChange]);

  const handleTextBoldChange = useCallback((bold: boolean) => {
    onToolChange({ ...activeTool, textBold: bold });
  }, [activeTool, onToolChange]);

  const handleTextItalicChange = useCallback((italic: boolean) => {
    onToolChange({ ...activeTool, textItalic: italic });
  }, [activeTool, onToolChange]);

  const handleSavePreset = useCallback(() => {
    if (!newPresetName.trim()) return;
    const preset: BrushPreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      icon: activeTool.type === "brush" ? "✏" : "●",
      tool: { ...activeTool },
      createdAt: Date.now(),
    };
    setPresets((prev) => [...prev, preset]);
    setNewPresetName("");
    setShowPresetInput(false);
  }, [newPresetName, activeTool]);

  const handleLoadPreset = useCallback((preset: BrushPreset) => {
    onToolChange({ ...preset.tool });
    setHexInput(preset.tool.color);
    setHexInput2(preset.tool.color2);
  }, [onToolChange]);

  const handleDeletePreset = useCallback((id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const activeHSL = hexToHSL(activeTool.color);
  const activeLayer = layers.find((l) => l.id === activeLayerId);

  if (!showLeftPanel && !showRightPanel) return null;

  return (
    <div className="canvas-pro-layout" style={{ background: "rgba(31, 56, 40, 0.94)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(0, 255, 136, 0.08)", boxShadow: "0 -2px 20px rgba(0, 0, 0, 0.3)" }}>
      {showLeftPanel && (
      <motion.div
        className="canvas-pro-panel canvas-tools-panel"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="panel-tabs">
          <button
            className={`panel-tab ${leftTab === "tools" ? "active" : ""}`}
            onClick={() => setLeftTab("tools")}
          >
            Tools
          </button>
          <button
            className={`panel-tab ${leftTab === "brush" ? "active" : ""}`}
            onClick={() => setLeftTab("brush")}
          >
            Brush
          </button>
          <button
            className={`panel-tab ${leftTab === "presets" ? "active" : ""}`}
            onClick={() => setLeftTab("presets")}
          >
            Presets
          </button>
        </div>

        <div className="panel-divider" />

        {leftTab === "tools" && (
          <div className="canvas-tools-list">
            {filteredToolGroups.map((group) => {
              const isPlusGroup = group.label.includes("✦");
              return (
                <div key={group.label} className={`tool-group ${isPlusGroup ? "tool-group--plus" : ""}`}>
                  <div className="tool-group-label">
                    {group.label}
                    {isPlusGroup && !isPlus && <span className="plus-badge">PLUS</span>}
                  </div>
                  <div className="canvas-tools-grid">
                    {group.tools.map((tool) => (
                      <button
                        key={tool.name}
                        onClick={() => {
                          if (!isPlusGroup || isPlus) {
                            handleToolTypeChange(tool.type);
                            // Store the Plus tool metadata
                            if (isPlusGroup && tool.plusId) {
                              onToolChange({ ...activeTool, type: tool.type, plusId: tool.plusId });
                            } else if (!isPlusGroup) {
                              onToolChange({ ...activeTool, type: tool.type, plusId: undefined });
                            }
                          }
                        }}
                        className={`canvas-tool-btn ${activeTool.type === tool.type && (!isPlusGroup || activeTool.plusId === tool.plusId) ? "active" : ""} ${isPlusGroup && !isPlus ? "canvas-tool-btn--locked" : ""}`}
                        title={isPlusGroup && !isPlus ? "Upgrade to Plus to unlock" : `${tool.name}${tool.key ? ` (${tool.key})` : ""}`}
                      >
                        <span className="tool-icon">{tool.icon}</span>
                        <span className="tool-label-text">{tool.name}</span>
                        {isPlusGroup && !isPlus && <span className="tool-lock-icon">🔒</span>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {leftTab === "brush" && (
          <div className="brush-settings">
            <div className="setting-row">
              <span className="setting-label">Size</span>
              <input
                type="range"
                min="1"
                max="500"
                value={activeTool.size}
                onChange={(e) => handleSizeChange(parseInt(e.target.value))}
                className="canvas-slider"
              />
              <span className="setting-value">{activeTool.size}px</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Opacity</span>
              <input
                type="range"
                min="1"
                max="100"
                value={Math.round(activeTool.opacity * 100)}
                onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
                className="canvas-slider"
              />
              <span className="setting-value">{Math.round(activeTool.opacity * 100)}%</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Flow</span>
              <input
                type="range"
                min="1"
                max="100"
                value={Math.round(activeTool.flow * 100)}
                onChange={(e) => handleFlowChange(parseInt(e.target.value))}
                className="canvas-slider"
              />
              <span className="setting-value">{Math.round(activeTool.flow * 100)}%</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Hardness</span>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(activeTool.hardness * 100)}
                onChange={(e) => handleHardnessChange(parseInt(e.target.value))}
                className="canvas-slider"
              />
              <span className="setting-value">{Math.round(activeTool.hardness * 100)}%</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Scatter</span>
              <input
                type="range"
                min="0"
                max="100"
                value={activeTool.scatter}
                onChange={(e) => handleScatterChange(parseInt(e.target.value))}
                className="canvas-slider"
              />
              <span className="setting-value">{activeTool.scatter}%</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Angle</span>
              <input
                type="range"
                min="0"
                max="360"
                value={activeTool.angle}
                onChange={(e) => handleAngleChange(parseInt(e.target.value))}
                className="canvas-slider"
              />
              <span className="setting-value">{activeTool.angle}°</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Spacing</span>
              <input
                type="range"
                min="1"
                max="100"
                value={activeTool.spacing}
                onChange={(e) => handleSpacingChange(parseInt(e.target.value))}
                className="canvas-slider"
              />
              <span className="setting-value">{activeTool.spacing}%</span>
            </div>

            <div className="panel-divider" />

            <div className="panel-sub-label">Jitter</div>
            <div className="setting-row">
              <span className="setting-label">Size</span>
              <input
                type="range"
                min="0"
                max="100"
                value={activeTool.jitter.size}
                onChange={(e) => handleJitterSizeChange(parseInt(e.target.value))}
                className="canvas-slider"
              />
              <span className="setting-value">{activeTool.jitter.size}%</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Opacity</span>
              <input
                type="range"
                min="0"
                max="100"
                value={activeTool.jitter.opacity}
                onChange={(e) => handleJitterOpacityChange(parseInt(e.target.value))}
                className="canvas-slider"
              />
              <span className="setting-value">{activeTool.jitter.opacity}%</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Color</span>
              <input
                type="range"
                min="0"
                max="100"
                value={activeTool.jitter.color}
                onChange={(e) => handleJitterColorChange(parseInt(e.target.value))}
                className="canvas-slider"
              />
              <span className="setting-value">{activeTool.jitter.color}%</span>
            </div>

            {activeTool.type === "gradient" && (
              <>
                <div className="panel-divider" />
                <div className="gradient-settings">
                  <div className="setting-row">
                    <span className="setting-label">Type</span>
                    <div className="btn-group">
                      <button
                        className={`btn-group-item ${activeTool.gradientType === "linear" ? "active" : ""}`}
                        onClick={() => handleGradientTypeChange("linear")}
                      >
                        Linear
                      </button>
                      <button
                        className={`btn-group-item ${activeTool.gradientType === "radial" ? "active" : ""}`}
                        onClick={() => handleGradientTypeChange("radial")}
                      >
                        Radial
                      </button>
                    </div>
                  </div>
                  <div className="setting-row">
                    <span className="setting-label">End Color</span>
                    <div className="color-preview-row">
                      <label
                        className="color-preview-sm"
                        style={{ background: activeTool.color2, cursor: "pointer" }}
                      >
                        <input
                          type="color"
                          value={activeTool.color2}
                          onChange={(e) => handleColor2Change(e.target.value)}
                          className="color-native-input"
                        />
                      </label>
                      <div className="color-hex-input">
                        <span className="hex-hash">#</span>
                        <input
                          type="text"
                          value={hexInput2.replace("#", "")}
                          onChange={(e) => setHexInput2(`#${e.target.value}`)}
                          onBlur={handleHexSubmit2}
                          onKeyDown={(e) => e.key === "Enter" && handleHexSubmit2()}
                          className="hex-field"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="gradient-preview" style={{
                    background: activeTool.gradientType === "linear"
                      ? `linear-gradient(90deg, ${activeTool.color}, ${activeTool.color2})`
                      : `radial-gradient(circle, ${activeTool.color}, ${activeTool.color2})`,
                  }} />
                </div>
              </>
            )}

            {activeTool.type === "polygon" && (
              <>
                <div className="panel-divider" />
                <div className="setting-row">
                  <span className="setting-label">Sides</span>
                  <input
                    type="range"
                    min="3"
                    max="24"
                    value={activeTool.polygonSides}
                    onChange={(e) => handlePolygonSidesChange(parseInt(e.target.value))}
                    className="canvas-slider"
                  />
                  <span className="setting-value">{activeTool.polygonSides}</span>
                </div>
              </>
            )}

            {activeTool.type === "star" && (
              <>
                <div className="panel-divider" />
                <div className="setting-row">
                  <span className="setting-label">Points</span>
                  <input
                    type="range"
                    min="3"
                    max="32"
                    value={activeTool.starPoints}
                    onChange={(e) => handleStarPointsChange(parseInt(e.target.value))}
                    className="canvas-slider"
                  />
                  <span className="setting-value">{activeTool.starPoints}</span>
                </div>
                <div className="setting-row">
                  <span className="setting-label">Inner Radius</span>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={Math.round(activeTool.starInner * 100)}
                    onChange={(e) => handleStarInnerChange(parseInt(e.target.value))}
                    className="canvas-slider"
                  />
                  <span className="setting-value">{Math.round(activeTool.starInner * 100)}%</span>
                </div>
              </>
            )}

            {activeTool.type === "magicwand" && (
              <>
                <div className="panel-divider" />
                <div className="setting-row">
                  <span className="setting-label">Tolerance</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={activeTool.tolerance}
                    onChange={(e) => handleToleranceChange(parseInt(e.target.value))}
                    className="canvas-slider"
                  />
                  <span className="setting-value">{activeTool.tolerance}</span>
                </div>
                <div className="setting-row">
                  <span className="setting-label">Contiguous</span>
                  <button
                    className={`toggle-btn ${activeTool.magicContiguous ? "active" : ""}`}
                    onClick={() => handleMagicContiguousChange(!activeTool.magicContiguous)}
                  >
                    {activeTool.magicContiguous ? "On" : "Off"}
                  </button>
                </div>
              </>
            )}

            {(activeTool.type === "eraser" || activeTool.type === "smudge" || activeTool.type === "blur" || activeTool.type === "sharpen" || activeTool.type === "dodge" || activeTool.type === "burn" || activeTool.type === "clone" || activeTool.type === "heal") && (
              <>
                <div className="panel-divider" />
                <div className="setting-row">
                  <span className="setting-label">Tolerance</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={activeTool.tolerance}
                    onChange={(e) => handleToleranceChange(parseInt(e.target.value))}
                    className="canvas-slider"
                  />
                  <span className="setting-value">{activeTool.tolerance}</span>
                </div>
              </>
            )}

            {activeTool.type === "text" && (
              <>
                <div className="panel-divider" />
                <div className="setting-row">
                  <span className="setting-label">Font</span>
                  <select
                    value={activeTool.textFont}
                    onChange={(e) => handleTextFontChange(e.target.value)}
                    className="layer-blend-select"
                  >
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <div className="setting-row">
                  <span className="setting-label">Size</span>
                  <input
                    type="range"
                    min="8"
                    max="200"
                    value={activeTool.textSize}
                    onChange={(e) => handleTextSizeChange(parseInt(e.target.value))}
                    className="canvas-slider"
                  />
                  <span className="setting-value">{activeTool.textSize}px</span>
                </div>
                <div className="setting-row">
                  <span className="setting-label">Style</span>
                  <div className="btn-group">
                    <button
                      className={`btn-group-item ${activeTool.textBold ? "active" : ""}`}
                      onClick={() => handleTextBoldChange(!activeTool.textBold)}
                    >
                      B
                    </button>
                    <button
                      className={`btn-group-item ${activeTool.textItalic ? "active" : ""}`}
                      onClick={() => handleTextItalicChange(!activeTool.textItalic)}
                    >
                      I
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {leftTab === "presets" && (
          <div className="presets-panel">
            <div className="presets-list">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="preset-item"
                  onClick={() => handleLoadPreset(preset)}
                >
                  <span className="preset-icon">{preset.icon}</span>
                  <div className="preset-info">
                    <span className="preset-name">{preset.name}</span>
                    <span className="preset-meta">{preset.tool.type} · {preset.tool.size}px</span>
                  </div>
                  <button
                    className="canvas-action-sm canvas-action-sm--danger"
                    onClick={(e) => { e.stopPropagation(); handleDeletePreset(preset.id); }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {showPresetInput ? (
              <div className="preset-save">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Preset name..."
                  className="preset-name-input"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSavePreset();
                    if (e.key === "Escape") setShowPresetInput(false);
                  }}
                  onBlur={() => { if (!newPresetName.trim()) setShowPresetInput(false); }}
                />
                <button className="layer-action-btn" onClick={handleSavePreset}>Save</button>
                <button className="canvas-action-sm" onClick={() => setShowPresetInput(false)}>Cancel</button>
              </div>
            ) : (
              <button className="preset-save" onClick={() => setShowPresetInput(true)}>
                + Save Current Brush
              </button>
            )}
          </div>
        )}

        <div className="panel-divider" />

        <div className="canvas-actions-col">
          <button onClick={onUndo} className="canvas-action-sm" disabled={!canUndo} title="Undo (Ctrl+Z)">
            ↶ Undo
          </button>
          <button onClick={onRedo} className="canvas-action-sm" disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
            ↷ Redo
          </button>
          <button onClick={onClear} className="canvas-action-sm canvas-action-sm--danger" title="Clear layer">
            ✕ Clear
          </button>
          <button onClick={onClearSelection} className="canvas-action-sm" title="Deselect">
            ⊡ Deselect
          </button>
        </div>
      </motion.div>
      )}

      {showRightPanel && (
      <motion.div
        className="canvas-pro-panel canvas-right-panel"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="panel-tabs">
          <button
            className={`panel-tab ${rightTab === "color" ? "active" : ""}`}
            onClick={() => setRightTab("color")}
          >
            Color
          </button>
          <button
            className={`panel-tab ${rightTab === "layers" ? "active" : ""}`}
            onClick={() => setRightTab("layers")}
          >
            Layers
          </button>
          <button
            className={`panel-tab ${rightTab === "history" ? "active" : ""}`}
            onClick={() => setRightTab("history")}
          >
            History
          </button>
          <button
            className={`panel-tab ${rightTab === "adjust" ? "active" : ""}`}
            onClick={() => setRightTab("adjust")}
          >
            Adjust
          </button>
        </div>

        <div className="panel-divider" />

        {rightTab === "color" && (
          <div className="color-section">
            <div className="color-preview-row">
              <label className="color-preview-main" style={{
                  background: activeTool.color,
                  boxShadow: `0 0 15px ${activeTool.color}40`,
                  cursor: "pointer",
                }}>
                <input
                  type="color"
                  value={activeTool.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="color-native-input"
                />
              </label>
              <div className="color-hex-input">
                <span className="hex-hash">#</span>
                <input
                  type="text"
                  value={hexInput.replace("#", "")}
                  onChange={(e) => setHexInput(`#${e.target.value}`)}
                  onBlur={handleHexSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleHexSubmit()}
                  className="hex-field"
                  maxLength={6}
                />
              </div>
            </div>

            <div className="color-row-label">Recent</div>
            <div className="color-swatches-row">
              {recentColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`color-swatch-btn ${activeTool.color === color ? "active" : ""}`}
                >
                  <div style={{ background: color }} />
                </button>
              ))}
            </div>

            <div className="color-row-label">Palette</div>
            <div className="color-palette-grid">
              {cosmicColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`color-swatch-btn ${activeTool.color === color ? "active" : ""}`}
                >
                  <div style={{ background: color }} />
                </button>
              ))}
            </div>

            <div className="color-row-label">Custom</div>
            <div className="hsl-sliders">
              <div className="hsl-row">
                <span className="hsl-label">H</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={activeHSL.h}
                  onChange={(e) => handleHueChange(parseInt(e.target.value))}
                  className="canvas-slider canvas-slider--hue"
                />
                <span className="setting-value">{activeHSL.h}°</span>
              </div>
              <div className="hsl-row">
                <span className="hsl-label">S</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeHSL.s}
                  onChange={(e) => handleSatChange(parseInt(e.target.value))}
                  className="canvas-slider canvas-slider--sat"
                />
                <span className="setting-value">{activeHSL.s}%</span>
              </div>
              <div className="hsl-row">
                <span className="hsl-label">L</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeHSL.l}
                  onChange={(e) => handleLightChange(parseInt(e.target.value))}
                  className="canvas-slider"
                />
                <span className="setting-value">{activeHSL.l}%</span>
              </div>
            </div>
          </div>
        )}

        {rightTab === "layers" && (
          <div>
            <div className="layer-blend-row">
              <select
                value={activeLayer?.blendMode || "source-over"}
                onChange={(e) => onLayerBlendMode(activeLayerId, e.target.value as GlobalCompositeOperation)}
                className="layer-blend-select"
              >
                {blendModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>{mode.label}</option>
                ))}
              </select>
              <div className="layer-opacity-control">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((activeLayer?.opacity ?? 1) * 100)}
                  onChange={(e) => onLayerOpacity(activeLayerId, parseInt(e.target.value) / 100)}
                  className="canvas-slider"
                />
                <span className="layer-opacity-val">
                  {Math.round((activeLayer?.opacity ?? 1) * 100)}%
                </span>
              </div>
            </div>

            <div className="layer-list">
              {[...layers].reverse().map((layer) => (
                <div
                  key={layer.id}
                  className={`layer-item ${layer.id === activeLayerId ? "active" : ""}`}
                  onClick={() => onActiveLayerChange(layer.id)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); onLayerToggle(layer.id); }}
                    className={`layer-vis-btn ${layer.visible ? "" : "hidden"}`}
                    title={layer.visible ? "Hide" : "Show"}
                  >
                    {layer.visible ? "◉" : "○"}
                  </button>

                  <div className="layer-info">
                    {editingLayerName === layer.id ? (
                      <input
                        type="text"
                        defaultValue={layer.name}
                        className="layer-name-input"
                        autoFocus
                        onBlur={() => setEditingLayerName(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingLayerName(null);
                        }}
                      />
                    ) : (
                      <span
                        className="layer-name"
                        onDoubleClick={() => setEditingLayerName(layer.id)}
                      >
                        {layer.name}
                        {layer.hasMask && " 🎭"}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); onLayerLock(layer.id); }}
                    className={`layer-lock-btn ${layer.locked ? "locked" : ""}`}
                    title={layer.locked ? "Unlock" : "Lock"}
                  >
                    {layer.locked ? "🔒" : "🔓"}
                  </button>
                </div>
              ))}
            </div>

            <div className="layer-actions">
              <button onClick={onLayerAdd} className="layer-action-btn" title="Add layer">
                + Add
              </button>
              <button
                onClick={() => onDuplicateLayer(activeLayerId)}
                className="layer-action-btn"
                title="Duplicate layer"
              >
                ⧉
              </button>
              <button
                onClick={() => onLayerMask(activeLayerId)}
                className="layer-action-btn"
                title="Toggle mask"
              >
                🎭
              </button>
              <button
                onClick={() => {
                  const idx = layers.findIndex((l) => l.id === activeLayerId);
                  if (idx > 0) onLayerReorder(idx, idx - 1);
                }}
                className="layer-action-btn"
                disabled={layers.findIndex((l) => l.id === activeLayerId) === 0}
                title="Move up"
              >
                ▲
              </button>
              <button
                onClick={() => {
                  const idx = layers.findIndex((l) => l.id === activeLayerId);
                  if (idx < layers.length - 1) onLayerReorder(idx, idx + 1);
                }}
                className="layer-action-btn"
                disabled={layers.findIndex((l) => l.id === activeLayerId) === layers.length - 1}
                title="Move down"
              >
                ▼
              </button>
              <button
                onClick={onFlattenLayers}
                className="layer-action-btn"
                title="Flatten layers"
              >
                ⊞
              </button>
              <button
                onClick={() => onLayerRemove(activeLayerId)}
                className="layer-action-btn layer-action-btn--danger"
                disabled={layers.length <= 1}
                title="Delete layer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {rightTab === "history" && (
          <div className="history-list">
            {historyEntries.map((entry, i) => (
              <div
                key={i}
                className={`history-item ${i === historyIndex ? "active" : ""}`}
                onClick={() => onHistoryJump(i)}
              >
                {entry}
              </div>
            ))}
            {historyEntries.length === 0 && (
              <div className="history-item">No history yet</div>
            )}
          </div>
        )}

        {rightTab === "adjust" && (
          <div className="adjust-sliders">
            <div className="setting-row">
              <span className="setting-label">Brightness</span>
              <input
                type="range"
                min="-100"
                max="100"
                defaultValue="0"
                onChange={(e) => onAdjustBrightness(parseInt(e.target.value))}
                className="canvas-slider"
              />
              <span className="setting-value">0</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Contrast</span>
              <input
                type="range"
                min="-100"
                max="100"
                defaultValue="0"
                onChange={(e) => onAdjustContrast(parseInt(e.target.value))}
                className="canvas-slider"
              />
              <span className="setting-value">0</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Saturation</span>
              <input
                type="range"
                min="-100"
                max="100"
                defaultValue="0"
                onChange={(e) => onAdjustSaturation(parseInt(e.target.value))}
                className="canvas-slider"
              />
              <span className="setting-value">0</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Hue</span>
              <input
                type="range"
                min="0"
                max="360"
                defaultValue="0"
                onChange={(e) => onAdjustHue(parseInt(e.target.value))}
                className="canvas-slider"
              />
              <span className="setting-value">0°</span>
            </div>
          </div>
        )}

        <div className="panel-divider" />

        <div className="panel-label">Reference</div>
        <div className="reference-section">
          <label className="reference-upload-btn">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onLoadReference(file);
              }}
              className="hidden"
            />
            {hasReference ? "Replace" : "Load Image"}
          </label>
          {hasReference && (
            <button onClick={onRemoveReference} className="reference-remove-btn">
              Remove
            </button>
          )}
        </div>

        <div className="panel-divider" />

        <div className="panel-label">
          Symmetry
          {!isPlus && (
            <span className="ml-1 inline-block px-1 py-0.5 rounded text-[8px] bg-elovayne-violet/20 border border-elovayne-violet/30 text-elovayne-violet font-body">PLUS</span>
          )}
        </div>
        <div className="btn-group">
          {filteredSymmetryOptions.map((opt) => (
            <button
              key={opt.value}
              className={`btn-group-item ${symmetryMode === opt.value ? "active" : ""}`}
              onClick={() => onSymmetryChange(opt.value)}
              title={opt.label}
            >
              {opt.icon}
            </button>
          ))}
        </div>

        <div className="panel-divider" />

        <div className="panel-label">View</div>
        <div className="canvas-actions-col">
          <div className="setting-row">
            <span className="setting-label">Zoom</span>
            <input
              type="range"
              min="10"
              max="500"
              value={Math.round(zoom * 100)}
              onChange={(e) => onZoomChange(parseInt(e.target.value) / 100)}
              className="canvas-slider"
            />
            <span className="setting-value">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="setting-row">
            <span className="setting-label">Rotation</span>
            <input
              type="range"
              min="-180"
              max="180"
              value={canvasRotation}
              onChange={(e) => onCanvasRotationChange(parseInt(e.target.value))}
              className="canvas-slider"
            />
            <span className="setting-value">{canvasRotation}°</span>
          </div>
          <button onClick={onFitToScreen} className="canvas-action-sm">
            ⊞ Fit to Screen
          </button>
        </div>
      </motion.div>
      )}
    </div>
  );
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16) / 255;
    g = parseInt(hex.slice(3, 5), 16) / 255;
    b = parseInt(hex.slice(5, 7), 16) / 255;
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
