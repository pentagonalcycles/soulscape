"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_CARDS, MAJOR_ARCANA, CUPS, WANDS, SWORDS, PENTACLES } from "@/lib/tarot";
import type { TarotCard } from "@/lib/tarot";

type Context = "general" | "love" | "career" | "personal" | "decision" | "situation";

interface SelectedCard {
  card: TarotCard;
  reversed: boolean;
}

const CONTEXTS: { id: Context; label: string; icon: string }[] = [
  { id: "general", label: "General", icon: "✦" },
  { id: "love", label: "Love", icon: "💗" },
  { id: "career", label: "Career", icon: "💼" },
  { id: "personal", label: "Personal Growth", icon: "🌱" },
  { id: "decision", label: "Decision", icon: "⚖" },
  { id: "situation", label: "Situation", icon: "🔮" },
];

const SUIT_FILTERS = [
  { id: "all", label: "All Cards" },
  { id: "major", label: "Major Arcana" },
  { id: "cups", label: "Cups" },
  { id: "wands", label: "Wands" },
  { id: "swords", label: "Swords" },
  { id: "pentacles", label: "Pentacles" },
];

export default function ArcanaCompare({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<SelectedCard[]>([]);
  const [context, setContext] = useState<Context>("general");
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [suitFilter, setSuitFilter] = useState("all");
  const [showResult, setShowResult] = useState(false);

  const filteredCards = useMemo(() => {
    let cards = suitFilter === "major" ? MAJOR_ARCANA
      : suitFilter === "cups" ? CUPS
      : suitFilter === "wands" ? WANDS
      : suitFilter === "swords" ? SWORDS
      : suitFilter === "pentacles" ? PENTACLES
      : ALL_CARDS;

    if (search.trim()) {
      const q = search.toLowerCase();
      cards = cards.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.keywords.some(k => k.toLowerCase().includes(q))
      );
    }

    return cards;
  }, [suitFilter, search]);

  const addCard = (card: TarotCard) => {
    if (selected.length >= 5) return;
    if (selected.find(s => s.card.id === card.id)) return;
    setSelected([...selected, { card, reversed: false }]);
    setShowPicker(false);
    setSearch("");
  };

  const removeCard = (index: number) => {
    setSelected(selected.filter((_, i) => i !== index));
    setShowResult(false);
  };

  const toggleReversed = (index: number) => {
    const updated = [...selected];
    updated[index] = { ...updated[index], reversed: !updated[index].reversed };
    setSelected(updated);
    setShowResult(false);
  };

  const clearAll = () => {
    setSelected([]);
    setShowResult(false);
  };

  const surpriseMe = () => {
    const shuffled = [...ALL_CARDS].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, 2).map(card => ({
      card,
      reversed: Math.random() > 0.5,
    }));
    setSelected(picks);
    setShowResult(false);
  };

  const interpretation = useMemo(() => {
    if (selected.length < 2) return null;
    return generateInterpretation(selected, context);
  }, [selected, context]);

  const patterns = useMemo(() => {
    if (selected.length < 2) return [];
    return detectPatterns(selected);
  }, [selected]);

  const copyReading = () => {
    if (!interpretation) return;
    const lines = selected.map(s =>
      `${s.card.name}${s.reversed ? " (Reversed)" : ""} — ${s.reversed ? s.card.reversedMeaning : s.card.uprightMeaning}`
    );
    const text = `Arcana Compare\n\nCards:\n${lines.join("\n")}\n\nContext: ${context}\n\n${interpretation.together}\n\nKey Message: ${interpretation.keyMessage}\n\nReflection: ${interpretation.reflectionQuestion}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{
          padding: "6px 12px", borderRadius: 8,
          background: "rgba(168, 85, 247, 0.06)", border: "1px solid rgba(168, 85, 247, 0.12)",
          color: "#a78bfa", fontSize: 11, cursor: "pointer", fontFamily: "monospace",
        }}>← Back</button>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 300, color: "#e0f5e8", margin: 0, letterSpacing: "0.05em" }}>
            Arcana Compare
          </h2>
          <p style={{ fontSize: 12, color: "rgba(224, 245, 232, 0.45)", margin: "2px 0 0" }}>
            Choose two or more cards and explore what they reveal together.
          </p>
        </div>
      </div>

      {/* Selected Cards */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase" }}>
            Selected ({selected.length}/5)
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {selected.length > 0 && (
              <button onClick={clearAll} style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 10,
                background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)",
                color: "rgba(255, 255, 255, 0.4)", cursor: "pointer", fontFamily: "monospace",
              }}>Clear</button>
            )}
            <button onClick={surpriseMe} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 10,
              background: "rgba(168, 85, 247, 0.06)", border: "1px solid rgba(168, 85, 247, 0.12)",
              color: "#a78bfa", cursor: "pointer", fontFamily: "monospace",
            }}>✦ Surprise Me</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {selected.map((s, i) => (
            <motion.div
              key={s.card.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                width: 100, padding: "12px 8px", borderRadius: 10,
                background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(168, 85, 247, 0.15)",
                textAlign: "center", position: "relative",
              }}
            >
              <button onClick={() => removeCard(i)} style={{
                position: "absolute", top: 4, right: 4,
                width: 18, height: 18, borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.05)", border: "none",
                color: "rgba(255, 255, 255, 0.3)", fontSize: 10,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
              <div style={{
                fontSize: 24, marginBottom: 6,
                transform: s.reversed ? "rotate(180deg)" : "none",
                transition: "transform 0.3s",
              }}>
                {s.card.arcana === "major" ? "★" : getSuitIcon(s.card.suit)}
              </div>
              <div style={{
                fontSize: 10, color: "#e0f5e8", lineHeight: 1.3,
                minHeight: 28,
              }}>
                {s.card.name}
              </div>
              <button
                onClick={() => toggleReversed(i)}
                style={{
                  marginTop: 6, padding: "3px 8px", borderRadius: 4, fontSize: 9,
                  background: s.reversed ? "rgba(244, 114, 182, 0.12)" : "rgba(0, 255, 136, 0.06)",
                  border: `1px solid ${s.reversed ? "rgba(244, 114, 182, 0.25)" : "rgba(0, 255, 136, 0.12)"}`,
                  color: s.reversed ? "#f472b6" : "#00ff88",
                  cursor: "pointer", fontFamily: "monospace",
                }}
              >
                {s.reversed ? "Reversed" : "Upright"}
              </button>
            </motion.div>
          ))}

          {selected.length < 5 && (
            <button
              onClick={() => setShowPicker(true)}
              style={{
                width: 100, padding: "12px 8px", borderRadius: 10,
                background: "rgba(0, 255, 136, 0.03)", border: "1px dashed rgba(0, 255, 136, 0.15)",
                color: "rgba(0, 255, 136, 0.4)", fontSize: 24, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 4, transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0, 255, 136, 0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0, 255, 136, 0.15)"; }}
            >
              <span>+</span>
              <span style={{ fontSize: 9 }}>Add Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Context Selector */}
      {selected.length >= 2 && (
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            Context
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CONTEXTS.map(c => (
              <button
                key={c.id}
                onClick={() => { setContext(c.id); setShowResult(false); }}
                style={{
                  padding: "6px 12px", borderRadius: 8, fontSize: 11,
                  background: context === c.id ? "rgba(168, 85, 247, 0.12)" : "rgba(255, 255, 255, 0.02)",
                  border: `1px solid ${context === c.id ? "rgba(168, 85, 247, 0.3)" : "rgba(255, 255, 255, 0.06)"}`,
                  color: context === c.id ? "#c084fc" : "rgba(255, 255, 255, 0.4)",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compare Button */}
      {selected.length >= 2 && !showResult && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowResult(true)}
          style={{
            width: "100%", padding: "14px", borderRadius: 12, marginBottom: 20,
            background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(244, 114, 182, 0.1))",
            border: "1px solid rgba(168, 85, 247, 0.25)",
            color: "#c084fc", fontSize: 14, fontWeight: 500, cursor: "pointer",
            letterSpacing: "0.05em", transition: "all 0.3s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 20px rgba(168, 85, 247, 0.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
        >
          ✦ Compare Cards
        </motion.button>
      )}

      {/* Results */}
      <AnimatePresence>
        {showResult && interpretation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Individual Meanings */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase" }}>
                Individual Meanings
              </span>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                {selected.map(s => (
                  <div key={s.card.id} style={{
                    flex: "1 1 200px", padding: "12px 14px", borderRadius: 10,
                    background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(168, 85, 247, 0.08)",
                  }}>
                    <div style={{ fontSize: 12, color: "#c084fc", fontWeight: 500, marginBottom: 4 }}>
                      {s.card.name} {s.reversed && <span style={{ color: "#f472b6", fontSize: 10 }}>(Reversed)</span>}
                    </div>
                    <p style={{ fontSize: 11, color: "rgba(224, 245, 232, 0.6)", lineHeight: 1.5, margin: 0 }}>
                      {s.reversed ? s.card.reversedMeaning : s.card.uprightMeaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Patterns */}
            {patterns.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase" }}>
                  Patterns Detected
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {patterns.map((p, i) => (
                    <div key={i} style={{
                      padding: "10px 14px", borderRadius: 8,
                      background: "rgba(168, 85, 247, 0.04)", border: "1px solid rgba(168, 85, 247, 0.08)",
                      fontSize: 12, color: "rgba(224, 245, 232, 0.65)", lineHeight: 1.5,
                    }}>
                      <span style={{ color: "#c084fc", fontWeight: 500 }}>{p.title}:</span> {p.description}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Together */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase" }}>
                Together
              </span>
              <div style={{
                marginTop: 8, padding: "16px", borderRadius: 12,
                background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(168, 85, 247, 0.1)",
              }}>
                <p style={{ fontSize: 13, color: "#e0f5e8", lineHeight: 1.7, margin: 0 }}>
                  {interpretation.together}
                </p>
              </div>
            </div>

            {/* Key Message */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                padding: "16px", borderRadius: 12,
                background: "linear-gradient(135deg, rgba(168, 85, 247, 0.06), rgba(244, 114, 182, 0.04))",
                border: "1px solid rgba(168, 85, 247, 0.12)",
              }}>
                <span style={{ fontSize: 10, color: "#c084fc", letterSpacing: "2px", textTransform: "uppercase" }}>
                  Key Message
                </span>
                <p style={{ fontSize: 14, color: "#e0f5e8", lineHeight: 1.6, margin: "8px 0 0", fontWeight: 300 }}>
                  {interpretation.keyMessage}
                </p>
              </div>
            </div>

            {/* Reflection Question */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                padding: "14px 16px", borderRadius: 10,
                background: "rgba(0, 255, 136, 0.03)", border: "1px solid rgba(0, 255, 136, 0.08)",
              }}>
                <span style={{ fontSize: 10, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase" }}>
                  Reflection Question
                </span>
                <p style={{ fontSize: 13, color: "rgba(224, 245, 232, 0.7)", lineHeight: 1.6, margin: "6px 0 0", fontStyle: "italic" }}>
                  {interpretation.reflectionQuestion}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={copyReading} style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 11,
                background: "rgba(0, 255, 136, 0.06)", border: "1px solid rgba(0, 255, 136, 0.12)",
                color: "#00ff88", cursor: "pointer", fontFamily: "monospace",
              }}>Copy Reading</button>
              <button onClick={() => setShowResult(false)} style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 11,
                background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)",
                color: "rgba(255, 255, 255, 0.4)", cursor: "pointer", fontFamily: "monospace",
              }}>Change Cards</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 20,
            }}
            onClick={() => setShowPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 500, maxHeight: "80vh",
                background: "rgba(15, 25, 20, 0.98)", border: "1px solid rgba(168, 85, 247, 0.15)",
                borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column",
              }}
            >
              {/* Picker Header */}
              <div style={{
                padding: "16px", borderBottom: "1px solid rgba(168, 85, 247, 0.08)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 14, color: "#e0f5e8", fontWeight: 500 }}>Choose a Card</span>
                <button onClick={() => setShowPicker(false)} style={{
                  background: "none", border: "none", color: "rgba(255, 255, 255, 0.4)",
                  fontSize: 18, cursor: "pointer",
                }}>✕</button>
              </div>

              {/* Search */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(168, 85, 247, 0.06)" }}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search cards..."
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 8,
                    background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(168, 85, 247, 0.12)",
                    color: "#e0f5e8", fontSize: 13, outline: "none",
                  }}
                />
              </div>

              {/* Suit Filter */}
              <div style={{ padding: "8px 16px", display: "flex", gap: 4, overflowX: "auto", borderBottom: "1px solid rgba(168, 85, 247, 0.06)" }}>
                {SUIT_FILTERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSuitFilter(f.id)}
                    style={{
                      padding: "5px 10px", borderRadius: 6, fontSize: 10, whiteSpace: "nowrap",
                      background: suitFilter === f.id ? "rgba(168, 85, 247, 0.12)" : "transparent",
                      border: `1px solid ${suitFilter === f.id ? "rgba(168, 85, 247, 0.25)" : "rgba(255, 255, 255, 0.06)"}`,
                      color: suitFilter === f.id ? "#c084fc" : "rgba(255, 255, 255, 0.35)",
                      cursor: "pointer", fontFamily: "monospace",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Card List */}
              <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                {filteredCards.map(card => {
                  const isSelected = selected.find(s => s.card.id === card.id);
                  return (
                    <button
                      key={card.id}
                      onClick={() => !isSelected && addCard(card)}
                      disabled={!!isSelected}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "10px 12px", borderRadius: 8,
                        background: isSelected ? "rgba(168, 85, 247, 0.06)" : "transparent",
                        border: "none", cursor: isSelected ? "default" : "pointer",
                        opacity: isSelected ? 0.4 : 1, transition: "all 0.15s",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(168, 85, 247, 0.06)"; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>
                        {card.arcana === "major" ? "★" : getSuitIcon(card.suit)}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: "#e0f5e8" }}>{card.name}</div>
                        <div style={{ fontSize: 10, color: "rgba(224, 245, 232, 0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {card.keywords.slice(0, 3).join(" · ")}
                        </div>
                      </div>
                      {isSelected && (
                        <span style={{ fontSize: 10, color: "#a855f7" }}>Selected</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getSuitIcon(suit?: string): string {
  switch (suit) {
    case "cups": return "🏆";
    case "wands": return "🪄";
    case "swords": return "⚔";
    case "pentacles": return "⭐";
    default: return "★";
  }
}

interface Pattern {
  title: string;
  description: string;
}

function detectPatterns(cards: SelectedCard[]): Pattern[] {
  const patterns: Pattern[] = [];

  const majorCount = cards.filter(c => c.card.arcana === "major").length;
  if (majorCount >= 2) {
    patterns.push({
      title: "Multiple Major Arcana",
      description: `${majorCount} Major Arcana cards suggest significant life themes and deeper forces at work. These are not small matters — the cards point to meaningful transformation.`,
    });
  }

  const suitCounts: Record<string, number> = {};
  cards.forEach(c => {
    if (c.card.suit) {
      suitCounts[c.card.suit] = (suitCounts[c.card.suit] || 0) + 1;
    }
  });

  const suitNames: Record<string, string> = {
    cups: "Cups (emotions, relationships, intuition)",
    wands: "Wands (passion, creativity, action)",
    swords: "Swords (thought, communication, conflict)",
    pentacles: "Pentacles (material, career, stability)",
  };

  Object.entries(suitCounts).forEach(([suit, count]) => {
    if (count >= 2) {
      patterns.push({
        title: `Multiple ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
        description: `${count} ${suitNames[suit]} cards. The energy of ${suit} is strong in this reading.`,
      });
    }
  });

  const reversedCount = cards.filter(c => c.reversed).length;
  if (reversedCount >= 2) {
    patterns.push({
      title: "Strong Reversal Pattern",
      description: `${reversedCount} of ${cards.length} cards are reversed. This suggests internalized energy, blocked expression, or a need to look inward rather than outward.`,
    });
  }

  const numbers = cards.filter(c => c.card.number !== null).map(c => c.card.number!);
  const numberCounts: Record<number, number> = {};
  numbers.forEach(n => { numberCounts[n] = (numberCounts[n] || 0) + 1; });
  Object.entries(numberCounts).forEach(([num, count]) => {
    if (count >= 2) {
      const numMeanings: Record<number, string> = {
        1: "new beginnings and potential",
        2: "balance, duality, and partnership",
        3: "creativity, growth, and expression",
        4: "stability, structure, and foundation",
        5: "change, conflict, and challenge",
        6: "harmony, responsibility, and adjustment",
        7: "reflection, assessment, and inner work",
        8: "movement, mastery, and accomplishment",
        9: "completion, fulfillment, and transition",
        10: "culmination, ending, and new cycles",
      };
      patterns.push({
        title: `Repeated Number: ${num}`,
        description: `The number ${num} appears ${count} times, pointing to themes of ${numMeanings[num] || "cycles and patterns"}.`,
      });
    }
  });

  const courtCount = cards.filter(c => c.card.number !== null && c.card.number! >= 11).length;
  if (courtCount >= 2) {
    patterns.push({
      title: "Court Card Energy",
      description: `${courtCount} court cards suggest strong personality dynamics, interpersonal themes, or different aspects of yourself at play.`,
    });
  }

  return patterns;
}

