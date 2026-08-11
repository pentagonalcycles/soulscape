"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

interface MoodAnalysis {
  mood: string;
  emoji: string;
  room: string;
  roomSlug: string;
  suggestion: string;
}

interface ElyraSettings {
  personality: string;
  responseLength: "short" | "medium" | "long";
  customName: string;
}

const STORAGE_KEY = "elyra-chat-messages";
const SETTINGS_KEY = "elyra-settings";
const MAX_FREE_MESSAGES = 10;

const PERSONALITIES = [
  { id: "gentle", name: "Friendly", emoji: "😊", prompt: "" },
  { id: "poet", name: "Creative", emoji: "✨", prompt: "Be a bit more creative and expressive in your responses. Use imagery sometimes." },
  { id: "sage", name: "Chill", emoji: "🧘", prompt: "Keep it super relaxed and brief. Short, easy responses." },
  { id: "friend", name: "Bubbly", emoji: "💛", prompt: "Be extra upbeat and friendly. Use more emojis and be enthusiastic." },
  { id: "healer", name: "Calm", emoji: "🌿", prompt: "Be extra calm and grounding. Gentle, soothing energy." },
];

const defaultSettings: ElyraSettings = { personality: "gentle", responseLength: "medium", customName: "Elyra" };

function loadMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveMessages(m: Message[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(m)); } catch {}
}
function loadSettings(): ElyraSettings {
  if (typeof window === "undefined") return defaultSettings;
  try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") }; } catch { return defaultSettings; }
}
function saveSettings(s: ElyraSettings) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
}

function detectMood(text: string): MoodAnalysis | null {
  const l = text.toLowerCase();
  if (l.includes("lonely") || l.includes("alone")) return { mood: "loneliness", emoji: "🌙", room: "Stargazing", roomSlug: "stargazing", suggestion: "Look up at the stars — you're not alone in this sky." };
  if (l.includes("sad") || l.includes("grief")) return { mood: "grief", emoji: "💜", room: "Reflection Room", roomSlug: "reflection-room", suggestion: "The Reflection Room is a gentle place to breathe and write." };
  if (l.includes("anxious") || l.includes("worried")) return { mood: "anxiety", emoji: "🌊", room: "Ambient Room", roomSlug: "ambient-room", suggestion: "Find calm in the Ambient Room with soothing sounds." };
  if (l.includes("happy") || l.includes("grateful")) return { mood: "joy", emoji: "✨", room: "Soul Echo", roomSlug: "soul-echo", suggestion: "Share your joy through Soul Echo!" };
  if (l.includes("creative") || l.includes("art")) return { mood: "creativity", emoji: "🎨", room: "Dream Canvas", roomSlug: "dream-canvas", suggestion: "Express yourself on the Dream Canvas." };
  if (l.includes("love") || l.includes("heart")) return { mood: "love", emoji: "💕", room: "Reflection Room", roomSlug: "reflection-room", suggestion: "Reflect on love in the Reflection Room." };
  if (l.includes("hope") || l.includes("better")) return { mood: "hope", emoji: "🌅", room: "Soul Echo", roomSlug: "soul-echo", suggestion: "Find light through Soul Echo." };
  if (l.includes("heal") || l.includes("recover")) return { mood: "healing", emoji: "🌿", room: "Reflection Room", roomSlug: "reflection-room", suggestion: "The Reflection Room helps you heal." };
  return null;
}

