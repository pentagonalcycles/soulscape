export interface MessageCheckResult {
  ok: boolean;
  reason?: "too-long" | "too-fast" | "repeat" | "banned-word" | "empty" | "flood";
}

export const MAX_CHAT_LENGTH = 500;
export const REACTION_THROTTLE_MS = 1200;
export const CHAT_THROTTLE_MS = 900;

/** Collapse whitespace/newlines, strip control chars, neutralise URLs. */
export function sanitizeMessage(raw: string): string {
  let text = raw.replace(/[\u0000-\u001f\u007f]/g, "");
  text = text.replace(/https?:\/\/\S+/gi, "[link]");
  text = text.replace(/www\.\S+/gi, "[link]");
  text = text.replace(/\s+/g, " ").trim();
  return text.slice(0, MAX_CHAT_LENGTH);
}

/** Client-side pre-checks. The server enforces the same rules via RLS. */
export function checkMessage(
  text: string,
  bannedWords: string[],
  recentMine: string[],
  now = Date.now(),
  lastSentAt: number | null = null
): MessageCheckResult {
  if (!text.trim()) return { ok: false, reason: "empty" };
  if (text.length > MAX_CHAT_LENGTH) return { ok: false, reason: "too-long" };
  if (lastSentAt && now - lastSentAt < CHAT_THROTTLE_MS) return { ok: false, reason: "too-fast" };

  const lower = text.toLowerCase();
  for (const word of bannedWords) {
    if (word && lower.includes(word.toLowerCase())) return { ok: false, reason: "banned-word" };
  }
  // Flood protection: identical message sent recently
  const recent = recentMine.slice(-4);
  if (recent.some((m) => m.toLowerCase() === lower)) return { ok: false, reason: "repeat" };

  return { ok: true };
}

export function rateLimitReaction(now: number, lastReactionAt: number | null): boolean {
  return !lastReactionAt || now - lastReactionAt >= REACTION_THROTTLE_MS;
}