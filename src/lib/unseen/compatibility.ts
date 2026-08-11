import type { UnseenProfile, UnseenAnswer, UnseenPreferences, CompatibilityScore } from "./types";

export function calculateCompatibility(
  profileA: UnseenProfile,
  answersA: UnseenAnswer[],
  prefsA: UnseenPreferences,
  profileB: UnseenProfile,
  answersB: UnseenAnswer[],
  prefsB: UnseenPreferences
): CompatibilityScore {
  // Emotional compatibility (from personality answer similarity)
  const emotional = calculateAnswerSimilarity(answersA, answersB);

  // Communication (from dating intention alignment)
  const communication = calculateIntentionCompatibility(
    profileA.dating_intention,
    profileB.dating_intention
  );

  // Lifestyle (from personality question patterns)
  const lifestyle = calculateLifestyleCompatibility(answersA, answersB);

  // Interest overlap (would need interests passed in, approximate from answers)
  const interests = calculateInterestCompatibility(answersA, answersB);

  // Weighted overall
  const overall = Math.round(
    emotional * 0.35 +
    communication * 0.25 +
    lifestyle * 0.2 +
    interests * 0.2
  );

  return {
    overall: Math.min(99, Math.max(1, overall)),
    emotional: Math.min(99, Math.max(1, emotional)),
    communication: Math.min(99, Math.max(1, communication)),
    lifestyle: Math.min(99, Math.max(1, lifestyle)),
    interests: Math.min(99, Math.max(1, interests)),
  };
}

function calculateAnswerSimilarity(
  answersA: UnseenAnswer[],
  answersB: UnseenAnswer[]
): number {
  // Find shared questions
  const mapA = new Map(answersA.map(a => [a.question_id, a.answer_text.toLowerCase()]));
  const mapB = new Map(answersB.map(a => [a.question_id, a.answer_text.toLowerCase()]));

  const sharedQuestions = [...mapA.keys()].filter(q => mapB.has(q));
  if (sharedQuestions.length === 0) return 50;

  let totalSimilarity = 0;
  for (const qId of sharedQuestions) {
    const textA = mapA.get(qId) || "";
    const textB = mapB.get(qId) || "";
    totalSimilarity += textSimilarity(textA, textB);
  }

  return Math.round((totalSimilarity / sharedQuestions.length) * 100);
}

function calculateIntentionCompatibility(
  intentionA: string,
  intentionB: string
): number {
  if (intentionA === intentionB) return 95;

  const compatibilityMatrix: Record<string, Record<string, number>> = {
    relationship: { something_casual: 30, friendship: 50, seeing_whats_out_there: 40 },
    something_casual: { relationship: 30, friendship: 60, seeing_whats_out_there: 80 },
    friendship: { relationship: 50, something_casual: 60, seeing_whats_out_there: 70 },
    seeing_whats_out_there: { relationship: 40, something_casual: 80, friendship: 70 },
  };

  return compatibilityMatrix[intentionA]?.[intentionB] || 50;
}

function calculateLifestyleCompatibility(
  answersA: UnseenAnswer[],
  answersB: UnseenAnswer[]
): number {
  // Look for lifestyle-related keywords in answers
  const lifestyleKeywords = [
    "quiet", "calm", "peaceful", "relax", "home", "cozy",
    "adventure", "travel", "explore", "city", "nature",
    "morning", "night", "early", "late",
    "read", "book", "music", "art", "creative",
    "active", "sport", "gym", "run", "hike",
  ];

  const wordsA = extractKeywords(answersA, lifestyleKeywords);
  const wordsB = extractKeywords(answersB, lifestyleKeywords);

  if (wordsA.length === 0 || wordsB.length === 0) return 50;

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  const intersection = [...setA].filter(w => setB.has(w));
  const union = new Set([...wordsA, ...wordsB]);

  return Math.round((intersection.length / union.size) * 100) + 30;
}

function calculateInterestCompatibility(
  answersA: UnseenAnswer[],
  answersB: UnseenAnswer[]
): number {
  // Extract general topic overlap from all answers
  const wordsA = getAllWords(answersA);
  const wordsB = getAllWords(answersB);

  if (wordsA.length === 0 || wordsB.length === 0) return 50;

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  const intersection = [...setA].filter(w => setB.has(w) && w.length > 3);
  const union = new Set([...wordsA, ...wordsB]);

  return Math.round((intersection.length / Math.min(union.size, 50)) * 100) + 25;
}

function extractKeywords(answers: UnseenAnswer[], keywords: string[]): string[] {
  const words: string[] = [];
  for (const answer of answers) {
    const lower = answer.answer_text.toLowerCase();
    for (const keyword of keywords) {
      if (lower.includes(keyword)) words.push(keyword);
    }
  }
  return words;
}

function getAllWords(answers: UnseenAnswer[]): string[] {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "can", "shall", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "through", "during",
    "before", "after", "above", "below", "between", "and", "but", "or",
    "not", "so", "if", "then", "than", "too", "very", "just", "about",
    "that", "this", "these", "those", "i", "me", "my", "we", "our",
    "you", "your", "he", "him", "his", "she", "her", "it", "its",
    "they", "them", "their", "what", "which", "who", "when", "where",
    "how", "all", "each", "every", "both", "few", "more", "most",
    "other", "some", "such", "no", "nor", "only", "own", "same",
  ]);

  const words: string[] = [];
  for (const answer of answers) {
    const tokens = answer.answer_text.toLowerCase().split(/\W+/);
    for (const token of tokens) {
      if (token.length > 3 && !stopWords.has(token)) {
        words.push(token);
      }
    }
  }
  return words;
}

function textSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(/\W+/).filter(w => w.length > 2));
  const wordsB = new Set(b.split(/\W+/).filter(w => w.length > 2));

  if (wordsA.size === 0 || wordsB.size === 0) return 0.5;

  const intersection = [...wordsA].filter(w => wordsB.has(w));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.length / union.size;
}