function formatTime(ts?: number) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDay(ts?: number) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ElyraIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 6 L30 18 L42 18 L32 26 L36 38 L24 30 L12 38 L16 26 L6 18 L18 18 Z" stroke="#22c55e" strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="24" cy="6" r="2.5" fill="#22c55e" />
      <circle cx="42" cy="18" r="2.5" fill="#4ade80" />
      <circle cx="36" cy="38" r="2.5" fill="#4ade80" />
      <circle cx="12" cy="38" r="2.5" fill="#4ade80" />
      <circle cx="6" cy="18" r="2.5" fill="#22c55e" />
      <circle cx="24" cy="24" r="3" fill="#86efac">
        <animate attributeName="r" values="3;4;3" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.6;1" dur="3s" repeatCount="indefinite" />
      </circle>
      <line x1="24" y1="8.5" x2="24" y2="21" stroke="#22c55e" strokeWidth="1.5" />
      <line x1="40" y1="18" x2="27" y2="24" stroke="#4ade80" strokeWidth="1.5" opacity="0.7" />
      <line x1="34" y1="36" x2="26" y2="26" stroke="#4ade80" strokeWidth="1.5" opacity="0.7" />
      <line x1="14" y1="36" x2="22" y2="26" stroke="#4ade80" strokeWidth="1.5" opacity="0.7" />
      <line x1="8" y1="18" x2="21" y2="24" stroke="#22c55e" strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}

