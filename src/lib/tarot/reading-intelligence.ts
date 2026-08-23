import type { TarotCard, SpreadDefinition } from "./types";

// Generic card type for pattern detection - works with both flat and nested formats
export interface PatternCard {
  card: TarotCard;
  reversed: boolean;
  position?: string;
}

export type ReadingContext = "general" | "love" | "career" | "personal" | "decision" | "situation";

export type ConnectionType = "reinforcement" | "tension" | "progression" | "resolution" | "repetition" | "contrast";

export interface CardAnalysis {
  card: PatternCard;
  positionMeaning: string;
  contextualInterpretation: string;
  importance: "primary" | "significant" | "supporting";
}

export interface KeyConnection {
  from: string;
  to: string;
  type: ConnectionType;
  description: string;
}

export interface Contradiction {
  description: string;
  cards: string[];
}

export interface Pattern {
  title: string;
  description: string;
}

export interface ReadingIntelligence {
  centralTheme: string;
  dominantEnergy: string | null;
  majorArcanaPattern: string | null;
  suitPattern: string | null;
  numberPattern: string | null;
  courtCardInsight: string | null;
  reversalPattern: string | null;
  turningPoint: string | null;
  keyConnections: KeyConnection[];
  supportsYou: string[];
  challengesYou: string[];
  wholeSpreadMeaning: string;
  keyMessage: string;
  reflectionQuestion: string;
  cardAnalyses: CardAnalysis[];
  contradictions: Contradiction[];
  patterns: Pattern[];
}

// --- Position interpretation helpers ---

const POSITION_FRAMING: Record<string, (cardName: string, meaning: string) => string> = {
  "Past": (name, meaning) => `In the past position, ${name} suggests ${meaning.toLowerCase()} This energy has shaped the current situation.`,
  "Present": (name, meaning) => `Currently, ${name} points to ${meaning.toLowerCase()} This is the energy at the centre of things.`,
  "Future": (name, meaning) => `Moving forward, ${name} indicates ${meaning.toLowerCase()} This is where things appear to be heading.`,
  "Situation": (name, meaning) => `The core situation reflects ${name}: ${meaning.toLowerCase()}`,
  "Obstacle": (name, meaning) => `As an obstacle, ${name} suggests ${meaning.toLowerCase()} This is what stands in the way.`,
  "Advice": (name, meaning) => `The guidance offered by ${name} is ${meaning.toLowerCase()}`,
  "Challenge": (name, meaning) => `As a challenge, ${name} highlights ${meaning.toLowerCase()}`,
  "Opportunity": (name, meaning) => `The opportunity here is ${name}: ${meaning.toLowerCase()}`,
  "Current Path": (name, meaning) => `Your current path reflects ${name}: ${meaning.toLowerCase()}`,
  "Option A": (name, meaning) => `Option A carries the energy of ${name}: ${meaning.toLowerCase()}`,
  "Option B": (name, meaning) => `Option B carries the energy of ${name}: ${meaning.toLowerCase()}`,
  "What You Need to Know": (name, meaning) => `What deserves attention is ${name}: ${meaning.toLowerCase()}`,
  "You": (name, meaning) => `Your energy in this situation is ${name}: ${meaning.toLowerCase()}`,
  "Them": (name, meaning) => `The other person's energy is ${name}: ${meaning.toLowerCase()}`,
  "Connection": (name, meaning) => `The connection between you is shaped by ${name}: ${meaning.toLowerCase()}`,
  "Hidden Influence": (name, meaning) => `A hidden influence is at work through ${name}: ${meaning.toLowerCase()}`,
  "Likely Outcome": (name, meaning) => `The likely outcome points to ${name}: ${meaning.toLowerCase()}`,
  "Outcome": (name, meaning) => `The outcome suggests ${name}: ${meaning.toLowerCase()}`,
  "Conscious": (name, meaning) => `On a conscious level, ${name} is present: ${meaning.toLowerCase()}`,
  "Subconscious": (name, meaning) => `Beneath the surface, ${name} operates: ${meaning.toLowerCase()}`,
  "External": (name, meaning) => `External forces reflect ${name}: ${meaning.toLowerCase()}`,
  "Hopes/Fears": (name, meaning) => `Hopes and fears are intertwined with ${name}: ${meaning.toLowerCase()}`,
  "Week 1": (name, meaning) => `The first week carries ${name}: ${meaning.toLowerCase()}`,
  "Week 2": (name, meaning) => `The second week shifts toward ${name}: ${meaning.toLowerCase()}`,
  "Week 3": (name, meaning) => `The third week brings ${name}: ${meaning.toLowerCase()}`,
  "Week 4": (name, meaning) => `The fourth week settles into ${name}: ${meaning.toLowerCase()}`,
  "Overall Theme": (name, meaning) => `The overarching theme is ${name}: ${meaning.toLowerCase()}`,
  "Guidance": (name, meaning) => `The guidance offered is ${name}: ${meaning.toLowerCase()}`,
};

