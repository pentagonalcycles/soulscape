"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import ArcanaCompare from "./ArcanaCompare";
import ReadingStory from "./ReadingStory";
import {
  ALL_CARDS,
  MAJOR_ARCANA,
  CUPS,
  WANDS,
  SWORDS,
  PENTACLES,
  SPREADS,
  shuffleDeck,
  drawCards,
  getDailyCard,
  getCardOfWeek,
  getCardOfMonth,
  searchCards,
  getCombinationInterpretation,
} from "@/lib/tarot";
import type { TarotCard, DrawnCard, SpreadDefinition } from "@/lib/tarot";

type TarotSection = "home" | "daily" | "ask" | "spreads" | "explore" | "learn" | "readings" | "reading-result" | "card-detail" | "compare" | "reading-story";

interface SavedReading {
  id: string;
  question: string;
  spread_id: string;
  spread_name: string;
  cards: { cardId: string; reversed: boolean; position: string }[];
  interpretation: string;
  notes: string;
  created_at: string;
}

const SUIT_SYMBOLS: Record<string, string> = {
  cups: "☽",
  wands: "✧",
  swords: "◇",
  pentacles: "◈",
};

const MAJOR_SYMBOLS: Record<number, string> = {
  0: "○", 1: "∞", 2: "☽", 3: "❋", 4: "△", 5: "⬡", 6: "♡", 7: "⊕",
  8: "🦁", 9: "☆", 10: "⊗", 11: "⚖", 12: "↻", 13: "☠", 14: "⟷", 15: "⚿",
  16: "⚡", 17: "✦", 18: "◑", 19: "☀", 20: "♬", 21: "◉",
};