export default function ElyraChat({ isPlus = false }: { isPlus?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastMood, setLastMood] = useState<MoodAnalysis | null>(null);
  const [settings, setSettings] = useState<ElyraSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setMessages([]);
      setSettings(loadSettings());
      initialized.current = true;
    }
  }, []);

  useEffect(() => { if (initialized.current) saveMessages(messages); }, [messages]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    if (!isPlus && messages.length >= MAX_FREE_MESSAGES * 2) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Message limit reached. Upgrade for unlimited.", timestamp: Date.now() }]);
      return;
    }
    const mood = detectMood(text);
    if (mood) setLastMood(mood);
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text, timestamp: Date.now() };
    const aiMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "", timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput("");
    setLoading(true);

    const personality = PERSONALITIES.find(p => p.id === settings.personality);
    const extra = [
      isPlus && personality?.prompt ? personality.prompt : "",
      isPlus ? `Response length: ${settings.responseLength}.` : "",
      isPlus && settings.customName !== "Elyra" ? `Your name is ${settings.customName}.` : "",
    ].filter(Boolean).join(" ");

    try {
      const res = await fetch("/api/elyra/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })), personality: extra, isPlus }),
      });
      if (!res.ok) throw new Error("Failed");
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const p = JSON.parse(data);
            if (p.content) { full += p.content; setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: full } : m)); }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: "Something went wrong. Try again." } : m));
    } finally { setLoading(false); }
  }

  function clearChat() { setMessages([]); setLastMood(null); localStorage.removeItem(STORAGE_KEY); }
  function updateSettings(p: Partial<ElyraSettings>) { const n = { ...settings, ...p }; setSettings(n); saveSettings(n); }

  const isEmpty = messages.length === 0;
  const messageCount = messages.filter(m => m.role === "user").length;
  const name = settings.customName || "Elyra";

  const groupedMessages: { day: string; messages: Message[] }[] = [];
  let currentDay = "";
  for (const msg of messages) {
    const day = formatDay(msg.timestamp);
    if (day !== currentDay) { currentDay = day; groupedMessages.push({ day, messages: [msg] }); }
    else groupedMessages[groupedMessages.length - 1].messages.push(msg);
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "transparent" }}>
      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", background: "transparent" }}>
        {isEmpty ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", minHeight: "100%", padding: "40px 24px",
          }}>
            <div style={{
              marginBottom: "20px",
              animation: "breathe 4s ease-in-out infinite",
            }}>
              <ElyraIcon size={72} />
            </div>
            <h2 style={{
              fontSize: "22px", fontWeight: 600, color: "#0f172a",
              marginBottom: "6px", letterSpacing: "0.3px",
            }}>{name}</h2>
            <p style={{
              fontSize: "13px", color: "#94a3b8",
              letterSpacing: "0.3px",
            }}>Your AI companion · Here to listen</p>
          </div>
        ) : (
          <div style={{ padding: "12px 0" }}>
            {groupedMessages.map((group, gi) => (
              <div key={gi}>
                <div style={{ textAlign: "center", padding: "10px 0 14px" }}>
                  <span style={{
                    fontSize: "11px", color: "#94a3b8",
                    background: "#f3f4f6",
                    padding: "4px 14px", borderRadius: "12px",
                    letterSpacing: "0.3px",
                  }}>{group.day}</span>
                </div>
                {group.messages.map((msg, mi) => {
                  const isUser = msg.role === "user";
                  const isLast = gi === groupedMessages.length - 1 && mi === group.messages.length - 1;
                  return (
                    <div key={msg.id} style={{
                      padding: "2px 16px", display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                    }}>
                      {!isUser && (
                        <div style={{
                          marginRight: "10px", marginTop: "2px", flexShrink: 0,
                        }}>
                          <ElyraIcon size={24} />
                        </div>
                      )}
                      <div style={{
                        maxWidth: "70%", display: "flex", flexDirection: "column",
                        alignItems: isUser ? "flex-end" : "flex-start",
                      }}>
                        <div style={{
                          padding: "10px 14px",
                          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          background: isUser
                            ? "linear-gradient(135deg, #22c55e, #4ade80)"
                            : "#f0fdf4",
                          border: isUser ? "none" : "1px solid #dcfce7",
                          color: isUser ? "#ffffff" : "#0f172a",
                          fontSize: "14px", lineHeight: "1.5",
                          wordBreak: "break-word",
                          boxShadow: isUser
                            ? "0 2px 12px rgba(34, 197, 94, 0.2)"
                            : "none",
                        }}>
                          {msg.content || (loading && isLast ? <span style={{ display: "inline-flex", gap: "4px", padding: "2px 0" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isUser ? "rgba(255,255,255,0.5)" : "#86efac", animation: "bounce 1.4s infinite 0s" }} />
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isUser ? "rgba(255,255,255,0.5)" : "#86efac", animation: "bounce 1.4s infinite 0.2s" }} />
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isUser ? "rgba(255,255,255,0.5)" : "#86efac", animation: "bounce 1.4s infinite 0.4s" }} />
                          </span> : null)}
                        </div>
                        <span style={{
                          fontSize: "10px", color: "#94a3b8",
                          marginTop: "3px", padding: "0 4px",
                        }}>{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {/* Mood suggestion */}
            {lastMood && !loading && (
              <div style={{ padding: "8px 16px", display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "12px 16px", borderRadius: "14px",
                  background: "#f0fdf4",
                  border: "1px solid #dcfce7",
                  display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <span style={{ fontSize: "16px" }}>{lastMood.emoji}</span>
                  <span style={{ fontSize: "12px", color: "#64748b", flex: 1, lineHeight: "1.4" }}>{lastMood.suggestion}</span>
                  <Link href={`/rooms/${lastMood.roomSlug}`} style={{
                    fontSize: "11px", color: "#22c55e", textDecoration: "none",
                    padding: "6px 12px", borderRadius: "14px",
                    background: "rgba(34, 197, 94, 0.08)",
                    border: "1px solid rgba(34, 197, 94, 0.15)",
                    whiteSpace: "nowrap", transition: "all 0.2s",
                  }}>Visit</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input bar */}
      <div style={{
        flexShrink: 0,
        background: "transparent",
        borderTop: "1px solid #e5e7eb",
        padding: "10px 14px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
          <div style={{
            flex: 1,
            background: "#f0fdf4",
            border: "1px solid #dcfce7",
            borderRadius: "22px",
            padding: "4px 4px 4px 16px",
            display: "flex", alignItems: "flex-end", gap: "4px",
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={isPlus ? `Message ${name}...` : `Message ${name}... (${MAX_FREE_MESSAGES - messageCount} left)`}
              rows={1}
              disabled={loading}
              style={{
                flex: 1, border: "none", background: "transparent",
                fontSize: "14px", color: "#0f172a", outline: "none", resize: "none",
                lineHeight: "1.4", minHeight: "20px", maxHeight: "80px",
                padding: "8px 0", fontFamily: "inherit",
              }}
            />
          </div>
          {input.trim() ? (
            <button onClick={send} disabled={loading} className="btn-icon" style={{
              width: "38px", height: "38px", borderRadius: "50%",
              background: "linear-gradient(135deg, #22c55e, #4ade80)",
              color: "#ffffff",
              boxShadow: "0 2px 12px rgba(34, 197, 94, 0.25)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          ) : (
            <button disabled className="btn-icon" style={{
              width: "38px", height: "38px", borderRadius: "50%",
              background: "#f0fdf4", color: "#86efac",
              cursor: "default",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          )}
        </div>
        {messages.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "8px", gap: "20px" }}>
            <button onClick={clearChat} style={{
              fontSize: "11px", color: "#94a3b8",
              letterSpacing: "0.3px",
            }}>New conversation</button>
            <button onClick={() => setShowSettings(!showSettings)} style={{
              fontSize: "11px", color: "#94a3b8",
              letterSpacing: "0.3px",
            }}>⚙ Settings</button>
          </div>
        )}
      </div>

      {/* Settings overlay */}
      {showSettings && (
        <div style={{
          position: "absolute", bottom: "80px", left: "16px", right: "16px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderRadius: "18px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px #e5e7eb",
          padding: "20px", zIndex: 20, maxHeight: "60vh", overflowY: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>Settings</span>
            <button onClick={() => setShowSettings(false)} className="btn-icon-sm" style={{
              background: "#f3f4f6",
              color: "#94a3b8",
              fontSize: "14px",
            }}>✕</button>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "8px", letterSpacing: "0.3px" }}>Personality</label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {PERSONALITIES.map(p => (
                <button key={p.id} onClick={() => updateSettings({ personality: p.id })} style={{
                  padding: "8px 14px", borderRadius: "14px",
                  border: `1px solid ${settings.personality === p.id ? "#22c55e" : "#e5e7eb"}`,
                  background: settings.personality === p.id ? "#f0fdf4" : "#ffffff",
                  color: settings.personality === p.id ? "#22c55e" : "#64748b",
                  fontSize: "12px", cursor: "pointer", transition: "all 0.2s",
                }}>{p.emoji} {p.name}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "8px", letterSpacing: "0.3px" }}>Name</label>
            <input type="text" value={settings.customName} onChange={e => updateSettings({ customName: e.target.value })} style={{
              width: "100%", background: "#f0fdf4",
              border: "1px solid #dcfce7", borderRadius: "12px",
              padding: "10px 14px", color: "#0f172a", fontSize: "13px",
              outline: "none", boxSizing: "border-box",
            }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "8px", letterSpacing: "0.3px" }}>Response Length</label>
            <div style={{ display: "flex", gap: "6px" }}>
              {(["short", "medium", "long"] as const).map(l => (
                <button key={l} onClick={() => updateSettings({ responseLength: l })} style={{
                  flex: 1, padding: "8px", borderRadius: "12px",
                  border: `1px solid ${settings.responseLength === l ? "#22c55e" : "#e5e7eb"}`,
                  background: settings.responseLength === l ? "#f0fdf4" : "#ffffff",
                  color: settings.responseLength === l ? "#22c55e" : "#64748b",
                  fontSize: "12px", cursor: "pointer", textTransform: "capitalize",
                  transition: "all 0.2s",
                }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        textarea::placeholder { color: #9ca3af; }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
        @keyframes breathe {
          0%, 100% { opacity: 0.8; transform: scale(1); box-shadow: 0 4px 24px rgba(34, 197, 94, 0.2); }
          50% { opacity: 1; transform: scale(1.05); box-shadow: 0 4px 32px rgba(34, 197, 94, 0.3); }
        }
      `}</style>
    </div>
  );
}