function getPositionFraming(position: string, cardName: string, meaning: string): string {
  const handler = POSITION_FRAMING[position];
  if (handler) return handler(cardName, meaning);
  return `In the ${position} position, ${cardName} suggests ${meaning.toLowerCase()}`;
}

// --- Context-aware meaning ---

function getContextualMeaning(card: TarotCard, reversed: boolean, context: ReadingContext): string {
  const prefix = reversed ? "In this position, the reversed energy suggests " : "";
  const base = reversed ? card.reversedMeaning : card.uprightMeaning;

  switch (context) {
    case "love":
      if (reversed) return prefix + card.love;
      return card.love;
    case "career":
      if (reversed) return prefix + card.career;
      return card.career;
    case "personal":
      if (reversed) return prefix + card.personalGrowth;
      return card.personalGrowth;
    case "decision":
      if (reversed) return `Uncertainty or mixed signals around this choice. ${base.split(".")[0]}.`;
      return `Clarity and direction for this choice. ${base.split(".")[0]}.`;
    case "situation":
      if (reversed) return `Hidden dynamics or unresolved aspects. ${base.split(".")[0]}.`;
      return `The current energy at play. ${base.split(".")[0]}.`;
    default:
      return base;
  }
}

// --- Keyword overlap ---

function keywordOverlap(a: TarotCard, b: TarotCard): string[] {
  return a.keywords.filter(k => b.keywords.includes(k));
}

// --- Element compatibility ---

const ELEMENT_PAIRS: Record<string, string[]> = {
  "Fire": ["Air"],
  "Air": ["Fire", "Water"],
  "Water": ["Earth", "Air"],
  "Earth": ["Water", "Fire"],
};

function elementsHarmonize(a?: string, b?: string): "harmony" | "tension" | "neutral" {
  if (!a || !b || a === b) return a === b && a ? "harmony" : "neutral";
  if (ELEMENT_PAIRS[a]?.includes(b)) return "harmony";
  return "tension";
}

// --- Card importance ---

function assignImportance(cards: PatternCard[], spread: SpreadDefinition): ("primary" | "significant" | "supporting")[] {
  const positions = spread.positions;
  const total = cards.length;

  return cards.map((card, i) => {
    const pos = positions[i]?.toLowerCase() || "";

    // Outcome/result positions are primary
    if (pos.includes("outcome") || pos.includes("likely outcome")) return "primary" as const;

    // First position (situation/present) is primary
    if (i === 0 && (pos.includes("present") || pos.includes("situation") || pos.includes("guidance"))) return "primary" as const;

    // Advice/guidance positions are significant
    if (pos.includes("advice") || pos.includes("guidance")) return "significant" as const;

    // Challenge/obstacle positions are significant
    if (pos.includes("challenge") || pos.includes("obstacle")) return "significant" as const;

    // Central card in 5+ card spreads is significant
    if (total >= 5 && i === Math.floor(total / 2)) return "significant" as const;

    // Major Arcana are always significant
    if (card.card.arcana === "major") return "significant" as const;

    return "supporting" as const;
  });
}

// --- Pattern detection (shared) ---

