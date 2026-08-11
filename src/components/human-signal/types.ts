export const SIGNAL_TYPES = [
  { id: "company", label: "I need company", emoji: "🫂" },
  { id: "understand", label: "I need someone to understand", emoji: "💭" },
  { id: "encouragement", label: "I need encouragement", emoji: "🌱" },
  { id: "listen", label: "I need someone to listen", emoji: "👂" },
  { id: "difficult_day", label: "I'm having a difficult day", emoji: "❤️" },
  { id: "good_share", label: "I have something good to share", emoji: "🎉" },
  { id: "dont_know", label: "I don't know what I need", emoji: "🌫️" },
  { id: "not_alone", label: "I just don't want to feel alone", emoji: "🕯️" },
] as const;

export type SignalType = typeof SIGNAL_TYPES[number]["id"];

export interface HumanSignal {
  id: string;
  sender_id: string;
  signal_type: SignalType;
  status: "waiting" | "claimed" | "heard" | "expired";
  claimed_by: string | null;
  created_at: string;
  claimed_at: string | null;
  heard_at: string | null;
  expires_at: string;
}

export interface SignalAcknowledgement {
  id: string;
  signal_id: string;
  receiver_id: string;
  created_at: string;
}

export const SIGNAL_MESSAGES: Record<SignalType, string> = {
  company: "Someone, somewhere, needs company right now.",
  understand: "Someone, somewhere, needs to be understood.",
  encouragement: "Someone, somewhere, needs a little encouragement.",
  listen: "Someone, somewhere, needs someone to listen.",
  difficult_day: "Someone, somewhere, is having a difficult day.",
  good_share: "Someone, somewhere, has something good to share.",
  dont_know: "Someone, somewhere, doesn't know what they need.",
  not_alone: "Someone, somewhere, doesn't want to feel alone.",
};

export const SIGNAL_DURATION_MS = 10 * 60 * 1000; // 10 minutes
export const RATE_LIMIT_COOLDOWN_MS = 30 * 1000; // 30 seconds
export const DAILY_SIGNAL_LIMIT = 5;

export function getSignalType(id: string) {
  return SIGNAL_TYPES.find(s => s.id === id) || SIGNAL_TYPES[0];
}

export function isSignalExpired(signal: HumanSignal): boolean {
  return new Date(signal.expires_at).getTime() < Date.now();
}
