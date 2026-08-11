"use client";

import { motion } from "framer-motion";
import { getBlockDef } from "@/lib/dream-world/blocks";

export interface CraftingRecipe {
  id: string;
  name: string;
  icon: string;
  ingredients: { blockId: number; count: number }[];
  result: { blockId: number; count: number };
  category: string;
}

export const RECIPES: CraftingRecipe[] = [
  // Basic building
  { id: "plank", name: "Starwood Planks", icon: "▣", ingredients: [{ blockId: 10, count: 1 }], result: { blockId: 11, count: 4 }, category: "basic" },
  { id: "brick", name: "Cosmic Bricks", icon: "▦", ingredients: [{ blockId: 1, count: 4 }], result: { blockId: 70, count: 4 }, category: "basic" },
  { id: "tile", name: "Starstone Tiles", icon: "▦", ingredients: [{ blockId: 2, count: 4 }], result: { blockId: 71, count: 4 }, category: "basic" },
  { id: "pillar", name: "Ethereal Pillar", icon: "║", ingredients: [{ blockId: 3, count: 2 }, { blockId: 70, count: 1 }], result: { blockId: 73, count: 2 }, category: "basic" },
  // Glow
  { id: "starlight", name: "Starlight Block", icon: "✦", ingredients: [{ blockId: 30, count: 4 }], result: { blockId: 31, count: 1 }, category: "glow" },
  { id: "aurora", name: "Aurora Block", icon: "◎", ingredients: [{ blockId: 30, count: 2 }, { blockId: 52, count: 2 }], result: { blockId: 32, count: 1 }, category: "glow" },
  { id: "neon", name: "Neon Cube", icon: "◆", ingredients: [{ blockId: 30, count: 2 }, { blockId: 51, count: 2 }], result: { blockId: 33, count: 1 }, category: "glow" },
  { id: "torch", name: "Torch", icon: "🔥", ingredients: [{ blockId: 10, count: 1 }, { blockId: 30, count: 1 }], result: { blockId: 84, count: 4 }, category: "glow" },
  // Building
  { id: "marble", name: "Moon Marble", icon: "◻", ingredients: [{ blockId: 3, count: 4 }], result: { blockId: 72, count: 4 }, category: "building" },
  { id: "glass", name: "Violet Glass", icon: "◇", ingredients: [{ blockId: 30, count: 1 }, { blockId: 1, count: 3 }], result: { blockId: 20, count: 4 }, category: "building" },
  { id: "rose_glass", name: "Rose Glass", icon: "◇", ingredients: [{ blockId: 20, count: 4 }, { blockId: 51, count: 1 }], result: { blockId: 23, count: 4 }, category: "building" },
  { id: "gold_glass", name: "Gold Glass", icon: "◇", ingredients: [{ blockId: 20, count: 4 }, { blockId: 110, count: 1 }], result: { blockId: 24, count: 4 }, category: "building" },
  // Special
  { id: "portal", name: "Portal Block", icon: "◎", ingredients: [{ blockId: 30, count: 4 }, { blockId: 111, count: 2 }, { blockId: 113, count: 1 }], result: { blockId: 100, count: 1 }, category: "special" },
  { id: "mirror", name: "Mirror Block", icon: "□", ingredients: [{ blockId: 22, count: 4 }, { blockId: 3, count: 2 }], result: { blockId: 102, count: 1 }, category: "special" },
  { id: "gravity", name: "Gravity Block", icon: "◈", ingredients: [{ blockId: 30, count: 2 }, { blockId: 113, count: 2 }], result: { blockId: 101, count: 1 }, category: "special" },
  // Tools
  { id: "wooden_pickaxe", name: "Wooden Pickaxe", icon: "⛏", ingredients: [{ blockId: 11, count: 3 }, { blockId: 10, count: 2 }], result: { blockId: 1001, count: 1 }, category: "tools" },
  { id: "stone_pickaxe", name: "Stone Pickaxe", icon: "⛏", ingredients: [{ blockId: 1, count: 3 }, { blockId: 10, count: 2 }], result: { blockId: 1002, count: 1 }, category: "tools" },
  { id: "wooden_axe", name: "Wooden Axe", icon: "🪓", ingredients: [{ blockId: 11, count: 3 }, { blockId: 10, count: 2 }], result: { blockId: 1003, count: 1 }, category: "tools" },
  { id: "stone_axe", name: "Stone Axe", icon: "🪓", ingredients: [{ blockId: 1, count: 3 }, { blockId: 10, count: 2 }], result: { blockId: 1004, count: 1 }, category: "tools" },
  { id: "wooden_shovel", name: "Wooden Shovel", icon: "⛏", ingredients: [{ blockId: 11, count: 1 }, { blockId: 10, count: 2 }], result: { blockId: 1005, count: 1 }, category: "tools" },
  { id: "stone_shovel", name: "Stone Shovel", icon: "⛏", ingredients: [{ blockId: 1, count: 1 }, { blockId: 10, count: 2 }], result: { blockId: 1006, count: 1 }, category: "tools" },
  { id: "dream_sword", name: "Dream Sword", icon: "⚔", ingredients: [{ blockId: 30, count: 2 }, { blockId: 11, count: 1 }], result: { blockId: 1007, count: 1 }, category: "tools" },
];

