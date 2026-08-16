"use client";

import { motion } from "framer-motion";

type Category = "all" | "music" | "image";

interface CategoryFilterProps {
  active: Category;
  onChange: (category: Category) => void;
  counts: Record<Category, number>;
}

export default function CategoryFilter({ active, onChange, counts }: CategoryFilterProps) {
  const categories: { key: Category; label: string; icon: string }[] = [
    { key: "all", label: "All", icon: "✦" },
    { key: "music", label: "Music", icon: "🎵" },
    { key: "image", label: "Images", icon: "🖼️" },
  ];

  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {categories.map((cat) => {
        const isActive = active === cat.key;
        return (
          <motion.button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            whileTap={{ scale: 0.95 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "10px",
              border: `1px solid ${isActive ? "rgba(0, 255, 136, 0.2)" : "rgba(0, 255, 136, 0.06)"}`,
              background: isActive ? "rgba(0, 255, 136, 0.08)" : "rgba(31, 56, 40, 0.55)",
              color: isActive ? "#e0f5e8" : "rgba(224, 245, 232, 0.35)",
              fontSize: "12px",
              fontWeight: isActive ? 500 : 400,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontSize: "13px" }}>{cat.icon}</span>
            <span>{cat.label}</span>
            <span style={{
              fontSize: "10px",
              padding: "1px 6px",
              borderRadius: "6px",
              background: isActive ? "rgba(0, 255, 136, 0.1)" : "rgba(0, 255, 136, 0.04)",
              color: isActive ? "rgba(0, 255, 136, 0.6)" : "rgba(224, 245, 232, 0.2)",
            }}>
              {counts[cat.key]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
