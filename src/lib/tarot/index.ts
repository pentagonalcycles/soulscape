export { ALL_CARDS, MAJOR_ARCANA, CUPS, WANDS, SWORDS, PENTACLES } from "./minor-arcana";
export { SPREADS } from "./types";
export type { TarotCard, DrawnCard, SpreadDefinition } from "./types";

import type { TarotCard } from "./types";
import { ALL_CARDS } from "./minor-arcana";

export function shuffleDeck(cards: TarotCard[]): TarotCard[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawCards(cards: TarotCard[], count: number, allowReversed: boolean): { card: TarotCard; reversed: boolean }[] {
  const shuffled = shuffleDeck(cards);
  return shuffled.slice(0, count).map(card => ({
    card,
    reversed: allowReversed ? Math.random() > 0.5 : false,
  }));
}

export function getDailyCard(): { card: TarotCard; reversed: boolean; date: string } {
  const today = new Date().toISOString().split("T")[0];
  const stored = typeof window !== "undefined" ? localStorage.getItem("tarot-daily-card") : null;
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) return parsed;
    } catch {}
  }
  const seed = today.split("-").reduce((acc, val) => acc + parseInt(val, 10), 0);
  const index = seed % ALL_CARDS.length;
  const reversed = seed % 3 === 0;
  const result = { card: ALL_CARDS[index], reversed, date: today };
  if (typeof window !== "undefined") {
    localStorage.setItem("tarot-daily-card", JSON.stringify(result));
  }
  return result;
}

export function getCardOfWeek(): { card: TarotCard; reversed: boolean; weekStart: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  const weekStr = startOfWeek.toISOString().split("T")[0];
  const stored = typeof window !== "undefined" ? localStorage.getItem("tarot-card-of-week") : null;
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.weekStart === weekStr) return parsed;
    } catch {}
  }
  const seed = weekStr.split("-").reduce((acc, val) => acc + parseInt(val, 10), 0);
  const index = seed % ALL_CARDS.length;
  const reversed = seed % 4 === 0;
  const result = { card: ALL_CARDS[index], reversed, weekStart: weekStr };
  if (typeof window !== "undefined") {
    localStorage.setItem("tarot-card-of-week", JSON.stringify(result));
  }
  return result;
}

export function getCardOfMonth(): { card: TarotCard; reversed: boolean; month: string } {
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const stored = typeof window !== "undefined" ? localStorage.getItem("tarot-card-of-month") : null;
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.month === monthStr) return parsed;
    } catch {}
  }
  const seed = monthStr.split("-").reduce((acc, val) => acc + parseInt(val, 10), 0);
  const index = seed % ALL_CARDS.length;
  const reversed = seed % 5 === 0;
  const result = { card: ALL_CARDS[index], reversed, month: monthStr };
  if (typeof window !== "undefined") {
    localStorage.setItem("tarot-card-of-month", JSON.stringify(result));
  }
  return result;
}

export function searchCards(query: string): TarotCard[] {
  const lower = query.toLowerCase();
  return ALL_CARDS.filter(card => {
    return (
      card.name.toLowerCase().includes(lower) ||
      card.keywords.some(k => k.toLowerCase().includes(lower)) ||
      card.uprightMeaning.toLowerCase().includes(lower) ||
      card.reversedMeaning.toLowerCase().includes(lower) ||
      card.love.toLowerCase().includes(lower) ||
      card.career.toLowerCase().includes(lower) ||
      card.personalGrowth.toLowerCase().includes(lower) ||
      card.symbolism.toLowerCase().includes(lower) ||
      (card.suit && card.suit.toLowerCase().includes(lower))
    );
  });
}

export function getCombinationInterpretation(card1: TarotCard, card2: TarotCard): string {
  const combinations: Record<string, string> = {
    "the-tower_the-star": "Destruction followed by hope. After a major upheaval, healing and renewal appear. The situation that breaks you open is the same one that lets the light in.",
    "the-fool_the-world": "The journey completes and begins again. Full circle — you have grown through an entire cycle and are ready for a new adventure with all the wisdom you have gained.",
    "death_the-sun": "Transformation leads to joy. An ending that initially felt painful ultimately brings the brightest happiness. Let go and let the sun shine.",
    "the-moon_the-star": "Moving through confusion toward hope. Uncertainty and fear are being replaced by faith and clarity. Trust the journey through the dark.",
    "the-devil_the-tower": "Breaking free from bondage. A sudden shake-up liberates you from what has been holding you captive. Freedom through disruption.",
    "the-hermit_the-fool": "Solitude followed by new beginnings. Time alone has prepared you for a fresh start. Step out of the cave with new wisdom.",
    "the-lovers_the-devil": "Passion and attachment intertwined. An intense connection that may cross into obsession. Examine whether this is love or need.",
    "temperance_the-tower": "Balance disrupted by sudden change. A period of harmony is shaken up. Adaptability and patience will guide you through.",
    "the-wheel-of-fortune_the-tower": "A sudden reversal of fortune. What goes up may come down, but the wheel always turns again. Stay resilient.",
    "the-empress_the-emperor": "Creative and structured energies unite. Nurturing and discipline working together. A powerful partnership of heart and mind.",
    "the-high-priestess_the-magician": "Intuition and action combine. Inner wisdom channeled into external creation. You know what to do and have the power to do it.",
    "the-hanged-man_death": "Surrendering to transformation. Letting go completely allows a profound rebirth. Release your grip and allow change.",
    "strength_the-chariot": "Inner courage meets outer determination. Gentle power directed with focus. You have both the heart and the drive to succeed.",
    "justice_the-world": "Fair completion. Karma delivers its final verdict. A just ending to a long journey.",
    "the-star_the-sun": "Hope fulfilled. Dreams manifest into joyful reality. What you wished for is arriving in full light.",
  };

  const key1 = `${card1.id}_${card2.id}`;
  const key2 = `${card2.id}_${card1.id}`;
  return combinations[key1] || combinations[key2] || `${card1.name} and ${card2.name} together suggest a powerful interplay of energies. The themes of ${card1.keywords[0]} and ${card2.keywords[0]} are merging. Consider how ${card1.uprightMeaning.split(".")[0].toLowerCase()} interacts with ${card2.uprightMeaning.split(".")[0].toLowerCase()}. Trust your intuition about how these energies are combining in your life.`;
}