export function detectPatterns(cards: PatternCard[]): Pattern[] {
  const patterns: Pattern[] = [];

  // Major Arcana concentration
  const majorCount = cards.filter(c => c.card.arcana === "major").length;
  if (majorCount >= 2) {
    const pct = Math.round((majorCount / cards.length) * 100);
    if (pct >= 60) {
      patterns.push({
        title: "Major Arcana Dominance",
        description: `${majorCount} of ${cards.length} cards are Major Arcana (${pct}%), giving this reading a stronger focus on larger personal themes rather than everyday details.`,
      });
    } else {
      patterns.push({
        title: "Major Arcana Pattern",
        description: `${majorCount} Major Arcana cards suggest this reading touches on meaningful life themes alongside practical matters.`,
      });
    }
  }

  // Suit patterns
  const suitCounts: Record<string, number> = {};
  cards.forEach(c => {
    if (c.card.suit) suitCounts[c.card.suit] = (suitCounts[c.card.suit] || 0) + 1;
  });
  const suitDescriptions: Record<string, string> = {
    cups: "emotional and relational energy",
    wands: "creative and passionate energy",
    swords: "mental and communicative energy",
    pentacles: "material and practical energy",
  };
  Object.entries(suitCounts).forEach(([suit, count]) => {
    if (count >= 2) {
      patterns.push({
        title: `${suit.charAt(0).toUpperCase() + suit.slice(1)} Emphasis`,
        description: `${count} ${suit} cards emphasize ${suitDescriptions[suit]}.`,
      });
    }
  });

  // Reversal pattern
  const reversedCount = cards.filter(c => c.reversed).length;
  if (reversedCount >= 2) {
    const ratio = reversedCount / cards.length;
    if (ratio >= 0.7) {
      patterns.push({
        title: "Strong Reversal Pattern",
        description: `${reversedCount} of ${cards.length} cards are reversed, suggesting a predominantly inward or resistant quality to this reading.`,
      });
    } else {
      patterns.push({
        title: "Reversal Pattern",
        description: `${reversedCount} reversed cards suggest internalized energy, blocked expression, or a need for inward reflection.`,
      });
    }
  }

  // Number repetition
  const numbers = cards.filter(c => c.card.number !== null).map(c => c.card.number!);
  const numberCounts: Record<number, number> = {};
  numbers.forEach(n => { numberCounts[n] = (numberCounts[n] || 0) + 1; });
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
  Object.entries(numberCounts).forEach(([num, count]) => {
    if (count >= 2) {
      patterns.push({
        title: `Number ${num} Repeated`,
        description: `The number ${num} appears ${count} times, pointing to themes of ${numMeanings[Number(num)] || "cycles and patterns"}.`,
      });
    }
  });

  // Court card energy
  const courtCount = cards.filter(c => c.card.number !== null && c.card.number >= 11).length;
  if (courtCount >= 2) {
    patterns.push({
      title: "Court Card Energy",
      description: `${courtCount} court cards suggest strong personality dynamics, interpersonal themes, or different aspects of yourself at play.`,
    });
  }

  return patterns;
}

// --- Card relationship detection ---

function detectConnections(cards: PatternCard[]): KeyConnection[] {
  const connections: KeyConnection[] = [];

  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const a = cards[i];
      const b = cards[j];
      const shared = keywordOverlap(a.card, b.card);

      // Reinforcement: shared keywords
      if (shared.length >= 2) {
        connections.push({
          from: a.card.name,
          to: b.card.name,
          type: "reinforcement",
          description: `Both ${a.card.name} and ${b.card.name} share themes of ${shared.slice(0, 3).join(", ")}, strengthening this thread through the reading.`,
        });
      } else if (shared.length === 1) {
        connections.push({
          from: a.card.name,
          to: b.card.name,
          type: "reinforcement",
          description: `${a.card.name} and ${b.card.name} echo each other through the shared theme of ${shared[0]}.`,
        });
      }

      // Tension: opposing elements
      const elemA = a.card.element;
      const elemB = b.card.element;
      if (elemA && elemB && elementsHarmonize(elemA, elemB) === "tension") {
        connections.push({
          from: a.card.name,
          to: b.card.name,
          type: "tension",
          description: `${a.card.name} (${elemA}) and ${b.card.name} (${elemB}) carry elemental tension, suggesting conflicting approaches or energies.`,
        });
      }

      // Tension: reversed vs upright
      if (a.reversed !== b.reversed && a.card.arcana === b.card.arcana) {
        connections.push({
          from: a.card.name,
          to: b.card.name,
          type: "tension",
          description: `${a.card.name}${a.reversed ? " (reversed)" : ""} and ${b.card.name}${b.reversed ? " (reversed)" : ""} pull in different directions within the same archetypal energy.`,
        });
      }
    }
  }

  // Progression: sequential Major Arcana
  const majors = cards
    .filter(c => c.card.arcana === "major" && c.card.number !== null)
    .sort((a, b) => (a.card.number || 0) - (b.card.number || 0));
  for (let i = 1; i < majors.length; i++) {
    if ((majors[i].card.number || 0) - (majors[i - 1].card.number || 0) <= 3) {
      connections.push({
        from: majors[i - 1].card.name,
        to: majors[i].card.name,
        type: "progression",
        description: `${majors[i - 1].card.name} flows naturally into ${majors[i].card.name}, suggesting a clear developmental arc.`,
      });
    }
  }

  // Resolution: advice card addressing a challenge/obstacle
  const challengeIdx = cards.findIndex(c => {
    const pos = (c.position || "").toLowerCase();
    return pos.includes("challenge") || pos.includes("obstacle");
  });
  const adviceIdx = cards.findIndex(c => {
    const pos = (c.position || "").toLowerCase();
    return pos.includes("advice") || pos.includes("guidance");
  });
  if (challengeIdx >= 0 && adviceIdx >= 0) {
    connections.push({
      from: cards[challengeIdx].card.name,
      to: cards[adviceIdx].card.name,
      type: "resolution",
      description: `${cards[adviceIdx].card.name} offers a way through the difficulty presented by ${cards[challengeIdx].card.name}.`,
    });
  }

  return connections;
}

