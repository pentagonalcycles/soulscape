"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TarotCard, SpreadDefinition } from "@/lib/tarot";

type Context = "general" | "love" | "career" | "personal" | "decision" | "situation";
type StoryStyle = "clear" | "reflective" | "story";

interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
  position: string;
}

interface ReadingStoryProps {
  drawnCards: DrawnCard[];
  spread: SpreadDefinition;
  question: string;
  onAskElyra?: (storyContext: string) => void;
  onSave?: (story: string) => void;
  onClose: () => void;
}

const CONTEXTS: { id: Context; label: string; icon: string }[] = [
  { id: "general", label: "General", icon: "✦" },
  { id: "love", label: "Love", icon: "💗" },
  { id: "career", label: "Career", icon: "💼" },
  { id: "personal", label: "Personal Growth", icon: "🌱" },
  { id: "decision", label: "Decision", icon: "⚖" },
  { id: "situation", label: "Situation", icon: "🔮" },
];

const STYLES: { id: StoryStyle; label: string }[] = [
  { id: "clear", label: "Clear" },
  { id: "reflective", label: "Reflective" },
  { id: "story", label: "Story" },
];

export default function ReadingStory({ drawnCards, spread, question, onAskElyra, onSave, onClose }: ReadingStoryProps) {
  const [context, setContext] = useState<Context>("general");
  const [style, setStyle] = useState<StoryStyle>("reflective");
  const [storyKey, setStoryKey] = useState(0);

  const story = useMemo(() => generateStory(drawnCards, spread, context, style, question), [drawnCards, spread, context, style, question, storyKey]);

  const patterns = useMemo(() => detectPatterns(drawnCards), [drawnCards]);

  const copyStory = () => {
    const cardList = drawnCards.map(dc => `${dc.position}: ${dc.card.name}${dc.reversed ? " (Reversed)" : ""}`).join("\n");
    const text = `${spread.name} Reading\n${question ? `Question: ${question}\n` : ""}\nCards:\n${cardList}\n\n${story.narrative}\n\nCentral Theme: ${story.centralTheme}\n\nReflection: ${story.reflectionQuestion}`;
    navigator.clipboard.writeText(text);
  };

  const regenerate = () => {
    setStoryKey(k => k + 1);
  };

  const askElyraContext = () => {
    const cardList = drawnCards.map(dc => `${dc.position}: ${dc.card.name}${dc.reversed ? " (Reversed)" : ""}`).join(", ");
    const ctx = `Tarot Reading Story\nSpread: ${spread.name}\n${question ? `Question: ${question}\n` : ""}Cards: ${cardList}\nContext: ${context}\n\nStory:\n${story.narrative}\n\nCentral Theme: ${story.centralTheme}\n\nPlease help me understand this reading more deeply.`;
    onAskElyra?.(ctx);
  };

  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onClose} style={{
          padding: "6px 12px", borderRadius: 8,
          background: "rgba(168, 85, 247, 0.06)", border: "1px solid rgba(168, 85, 247, 0.12)",
          color: "#a78bfa", fontSize: 11, cursor: "pointer", fontFamily: "monospace",
        }}>← Back</button>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 300, color: "#e0f5e8", margin: 0, letterSpacing: "0.05em" }}>
            Reading Story
          </h2>
          <p style={{ fontSize: 12, color: "rgba(224, 245, 232, 0.45)", margin: "2px 0 0" }}>
            {spread.name} — one connected narrative
          </p>
        </div>
      </div>

      {/* Context Selector */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
          Context
        </span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CONTEXTS.map(c => (
            <button
              key={c.id}
              onClick={() => setContext(c.id)}
              style={{
                padding: "5px 10px", borderRadius: 6, fontSize: 10,
                background: context === c.id ? "rgba(168, 85, 247, 0.12)" : "rgba(255, 255, 255, 0.02)",
                border: `1px solid ${context === c.id ? "rgba(168, 85, 247, 0.25)" : "rgba(255, 255, 255, 0.06)"}`,
                color: context === c.id ? "#c084fc" : "rgba(255, 255, 255, 0.4)",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style Selector */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
          Style
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 10,
                background: style === s.id ? "rgba(0, 255, 136, 0.08)" : "rgba(255, 255, 255, 0.02)",
                border: `1px solid ${style === s.id ? "rgba(0, 255, 136, 0.2)" : "rgba(255, 255, 255, 0.06)"}`,
                color: style === s.id ? "var(--elovayne-nebula)" : "rgba(255, 255, 255, 0.4)",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Summary */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
          Your Spread
        </span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {drawnCards.map((dc, i) => (
            <div key={i} style={{
              padding: "8px 12px", borderRadius: 8,
              background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(168, 85, 247, 0.08)",
              fontSize: 11, color: "rgba(224, 245, 232, 0.7)",
            }}>
              <span style={{ color: "#c084fc", fontSize: 9, display: "block", marginBottom: 2 }}>{dc.position}</span>
              {dc.card.name} {dc.reversed && <span style={{ color: "#f472b6", fontSize: 9 }}>(R)</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Patterns */}
      {patterns.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            Patterns
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {patterns.map((p, i) => (
              <div key={i} style={{
                padding: "8px 12px", borderRadius: 8,
                background: "rgba(168, 85, 247, 0.04)", border: "1px solid rgba(168, 85, 247, 0.08)",
                fontSize: 11, color: "rgba(224, 245, 232, 0.6)", lineHeight: 1.5,
              }}>
                <span style={{ color: "#c084fc", fontWeight: 500 }}>{p.title}:</span> {p.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* The Story */}
      <motion.div
        key={storyKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Narrative Sections */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase", display: "block", marginBottom: 12 }}>
            The Story
          </span>
          <div style={{
            padding: "20px", borderRadius: 12,
            background: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(168, 85, 247, 0.1)",
          }}>
            {story.sections.map((section, i) => (
              <div key={i} style={{ marginBottom: i < story.sections.length - 1 ? 20 : 0 }}>
                <h3 style={{ fontSize: 13, color: "#c084fc", fontWeight: 500, marginBottom: 8, letterSpacing: "0.05em" }}>
                  {section.title}
                </h3>
                <p style={{ fontSize: 13, color: "#e0f5e8", lineHeight: 1.8, margin: 0 }}>
                  {section.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Turning Point */}
        {story.turningPoint && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              padding: "14px 16px", borderRadius: 10,
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.06), rgba(244, 114, 182, 0.04))",
              border: "1px solid rgba(168, 85, 247, 0.12)",
            }}>
              <span style={{ fontSize: 10, color: "#c084fc", letterSpacing: "2px", textTransform: "uppercase" }}>
                Turning Point
              </span>
              <p style={{ fontSize: 13, color: "#e0f5e8", lineHeight: 1.6, margin: "6px 0 0" }}>
                {story.turningPoint}
              </p>
            </div>
          </div>
        )}

        {/* Central Theme */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            padding: "14px 16px", borderRadius: 10,
            background: "rgba(0, 255, 136, 0.03)", border: "1px solid rgba(0, 255, 136, 0.08)",
          }}>
            <span style={{ fontSize: 10, color: "var(--elovayne-nebula)", letterSpacing: "2px", textTransform: "uppercase" }}>
              Central Theme
            </span>
            <p style={{ fontSize: 14, color: "#e0f5e8", lineHeight: 1.6, margin: "6px 0 0", fontWeight: 300 }}>
              {story.centralTheme}
            </p>
          </div>
        </div>

        {/* What This Reading Invites */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            padding: "14px 16px", borderRadius: 10,
            background: "rgba(168, 85, 247, 0.04)", border: "1px solid rgba(168, 85, 247, 0.08)",
          }}>
            <span style={{ fontSize: 10, color: "#a855f7", letterSpacing: "2px", textTransform: "uppercase" }}>
              What This Reading Invites You to Consider
            </span>
            <p style={{ fontSize: 13, color: "rgba(224, 245, 232, 0.7)", lineHeight: 1.6, margin: "6px 0 0" }}>
              {story.invitation}
            </p>
          </div>
        </div>

        {/* Reflection Question */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            padding: "14px 16px", borderRadius: 10,
            background: "rgba(0, 255, 136, 0.03)", border: "1px solid rgba(0, 255, 136, 0.08)",
          }}>
            <span style={{ fontSize: 10, color: "var(--elovayne-nebula)", letterSpacing: "2px", textTransform: "uppercase" }}>
              Reflection Question
            </span>
            <p style={{ fontSize: 13, color: "rgba(224, 245, 232, 0.7)", lineHeight: 1.6, margin: "6px 0 0", fontStyle: "italic" }}>
              {story.reflectionQuestion}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={copyStory} style={btnStyle()}>Copy Story</button>
          <button onClick={regenerate} style={btnStyle()}>Interpret Again</button>
          {onAskElyra && (
            <button onClick={askElyraContext} style={{
              ...btnStyle(),
              background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.2)",
              color: "#c084fc",
            }}>Continue With Elyra</button>
          )}
          {onSave && (
            <button onClick={() => onSave(story.narrative)} style={btnStyle()}>Save Reading</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function btnStyle() {
  return {
    padding: "8px 16px", borderRadius: 8, fontSize: 11,
    background: "rgba(0, 255, 136, 0.06)", border: "1px solid rgba(0, 255, 136, 0.12)",
    color: "var(--elovayne-nebula)", cursor: "pointer" as const, fontFamily: "monospace",
  };
}

interface Pattern {
  title: string;
  description: string;
}

function detectPatterns(cards: DrawnCard[]): Pattern[] {
  const patterns: Pattern[] = [];

  const majorCount = cards.filter(c => c.card.arcana === "major").length;
  if (majorCount >= 2) {
    patterns.push({
      title: "Major Arcana Dominance",
      description: `${majorCount} Major Arcana cards suggest this reading touches on deep, archetypal life themes rather than everyday matters.`,
    });
  }

  const suitCounts: Record<string, number> = {};
  cards.forEach(c => {
    if (c.card.suit) suitCounts[c.card.suit] = (suitCounts[c.card.suit] || 0) + 1;
  });
  const suitNames: Record<string, string> = {
    cups: "emotional and relational energy",
    wands: "creative and passionate energy",
    swords: "mental and communicative energy",
    pentacles: "material and practical energy",
  };
  Object.entries(suitCounts).forEach(([suit, count]) => {
    if (count >= 2) {
      patterns.push({
        title: `${suit.charAt(0).toUpperCase() + suit.slice(1)} Dominance`,
        description: `${count} ${suit} cards emphasize ${suitNames[suit]}.`,
      });
    }
  });

  const reversedCount = cards.filter(c => c.reversed).length;
  if (reversedCount >= 2) {
    patterns.push({
      title: "Reversal Pattern",
      description: `${reversedCount} reversed cards suggest internalized energy, blocked expression, or a need for inward reflection.`,
    });
  }

  const numbers = cards.filter(c => c.card.number !== null).map(c => c.card.number!);
  const numberCounts: Record<number, number> = {};
  numbers.forEach(n => { numberCounts[n] = (numberCounts[n] || 0) + 1; });
  Object.entries(numberCounts).forEach(([num, count]) => {
    if (count >= 2) {
      patterns.push({
        title: `Number ${num} Repeated`,
        description: `The number ${num} appears ${count} times, emphasizing cycles and patterns.`,
      });
    }
  });

  return patterns;
}

interface StorySection {
  title: string;
  text: string;
}

interface StoryResult {
  sections: StorySection[];
  turningPoint: string | null;
  centralTheme: string;
  invitation: string;
  reflectionQuestion: string;
  narrative: string;
}

function generateStory(
  cards: DrawnCard[],
  spread: SpreadDefinition,
  context: Context,
  style: StoryStyle,
  question: string
): StoryResult {
  const sections: StorySection[] = [];
  let turningPoint: string | null = null;

  const getCardMeaning = (card: TarotCard, reversed: boolean, ctx: Context): string => {
    const base = reversed ? card.reversedMeaning : card.uprightMeaning;
    switch (ctx) {
      case "love": return reversed ? `In love, blocked or imbalanced energy. ${card.love}` : card.love;
      case "career": return reversed ? `Professional challenges. ${card.career}` : card.career;
      case "personal": return reversed ? `Inner resistance to growth. ${card.personalGrowth}` : card.personalGrowth;
      case "decision": return reversed ? "Uncertainty or fear around this choice." : "Clarity and direction for this choice.";
      case "situation": return reversed ? "Hidden dynamics or unresolved aspects." : "The current energy at play.";
      default: return base;
    }
  };

  const toneAdj = style === "story" ? ["unfolds", "reveals", "whispers", "emerges"] :
    style === "reflective" ? ["invites", "suggests", "calls", "asks"] :
    ["shows", "indicates", "points to", "highlights"];
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  if (cards.length === 1) {
    const dc = cards[0];
    const meaning = getCardMeaning(dc.card, dc.reversed, context);
    sections.push({
      title: "Your Card",
      text: `${dc.card.name}${dc.reversed ? ", reversed," : ""} ${pick(toneAdj)} a single clear energy: ${meaning} This card ${pick(toneAdj)} the essence of where your attention is needed right now.`,
    });
  } else if (cards.length === 2) {
    const [a, b] = cards;
    const meaningA = getCardMeaning(a.card, a.reversed, context);
    const meaningB = getCardMeaning(b.card, b.reversed, context);

    sections.push({
      title: "The Connection",
      text: `${a.card.name}${a.reversed ? " reversed" : ""} in the ${a.position} position ${pick(toneAdj)} ${meaningA.toLowerCase()} Meanwhile, ${b.card.name}${b.reversed ? " reversed" : ""} in the ${b.position} ${pick(toneAdj)} ${meaningB.toLowerCase()} Together, these cards create a dialogue between ${a.card.keywords[0]} and ${b.card.keywords[0]}.`,
    });

    if (a.reversed && !b.reversed) {
      turningPoint = `The movement from ${a.card.name} reversed toward ${b.card.name} upright suggests a shift from internal struggle toward outward expression.`;
    } else if (!a.reversed && b.reversed) {
      turningPoint = `The movement from ${a.card.name} toward ${b.card.name} reversed suggests initial clarity that turns inward or becomes blocked.`;
    }
  } else if (cards.length >= 3) {
    // Opening
    const opening = cards[0];
    const openingMeaning = getCardMeaning(opening.card, opening.reversed, context);
    sections.push({
      title: "Where the Story Begins",
      text: `The ${opening.position} position is held by ${opening.card.name}${opening.reversed ? ", reversed," : ""}, which ${pick(toneAdj)} ${openingMeaning.toLowerCase()} This sets the foundation for everything that follows.`,
    });

    // Middle / unfolding
    if (cards.length >= 4) {
      const middleCards = cards.slice(1, -1);
      const middleTexts = middleCards.map(dc => {
        const m = getCardMeaning(dc.card, dc.reversed, context);
        return `${dc.card.name}${dc.reversed ? " reversed" : ""} as ${dc.position} ${pick(toneAdj)} ${m.toLowerCase()}`;
      });
      sections.push({
        title: "What Is Unfolding",
        text: `The middle of the spread ${pick(toneAdj)} a journey: ${middleTexts.join(", ")}. These cards together create the tension and movement at the heart of this reading.`,
      });
    }

    // Turning point - find the most dramatic shift
    for (let i = 1; i < cards.length - 1; i++) {
      const prev = cards[i - 1];
      const curr = cards[i];
      const next = cards[i + 1];
      if (prev.card.arcana === "major" && curr.card.arcana === "major") {
        turningPoint = `The encounter between ${prev.card.name} and ${curr.card.name} — two Major Arcana cards — represents a powerful turning point where deep forces meet.`;
        break;
      }
      if (prev.reversed && !curr.reversed) {
        turningPoint = `The shift from ${prev.card.name} reversed to ${curr.card.name} upright marks a turning point — energy that was blocked begins to flow.`;
        break;
      }
      if (!prev.reversed && curr.reversed) {
        turningPoint = `The shift from ${prev.card.name} to ${curr.card.name} reversed marks a turning point — clarity gives way to inner reflection.`;
        break;
      }
    }

    // Ending
    const ending = cards[cards.length - 1];
    const endingMeaning = getCardMeaning(ending.card, ending.reversed, context);
    sections.push({
      title: "Where This Leads",
      text: `The ${ending.position} position, held by ${ending.card.name}${ending.reversed ? " reversed" : ""}, ${pick(toneAdj)} ${endingMeaning.toLowerCase()} This is the direction the spread ${pick(toneAdj)} — the energy you are moving toward.`,
    });
  }

  // Central theme
  const allKeywords = cards.flatMap(c => c.card.keywords.slice(0, 2));
  const uniqueThemes = [...new Set(allKeywords)].slice(0, 3);
  const centralTheme = generateCentralTheme(cards, context, uniqueThemes);

  // Invitation
  const invitation = generateInvitation(cards, context);

  // Reflection question
  const reflectionQuestion = generateReflectionQuestion(cards, context);

  // Build full narrative
  const narrative = sections.map(s => `${s.title}\n${s.text}`).join("\n\n");

  return { sections, turningPoint, centralTheme, invitation, reflectionQuestion, narrative };
}

function generateCentralTheme(cards: DrawnCard[], context: Context, themes: string[]): string {
  const reversedCount = cards.filter(c => c.reversed).length;
  const majorCount = cards.filter(c => c.card.arcana === "major").length;

  if (majorCount >= 2) {
    return `Deep transformation and archetypal forces shape this reading, centered on themes of ${themes.join(", ")}.`;
  }
  if (reversedCount > cards.length / 2) {
    return `Internal reflection and blocked energy dominate, calling for patience and inward attention around ${themes.join(", ")}.`;
  }
  if (context === "love") {
    return `The heart of this reading speaks to ${themes.join(" and ")} in your relational world.`;
  }
  if (context === "career") {
    return `Your professional path is shaped by ${themes.join(" and ")} — the cards suggest movement and awareness.`;
  }
  return `The central thread running through this spread is ${themes.join(", ")} — energies that connect every card in the reading.`;
}

function generateInvitation(cards: DrawnCard[], context: Context): string {
  const last = cards[cards.length - 1];
  if (last.reversed) {
    return "This reading invites you to slow down and listen to what is not yet ready to emerge. Some things need time before they become clear.";
  }
  if (context === "love") {
    return "This reading invites you to consider how you show up in your connections — what you give, what you hold back, and what you truly need.";
  }
  if (context === "career") {
    return "This reading invites you to look at your path with fresh eyes — where you are headed, and whether that direction still fits who you are becoming.";
  }
  if (context === "decision") {
    return "This reading invites you to sit with the tension between options rather than rushing toward resolution. Clarity often comes in its own time.";
  }
  return "This reading invites you to see the pattern more clearly — and to consider what part of it you are ready to change.";
}

function generateReflectionQuestion(cards: DrawnCard[], context: Context): string {
  const questions = [
    "What part of this reading feels most true — and most uncomfortable?",
    "If these cards could speak in one sentence, what would they say to you?",
    "Where in your life does this pattern already exist?",
    "What would change if you trusted this message fully?",
    "Which card challenges you most — and why?",
    "What are you being asked to release?",
    "How would you advise a friend who received this reading?",
    "What is the one thing you already know but have been avoiding?",
  ];
  return questions[Math.floor(Math.random() * questions.length)];
}
