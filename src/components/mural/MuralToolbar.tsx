"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BrushType } from "@/lib/mural/types";
import { BRUSH_PRESETS, COLOR_PALETTE } from "@/lib/mural/brushes";
import { RoomPresence } from "@/lib/mural/types";

interface MuralToolbarProps {
  brushType: BrushType;
  brushSize: number;
  brushHardness: number;
  opacity: number;
  color: string;
  onBrushTypeChange: (type: BrushType) => void;
  onBrushSizeChange: (size: number) => void;
  onBrushHardnessChange: (hardness: number) => void;
  onOpacityChange: (opacity: number) => void;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  onLeave: () => void;
  roomName: string;
  presences: RoomPresence[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function MuralToolbar({
  brushType,
  brushSize,
  brushHardness,
  opacity,
  color,
  onBrushTypeChange,
  onBrushSizeChange,
  onBrushHardnessChange,
  onOpacityChange,
  onColorChange,
  onUndo,
  onLeave,
  roomName,
  presences,
  isOpen,
  onToggle,
}: MuralToolbarProps) {
  const categories = ["basic", "creative", "nature", "textured"];

  return (
    <>
      {/* Toggle button - adjusted for mobile */}
      <motion.button
        onClick={onToggle}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed top-4 left-14 sm:left-14 z-40 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
        style={{
          background: "rgba(13, 148, 136, 0.08)",
          border: "1px solid rgba(13, 148, 136, 0.15)",
          backdropFilter: "blur(8px)",
          color: "#0d9488",
          fontSize: "14px",
        }}
      >
        {isOpen ? "✕" : "🎨"}
      </motion.button>

      {/* Desktop: side panel, Mobile: bottom sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-20 sm:hidden"
              style={{ background: "rgba(0,0,0,0.3)" }}
              onClick={onToggle}
            />

            {/* Side panel (desktop) / Bottom sheet (mobile) */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed z-30 overflow-y-auto overflow-x-hidden"
              style={{
                top: 0,
                left: 0,
                bottom: 0,
                width: "min(300px, 85vw)",
                background: "rgba(255, 255, 255, 0.97)",
                backdropFilter: "blur(16px)",
                borderRight: "1px solid rgba(13, 148, 136, 0.1)",
                boxShadow: "4px 0 30px rgba(0,0,0,0.06)",
              }}
            >
              <div className="p-4 pt-14">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-sm font-medium truncate flex-1"
                    style={{
                      background: "linear-gradient(135deg, #0d9488, #06b6d4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {roomName}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs" style={{ color: "rgba(15, 23, 42, 0.4)" }}>
                      {presences.length + 1}
                    </span>
                  </div>
                </div>

                {presences.length > 0 && (
                  <div className="flex gap-1 mb-4 flex-wrap">
                    {presences.map((p) => (
                      <div
                        key={p.userId}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                        style={{ background: p.color }}
                        title={p.name}
                      >
                        {p.name[0]?.toUpperCase()}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={onUndo}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                    style={{
                      background: "rgba(13, 148, 136, 0.06)",
                      border: "1px solid rgba(13, 148, 136, 0.12)",
                      color: "rgba(15, 23, 42, 0.6)",
                    }}
                  >
                    Undo
                  </button>
                  <button
                    onClick={onLeave}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                    style={{
                      background: "rgba(239, 68, 68, 0.06)",
                      border: "1px solid rgba(239, 68, 68, 0.15)",
                      color: "#ef4444",
                    }}
                  >
                    Leave
                  </button>
                  <Link
                    href="/"
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs cursor-pointer text-center"
                    style={{
                      background: "rgba(13, 148, 136, 0.06)",
                      border: "1px solid rgba(13, 148, 136, 0.12)",
                      color: "#0d9488",
                      textDecoration: "none",
                    }}
                  >
                    Home
                  </Link>
                </div>

                <div className="mb-4">
                  <label className="text-xs mb-1.5 block" style={{ color: "rgba(15, 23, 42, 0.4)" }}>
                    Color
                  </label>
                  <div className="grid grid-cols-6 gap-1.5 mb-2">
                    {COLOR_PALETTE.flat().map((c, i) => (
                      <button
                        key={i}
                        onClick={() => onColorChange(c)}
                        className="w-full aspect-square rounded-md cursor-pointer transition-transform"
                        style={{
                          background: c,
                          boxShadow: color === c ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : "none",
                          transform: color === c ? "scale(1.1)" : "scale(1)",
                        }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-full h-8 rounded-lg cursor-pointer"
                    style={{ border: "1px solid rgba(13, 148, 136, 0.12)" }}
                  />
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs" style={{ color: "rgba(15, 23, 42, 0.4)" }}>Size</label>
                    <span className="text-xs" style={{ color: "rgba(15, 23, 42, 0.3)" }}>{brushSize}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={brushSize}
                    onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs" style={{ color: "rgba(15, 23, 42, 0.4)" }}>Opacity</label>
                    <span className="text-xs" style={{ color: "rgba(15, 23, 42, 0.3)" }}>
                      {Math.round(opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={Math.round(opacity * 100)}
                    onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs" style={{ color: "rgba(15, 23, 42, 0.4)" }}>Hardness</label>
                    <span className="text-xs" style={{ color: "rgba(15, 23, 42, 0.3)" }}>{brushHardness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={brushHardness}
                    onChange={(e) => onBrushHardnessChange(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div className="mb-2">
                  <label className="text-xs mb-2 block" style={{ color: "rgba(15, 23, 42, 0.4)" }}>
                    Brush
                  </label>
                  {categories.map((cat) => {
                    const brushes = BRUSH_PRESETS.filter((b) => b.category === cat);
                    if (brushes.length === 0) return null;
                    return (
                      <div key={cat} className="mb-3">
                        <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "rgba(15, 23, 42, 0.25)" }}>
                          {cat}
                        </p>
                        <div className="grid grid-cols-4 gap-1">
                          {brushes.map((b) => (
                            <button
                              key={b.type}
                              onClick={() => onBrushTypeChange(b.type)}
                              className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg cursor-pointer transition-all"
                              title={b.name}
                              style={{
                                background: brushType === b.type ? "rgba(13, 148, 136, 0.1)" : "transparent",
                                border: `1px solid ${brushType === b.type ? "rgba(13, 148, 136, 0.2)" : "transparent"}`,
                              }}
                            >
                              <span className="text-sm">{b.icon}</span>
                              <span className="text-[9px] leading-tight" style={{ color: "rgba(15, 23, 42, 0.4)" }}>
                                {b.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