// --- Contradiction detection ---

function detectContradictions(cards: PatternCard[]): Contradiction[] {
  const contradictions: Contradiction[] = [];

  // Check for cards with strongly opposing keywords
  const oppositions: [string, string][] = [
    ["courage", "fear"],
    ["freedom", "restriction"],
    ["action", "patience"],
    ["strength", "vulnerability"],
    ["beginning", "ending"],
    ["light", "shadow"],
    ["love", "conflict"],
    ["hope", "despair"],
    ["growth", "decay"],
    ["clarity", "confusion"],
  ];

  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const aKw = cards[i].card.keywords.map(k => k.toLowerCase());
      const bKw = cards[j].card.keywords.map(k => k.toLowerCase());

      for (const [a, b] of oppositions) {
        if ((aKw.includes(a) && bKw.includes(b)) || (aKw.includes(b) && bKw.includes(a))) {
          contradictions.push({
            description: `${cards[i].card.name} and ${cards[j].card.name} carry opposing energies, creating tension that may not resolve neatly.`,
            cards: [cards[i].card.name, cards[j].card.name],
          });
          break;
        }
      }
    }
  }

  return contradictions;
}

// --- Whole-spread meaning ---

function generateWholeSpreadMeaning(
  cards: PatternCard[],
  spread: SpreadDefinition,
  context: ReadingContext,
  patterns: Pattern[],
  connections: KeyConnection[],
  contradictions: Contradiction[]
): string {
  const parts: string[] = [];

  // What the spread centres around
  const firstCard = cards[0];
  if (firstCard) {
    const pos = firstCard.position || spread.positions[0];
    parts.push(`This ${spread.name} centres on ${firstCard.card.name} in the ${pos} position, suggesting ${firstCard.card.uprightMeaning.split(".")[0].toLowerCase()}.`);
  }

  // Strongest pattern
  if (patterns.length > 0) {
    parts.push(`The strongest underlying pattern is ${patterns[0].title.toLowerCase()}: ${patterns[0].description}`);
  }

  // Main tension
  if (contradictions.length > 0) {
    parts.push(`Where the main tension lies: ${contradictions[0].description}`);
  } else if (connections.some(c => c.type === "tension")) {
    const tension = connections.find(c => c.type === "tension")!;
    parts.push(`Tension exists between ${tension.from} and ${tension.to}: ${tension.description}`);
  }

  // What is developing
  const lastCard = cards[cards.length - 1];
  if (lastCard && cards.length > 1) {
    const pos = lastCard.position || spread.positions[spread.positions.length - 1];
    parts.push(`What appears to be developing is reflected in ${lastCard.card.name} in the ${pos} position: ${lastCard.card.uprightMeaning.split(".")[0].toLowerCase()}.`);
  }

  // Context adaptation
  const contextAdaptations: Record<ReadingContext, string> = {
    love: "The emotional and relational dimensions deserve particular attention here.",
    career: "The professional and practical dimensions are highlighted in this reading.",
    personal: "This reading invites deep inner reflection and personal awareness.",
    decision: "The tension between choices and the clarity needed to make them runs through this spread.",
    situation: "The current circumstances and their dynamics are at the heart of this reading.",
    general: "The cards collectively invite reflection on the forces currently at work in your life.",
  };
  parts.push(contextAdaptations[context]);

  return parts.join(" ");
}

// --- Central theme ---

function generateCentralTheme(cards: PatternCard[], context: ReadingContext): string {
  const allKeywords = cards.flatMap(c => c.card.keywords);
  const freq: Record<string, number> = {};
  allKeywords.forEach(k => { freq[k] = (freq[k] || 0) + 1; });
  const topKeywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  const first = cards[0];
  const last = cards[cards.length - 1];

  if (!first || !last) return topKeywords.join(", ");

  const fromTheme = first.card.uprightMeaning.split(".")[0].toLowerCase();
  const toTheme = last.card.uprightMeaning.split(".")[0].toLowerCase();

  const connectors: Record<ReadingContext, string> = {
    love: "In matters of the heart",
    career: "On your professional path",
    personal: "In your inner life",
    decision: "Regarding the choice before you",
    situation: "In the current circumstances",
    general: "In the current moment",
  };

  return `${connectors[context]}, ${topKeywords.join(" and ")} weave through this reading — moving from ${fromTheme} toward ${toTheme}.`;
}

