"use client";

import { motion } from "framer-motion";
import { getBlocksByCategory } from "@/lib/dream-world/blocks";

interface BlockPaletteProps {
  onSelect: (blockId: number) => void;
  onClose: () => void;
  activeBlockId: number;
}

const CATEGORIES = [
  { key: "stone", label: "Stone", icon: "◆" },
  { key: "wood", label: "Wood", icon: "▣" },
  { key: "glass", label: "Glass", icon: "◇" },
  { key: "glow", label: "Glow", icon: "✦" },
  { key: "nature", label: "Nature", icon: "❋" },
  { key: "vegetation", label: "Plants", icon: "✿" },
  { key: "building", label: "Build", icon: "▦" },
  { key: "furniture", label: "Furnish", icon: "◈" },
  { key: "essence", label: "Essence", icon: "✧" },
  { key: "special", label: "Special", icon: "◎" },
];

export default function BlockPalette({ onSelect, onClose, activeBlockId }: BlockPaletteProps) {
  return (
    <motion.div
      className="dw-palette"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="dw-palette-header">
        <span className="dw-palette-title">Block Palette</span>
        <button onClick={onClose} className="dw-palette-close">✕</button>
      </div>

      <div className="dw-palette-categories">
        {CATEGORIES.map((cat) => {
          const blocks = getBlocksByCategory(cat.key);
          if (blocks.length === 0) return null;
          return (
            <div key={cat.key} className="dw-palette-category">
              <div className="dw-palette-cat-label">
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </div>
              <div className="dw-palette-grid">
                {blocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => onSelect(block.id)}
                    className={`dw-palette-block ${activeBlockId === block.id ? "active" : ""}`}
                    title={block.name}
                  >
                    <div className="dw-palette-block-color" style={{
                      background: block.colorTop || block.color,
                      boxShadow: block.emissive ? `0 0 8px ${block.color}60` : undefined,
                    }} />
                    <span className="dw-palette-block-name">{block.name}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
