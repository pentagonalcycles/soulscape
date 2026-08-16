export interface TarotCard {
  id: string;
  name: string;
  number: number | null;
  arcana: "major" | "minor";
  suit?: "cups" | "wands" | "swords" | "pentacles";
  uprightMeaning: string;
  reversedMeaning: string;
  keywords: string[];
  symbolism: string;
  love: string;
  career: string;
  personalGrowth: string;
  reflectionQuestion: string;
  element?: string;
  astrologicalSign?: string;
}

export interface DrawnCard extends TarotCard {
  reversed: boolean;
  position?: string;
}

export interface SpreadDefinition {
  id: string;
  name: string;
  description: string;
  positions: string[];
  category: string;
}

export const SPREADS: SpreadDefinition[] = [
  {
    id: "one-card",
    name: "One Card",
    description: "A single card for quick guidance or daily reflection.",
    positions: ["Guidance"],
    category: "quick",
  },
  {
    id: "past-present-future",
    name: "Past / Present / Future",
    description: "Explore how your past influences your present and where things are heading.",
    positions: ["Past", "Present", "Future"],
    category: "classic",
  },
  {
    id: "situation-obstacle-advice",
    name: "Situation / Obstacle / Advice",
    description: "Understand your current situation, what stands in the way, and how to move forward.",
    positions: ["Situation", "Obstacle", "Advice"],
    category: "classic",
  },
  {
    id: "love-connection",
    name: "Love & Connection",
    description: "Explore the energy between you and another person.",
    positions: ["You", "Them", "Connection"],
    category: "love",
  },
  {
    id: "career-direction",
    name: "Career Direction",
    description: "Gain clarity on your professional path.",
    positions: ["Current Path", "Challenge", "Opportunity", "Advice"],
    category: "career",
  },
  {
    id: "decision-making",
    name: "Decision Making",
    description: "Explore two options and what each path offers.",
    positions: ["Option A", "Option B", "What You Need to Know"],
    category: "guidance",
  },
  {
    id: "self-reflection",
    name: "Self Reflection",
    description: "Look inward and understand yourself more deeply.",
    positions: ["Conscious", "Subconscious", "Advice"],
    category: "personal",
  },
  {
    id: "month-ahead",
    name: "Month Ahead",
    description: "A five-card spread for the weeks ahead.",
    positions: ["Week 1", "Week 2", "Week 3", "Week 4", "Overall Theme"],
    category: "time",
  },
  {
    id: "five-card-insight",
    name: "Five Card Insight",
    description: "A versatile spread for deeper understanding.",
    positions: ["Past", "Present", "Hidden Influence", "Advice", "Likely Outcome"],
    category: "classic",
  },
  {
    id: "celtic-cross",
    name: "Celtic Cross",
    description: "The classic ten-card spread for comprehensive readings.",
    positions: ["Present", "Challenge", "Past", "Future", "Conscious", "Subconscious", "Advice", "External", "Hopes/Fears", "Outcome"],
    category: "advanced",
  },
];