// --- Dominant energy ---

function detectDominantEnergy(cards: PatternCard[]): string | null {
  if (cards.length < 3) return null;

  const suitCounts: Record<string, number> = {};
  cards.forEach(c => { if (c.card.suit) suitCounts[c.card.suit] = (suitCounts[c.card.suit] || 0) + 1; });

  const maxSuit = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0];
  if (maxSuit && maxSuit[1] >= Math.ceil(cards.length * 0.5)) {
    const energies: Record<string, string> = {
      cups: "emotional",
      wands: "creative",
      swords: "mental",
      pentacles: "practical",
    };
    return energies[maxSuit[0]] || null;
  }

  const majorCount = cards.filter(c => c.card.arcana === "major").length;
  if (majorCount >= Math.ceil(cards.length * 0.6)) return "transformative";

  const reversedCount = cards.filter(c => c.reversed).length;
  if (reversedCount >= Math.ceil(cards.length * 0.6)) return "reflective";

  return null;
}

// --- Major Arcana pattern text ---

function generateMajorArcanaPattern(cards: PatternCard[]): string | null {
  const majorCount = cards.filter(c => c.card.arcana === "major").length;
  if (majorCount < 3) return null;

  const pct = Math.round((majorCount / cards.length) * 100);
  if (pct >= 60) {
    return `${majorCount} of ${cards.length} cards are Major Arcana, giving this reading a stronger focus on larger personal themes rather than everyday details.`;
  }
  return `${majorCount} Major Arcana cards appear, suggesting meaningful life themes alongside practical considerations.`;
}

// --- Suit pattern text ---

function generateSuitPattern(cards: PatternCard[]): string | null {
  const suitCounts: Record<string, number> = {};
  cards.forEach(c => { if (c.card.suit) suitCounts[c.card.suit] = (suitCounts[c.card.suit] || 0) + 1; });

  const dominant = Object.entries(suitCounts).sort((a, b) => b[1] - a[1])[0];
  if (!dominant || dominant[1] < 3) return null;

  const meanings: Record<string, string> = {
    cups: "Emotional and relational energy is dominant, highlighting feelings, connections, and intuition.",
    wands: "Creative and passionate energy is dominant, highlighting drive, inspiration, and action.",
    swords: "Mental and communicative energy is dominant, highlighting thoughts, decisions, and clarity.",
    pentacles: "Material and practical energy is dominant, highlighting resources, stability, and grounded matters.",
  };

  return meanings[dominant[0]] || null;
}

// --- Number pattern text ---

function generateNumberPattern(cards: PatternCard[]): string | null {
  const numbers = cards.filter(c => c.card.number !== null).map(c => c.card.number!);
  const counts: Record<number, number> = {};
  numbers.forEach(n => { counts[n] = (counts[n] || 0) + 1; });

  const repeated = Object.entries(counts).filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1]);
  if (repeated.length === 0) return null;

  const [num, count] = repeated[0];
  const meanings: Record<string, string> = {
    "1": "new beginnings",
    "2": "balance and partnership",
    "3": "creativity and growth",
    "4": "stability and structure",
    "5": "change and challenge",
    "6": "harmony and responsibility",
    "7": "reflection and inner work",
    "8": "movement and mastery",
    "9": "completion and transition",
    "10": "culmination and new cycles",
  };

  return `The number ${num} appears ${count} times, emphasizing themes of ${meanings[num] || "cycles and patterns"}.`;
}

// --- Court card insight ---

function generateCourtCardInsight(cards: PatternCard[]): string | null {
  const courts = cards.filter(c => c.card.number !== null && c.card.number >= 11);
  if (courts.length < 2) return null;

  const roles: Record<number, string> = {
    11: "Pages (beginners, messengers, students)",
    12: "Knights (action, movement, pursuit)",
    13: "Queens (mastery, nurturing, internalised power)",
    14: "Kings (authority, leadership, externalised power)",
  };

  const roleCounts: Record<number, number> = {};
  courts.forEach(c => {
    const role = c.card.number!;
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });

  const dominantRole = Object.entries(roleCounts).sort((a, b) => b[1] - a[1])[0];
  if (dominantRole) {
    return `${courts.length} court cards appear. ${roles[Number(dominantRole[0])] || "Court card energy"} is prominent, suggesting themes of personality dynamics, roles, or aspects of yourself at play.`;
  }

  return `${courts.length} court cards suggest interpersonal dynamics or different facets of your own approach.`;
}

