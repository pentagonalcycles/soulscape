export const EMOTIONS = [
  { id: "happy", label: "Happy", emoji: "😊", color: "#f59e0b", warmth: 0.9, energy: 0.8, pressure: 0.1, visibility: 0.9 },
  { id: "calm", label: "Calm", emoji: "😌", color: "#06b6d4", warmth: 0.6, energy: 0.3, pressure: 0.1, visibility: 0.8 },
  { id: "hopeful", label: "Hopeful", emoji: "🌟", color: "#10b981", warmth: 0.8, energy: 0.6, pressure: 0.2, visibility: 0.7 },
  { id: "loved", label: "Loved", emoji: "❤️", color: "#ec4899", warmth: 1.0, energy: 0.5, pressure: 0.1, visibility: 0.9 },
  { id: "excited", label: "Excited", emoji: "🤩", color: "#f97316", warmth: 0.7, energy: 1.0, pressure: 0.3, visibility: 0.8 },
  { id: "energised", label: "Energised", emoji: "⚡", color: "#eab308", warmth: 0.5, energy: 0.9, pressure: 0.2, visibility: 0.7 },
  { id: "tired", label: "Tired", emoji: "😴", color: "#6366f1", warmth: 0.3, energy: 0.1, pressure: 0.3, visibility: 0.4 },
  { id: "sad", label: "Sad", emoji: "😔", color: "#3b82f6", warmth: 0.2, energy: 0.2, pressure: 0.6, visibility: 0.3 },
  { id: "lonely", label: "Lonely", emoji: "🫥", color: "#64748b", warmth: 0.2, energy: 0.2, pressure: 0.7, visibility: 0.2 },
  { id: "anxious", label: "Anxious", emoji: "😰", color: "#8b5cf6", warmth: 0.3, energy: 0.6, pressure: 0.9, visibility: 0.4 },
  { id: "overwhelmed", label: "Overwhelmed", emoji: "🌊", color: "#0ea5e9", warmth: 0.3, energy: 0.5, pressure: 1.0, visibility: 0.3 },
  { id: "angry", label: "Angry", emoji: "😤", color: "#ef4444", warmth: 0.8, energy: 0.8, pressure: 0.8, visibility: 0.5 },
  { id: "lost", label: "Lost", emoji: "🌫️", color: "#94a3b8", warmth: 0.2, energy: 0.2, pressure: 0.5, visibility: 0.1 },
  { id: "numb", label: "Numb", emoji: "🪨", color: "#78716c", warmth: 0.1, energy: 0.1, pressure: 0.4, visibility: 0.1 },
  { id: "unnamed", label: "Something I can't name", emoji: "🌀", color: "#a78bfa", warmth: 0.5, energy: 0.5, pressure: 0.5, visibility: 0.5 },
] as const;

export type EmotionId = typeof EMOTIONS[number]["id"];

export interface EmotionCheckin {
  id: string;
  user_id: string | null;
  emotion: EmotionId;
  country_code: string | null;
  region: string | null;
  created_at: string;
}

export interface EmotionStat {
  emotion: EmotionId;
  count: number;
  percentage: number;
}

export function getEmotionById(id: string) {
  return EMOTIONS.find(e => e.id === id) || EMOTIONS[0];
}

export function calculateStats(checkins: EmotionCheckin[]): EmotionStat[] {
  if (checkins.length === 0) return [];
  
  const counts: Record<string, number> = {};
  for (const c of checkins) {
    counts[c.emotion] = (counts[c.emotion] || 0) + 1;
  }
  
  const total = checkins.length;
  return EMOTIONS
    .map(e => ({
      emotion: e.id as EmotionId,
      count: counts[e.id] || 0,
      percentage: total > 0 ? Math.round(((counts[e.id] || 0) / total) * 100) : 0,
    }))
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function getDominantEmotion(stats: EmotionStat[]): EmotionStat | null {
  return stats.length > 0 ? stats[0] : null;
}

export function getAtmosphereColor(stats: EmotionStat[]): string {
  if (stats.length === 0) return "#0d9488";
  const dominant = getDominantById(stats[0].emotion);
  return dominant?.color || "#0d9488";
}

function getDominantById(id: EmotionId) {
  return EMOTIONS.find(e => e.id === id);
}

export function calculateMetrics(stats: EmotionStat[]) {
  const totalWeight = stats.reduce((sum, s) => sum + s.count, 0);
  if (totalWeight === 0) return { pressure: 0, warmth: 0, energy: 0, visibility: 0 };

  let pressure = 0, warmth = 0, energy = 0, visibility = 0;
  for (const s of stats) {
    const e = getEmotionById(s.emotion);
    const weight = s.count / totalWeight;
    pressure += e.pressure * weight;
    warmth += e.warmth * weight;
    energy += e.energy * weight;
    visibility += e.visibility * weight;
  }

  return {
    pressure: Math.round(pressure * 100),
    warmth: Math.round(warmth * 100),
    energy: Math.round(energy * 100),
    visibility: Math.round(visibility * 100),
  };
}
