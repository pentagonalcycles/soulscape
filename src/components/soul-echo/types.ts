export interface Reflection {
  id: string;
  user_id: string;
  content: string;
  emotion_tags: string[];
  is_matched: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  reflection_a_id: string;
  reflection_b_id: string;
  user_a_id: string;
  user_b_id: string;
  status: "pending" | "active" | "ended";
  created_at: string;
  reflection_a?: Reflection;
  reflection_b?: Reflection;
}

export interface Message {
  id: string;
  match_id: string;
  user_id: string;
  content: string;
  message_type: "text" | "letter" | "encouragement" | "quote" | "song" | "kindness";
  is_read: boolean;
  created_at: string;
}

export interface DailyLimit {
  id: string;
  user_id: string;
  submission_date: string;
  submission_count: number;
}

export type SoulEchoStage =
  | "landing"
  | "reflection"
  | "matching"
  | "match-reveal"
  | "response"
  | "connection"
  | "empty";

export interface ResponseOption {
  type: Message["message_type"];
  label: string;
  icon: string;
  description: string;
}

export const RESPONSE_OPTIONS: ResponseOption[] = [
  { type: "letter", label: "Write a letter", icon: "✉", description: "Share your thoughts in words" },
  { type: "encouragement", label: "Share encouragement", icon: "✦", description: "Offer gentle support" },
  { type: "quote", label: "Share a favourite quote", icon: "❝", description: "Words that moved you" },
  { type: "song", label: "Share a meaningful song", icon: "♪", description: "A melody that speaks" },
  { type: "kindness", label: "Simply send kindness", icon: "◈", description: "A moment of warmth" },
];

export const EMOTION_KEYWORDS: Record<string, string[]> = {
  sadness: ["sad", "crying", "tears", "grief", "loss", "miss", "missing", "gone", "empty", "hollow", "broken", "heartache", "sorrow"],
  anxiety: ["anxious", "worried", "nervous", "panic", "fear", "scared", "overthinking", "racing", "overwhelmed", "stress", "tense"],
  loneliness: ["lonely", "alone", "isolated", "disconnected", "nobody", "no one", "abandoned", "forgotten", "invisible"],
  hope: ["hope", "hopeful", "better", "future", "believe", "trust", "faith", "bright", "light", "dawn", "new"],
  love: ["love", "care", "heart", "warm", "tender", "gentle", "cherish", "adore", "affection", "compassion"],
  anger: ["angry", "furious", "frustrated", "mad", "rage", "bitter", "resentment", "fed up", "done"],
  confusion: ["confused", "lost", "uncertain", "unsure", "direction", "purpose", "meaning", "why", "how", "what now"],
  gratitude: ["grateful", "thankful", "appreciate", "blessed", "lucky", "gift", "grace", "mercy"],
  grief: ["grief", "mourning", "loss", "passed away", "death", "funeral", "remember", "gone forever"],
  exhaustion: ["tired", "exhausted", "drained", "burnout", "weary", " depleted", "no energy", "heavy"],
  healing: ["healing", "recovery", "growing", "learning", "progress", "better", "therapy", "working on"],
  creativity: ["create", "imagine", "dream", "inspire", "art", "music", "write", "poetry", "beauty"],
};
