export interface Question {
  id: number;
  text: string;
  category: string;
}

export const CATEGORIES: Record<string, { color: string; glow: string }> = {
  emotions: { color: "#f59e0b", glow: "rgba(245, 158, 11, 0.3)" },
  values: { color: "#00ff88", glow: "rgba(0, 255, 136, 0.3)" },
  fears: { color: "#6366f1", glow: "rgba(99, 102, 241, 0.3)" },
  dreams: { color: "#eab308", glow: "rgba(234, 179, 8, 0.3)" },
  identity: { color: "#ec4899", glow: "rgba(236, 72, 153, 0.3)" },
};

export const QUESTIONS: Question[] = [
  { id: 1, text: "What are you feeling right now?", category: "emotions" },
  { id: 2, text: "What emotion do you avoid?", category: "emotions" },
  { id: 3, text: "When did you last cry?", category: "emotions" },
  { id: 4, text: "What makes you feel alive?", category: "emotions" },
  { id: 5, text: "What feeling do you chase?", category: "emotions" },
  { id: 6, text: "What emotion surprises you?", category: "emotions" },
  { id: 7, text: "When do you feel most at peace?", category: "emotions" },
  { id: 8, text: "What feeling have you outgrown?", category: "emotions" },
  { id: 9, text: "What emotion scares you?", category: "emotions" },
  { id: 10, text: "When do you feel most yourself?", category: "emotions" },
  { id: 11, text: "What matters most to you?", category: "values" },
  { id: 12, text: "What are your non-negotiables?", category: "values" },
  { id: 13, text: "What kind of friend are you?", category: "values" },
  { id: 14, text: "What do you stand for?", category: "values" },
  { id: 15, text: "What would you never compromise?", category: "values" },
  { id: 16, text: "What makes a good life?", category: "values" },
  { id: 17, text: "What do you owe others?", category: "values" },
  { id: 18, text: "What deserves your time?", category: "values" },
  { id: 19, text: "What is worth fighting for?", category: "values" },
  { id: 20, text: "What do you believe in?", category: "values" },
  { id: 21, text: "What are you afraid of?", category: "fears" },
  { id: 22, text: "What holds you back?", category: "fears" },
  { id: 23, text: "What would you do if you weren't afraid?", category: "fears" },
  { id: 24, text: "What keeps you up at night?", category: "fears" },
  { id: 25, text: "What are you avoiding?", category: "fears" },
  { id: 26, text: "What fear have you outgrown?", category: "fears" },
  { id: 27, text: "What's the worst that could happen?", category: "fears" },
  { id: 28, text: "What are you clinging to?", category: "fears" },
  { id: 29, text: "What would letting go look like?", category: "fears" },
  { id: 30, text: "What are you protecting?", category: "fears" },
  { id: 31, text: "What does your ideal day look like?", category: "dreams" },
  { id: 32, text: "What do you want to be remembered for?", category: "dreams" },
  { id: 33, text: "What would you tell your younger self?", category: "dreams" },
  { id: 34, text: "What does success mean to you?", category: "dreams" },
  { id: 35, text: "Where do you see yourself in five years?", category: "dreams" },
  { id: 36, text: "What would you do with unlimited time?", category: "dreams" },
  { id: 37, text: "What dream have you given up on?", category: "dreams" },
  { id: 38, text: "What would make you proud?", category: "dreams" },
  { id: 39, text: "What's calling to you?", category: "dreams" },
  { id: 40, text: "What does freedom look like?", category: "dreams" },
  { id: 41, text: "What makes you unique?", category: "identity" },
  { id: 42, text: "What are you proud of?", category: "identity" },
  { id: 43, text: "What part of yourself do you hide?", category: "identity" },
  { id: 44, text: "What defines you?", category: "identity" },
  { id: 45, text: "What mask do you wear?", category: "identity" },
  { id: 46, text: "What are you growing into?", category: "identity" },
  { id: 47, text: "What have you learned recently?", category: "identity" },
  { id: 48, text: "What would surprise people about you?", category: "identity" },
  { id: 49, text: "What are you becoming?", category: "identity" },
  { id: 50, text: "Who are you when no one is watching?", category: "identity" },
];

export function getDailyQuestion(): Question {
  const today = new Date();
  const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % QUESTIONS.length;
  return QUESTIONS[dayIndex];
}