// --- Reversal pattern text ---

function generateReversalPattern(cards: PatternCard[]): string | null {
  const reversedCount = cards.filter(c => c.reversed).length;
  if (reversedCount < 2) return null;

  const ratio = reversedCount / cards.length;
  if (ratio >= 0.7) {
    return `The majority of cards (${reversedCount} of ${cards.length}) are reversed, suggesting a predominantly inward, reflective, or resistant quality to this reading. The answers may lie more in internal processing than external action.`;
  }
  if (ratio >= 0.5) {
    return `${reversedCount} reversed cards suggest a mix of outward expression and inward energy. Some themes are being processed internally or may face resistance.`;
  }
  return `${reversedCount} reversed cards appear, adding nuance to the reading through internalized or blocked energy in certain areas.`;
}

// --- Turning point detection ---

function detectTurningPoint(cards: PatternCard[], spread: SpreadDefinition): string | null {
  if (cards.length < 3) return null;

  // Check for Major Arcana transitions
  for (let i = 1; i < cards.length; i++) {
    if (cards[i].card.arcana === "major" && cards[i - 1].card.arcana === "minor") {
      const pos = cards[i].position || spread.positions[i];
      return `${cards[i].card.name} in the ${pos} position marks a shift from personal matters to larger archetypal forces.`;
    }
  }

  // Check for reversal transitions
  for (let i = 1; i < cards.length; i++) {
    if (cards[i].reversed !== cards[i - 1].reversed) {
      const from = cards[i - 1].card.name;
      const to = cards[i].card.name;
      if (cards[i].reversed) {
        return `A shift occurs at ${to} — moving from outward expression toward inward processing.`;
      }
      return `A shift occurs at ${to} — energy moves from internal to external.`;
    }
  }

  // Check for suit transitions
  for (let i = 1; i < cards.length; i++) {
    if (cards[i].card.suit && cards[i - 1].card.suit && cards[i].card.suit !== cards[i - 1].card.suit) {
      return `The energy shifts from ${cards[i - 1].card.suit} themes to ${cards[i].card.suit} themes at ${cards[i].card.name}.`;
    }
  }

  return null;
}

// --- Supports / Challenges ---

function deriveSupportsAndChallenges(cards: PatternCard[], spread: SpreadDefinition): { supports: string[]; challenges: string[] } {
  const supports: string[] = [];
  const challenges: string[] = [];

  cards.forEach((dc, i) => {
    const pos = (dc.position || spread.positions[i] || "").toLowerCase();
    const name = dc.card.name;
    const reversed = dc.reversed;

    if (pos.includes("advice") || pos.includes("guidance") || pos.includes("opportunity")) {
      supports.push(`${name}${reversed ? " (reversed)" : ""}: ${dc.card.uprightMeaning.split(".")[0]}.`);
    }
    if (pos.includes("challenge") || pos.includes("obstacle")) {
      challenges.push(`${name}${reversed ? " (reversed)" : ""}: ${dc.card.uprightMeaning.split(".")[0]}.`);
    }
    if (pos.includes("hope") || pos.includes("fear")) {
      if (!reversed) {
        supports.push(`${name} represents a hope or aspiration: ${dc.card.uprightMeaning.split(".")[0]}.`);
      } else {
        challenges.push(`${name} represents a fear or concern: ${dc.card.reversedMeaning.split(".")[0]}.`);
      }
    }
  });

  // If no explicit supports/challenges found, derive from card quality
  if (supports.length === 0) {
    const uprightMajors = cards.filter(c => c.card.arcana === "major" && !c.reversed);
    uprightMajors.slice(0, 2).forEach(dc => {
      supports.push(`${dc.card.name} brings ${dc.card.keywords[0]} energy that supports this situation.`);
    });
  }
  if (challenges.length === 0) {
    const reversedCards = cards.filter(c => c.reversed);
    reversedCards.slice(0, 2).forEach(dc => {
      challenges.push(`${dc.card.name} (reversed) may present ${dc.card.keywords[0]} as an area of difficulty.`);
    });
  }

  return { supports, challenges };
}

// --- Key message ---