function generateInterpretation(cards: SelectedCard[], context: Context) {
  const cardNames = cards.map(c => `${c.card.name}${c.reversed ? " (Reversed)" : ""}`).join(" + ");

  let together = "";
  let keyMessage = "";
  let reflectionQuestion = "";

  const majorCards = cards.filter(c => c.card.arcana === "major");
  const minorCards = cards.filter(c => c.card.arcana === "minor");
  const reversedCards = cards.filter(c => c.reversed);

  // Generate contextual meanings
  const getContextMeaning = (card: TarotCard, ctx: Context, isReversed: boolean): string => {
    const prefix = isReversed ? "In reverse, " : "";
    switch (ctx) {
      case "love":
        return prefix + (isReversed
          ? `love may feel blocked or imbalanced. ${card.love}`
          : card.love);
      case "career":
        return prefix + (isReversed
          ? `professional challenges or setbacks. ${card.career}`
          : card.career);
      case "personal":
        return prefix + (isReversed
          ? `inner resistance or blocked growth. ${card.personalGrowth}`
          : card.personalGrowth);
      case "decision":
        return prefix + (isReversed
          ? `uncertainty or fear around this choice. Consider what holds you back.`
          : `clarity and direction for this decision. Move with intention.`);
      case "situation":
        return prefix + (isReversed
          ? `hidden dynamics or unresolved aspects of this situation.`
          : `the current energy and trajectory of this situation.`);
      default:
        return prefix + (isReversed ? card.reversedMeaning : card.uprightMeaning);
    }
  };

  if (cards.length === 2) {
    const [a, b] = cards;
    const themesA = a.card.keywords;
    const themesB = b.card.keywords;
    const shared = themesA.filter(t => themesB.includes(t));

    together = `${a.card.name}${a.reversed ? " (Reversed)" : ""} meets ${b.card.name}${b.reversed ? " (Reversed)" : ""}. `;

    if (shared.length > 0) {
      together += `Both cards share themes of ${shared.join(", ")}, suggesting these energies are particularly strong. `;
    }

    if (a.card.arcana === "major" && b.card.arcana === "major") {
      together += `Two Major Arcana cards indicate powerful, fateful forces at work. This is not a coincidence — pay attention. `;
    }

    if (a.reversed && !b.reversed) {
      together += `The first card is reversed while the second is upright, suggesting movement from internal struggle toward outward expression. `;
    } else if (!a.reversed && b.reversed) {
      together += `The first card is upright while the second is reversed, suggesting initial clarity that turns inward or becomes blocked. `;
    }

    together += getContextMeaning(a.card, context, a.reversed) + " " + getContextMeaning(b.card, context, b.reversed);

    keyMessage = generateKeyMessage(cards, context);
    reflectionQuestion = generateReflectionQuestion(cards, context);

  } else if (cards.length >= 3) {
    together = `This spread of ${cards.length} cards reveals a journey. `;

    if (majorCards.length >= 2) {
      together += `With ${majorCards.length} Major Arcana cards, the forces at play are significant and transformative. `;
    }

    // Describe the arc
    together += `Moving from ${cards[0].card.name} through to ${cards[cards.length - 1].card.name}, `;
    if (reversedCards.length > 0) {
      together += `with ${reversedCards.length} reversed card${reversedCards.length > 1 ? "s" : ""} indicating internalized or blocked energies, `;
    }
    together += `the cards tell a story of evolution and change. `;

    // Context-specific
    const contextMeanings = cards.map(c => getContextMeaning(c.card, context, c.reversed));
    together += contextMeanings.join(" ");

    keyMessage = generateKeyMessage(cards, context);
    reflectionQuestion = generateReflectionQuestion(cards, context);
  }

  return { together, keyMessage, reflectionQuestion, context };
}

