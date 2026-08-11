import type { NeraType, NeraEmotion } from "./types";

export interface NeraTypeInfo {
  id: NeraType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const NERA_TYPES: NeraTypeInfo[] = [
  { id: "quiet_coffee", label: "Quiet Coffee", icon: "\u2615", color: "#92400e", description: "For people who want company without having to be the loudest person in the room." },
  { id: "walk_and_talk", label: "Walk & Talk", icon: "\ud83d\udeb6", color: "#059669", description: "Move your body, share your thoughts. Some conversations flow better in motion." },
  { id: "create_together", label: "Create Together", icon: "\ud83c\udfa8", color: "#7c3aed", description: "Draw, write, design, build. Creative energy shared is creative energy multiplied." },
  { id: "lets_eat", label: "Let's Eat Somewhere", icon: "\ud83c\udf5c\ufe0f", color: "#ea580c", description: "Food tastes better when shared. Find someone to explore a new restaurant with." },
  { id: "game_night", label: "Game Night", icon: "\ud83c\udfae", color: "#2563eb", description: "Board games, card games, video games. Competition makes everything more fun." },
  { id: "music_people", label: "Music People", icon: "\ud83c\udfa7", color: "#db2777", description: "Share playlists, attend concerts, or just listen together in comfortable silence." },
  { id: "deep_conversation", label: "Deep Conversation", icon: "\ud83d\udcad", color: "#6366f1", description: "Skip the small talk. Find someone who wants to go deeper." },
  { id: "fresh_air", label: "Fresh Air", icon: "\ud83c\udf3f", color: "#16a34a", description: "Nature walks, park hangs, stargazing. The outdoors heals." },
  { id: "need_company", label: "Need Company", icon: "\ud83e\udee7", color: "#0891b2", description: "No explanation needed. Sometimes you just need someone nearby." },
  { id: "something_spontaneous", label: "Something Spontaneous", icon: "\u26a1", color: "#d97706", description: "Life is short. Say yes to something unexpected." },
  { id: "online_tonight", label: "Online Tonight", icon: "\ud83c\udf10", color: "#4f46e5", description: "Connection without leaving home. Perfect for late nights and shy souls." },
];

export const NERA_EMOTIONS: { id: NeraEmotion; label: string; icon: string; color: string }[] = [
  { id: "need_company", label: "I need company", icon: "\ud83e\udee7", color: "#0891b2" },
  { id: "want_to_talk", label: "I want to talk", icon: "\ud83d\udde3\ufe0f", color: "#6366f1" },
  { id: "want_distraction", label: "I want a distraction", icon: "\ud83c\udf1f", color: "#d97706" },
  { id: "feel_spontaneous", label: "I feel spontaneous", icon: "\u26a1", color: "#ea580c" },
  { id: "meet_someone_new", label: "I want to meet someone new", icon: "\ud83e\udd1d", color: "#059669" },
  { id: "quiet_day", label: "I want a quiet day", icon: "\ud83c\udf19", color: "#7c3aed" },
  { id: "want_adventure", label: "I want an adventure", icon: "\ud83c\udfd4\ufe0f", color: "#dc2626" },
  { id: "surprise_me", label: "Surprise me", icon: "\ud83c\udf81", color: "#db2777" },
];

export const REPORT_REASONS = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "unsafe", label: "Unsafe location or activity" },
  { value: "spam", label: "Spam or advertising" },
  { value: "fake", label: "Fake or misleading" },
  { value: "other", label: "Other" },
] as const;

export function getNeraTypeById(id: string): NeraTypeInfo {
  return NERA_TYPES.find((t) => t.id === id) || NERA_TYPES[0];
}

export function getEmotionById(id: string) {
  return NERA_EMOTIONS.find((e) => e.id === id) || NERA_EMOTIONS[0];
}

export function formatNeraDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  if (isToday) return "Today at " + time;
  if (isTomorrow) return "Tomorrow at " + time;
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + " at " + time;
}

export function getTimeUntil(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff < 0) return "Past";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return "in " + days + " day" + (days > 1 ? "s" : "");
  if (hours > 0) return "in " + hours + " hour" + (hours > 1 ? "s" : "");
  return "Soon";
}

export function getDayOfWeek(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });
}

export function getShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