interface CraftingMenuProps {
  onClose: () => void;
  onCraft: (recipe: CraftingRecipe) => void;
  inventory: Record<number, number>; // blockId -> count
}

const CATEGORIES = [
  { key: "basic", label: "Basic", icon: "◆" },
  { key: "glow", label: "Glow", icon: "✦" },
  { key: "building", label: "Building", icon: "▦" },
  { key: "tools", label: "Tools", icon: "⛏" },
  { key: "special", label: "Special", icon: "◎" },
];

export default function CraftingMenu({ onClose, onCraft, inventory }: CraftingMenuProps) {
  const canCraft = (recipe: CraftingRecipe): boolean => {
    return recipe.ingredients.every((ing) => (inventory[ing.blockId] || 0) >= ing.count);
  };

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    recipes: RECIPES.filter((r) => r.category === cat.key),
  }));

  return (
    <motion.div
      className="dw-crafting"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="dw-crafting-header">
        <span className="dw-crafting-title">◈ Crafting Table</span>
        <button onClick={onClose} className="dw-crafting-close">✕</button>
      </div>

      <div className="dw-crafting-body">
        {grouped.map((cat) => (
          <div key={cat.key} className="dw-crafting-category">
            <div className="dw-crafting-cat-label">
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </div>
            <div className="dw-crafting-grid">
              {cat.recipes.map((recipe) => {
                const available = canCraft(recipe);
                const resultBlock = getBlockDef(recipe.result.blockId);
                return (
                  <button
                    key={recipe.id}
                    onClick={() => available && onCraft(recipe)}
                    className={`dw-crafting-recipe ${available ? "" : "disabled"}`}
                    title={recipe.name}
                  >
                    <div className="dw-crafting-recipe-icon">{recipe.icon}</div>
                    <div className="dw-crafting-recipe-name">{recipe.name}</div>
                    <div className="dw-crafting-recipe-ingredients">
                      {recipe.ingredients.map((ing, i) => {
                        const block = getBlockDef(ing.blockId);
                        const have = inventory[ing.blockId] || 0;
                        return (
                          <span key={i} className={`dw-crafting-ing ${have >= ing.count ? "has" : "needs"}`}>
                            {block.name.split(" ")[0]} {have}/{ing.count}
                          </span>
                        );
                      })}
                    </div>
                    {resultBlock && (
                      <div className="dw-crafting-result">
                        <div className="dw-crafting-result-color" style={{ background: resultBlock.color }} />
                        <span>×{recipe.result.count}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