function generateKeyMessage(cards: SelectedCard[], context: Context): string {
  const reversedCount = cards.filter(c => c.reversed).length;
  const majorCount = cards.filter(c => c.card.arcana === "major").length;

  if (majorCount >= 2) {
    return "The cards point to significant transformation. Trust the process even when it feels uncertain.";
  }
  if (reversedCount > cards.length / 2) {
    return "Look inward. The answers you seek are not outside — they are within.";
  }
  if (context === "love") {
    return "Love asks for honesty — with yourself first, then with others.";
  }
  if (context === "career") {
    return "Your path forward requires both patience and decisive action. Know when for each.";
  }
  if (context === "decision") {
    return "Neither choice is wrong. The question is which one aligns with who you are becoming.";
  }

  return "The cards reflect where you are. What you do next is always your choice.";
}

function generateReflectionQuestion(cards: SelectedCard[], context: Context): string {
  const questions = [
    "What are you being asked to release before something calmer can take its place?",
    "Which part of this message do you resist most — and why?",
    "If these cards could speak in one sentence, what would they say to you?",
    "What pattern in your life does this combination mirror?",
    "Where in your life are you holding on too tightly?",
    "What would change if you trusted this message fully?",
    "Which card feels most uncomfortable — and what does that tell you?",
    "How would you advise a friend who received this reading?",
  ];

  return questions[Math.floor(Math.random() * questions.length)];
}