function TarotCardVisual({ card, reversed, size = "md", onClick, selected, flipping, faceDown }: {
  card: TarotCard;
  reversed?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  selected?: boolean;
  flipping?: boolean;
  faceDown?: boolean;
}) {
  const [isRevealed, setIsRevealed] = useState(faceDown ? false : false);
  const dims = size === "sm" ? { w: 80, h: 120 } : size === "lg" ? { w: 180, h: 270 } : { w: 120, h: 180 };
  const symbol = card.arcana === "major"
    ? MAJOR_SYMBOLS[card.number || 0] || "✦"
    : SUIT_SYMBOLS[card.suit || ""] || "◈";

  useEffect(() => {
    if (faceDown) {
      setIsRevealed(false);
    } else if (flipping) {
      const timer = setTimeout(() => setIsRevealed(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsRevealed(true);
    }
  }, [flipping, faceDown]);

  return (
    <motion.div
      onClick={onClick}
      style={{
        width: dims.w,
        height: dims.h,
        cursor: onClick ? "pointer" : "default",
        perspective: 1000,
        flexShrink: 0,
      }}
      whileHover={onClick ? { scale: 1.05, y: -4 } : undefined}
      animate={selected ? { scale: 1.08, y: -8 } : { scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateY: isRevealed ? 0 : 180 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Card front */}
        <div style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          borderRadius: size === "sm" ? 8 : 12,
          background: "linear-gradient(145deg, rgba(20, 40, 80, 0.95), rgba(30, 55, 100, 0.95))",
          border: `1px solid ${selected ? "rgba(168, 85, 247, 0.5)" : "rgba(168, 85, 247, 0.15)"}`,
          boxShadow: selected
            ? "0 0 30px rgba(168, 85, 247, 0.2), inset 0 0 20px rgba(168, 85, 247, 0.05)"
            : "0 4px 20px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: size === "sm" ? "6px" : size === "lg" ? "20px" : "12px",
          transform: reversed ? "rotate(180deg)" : "none",
          overflow: "hidden",
        }}>
          {/* Top corner accent */}
          <div style={{
            position: "absolute",
            top: -1,
            left: -1,
            width: size === "sm" ? 12 : 20,
            height: size === "sm" ? 1 : 2,
            background: "linear-gradient(90deg, #a855f7, transparent)",
          }} />
          <div style={{
            position: "absolute",
            top: -1,
            left: -1,
            width: size === "sm" ? 1 : 2,
            height: size === "sm" ? 12 : 20,
            background: "linear-gradient(180deg, #a855f7, transparent)",
          }} />
          {/* Bottom corner accent */}
          <div style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: size === "sm" ? 12 : 20,
            height: size === "sm" ? 1 : 2,
            background: "linear-gradient(270deg, #a855f7, transparent)",
          }} />
          <div style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: size === "sm" ? 1 : 2,
            height: size === "sm" ? 12 : 20,
            background: "linear-gradient(0deg, #a855f7, transparent)",
          }} />

          {/* Symbol */}
          <div style={{
            fontSize: size === "sm" ? "20px" : size === "lg" ? "48px" : "32px",
            marginBottom: size === "sm" ? 2 : 8,
            opacity: 0.9,
            filter: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.3))",
          }}>
            {symbol}
          </div>

          {/* Card name */}
          <div style={{
            fontSize: size === "sm" ? "7px" : size === "lg" ? "13px" : "10px",
            color: "#e0f5e8",
            textAlign: "center",
            fontFamily: "var(--font-heading, inherit)",
            letterSpacing: "1px",
            textTransform: "uppercase",
            lineHeight: 1.3,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: size === "sm" ? 2 : 3,
            WebkitBoxOrient: "vertical",
          }}>
            {card.name}
          </div>

          {/* Number */}
          {card.number !== null && (
            <div style={{
              fontSize: size === "sm" ? "6px" : "8px",
              color: "rgba(168, 85, 247, 0.4)",
              marginTop: size === "sm" ? 1 : 4,
              fontFamily: "monospace",
            }}>
              {card.arcana === "major" ? `— ${card.number} —` : card.number}
            </div>
          )}

          {/* Reversed indicator */}
          {reversed && (
            <div style={{
              position: "absolute",
              top: size === "sm" ? 4 : 8,
              right: size === "sm" ? 4 : 8,
              fontSize: size === "sm" ? "6px" : "8px",
              color: "rgba(255, 136, 136, 0.7)",
              fontFamily: "monospace",
              letterSpacing: "1px",
            }}>
              REV
            </div>
          )}
        </div>

        {/* Card back */}
        <div style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          borderRadius: size === "sm" ? 8 : 12,
          background: "linear-gradient(145deg, #0a2a2a, #0d3d3d)",
          border: "1px solid rgba(0, 212, 170, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}>
          {/* Animated color shift background */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, #0a2a2a, #1a0a3a, #0a2a3a, #2a0a2a, #0a3a2a)",
            backgroundSize: "400% 400%",
            animation: "cardColorShift 8s ease infinite",
            opacity: 0.8,
          }} />
          {/* Decorative pattern */}
          <div style={{
            position: "absolute",
            inset: 0,
            opacity: 0.2,
            background: `
              radial-gradient(circle at 25% 25%, rgba(0, 212, 170, 0.4) 0%, transparent 30%),
              radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.4) 0%, transparent 30%),
              radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 40%)
            `,
            animation: "cardGlowShift 6s ease infinite",
          }} />
          {/* Inner border */}
          <div style={{
            width: "75%",
            height: "85%",
            border: "1px solid rgba(0, 212, 170, 0.2)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}>
            {/* Corner dots */}
            <div style={{ position: "absolute", top: 4, left: 4, width: 4, height: 4, borderRadius: "50%", background: "rgba(0, 212, 170, 0.4)" }} />
            <div style={{ position: "absolute", top: 4, right: 4, width: 4, height: 4, borderRadius: "50%", background: "rgba(0, 212, 170, 0.4)" }} />
            <div style={{ position: "absolute", bottom: 4, left: 4, width: 4, height: 4, borderRadius: "50%", background: "rgba(0, 212, 170, 0.4)" }} />
            <div style={{ position: "absolute", bottom: 4, right: 4, width: 4, height: 4, borderRadius: "50%", background: "rgba(0, 212, 170, 0.4)" }} />
            {/* Center symbol */}
            <div style={{
              fontSize: size === "sm" ? "18px" : size === "lg" ? "40px" : "28px",
              opacity: 0.6,
              textShadow: "0 0 10px rgba(0, 212, 170, 0.4)",
            }}>
              ✦
            </div>
            {/* Cross lines */}
            <div style={{ position: "absolute", top: "50%", left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.2), transparent)" }} />
            <div style={{ position: "absolute", left: "50%", top: "15%", bottom: "15%", width: "1px", background: "linear-gradient(180deg, transparent, rgba(0, 212, 170, 0.2), transparent)" }} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CardMeaningPanel({ card, reversed, onClose }: { card: TarotCard; reversed: boolean; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        background: "rgba(3, 7, 18, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: 16,
        border: "1px solid rgba(168, 85, 247, 0.15)",
        padding: 24,
        maxWidth: 500,
        width: "100%",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: "#e0f5e8", margin: 0, letterSpacing: "2px", textTransform: "uppercase" }}>
            {card.name}
          </h3>
          <div style={{ fontSize: 11, color: "rgba(168, 85, 247, 0.5)", marginTop: 4, fontFamily: "monospace" }}>
            {card.arcana === "major" ? "Major Arcana" : `${card.suit?.charAt(0).toUpperCase()}${card.suit?.slice(1)} · Minor Arcana`}
            {reversed && " · Reversed"}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: "rgba(168, 85, 247, 0.08)",
          border: "1px solid rgba(168, 85, 247, 0.15)",
          color: "#475569",
          fontSize: 14,
          width: 28,
          height: 28,
          borderRadius: 6,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>✕</button>
      </div>

      {/* Keywords */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {card.keywords.map(k => (
          <span key={k} style={{
            padding: "4px 10px",
            borderRadius: 4,
            background: "rgba(168, 85, 247, 0.06)",
            border: "1px solid rgba(168, 85, 247, 0.12)",
            fontSize: 10,
            color: "rgba(168, 85, 247, 0.7)",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}>{k}</span>
        ))}
      </div>

      {/* Meaning */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>
          {reversed ? "Reversed Meaning" : "Upright Meaning"}
        </div>
        <p style={{ fontSize: 13, color: "#cce8d8", lineHeight: 1.6, margin: 0 }}>
          {reversed ? card.reversedMeaning : card.uprightMeaning}
        </p>
      </div>

      {/* Symbolism */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>Symbolism</div>
        <p style={{ fontSize: 13, color: "#90c8a0", lineHeight: 1.6, margin: 0 }}>{card.symbolism}</p>
      </div>

      {/* Love */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>☽ Love</div>
        <p style={{ fontSize: 13, color: "#cce8d8", lineHeight: 1.6, margin: 0 }}>{card.love}</p>
      </div>

      {/* Career */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>◈ Career</div>
        <p style={{ fontSize: 13, color: "#cce8d8", lineHeight: 1.6, margin: 0 }}>{card.career}</p>
      </div>

      {/* Personal Growth */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>✦ Personal Growth</div>
        <p style={{ fontSize: 13, color: "#cce8d8", lineHeight: 1.6, margin: 0 }}>{card.personalGrowth}</p>
      </div>

      {/* Reflection */}
      <div style={{
        padding: "12px 16px",
        borderRadius: 8,
        background: "rgba(168, 85, 247, 0.04)",
        border: "1px solid rgba(168, 85, 247, 0.1)",
      }}>
        <div style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>Reflection</div>
        <p style={{ fontSize: 13, color: "#e0f5e8", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
          {card.reflectionQuestion}
        </p>
      </div>
    </motion.div>
  );
}

export default function TarotPage() {
  const { userId, loading: authLoading } = useAuth();
  const [section, setSection] = useState<TarotSection>("home");
  const [allowReversed, setAllowReversed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("tarot-reversed") !== "false";
  });
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [selectedCardReversed, setSelectedCardReversed] = useState(false);
  const [drawnCards, setDrawnCards] = useState<{ card: TarotCard; reversed: boolean; position: string }[]>([]);
  const [activeSpread, setActiveSpread] = useState<SpreadDefinition | null>(null);
  const [question, setQuestion] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TarotCard[]>([]);
  const [exploreSuit, setExploreSuit] = useState<string>("major");
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [readingNotes, setReadingNotes] = useState("");
  const [customPositions, setCustomPositions] = useState<string[]>(["", "", ""]);
  const [customSpreadName, setCustomSpreadName] = useState("");
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [shufflePhase, setShufflePhase] = useState<"idle" | "shuffling" | "ready" | "drawing">("idle");
  const [deck, setDeck] = useState<TarotCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const shuffleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleReversed = useCallback(() => {
    setAllowReversed(prev => {
      const next = !prev;
      localStorage.setItem("tarot-reversed", String(next));
      return next;
    });
  }, []);

  const loadReadings = useCallback(async () => {
    if (!userId) return;
    const client = supabase();
    const { data } = await client
      .from("tarot_readings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setSavedReadings(data as SavedReading[]);
  }, [userId]);

  const loadFavourites = useCallback(async () => {
    if (!userId) return;
    const client = supabase();
    const { data } = await client
      .from("tarot_favourites")
      .select("item_type, item_id")
      .eq("user_id", userId);
    if (data) {
      setFavourites(new Set(data.map((f: { item_type: string; item_id: string }) => `${f.item_type}:${f.item_id}`)));
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadReadings();
      loadFavourites();
    }
  }, [userId, loadReadings, loadFavourites]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(searchCards(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const startShuffle = useCallback((spread: SpreadDefinition, q: string) => {
    setActiveSpread(spread);
    setQuestion(q);
    setDrawnCards([]);
    setSelectedCards([]);
    setShufflePhase("shuffling");
    setDeck(shuffleDeck(ALL_CARDS));
    setSection("ask");

    shuffleTimer.current = setTimeout(() => {
      setShufflePhase("ready");
    }, 1500);
  }, []);

  const selectCard = useCallback((index: number) => {
    if (shufflePhase !== "ready" || !activeSpread) return;
    if (selectedCards.length >= activeSpread.positions.length) return;
    if (selectedCards.includes(index)) return;

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    const card = deck[index];
    const reversed = allowReversed ? Math.random() > 0.5 : false;
    const position = activeSpread.positions[newSelected.length - 1];

    setDrawnCards(prev => [...prev, { card, reversed, position }]);

    if (newSelected.length === activeSpread.positions.length) {
      setShufflePhase("idle");
    }
  }, [shufflePhase, activeSpread, selectedCards, deck, allowReversed]);

  const startReading = useCallback((spread: SpreadDefinition) => {
    if (spread.positions.length === 1) {
      startShuffle(spread, question || "Daily guidance");
    } else {
      setSection("ask");
      setActiveSpread(spread);
    }
  }, [question, startShuffle]);

  const saveReading = useCallback(async () => {
    if (!userId || !activeSpread || drawnCards.length === 0) return;
    const client = supabase();
    const reading = {
      user_id: userId,
      question: question || null,
      spread_id: activeSpread.id,
      spread_name: activeSpread.name,
      cards: drawnCards.map(dc => ({
        cardId: dc.card.id,
        reversed: dc.reversed,
        position: dc.position,
      })),
      interpretation: generateInterpretation(drawnCards, activeSpread),
      notes: readingNotes,
    };
    const { data, error } = await client.from("tarot_readings").insert(reading).select().single();
    if (!error && data) {
      setSavedReadings(prev => [data as SavedReading, ...prev]);
      setReadingNotes("");
    }
  }, [userId, activeSpread, drawnCards, question, readingNotes]);

  const deleteReading = useCallback(async (id: string) => {
    if (!userId) return;
    const client = supabase();
    await client.from("tarot_readings").delete().eq("id", id).eq("user_id", userId);
    setSavedReadings(prev => prev.filter(r => r.id !== id));
  }, [userId]);

  const toggleFavourite = useCallback(async (type: string, id: string) => {
    if (!userId) return;
    const key = `${type}:${id}`;
    const client = supabase();
    if (favourites.has(key)) {
      await client.from("tarot_favourites").delete().eq("user_id", userId).eq("item_type", type).eq("item_id", id);
      setFavourites(prev => { const n = new Set(prev); n.delete(key); return n; });
    } else {
      await client.from("tarot_favourites").insert({ user_id: userId, item_type: type, item_id: id });
      setFavourites(prev => new Set(prev).add(key));
    }
  }, [userId, favourites]);

  const dailyCard = getDailyCard();
  const cardOfWeek = getCardOfWeek();
  const cardOfMonth = getCardOfMonth();

  const glassStyle = {
    background: "rgba(31, 56, 40, 0.75)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(168, 85, 247, 0.08)",
    borderRadius: 16,
    padding: 24,
  };

  const sectionTitle = {
    fontSize: 14,
    fontWeight: 600,
    color: "#a855f7",
    letterSpacing: "3px",
    textTransform: "uppercase" as const,
    marginBottom: 16,
    fontFamily: "monospace",
  };

  if (authLoading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(168, 85, 247, 0.5)", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", fontFamily: "monospace" }}>
          Loading Arcana...
        </div>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "transparent",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Magical ambient orbs */}
      <div style={{
        position: "fixed", top: "-20%", left: "-10%", width: 700, height: 700,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", right: "-10%", width: 600, height: 600,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
        filter: "blur(70px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", top: "40%", left: "60%", width: 500, height: 500,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", top: "60%", left: "20%", width: 450, height: 450,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)",
        filter: "blur(50px)", pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 20px 60px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        {section === "home" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 style={{
              fontSize: 36,
              fontWeight: 100,
              letterSpacing: "16px",
              textTransform: "uppercase",
              background: "linear-gradient(135deg, #a855f7, #9333ea, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: "0 0 12px",
              textAlign: "center",
            }}>
              ARCANA
            </h1>
            <p style={{
              fontSize: 13,
              color: "rgba(240, 255, 245, 0.65)",
              textAlign: "center",
              margin: "0 0 48px",
              lineHeight: 1.6,
            }}>
              A place to draw, reflect, question and explore the cards.
            </p>

            {/* Reversed toggle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
              <button onClick={toggleReversed} style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid rgba(168, 85, 247, 0.15)",
                background: allowReversed ? "rgba(168, 85, 247, 0.08)" : "transparent",
                color: allowReversed ? "#a855f7" : "rgba(168, 85, 247, 0.4)",
                fontSize: 10,
                cursor: "pointer",
                fontFamily: "monospace",
                letterSpacing: "1px",
                textTransform: "uppercase",
                transition: "all 0.2s",
              }}>
                {allowReversed ? "☽ Upright + Reversed" : "◇ Upright Only"}
              </button>
            </div>

            {/* Card of the Week & Month */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
              <div style={{ ...glassStyle, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "rgba(168, 85, 247, 0.5)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 12 }}>Card of the Week</div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <TarotCardVisual card={cardOfWeek.card} reversed={cardOfWeek.reversed} size="sm" onClick={() => { setSelectedCard(cardOfWeek.card); setSelectedCardReversed(cardOfWeek.reversed); setSection("card-detail"); }} />
                </div>
                <div style={{ fontSize: 11, color: "#cce8d8" }}>{cardOfWeek.card.name}{cardOfWeek.reversed ? " (Reversed)" : ""}</div>
              </div>
              <div style={{ ...glassStyle, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "rgba(168, 85, 247, 0.5)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 12 }}>Card of the Month</div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <TarotCardVisual card={cardOfMonth.card} reversed={cardOfMonth.reversed} size="sm" onClick={() => { setSelectedCard(cardOfMonth.card); setSelectedCardReversed(cardOfMonth.reversed); setSection("card-detail"); }} />
                </div>
                <div style={{ fontSize: 11, color: "#cce8d8" }}>{cardOfMonth.card.name}{cardOfMonth.reversed ? " (Reversed)" : ""}</div>
              </div>
            </div>

            {/* Main options */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { id: "daily" as TarotSection, icon: "☀", label: "Daily Card", desc: "Draw today&apos;s guidance" },
                { id: "ask" as TarotSection, icon: "☽", label: "Ask the Cards", desc: "Type your question" },
                { id: "spreads" as TarotSection, icon: "⬡", label: "Tarot Spreads", desc: "Choose a layout" },
                { id: "explore" as TarotSection, icon: "☆", label: "Explore the Deck", desc: "Browse all 78 cards" },
                { id: "learn" as TarotSection, icon: "📖", label: "Learn Tarot", desc: "Beginner guide" },
                { id: "readings" as TarotSection, icon: "◇", label: "My Readings", desc: "Your saved readings" },
                { id: "compare" as TarotSection, icon: "⚖", label: "Arcana Compare", desc: "Explore cards together" },
              ].map(opt => (
                <motion.button
                  key={opt.id}
                  onClick={() => {
                    if (opt.id === "daily") {
                      startReading(SPREADS[0]);
                    } else {
                      setSection(opt.id);
                    }
                  }}
                  style={{
                    ...glassStyle,
                    cursor: "pointer",
                    textAlign: "center",
                    padding: "24px 16px",
                    transition: "all 0.3s",
                  }}
                  whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{opt.icon}</div>
                  <div style={{ fontSize: 12, color: "#e0f5e8", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>{opt.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(240, 255, 245, 0.65)" }}>{opt.desc}</div>
                </motion.button>
              ))}
            </div>

            {/* Disclaimer */}
            {showDisclaimer && (
              <div style={{
                marginTop: 48,
                padding: "12px 16px",
                borderRadius: 8,
                background: "rgba(168, 85, 247, 0.02)",
                border: "1px solid rgba(168, 85, 247, 0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}>
                <p style={{ fontSize: 10, color: "rgba(240, 255, 245, 0.6)", margin: 0, lineHeight: 1.5 }}>
                  Tarot in Elovayne is designed for reflection, creativity and personal exploration. It should not be treated as guaranteed prediction or as professional medical, legal or financial advice.
                </p>
                <button onClick={() => setShowDisclaimer(false)} style={{
                  background: "none", border: "none", color: "rgba(168, 85, 247, 0.3)",
                  cursor: "pointer", fontSize: 12, flexShrink: 0,
                }}>✕</button>
              </div>
            )}
          </motion.div>
        )}

        {/* Card Detail View */}
        {section === "card-detail" && selectedCard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => setSection("home")} style={{
              fontSize: 10, color: "rgba(168, 85, 247, 0.5)", background: "none", border: "none",
              cursor: "pointer", marginBottom: 24, fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase",
            }}>← Back</button>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <AnimatePresence>
                <CardMeaningPanel card={selectedCard} reversed={selectedCardReversed} onClose={() => setSection("home")} />
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Ask the Cards */}
        {section === "ask" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => { setSection("home"); setShufflePhase("idle"); setDrawnCards([]); setSelectedCards([]); }} style={{
              fontSize: 10, color: "rgba(168, 85, 247, 0.5)", background: "none", border: "none",
              cursor: "pointer", marginBottom: 24, fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase",
            }}>← Back</button>

            {!activeSpread ? (
              <>
                <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18, marginBottom: 24 }}>Ask the Cards</h2>
                <div style={{ ...glassStyle, maxWidth: 500, margin: "0 auto 24px" }}>
                  <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="What would you like to ask?"
                    style={{
                      width: "100%",
                      background: "rgba(168, 85, 247, 0.04)",
                      border: "1px solid rgba(168, 85, 247, 0.15)",
                      borderRadius: 8,
                      padding: "12px 16px",
                      color: "#e0f5e8",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, maxWidth: 500, margin: "0 auto" }}>
                  {SPREADS.filter(s => s.positions.length <= 5).map(spread => (
                    <button key={spread.id} onClick={() => startShuffle(spread, question)} style={{
                      ...glassStyle,
                      cursor: "pointer",
                      textAlign: "left",
                      padding: "16px",
                    }}>
                      <div style={{ fontSize: 12, color: "#e0f5e8", fontWeight: 600, marginBottom: 4 }}>{spread.name}</div>
                      <div style={{ fontSize: 10, color: "rgba(240, 255, 245, 0.65)" }}>{spread.positions.length} card{spread.positions.length > 1 ? "s" : ""}</div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 style={{ ...sectionTitle, textAlign: "center" }}>{activeSpread.name}</h2>
                {question && (
                  <p style={{ textAlign: "center", fontSize: 13, color: "#cce8d8", margin: "0 0 24px", fontStyle: "italic" }}>
                    &ldquo;{question}&rdquo;
                  </p>
                )}

                {/* Shuffle phase */}
                {shufflePhase === "shuffling" && (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 3, -3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ fontSize: 48, marginBottom: 16 }}
                    >
                      ✦
                    </motion.div>
                    <div style={{ fontSize: 11, color: "rgba(168, 85, 247, 0.5)", fontFamily: "monospace", letterSpacing: "2px" }}>
                      SHUFFLING...
                    </div>
                  </div>
                )}

                {/* Card selection */}
                {shufflePhase === "ready" && (
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{ fontSize: 11, color: "rgba(168, 85, 247, 0.5)", fontFamily: "monospace", letterSpacing: "2px", marginBottom: 16 }}>
                      CHOOSE {activeSpread.positions.length} CARD{activeSpread.positions.length > 1 ? "S" : ""}
                    </div>
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: 8,
                      maxHeight: 300,
                      overflowY: "auto",
                      padding: "0 10px",
                    }}>
                      {deck.slice(0, 22).map((card, i) => (
                        <TarotCardVisual
                          key={card.id}
                          card={card}
                          size="sm"
                          selected={selectedCards.includes(i)}
                          faceDown={!selectedCards.includes(i)}
                          onClick={() => selectCard(i)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Drawn cards */}
                {drawnCards.length > 0 && (
                  <div style={{ ...glassStyle, maxWidth: 700, margin: "0 auto" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, marginBottom: 24 }}>
                      {drawnCards.map((dc, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                          <TarotCardVisual card={dc.card} reversed={dc.reversed} flipping />
                          <div style={{ fontSize: 10, color: "rgba(168, 85, 247, 0.6)", marginTop: 8, letterSpacing: "1px", textTransform: "uppercase" }}>
                            {dc.position}
                          </div>
                          <button onClick={() => { setSelectedCard(dc.card); setSelectedCardReversed(dc.reversed); setSection("card-detail"); }} style={{
                            fontSize: 9, color: "rgba(168, 85, 247, 0.4)", background: "none", border: "none",
                            cursor: "pointer", marginTop: 4, fontFamily: "monospace",
                          }}>
                            {dc.card.name}{dc.reversed ? " (R)" : ""}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Interpretation */}
                    {drawnCards.length === activeSpread.positions.length && (
                      <>
                        <div style={{ borderTop: "1px solid rgba(168, 85, 247, 0.08)", paddingTop: 20 }}>
                          <div style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>Interpretation</div>
                          <p style={{ fontSize: 13, color: "#cce8d8", lineHeight: 1.7, margin: "0 0 16px" }}>
                            {generateInterpretation(drawnCards, activeSpread)}
                          </p>

                          {/* Card combinations */}
                          {drawnCards.length >= 2 && (
                            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 8, background: "rgba(168, 85, 247, 0.03)", border: "1px solid rgba(168, 85, 247, 0.08)" }}>
                              <div style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>Together</div>
                              <p style={{ fontSize: 12, color: "#90c8a0", lineHeight: 1.6, margin: 0 }}>
                                {getCombinationInterpretation(drawnCards[0].card, drawnCards[1].card)}
                              </p>
                            </div>
                          )}

                          {/* Tell Me the Story button */}
                          {drawnCards.length >= 2 && activeSpread && (
                            <div style={{ marginTop: 16, textAlign: "center" }}>
                              <button
                                onClick={() => setSection("reading-story")}
                                style={{
                                  padding: "10px 24px", borderRadius: 10,
                                  background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(244, 114, 182, 0.06))",
                                  border: "1px solid rgba(168, 85, 247, 0.2)",
                                  color: "#c084fc", fontSize: 12, fontWeight: 500,
                                  cursor: "pointer", letterSpacing: "0.03em",
                                  transition: "all 0.3s",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 16px rgba(168, 85, 247, 0.15)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                              >
                                ✦ Tell Me the Story
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Save & Notes */}
                        <div style={{ marginTop: 20, borderTop: "1px solid rgba(168, 85, 247, 0.08)", paddingTop: 20 }}>
                          <textarea
                            value={readingNotes}
                            onChange={e => setReadingNotes(e.target.value)}
                            placeholder="Add your notes..."
                            style={{
                              width: "100%",
                              background: "rgba(168, 85, 247, 0.04)",
                              border: "1px solid rgba(168, 85, 247, 0.15)",
                              borderRadius: 8,
                              padding: "10px 14px",
                              color: "#e0f5e8",
                              fontSize: 12,
                              outline: "none",
                              resize: "vertical",
                              minHeight: 60,
                              marginBottom: 12,
                            }}
                          />
                          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                            {userId && (
                              <button onClick={saveReading} style={{
                                padding: "8px 20px",
                                borderRadius: 6,
                                border: "1px solid rgba(168, 85, 247, 0.3)",
                                background: "rgba(168, 85, 247, 0.08)",
                                color: "#a855f7",
                                fontSize: 10,
                                cursor: "pointer",
                                fontFamily: "monospace",
                                letterSpacing: "1px",
                                textTransform: "uppercase",
                              }}>
                                Save Reading
                              </button>
                            )}
                            <button onClick={() => {
                              const readingText = drawnCards.map(dc => `${dc.position}: ${dc.card.name}${dc.reversed ? " (Reversed)" : ""}`).join("\n");
                              window.open(`/elyra?context=${encodeURIComponent(`Tarot Reading\nQuestion: ${question}\n${readingText}\nPlease explain this reading.`)}`, "_blank");
                            }} style={{
                              padding: "8px 20px",
                              borderRadius: 6,
                              border: "1px solid rgba(139, 92, 246, 0.3)",
                              background: "rgba(139, 92, 246, 0.08)",
                              color: "#8b5cf6",
                              fontSize: 10,
                              cursor: "pointer",
                              fontFamily: "monospace",
                              letterSpacing: "1px",
                              textTransform: "uppercase",
                            }}>
                              Ask Luna
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Spreads */}
        {section === "spreads" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => setSection("home")} style={{
              fontSize: 10, color: "rgba(168, 85, 247, 0.5)", background: "none", border: "none",
              cursor: "pointer", marginBottom: 24, fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase",
            }}>← Back</button>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18, marginBottom: 32 }}>Tarot Spreads</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
              {SPREADS.map(spread => (
                <button key={spread.id} onClick={() => startReading(spread)} style={{
                  ...glassStyle,
                  cursor: "pointer",
                  textAlign: "left",
                  padding: "20px",
                }}>
                  <div style={{ fontSize: 13, color: "#e0f5e8", fontWeight: 600, marginBottom: 8, letterSpacing: "1px" }}>{spread.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(240, 255, 245, 0.65)", marginBottom: 12, lineHeight: 1.5 }}>{spread.description}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {spread.positions.map((pos, i) => (
                      <span key={i} style={{
                        padding: "3px 8px",
                        borderRadius: 3,
                        background: "rgba(168, 85, 247, 0.04)",
                        border: "1px solid rgba(168, 85, 247, 0.08)",
                        fontSize: 9,
                        color: "rgba(168, 85, 247, 0.5)",
                        fontFamily: "monospace",
                      }}>{pos}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Explore Deck */}
        {section === "explore" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => setSection("home")} style={{
              fontSize: 10, color: "rgba(168, 85, 247, 0.5)", background: "none", border: "none",
              cursor: "pointer", marginBottom: 24, fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase",
            }}>← Back</button>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18, marginBottom: 24 }}>Explore the Deck</h2>

            {/* Search */}
            <div style={{ maxWidth: 400, margin: "0 auto 24px" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search cards..."
                style={{
                  width: "100%",
                  background: "rgba(168, 85, 247, 0.04)",
                  border: "1px solid rgba(168, 85, 247, 0.15)",
                  borderRadius: 8,
                  padding: "10px 16px",
                  color: "#e0f5e8",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            {/* Suit filters */}
            {!searchQuery && (
              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
                {[
                  { id: "major", label: "Major Arcana" },
                  { id: "cups", label: "Cups" },
                  { id: "wands", label: "Wands" },
                  { id: "swords", label: "Swords" },
                  { id: "pentacles", label: "Pentacles" },
                ].map(filter => (
                  <button key={filter.id} onClick={() => setExploreSuit(filter.id)} style={{
                    padding: "6px 14px",
                    borderRadius: 4,
                    border: `1px solid ${exploreSuit === filter.id ? "rgba(168, 85, 247, 0.4)" : "rgba(168, 85, 247, 0.1)"}`,
                    background: exploreSuit === filter.id ? "rgba(168, 85, 247, 0.08)" : "transparent",
                    color: exploreSuit === filter.id ? "#a855f7" : "rgba(168, 85, 247, 0.4)",
                    fontSize: 10,
                    cursor: "pointer",
                    fontFamily: "monospace",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}>{filter.label}</button>
                ))}
              </div>
            )}

            {/* Cards grid */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
              {(searchQuery ? searchResults : getCardsForSuit(exploreSuit)).map(card => (
                <div key={card.id} style={{ textAlign: "center" }}>
                  <TarotCardVisual
                    card={card}
                    size="sm"
                    onClick={() => { setSelectedCard(card); setSelectedCardReversed(false); setSection("card-detail"); }}
                  />
                  <button
                    onClick={() => toggleFavourite("card", card.id)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 12, marginTop: 4,
                      color: favourites.has(`card:${card.id}`) ? "#ffd700" : "rgba(168, 85, 247, 0.2)",
                    }}
                  >
                    {favourites.has(`card:${card.id}`) ? "★" : "☆"}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Learn Tarot */}
        {section === "learn" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => setSection("home")} style={{
              fontSize: 10, color: "rgba(168, 85, 247, 0.5)", background: "none", border: "none",
              cursor: "pointer", marginBottom: 24, fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase",
            }}>← Back</button>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18, marginBottom: 32 }}>Learn Tarot</h2>

            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              {[
                { title: "What is Tarot?", content: "Tarot is a system of 78 cards used for reflection, self-exploration and creative insight. Each card carries symbolic imagery and meanings that can help you think about your life from new angles. Tarot does not predict the future — it helps you explore your present." },
                { title: "Major Arcana", content: "The 22 Major Arcana cards represent major life themes and archetypal energies — from The Fool (new beginnings) to The World (completion). These cards often point to significant lessons or turning points." },
                { title: "Minor Arcana", content: "The 56 Minor Arcana cards deal with everyday experiences. They are divided into four suits, each connected to an element and a area of life." },
                { title: "The Four Suits", content: "Cups (Water) — emotions, relationships, feelings\nWands (Fire) — passion, creativity, action\nSwords (Air) — thoughts, communication, challenges\nPentacles (Earth) — material world, work, health, security" },
                { title: "Court Cards", content: "Each suit has four court cards: Page (student energy), Knight (action energy), Queen (nurturing energy), King (mastery energy). These can represent people, aspects of yourself, or approaches to situations." },
                { title: "Upright & Reversed", content: "An upright card expresses its energy freely. A reversed card suggests the energy is blocked, internalized, or expressed in an unusual way. Reversals add nuance but are optional — many readers use upright-only readings." },
                { title: "How Spreads Work", content: "A spread is a layout pattern for cards. Each position in a spread represents a different aspect of the question. For example, Past/Present/Future uses three positions to explore how time influences a situation." },
                { title: "Asking Good Questions", content: "Open-ended questions work best: 'What should I know about...' or 'How can I approach...' rather than yes/no questions. The more specific and reflective your question, the more useful the reading." },
                { title: "Interpreting Multiple Cards", content: "Look for themes, patterns and connections between cards. Do the elements balance? Are there repeating numbers? How do the cards tell a story together? Trust your intuition alongside traditional meanings." },
              ].map((lesson, i) => (
                <div key={i} style={{ ...glassStyle, marginBottom: 12 }}>
                  <h3 style={{ fontSize: 13, color: "#e0f5e8", fontWeight: 600, margin: "0 0 8px", letterSpacing: "1px" }}>{lesson.title}</h3>
                  <p style={{ fontSize: 12, color: "#90c8a0", lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>{lesson.content}</p>
                </div>
              ))}

              {/* Learning Mode - Random Card Quiz */}
              <div style={{ ...glassStyle, marginTop: 24, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16 }}>Learning Mode</div>
                <LearningCard />
              </div>
            </div>
          </motion.div>
        )}

        {/* Arcana Compare */}
        {section === "compare" && (
          <ArcanaCompare onBack={() => setSection("home")} />
        )}

        {/* Reading Story */}
        {section === "reading-story" && activeSpread && (
          <ReadingStory
            drawnCards={drawnCards}
            spread={activeSpread}
            question={question}
            onAskElyra={(ctx) => {
              window.open(`/elyra?context=${encodeURIComponent(ctx)}`, "_blank");
            }}
            onClose={() => setSection("reading-result")}
          />
        )}

        {/* My Readings */}
        {section === "readings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => setSection("home")} style={{
              fontSize: 10, color: "rgba(168, 85, 247, 0.5)", background: "none", border: "none",
              cursor: "pointer", marginBottom: 24, fontFamily: "monospace", letterSpacing: "2px", textTransform: "uppercase",
            }}>← Back</button>
            <h2 style={{ ...sectionTitle, textAlign: "center", fontSize: 18, marginBottom: 32 }}>My Readings</h2>

            {!userId ? (
              <div style={{ ...glassStyle, textAlign: "center", maxWidth: 400, margin: "0 auto" }}>
                <p style={{ fontSize: 13, color: "#90c8a0", margin: 0 }}>Sign in to save and view your readings.</p>
              </div>
            ) : savedReadings.length === 0 ? (
              <div style={{ ...glassStyle, textAlign: "center", maxWidth: 400, margin: "0 auto" }}>
                <p style={{ fontSize: 13, color: "#90c8a0", margin: 0 }}>No saved readings yet. Complete a reading and save it to see it here.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 600, margin: "0 auto" }}>
                {savedReadings.map(reading => (
                  <div key={reading.id} style={{ ...glassStyle }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, color: "#e0f5e8", fontWeight: 600, marginBottom: 4 }}>{reading.spread_name}</div>
                        {reading.question && (
                          <div style={{ fontSize: 11, color: "#90c8a0", fontStyle: "italic" }}>&ldquo;{reading.question}&rdquo;</div>
                        )}
                        <div style={{ fontSize: 9, color: "rgba(168, 85, 247, 0.3)", marginTop: 4, fontFamily: "monospace" }}>
                          {new Date(reading.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      <button onClick={() => deleteReading(reading.id)} style={{
                        background: "none", border: "none", color: "rgba(255, 80, 80, 0.4)",
                        cursor: "pointer", fontSize: 12,
                      }}>✕</button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                      {reading.cards.map((c: { cardId: string; reversed: boolean; position: string }, i: number) => {
                        const cardData = ALL_CARDS.find(ac => ac.id === c.cardId);
                        return cardData ? (
                          <div key={i} style={{ textAlign: "center" }}>
                            <TarotCardVisual card={cardData} reversed={c.reversed} size="sm" />
                            <div style={{ fontSize: 8, color: "rgba(168, 85, 247, 0.4)", marginTop: 4 }}>{c.position}</div>
                          </div>
                        ) : null;
                      })}
                    </div>
                    {reading.notes && (
                      <div style={{ fontSize: 11, color: "#90c8a0", padding: "8px 12px", borderRadius: 6, background: "rgba(168, 85, 247, 0.02)", border: "1px solid rgba(168, 85, 247, 0.06)" }}>
                        {reading.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}

function LearningCard() {
  const [currentCard, setCurrentCard] = useState<TarotCard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const drawRandom = useCallback(() => {
    const index = Math.floor(Math.random() * ALL_CARDS.length);
    setCurrentCard(ALL_CARDS[index]);
    setShowAnswer(false);
  }, []);

  useEffect(() => { drawRandom(); }, [drawRandom]);

  if (!currentCard) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <TarotCardVisual card={currentCard} size="md" />
      </div>
      {!showAnswer ? (
        <button onClick={() => setShowAnswer(true)} style={{
          padding: "8px 20px",
          borderRadius: 6,
          border: "1px solid rgba(168, 85, 247, 0.3)",
          background: "rgba(168, 85, 247, 0.08)",
          color: "#a855f7",
          fontSize: 11,
          cursor: "pointer",
          fontFamily: "monospace",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}>
          Reveal Meaning
        </button>
      ) : (
        <div style={{ textAlign: "left" }}>
          <p style={{ fontSize: 12, color: "#cce8d8", lineHeight: 1.6, margin: "0 0 8px" }}>{currentCard.uprightMeaning}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", marginBottom: 16 }}>
            {currentCard.keywords.map(k => (
              <span key={k} style={{
                padding: "3px 8px", borderRadius: 3,
                background: "rgba(168, 85, 247, 0.04)", border: "1px solid rgba(168, 85, 247, 0.08)",
                fontSize: 9, color: "rgba(168, 85, 247, 0.5)", fontFamily: "monospace",
              }}>{k}</span>
            ))}
          </div>
          <button onClick={drawRandom} style={{
            padding: "8px 20px",
            borderRadius: 6,
            border: "1px solid rgba(168, 85, 247, 0.15)",
            background: "transparent",
            color: "rgba(168, 85, 247, 0.5)",
            fontSize: 10,
            cursor: "pointer",
            fontFamily: "monospace",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}>
            Next Card
          </button>
        </div>
      )}
    </div>
  );
}

function getCardsForSuit(suit: string): TarotCard[] {
  switch (suit) {
    case "major": return MAJOR_ARCANA;
    case "cups": return CUPS;
    case "wands": return WANDS;
    case "swords": return SWORDS;
    case "pentacles": return PENTACLES;
    default: return ALL_CARDS;
  }
}

function generateInterpretation(drawnCards: { card: TarotCard; reversed: boolean; position: string }[], spread: SpreadDefinition): string {
  if (drawnCards.length === 0) return "";

  const parts = drawnCards.map(dc => {
    const meaning = dc.reversed ? dc.card.reversedMeaning : dc.card.uprightMeaning;
    return `**${dc.position}** — ${dc.card.name}${dc.reversed ? " (Reversed)" : ""}: ${meaning.split(".")[0]}.`;
  });

  let interpretation = parts.join("\n\n");

  if (drawnCards.length >= 2) {
    interpretation += "\n\nThe cards together suggest a narrative of ";
    const themes = drawnCards.flatMap(dc => dc.card.keywords.slice(0, 2));
    interpretation += themes.slice(0, 4).join(", ") + ". ";
    interpretation += "Trust your intuition about how these energies are manifesting in your life.";
  }

  return interpretation;
}