function generateKeyMessage(cards: PatternCard[], context: ReadingContext): string {
  const theme = generateCentralTheme(cards, context);
  const first = cards[0];
  const last = cards[cards.length - 1];

  if (!first) return "The cards invite you to reflect on the energies at play.";

  const contextEndings: Record<ReadingContext, string> = {
    love: "Trust what your heart is telling you.",
    career: "Consider what aligns with your longer-term path.",
    personal: "Listen to what your inner self is asking of you.",
    decision: "The clarity you seek is already within you.",
    situation: "Observe the situation with both honesty and compassion.",
    general: "The cards invite reflection, not certainty.",
  };

  return `${contextEndings[context]} ${first.card.name} through ${last?.card.name} suggests a journey from ${first.card.uprightMeaning.split(".")[0].toLowerCase()}${last ? ` toward ${last.card.uprightMeaning.split(".")[0].toLowerCase()}` : ""}.`;
}

// --- Reflection question ---

function generateReflectionQuestion(cards: PatternCard[], context: ReadingContext): string {
  const lastCard = cards[cards.length - 1];
  if (lastCard) return lastCard.card.reflectionQuestion;

  const contextQuestions: Record<ReadingContext, string> = {
    love: "What does your heart already know that your mind is hesitating to accept?",
    career: "What would you pursue if you knew you could not fail?",
    personal: "What part of yourself are you being invited to grow into?",
    decision: "Which option excites you, even if it also scares you?",
    situation: "What would change if you looked at this situation from a place of wholeness?",
    general: "What is this reading asking you to pay attention to?",
  };

  return contextQuestions[context];
}

// --- Position-aware card interpretation ---

function generateCardAnalyses(cards: PatternCard[], spread: SpreadDefinition, context: ReadingContext): CardAnalysis[] {
  const importance = assignImportance(cards, spread);

  return cards.map((dc, i) => {
    const meaning = dc.reversed ? dc.card.reversedMeaning : dc.card.uprightMeaning;
    const positionMeaning = getPositionFraming(dc.position || spread.positions[i], dc.card.name, meaning.split(".")[0]);
    const contextualInterpretation = getContextualMeaning(dc.card, dc.reversed, context);

    return {
      card: dc,
      positionMeaning,
      contextualInterpretation,
      importance: importance[i],
    };
  });
}

// --- MAIN ENTRY POINT ---

export function analyzeReading(
  drawnCards: PatternCard[],
  spread: SpreadDefinition,
  context: ReadingContext = "general",
  question?: string
): ReadingIntelligence {
  if (drawnCards.length === 0) {
    return {
      centralTheme: "",
      dominantEnergy: null,
      majorArcanaPattern: null,
      suitPattern: null,
      numberPattern: null,
      courtCardInsight: null,
      reversalPattern: null,
      turningPoint: null,
      keyConnections: [],
      supportsYou: [],
      challengesYou: [],
      wholeSpreadMeaning: "",
      keyMessage: "",
      reflectionQuestion: "",
      cardAnalyses: [],
      contradictions: [],
      patterns: [],
    };
  }

  const patterns = detectPatterns(drawnCards);
  const connections = detectConnections(drawnCards);
  const contradictions = detectContradictions(drawnCards);
  const { supports, challenges } = deriveSupportsAndChallenges(drawnCards, spread);
  const cardAnalyses = generateCardAnalyses(drawnCards, spread, context);

  const majorArcanaPattern = generateMajorArcanaPattern(drawnCards);
  const suitPattern = generateSuitPattern(drawnCards);
  const numberPattern = generateNumberPattern(drawnCards);
  const courtCardInsight = generateCourtCardInsight(drawnCards);
  const reversalPattern = generateReversalPattern(drawnCards);
  const turningPoint = detectTurningPoint(drawnCards, spread);

  const centralTheme = generateCentralTheme(drawnCards, context);
  const dominantEnergy = detectDominantEnergy(drawnCards);
  const wholeSpreadMeaning = generateWholeSpreadMeaning(drawnCards, spread, context, patterns, connections, contradictions);
  const keyMessage = generateKeyMessage(drawnCards, context);
  const reflectionQuestion = generateReflectionQuestion(drawnCards, context);

  return {
    centralTheme,
    dominantEnergy,
    majorArcanaPattern,
    suitPattern,
    numberPattern,
    courtCardInsight,
    reversalPattern,
    turningPoint,
    keyConnections: connections,
    supportsYou: supports,
    challengesYou: challenges,
    wholeSpreadMeaning,
    keyMessage,
    reflectionQuestion,
    cardAnalyses,
    contradictions,
    patterns,
  };
}

// --- Format intelligence as readable text (for interpretation display) ---

export function formatReadingAsText(intel: ReadingIntelligence, drawnCards: PatternCard[], spread: SpreadDefinition): string {
  const parts: string[] = [];

  // Card-by-card with position-aware interpretation
  intel.cardAnalyses.forEach(ca => {
    const label = ca.importance === "primary" ? " ★" : ca.importance === "significant" ? " ●" : "";
    parts.push(`**${ca.card.position}** — ${ca.card.card.name}${ca.card.reversed ? " (Reversed)" : ""}${label}`);
    parts.push(ca.positionMeaning);
    parts.push("");
  });

  // Central theme
  parts.push(`**Central Theme**`);
  parts.push(intel.centralTheme);
  parts.push("");

  // Dominant energy
  if (intel.dominantEnergy) {
    parts.push(`**Dominant Energy**: ${intel.dominantEnergy}`);
    parts.push("");
  }

  // Patterns
  if (intel.patterns.length > 0) {
    intel.patterns.forEach(p => {
      parts.push(`**${p.title}**`);
      parts.push(p.description);
      parts.push("");
    });
  }

  // Key connections
  if (intel.keyConnections.length > 0) {
    parts.push("**Key Connections**");
    // Show only top connections (max 5)
    const topConnections = intel.keyConnections
      .sort((a, b) => {
        const order: Record<ConnectionType, number> = { resolution: 0, tension: 1, progression: 2, reinforcement: 3, contrast: 4, repetition: 5 };
        return order[a.type] - order[b.type];
      })
      .slice(0, 5);
    topConnections.forEach(c => {
      const typeLabel = c.type.charAt(0).toUpperCase() + c.type.slice(1);
      parts.push(`**${c.from} → ${c.to}** (${typeLabel})`);
      parts.push(c.description);
      parts.push("");
    });
  }

  // Contradictions
  if (intel.contradictions.length > 0) {
    parts.push("**Important Tension**");
    intel.contradictions.forEach(c => {
      parts.push(c.description);
    });
    parts.push("");
  }

  // Supports / Challenges
  if (intel.supportsYou.length > 0) {
    parts.push("**What Supports You**");
    intel.supportsYou.forEach(s => parts.push(`• ${s}`));
    parts.push("");
  }
  if (intel.challengesYou.length > 0) {
    parts.push("**What Challenges You**");
    intel.challengesYou.forEach(c => parts.push(`• ${c}`));
    parts.push("");
  }

  // Turning point
  if (intel.turningPoint) {
    parts.push("**Turning Point**");
    parts.push(intel.turningPoint);
    parts.push("");
  }

  // Whole-spread meaning
  parts.push("**The Reading as a Whole**");
  parts.push(intel.wholeSpreadMeaning);
  parts.push("");

  // Key message
  parts.push("**Key Message**");
  parts.push(intel.keyMessage);
  parts.push("");

  // Reflection question
  parts.push("**Reflection Question**");
  parts.push(intel.reflectionQuestion);

  return parts.join("\n");
}

// --- Format intelligence as Luna context ---

export function formatForLuna(intel: ReadingIntelligence, drawnCards: PatternCard[], spread: SpreadDefinition, question?: string): string {
  const lines: string[] = [];

  lines.push(`Tarot Reading — ${spread.name}`);
  if (question) lines.push(`Question: ${question}`);
  lines.push("");

  lines.push("Cards:");
  drawnCards.forEach(dc => {
    lines.push(`  ${dc.position}: ${dc.card.name}${dc.reversed ? " (Reversed)" : ""}`);
  });
  lines.push("");

  lines.push(`Central Theme: ${intel.centralTheme}`);
  if (intel.dominantEnergy) lines.push(`Dominant Energy: ${intel.dominantEnergy}`);
  lines.push("");

  if (intel.patterns.length > 0) {
    lines.push("Patterns:");
    intel.patterns.forEach(p => lines.push(`  ${p.title}: ${p.description}`));
    lines.push("");
  }

  if (intel.keyConnections.length > 0) {
    lines.push("Key Connections:");
    intel.keyConnections.slice(0, 5).forEach(c => {
      lines.push(`  ${c.from} → ${c.to} (${c.type}): ${c.description}`);
    });
    lines.push("");
  }

  if (intel.contradictions.length > 0) {
    lines.push("Tensions:");
    intel.contradictions.forEach(c => lines.push(`  ${c.description}`));
    lines.push("");
  }

  lines.push(`Whole-Spread Meaning: ${intel.wholeSpreadMeaning}`);
  lines.push(`Key Message: ${intel.keyMessage}`);
  lines.push(`Reflection: ${intel.reflectionQuestion}`);
  lines.push("");
  lines.push("Please discuss this reading in depth, considering the patterns, tensions, and connections above.");

  return lines.join("\n");
}
