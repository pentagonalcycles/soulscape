"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import ElyraCodeBlock from "./ElyraCodeBlock";
import {
  loadConversations,
  upsertConversation,
  deleteConversation as storageDeleteConversation,
  loadProjects,
  upsertProject,
  deleteProject as storageDeleteProject,
  loadMemory,
  replaceMemory,
  migrateLegacy,
  newConversationId,
  newProjectId,
} from "@/lib/elyra-storage";
import type {
  ElyraMessage,
  ElyraConversation,
  ElyraProject,
  ElyraMemoryItem,
} from "@/lib/elyra-storage";

type Message = ElyraMessage;

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

const SETTINGS_KEY = "elyra-settings";
const MEMORY_ENABLED_KEY = "elyra-memory-enabled";
const MAX_FREE_MESSAGES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "text/plain", "text/html", "text/css", "text/javascript", "text/typescript",
  "application/json", "application/javascript", "application/typescript",
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
];

const PERSONALITIES = [
  { id: "gentle", name: "Standard", emoji: "◈", prompt: "" },
  { id: "poet", name: "Creative", emoji: "✦", prompt: "Be a bit more creative and expressive in your responses. Use imagery sometimes." },
  { id: "sage", name: "Minimal", emoji: "◇", prompt: "Keep it super relaxed and brief. Short, easy responses." },
  { id: "friend", name: "Expressive", emoji: "⬡", prompt: "Be extra upbeat and friendly. Use more emojis and be enthusiastic." },
  { id: "healer", name: "Calm", emoji: "○", prompt: "Be extra calm and grounding. Gentle, soothing energy." },
];

const MODES = [
  { id: "talk" as const, label: "Talk", icon: "💬" },
  { id: "code" as const, label: "Code", icon: "✦" },
  { id: "create" as const, label: "Create", icon: "✨" },
  { id: "explain" as const, label: "Explain", icon: "📖" },
  { id: "terminal" as const, label: "Terminal", icon: "▸" },
];

const MODE_SUGGESTIONS: Record<string, string[]> = {
  talk: [
    "Tell me about yourself",
    "I just want to talk",
    "Help me think this through",
    "What can we explore together?",
  ],
  code: [
    "Build a website",
    "Fix an error",
    "Improve my code",
    "Create an app",
  ],
  create: [
    "Help me design something",
    "Brainstorm an idea",
    "Create something new",
  ],
  explain: [
    "Explain some code",
    "Explain this simply",
    "Teach me something",
  ],
  terminal: [
    "Build a working terminal",
    "Create a phone terminal",
    "Help me fix my terminal",
  ],
};

const defaultSettings: ElyraSettings = { personality: "gentle", responseLength: "medium", customName: "Luna" };

function loadSettings(): ElyraSettings {
  if (typeof window === "undefined") return defaultSettings;
  try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") }; } catch { return defaultSettings; }
}
function saveSettings(s: ElyraSettings) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
}
function loadMemoryEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(MEMORY_ENABLED_KEY) !== "0";
}
function saveMemoryEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(MEMORY_ENABLED_KEY, enabled ? "1" : "0"); } catch {}
}

function nowTs(): number {
  return Date.now();
}

function generateConversationTitle(messages: Message[]): string {
  const userMessages = messages.filter(m => m.role === "user");
  if (userMessages.length === 0) return "New Conversation";

  const firstMsg = userMessages[0].content.toLowerCase();
  const clean = firstMsg.replace(/```[\s\S]*?```/g, "").replace(/[^\w\s'’-]/g, " ").replace(/\s+/g, " ").trim();

  if (/portfolio/.test(firstMsg)) return "Build My Portfolio";
  if (/terminal|command line|cli\b|console/.test(firstMsg)) return "Phone Terminal";
  if (/creative|brainstorm|design|idea/.test(firstMsg)) return "Creative Ideas";
  if (/react|next\.?js|component/.test(firstMsg)) return "React Project";
  if (/fix|error|debug|bug|issue|broken|failed/.test(firstMsg)) {
    if (/react|javascript|js\b|node/.test(firstMsg)) return "Fix React Error";
    return "Fix an Error";
  }
  if (/login|sign in|auth/.test(firstMsg)) return "Login Page";
  if (/css|style|styling|animation/.test(firstMsg)) return "CSS Styling";
  if (/api|endpoint|backend|server/.test(firstMsg)) return "API Development";
  if (/python|django|flask/.test(firstMsg)) return "Python Project";
  if (/database|sql|postgres/.test(firstMsg)) return "Database Work";
  if (/game|play/.test(firstMsg)) return "Make a Game";
  if (/create|build|make|start.*app|website/.test(firstMsg)) return "Building a Project";
  if (/explain|what is|how does|teach|learn/.test(firstMsg)) return "Learning";
  if (/poem|poetry|story|write/.test(firstMsg)) return "Creative Writing";
  if (/help|stuck|advice/.test(firstMsg)) return "Getting Help";
  if (/general|chat|talk|hello|hi\b|hey/.test(firstMsg)) return "General Conversation";

  if (clean.length > 0) {
    const words = clean.split(" ").slice(0, 4).join(" ");
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
  return "General Conversation";
}

function buildProjectContext(p: ElyraProject): string | undefined {
  const lines = [
    `Name: ${p.name}`,
    p.whatBuilding ? `What you're building: ${p.whatBuilding}` : "",
    p.language ? `Language: ${p.language}` : "",
    p.framework ? `Framework: ${p.framework}` : "",
    p.files ? `Files involved: ${p.files}` : "",
    p.decisions ? `Decisions so far: ${p.decisions}` : "",
    p.progress ? `Progress: ${p.progress}` : "",
    p.instructions ? `Instructions for me: ${p.instructions}` : "",
  ].filter(Boolean).join("\n");
  return lines || undefined;
}

function detectMood(text: string): MoodAnalysis | null {
  const l = text.toLowerCase();
  if (l.includes("lonely") || l.includes("alone")) return { mood: "loneliness", emoji: "🌙", room: "Soul Echo", roomSlug: "soul-echo", suggestion: "You're not alone — someone out there understands." };
  if (l.includes("sad") || l.includes("grief")) return { mood: "grief", emoji: "💜", room: "Reflection Room", roomSlug: "reflection-room", suggestion: "The Reflection Room is a gentle place to breathe and write." };
  if (l.includes("anxious") || l.includes("worried")) return { mood: "anxiety", emoji: "🌊", room: "Reflection Room", roomSlug: "reflection-room", suggestion: "Find calm in the Reflection Room with a moment to breathe." };
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

export default function ElyraChat({ isPlus = false, userId = null }: { isPlus?: boolean; userId?: string | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastMood, setLastMood] = useState<MoodAnalysis | null>(null);
  const [settings, setSettings] = useState<ElyraSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [conversations, setConversations] = useState<ElyraConversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [memory, setMemory] = useState<ElyraMemoryItem[]>([]);
  const [showMemory, setShowMemory] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [projects, setProjects] = useState<ElyraProject[]>([]);
  const [showProjects, setShowProjects] = useState(false);
  const [projectDetailId, setProjectDetailId] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectDraft, setNewProjectDraft] = useState({ name: "", whatBuilding: "", language: "", framework: "" });
  const [activeMode, setActiveMode] = useState<string>("talk");
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [convRenameDraft, setConvRenameDraft] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setSettings(loadSettings());
    setMemoryEnabled(loadMemoryEnabled());
    (async () => {
      const uid = userId;
      await migrateLegacy(uid);
      const [convs, projs, mems] = await Promise.all([
        loadConversations(uid),
        loadProjects(uid),
        loadMemory(uid),
      ]);
      setConversations(convs);
      setProjects(projs);
      setMemory(mems);
      const mostRecent = convs[0];
      if (mostRecent && mostRecent.messages.length > 0) {
        setMessages(mostRecent.messages);
        setCurrentConversationId(mostRecent.id);
      }
    })();
  }, [userId]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);

  const currentProject = currentProjectId ? projects.find(p => p.id === currentProjectId) || null : null;

  async function send() {
    const text = input.trim();
    if ((!text && uploadedFiles.length === 0) || loading) return;
    if (!isPlus && messages.length >= MAX_FREE_MESSAGES * 2) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Message limit reached. Upgrade for unlimited.", timestamp: Date.now() }]);
      return;
    }

    let messageContent = text;

    // Handle file uploads
    if (uploadedFiles.length > 0) {
      const fileContents: string[] = [];
      for (const file of uploadedFiles) {
        if (file.type.startsWith("image/")) {
          // For images, we'll send a description
          fileContents.push(`[Image: ${file.name}]`);
        } else {
          // For text files, read the content
          try {
            const content = await file.text();
            fileContents.push(`File: ${file.name}\n\`\`\`\n${content}\n\`\`\``);
          } catch {
            fileContents.push(`[File: ${file.name} - could not read]`);
          }
        }
      }
      if (fileContents.length > 0) {
        messageContent = fileContents.join("\n\n") + (text ? "\n\n" + text : "");
      }
    }

    const mood = detectMood(messageContent);
    if (mood) setLastMood(mood);
    setLastUserMessage(messageContent);
    setErrorNotice(null);
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: messageContent, timestamp: Date.now() };
    const aiMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "", timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput("");
    setUploadedFiles([]);
    setLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    const personality = PERSONALITIES.find(p => p.id === settings.personality);
    const extra = [
      isPlus && personality?.prompt ? personality.prompt : "",
      isPlus ? `Response length: ${settings.responseLength}.` : "",
      isPlus && settings.customName !== "Luna" ? `Your name is ${settings.customName}.` : "",
    ].filter(Boolean).join(" ");

    const memoryList = memoryEnabled ? memory.map(m => m.text) : [];
    const projectContext = currentProject ? buildProjectContext(currentProject) : undefined;

    let full = "";
    let interrupted = false;

    try {
      const res = await fetch("/api/elyra/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          personality: extra,
          isPlus,
          memory: memoryList,
          projectContext,
          mode: activeMode,
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed");
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const p = JSON.parse(data);
            if (p.error === "stream_interrupted") { interrupted = true; continue; }
            if (p.content) { full += p.content; setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: full } : m)); }
          } catch {}
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: m.content || "Generation stopped." } : m));
      } else {
        setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: m.content || "" } : m));
        setErrorNotice("I couldn't finish that response. You can retry below.");
        setLoading(false);
        setAbortController(null);
        return;
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }

    // Auto-save conversation (even partial/stopped responses)
    const finalContent = full || (interrupted ? "I couldn't finish that response." : "Generation stopped.");
    const updatedMessages = [...messages, userMsg, { ...aiMsg, content: finalContent }];
    const convId = currentConversationId || newConversationId();
    const conv: ElyraConversation = {
      id: convId,
      title: generateConversationTitle(updatedMessages),
      messages: updatedMessages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await upsertConversation(userId, conv);
    setConversations(prev => {
      const existing = prev.findIndex(c => c.id === convId);
      return existing >= 0 ? prev.map((c, i) => i === existing ? conv : c) : [conv, ...prev];
    });
    setCurrentConversationId(convId);

    if (currentProject && currentProject.conversationId !== convId) {
      const linked = { ...currentProject, conversationId: convId, updatedAt: Date.now() };
      setProjects(prev => prev.map(p => p.id === linked.id ? linked : p));
      await upsertProject(userId, linked);
    }

    if (interrupted) setErrorNotice("The response was interrupted. You can retry below.");
  }

  function startNewConversation() {
    if (loading) return;
    setMessages([]);
    setLastMood(null);
    setCurrentConversationId(null);
    setErrorNotice(null);
    setShowHistory(false);
  }
  function updateSettings(p: Partial<ElyraSettings>) { const n = { ...settings, ...p }; setSettings(n); saveSettings(n); }

  function stopGeneration() {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  }

  function regenerateResponse() {
    if (lastUserMessage && !loading) {
      // Remove last assistant message and resend
      setMessages(prev => prev.slice(0, -1));
      setErrorNotice(null);
      setInput(lastUserMessage);
      setTimeout(() => send(), 100);
    }
  }

  function copyMessage(content: string) {
    navigator.clipboard.writeText(content).catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    });
  }

  function editLastMessage() {
    if (lastUserMessage) {
      setInput(lastUserMessage);
      setMessages(prev => prev.slice(0, -2)); // Remove last user and assistant messages
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function loadConversation(conversation: ElyraConversation) {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
    setLastMood(null);
    setErrorNotice(null);
    setShowHistory(false);
    setShowProjects(false);
  }

  function deleteConversation(id: string) {
    setConversations(prev => prev.filter(c => c.id !== id));
    storageDeleteConversation(userId, id);
    if (currentConversationId === id) {
      setMessages([]);
      setCurrentConversationId(null);
      setErrorNotice(null);
    }
  }

  function renameConversation(id: string, newTitle: string) {
    const title = newTitle.trim() || "Untitled Conversation";
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title, updatedAt: Date.now() } : c));
    const target = conversations.find(c => c.id === id);
    if (target) upsertConversation(userId, { ...target, title, updatedAt: nowTs() });
  }

  function addToMemory(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMemory(prev => {
      const updated = [{ id: newConversationId(), text: trimmed, createdAt: Date.now() }, ...prev];
      replaceMemory(userId, updated);
      return updated;
    });
  }

  function removeFromMemory(id: string) {
    setMemory(prev => {
      const updated = prev.filter(m => m.id !== id);
      replaceMemory(userId, updated);
      return updated;
    });
  }

  function clearMemory() {
    setMemory([]);
    replaceMemory(userId, []);
  }

  function toggleMemoryEnabled() {
    const next = !memoryEnabled;
    setMemoryEnabled(next);
    saveMemoryEnabled(next);
  }

  function createProject() {
    const name = newProjectDraft.name.trim() || "New Project";
    const proj: ElyraProject = {
      id: newProjectId(),
      name,
      whatBuilding: newProjectDraft.whatBuilding.trim(),
      language: newProjectDraft.language.trim(),
      framework: newProjectDraft.framework.trim(),
      files: "",
      decisions: "",
      progress: "",
      instructions: "",
      conversationId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProjects(prev => [proj, ...prev]);
    upsertProject(userId, proj);
    setCurrentProjectId(proj.id);
    setProjectDetailId(proj.id);
    setNewProjectOpen(false);
    setNewProjectDraft({ name: "", whatBuilding: "", language: "", framework: "" });
  }

  function deleteProject(id: string) {
    setProjects(prev => prev.filter(p => p.id !== id));
    storageDeleteProject(userId, id);
    if (currentProjectId === id) setCurrentProjectId(null);
    if (projectDetailId === id) setProjectDetailId(null);
  }

  function updateProjectField(
    id: string,
    field: keyof Pick<ElyraProject, "name" | "whatBuilding" | "language" | "framework" | "files" | "decisions" | "progress" | "instructions">,
    value: string
  ) {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, [field]: value, updatedAt: Date.now() } : p));
    const target = projects.find(p => p.id === id);
    if (target) upsertProject(userId, { ...target, [field]: value, updatedAt: nowTs() });
  }

  function openProject(proj: ElyraProject) {
    setCurrentProjectId(proj.id);
    setShowProjects(false);
    if (proj.conversationId) {
      const conv = conversations.find(c => c.id === proj.conversationId);
      if (conv) {
        setMessages(conv.messages);
        setCurrentConversationId(conv.id);
        return;
      }
    }
    setMessages([]);
    setCurrentConversationId(null);
    setLastMood(null);
    setErrorNotice(null);
  }

  function startNewProject() {
    setNewProjectOpen(true);
    setShowProjects(true);
    setProjectDetailId(null);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type) && !file.name.match(/\.(js|jsx|ts|tsx|html|css|json|py|sql|md|txt)$/i)) {
        alert(`File type not supported: ${file.name}`);
        continue;
      }
      validFiles.push(file);
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeFile(index: number) {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData("text");
    if (text.includes("\n") && (text.includes("{") || text.includes("function") || text.includes("const ") || text.includes("import ") || text.includes("class ") || text.includes("def ") || text.includes("return "))) {
      e.preventDefault();
      const formatted = "```\n" + text + "\n```";
      setInput(prev => prev + formatted);
    }
  }

  const isEmpty = messages.length === 0;
  const messageCount = messages.filter(m => m.role === "user").length;
  const name = settings.customName || "Luna";

  const detailProject = projectDetailId ? projects.find(p => p.id === projectDetailId) || null : null;

  const controlButtonStyle: React.CSSProperties = {
    fontSize: "9px", color: "#d9f5e3",
    letterSpacing: "2px", textTransform: "uppercase",
    background: "none", border: "none", cursor: "pointer",
    transition: "all 0.2s", fontFamily: "monospace",
  };

  const groupedMessages: { day: string; messages: Message[] }[] = [];
  let currentDay = "";
  for (const msg of messages) {
    const day = formatDay(msg.timestamp);
    if (day !== currentDay) { currentDay = day; groupedMessages.push({ day, messages: [msg] }); }
    else groupedMessages[groupedMessages.length - 1].messages.push(msg);
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "transparent", boxShadow: "0 8px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(0, 255, 136, 0.04)", backdropFilter: "blur(20px)", borderRadius: "16px" }}>
      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", background: "transparent" }}>
        {isEmpty ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", minHeight: "100%", padding: "40px 24px",
          }}>
            {/* Name with gradient */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <h2 style={{
                fontSize: "32px", fontWeight: 100, color: "#e2e8f0",
                letterSpacing: "12px", textTransform: "uppercase",
                background: "linear-gradient(135deg, #00ff88, #8b5cf6, #00ff88)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% 100%",
                animation: "gradientShift 4s ease-in-out infinite",
              }}>{name}</h2>
              {/* Glowing underline */}
              <div style={{
                width: "100%", height: "1px", marginTop: "8px",
                background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.85), rgba(139, 92, 246, 0.4), transparent)",
                boxShadow: "0 0 10px rgba(0, 255, 136, 0.3)",
              }} />
            </div>

            {/* Mode selection */}
            <div style={{ marginTop: "40px", textAlign: "center" }}>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                {MODES.map((mode) => {
                  const isActive = activeMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setActiveMode(mode.id)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: `1px solid ${isActive ? "rgba(0, 255, 136, 0.65)" : "rgba(0, 255, 136, 0.3)"}`,
                        background: isActive ? "rgba(0, 255, 136, 0.1)" : "rgba(0, 255, 136, 0.04)",
                        color: isActive ? "#00ff88" : "rgba(0, 255, 136, 0.85)",
                        fontSize: "10px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "monospace",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0, 255, 136, 0.08)";
                        e.currentTarget.style.color = "rgba(0, 255, 136, 0.9)";
                        e.currentTarget.style.borderColor = "rgba(0, 255, 136, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isActive ? "rgba(0, 255, 136, 0.1)" : "rgba(0, 255, 136, 0.04)";
                        e.currentTarget.style.color = isActive ? "#00ff88" : "rgba(0, 255, 136, 0.85)";
                        e.currentTarget.style.borderColor = isActive ? "rgba(0, 255, 136, 0.65)" : "rgba(0, 255, 136, 0.3)";
                      }}
                    >
                      <span style={{ fontSize: "12px" }}>{mode.icon}</span>
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {/* Mode-aware starter suggestions */}
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" }}>
                {(MODE_SUGGESTIONS[activeMode] || []).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      border: "1px solid rgba(0, 255, 136, 0.1)",
                      background: "rgba(0, 255, 136, 0.02)",
                      color: "rgba(0, 255, 136, 0.65)",
                      fontSize: "9px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontFamily: "monospace",
                      letterSpacing: "0.5px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0, 255, 136, 0.06)";
                      e.currentTarget.style.color = "rgba(0, 255, 136, 0.8)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(0, 255, 136, 0.02)";
                      e.currentTarget.style.color = "rgba(0, 255, 136, 0.65)";
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <p style={{
                fontSize: "8px",
                color: "rgba(0, 255, 136, 0.5)",
                marginTop: "12px",
                fontFamily: "monospace",
                letterSpacing: "1px",
              }}>
                Or just type anything naturally
              </p>
            </div>
          </div>
        ) : (
          <div style={{ padding: "12px 0" }}>
            {groupedMessages.map((group, gi) => (
              <div key={gi}>
                <div style={{ textAlign: "center", padding: "10px 0 14px" }}>
                  <span style={{
                    fontSize: "10px", color: "#00ff88",
                    background: "rgba(0, 255, 136, 0.08)",
                    border: "1px solid rgba(0, 255, 136, 0.15)",
                    padding: "4px 14px", borderRadius: "4px",
                    letterSpacing: "2px", textTransform: "uppercase",
                  }}>{group.day}</span>
                </div>
                {group.messages.map((msg, mi) => {
                  const isUser = msg.role === "user";
                  const isLast = gi === groupedMessages.length - 1 && mi === group.messages.length - 1;
                  return (
                    <div key={msg.id} style={{
                      padding: "4px 16px", display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                    }}>
                      {!isUser && (
                        <div style={{
                          width: "20px", flexShrink: 0,
                        }} />
                      )}
                      <div style={{
                        maxWidth: "70%", display: "flex", flexDirection: "column",
                        alignItems: isUser ? "flex-end" : "flex-start",
                      }}>
                        <div style={{
                          padding: "10px 14px",
                          borderRadius: isUser ? "2px 12px 12px 12px" : "12px 12px 12px 2px",
                          background: isUser
                            ? "linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(139, 92, 246, 0.1))"
                            : "rgba(0, 255, 136, 0.03)",
                          border: isUser
                            ? "1px solid rgba(0, 255, 136, 0.25)"
                            : "1px solid rgba(0, 255, 136, 0.08)",
                          color: isUser ? "#e2e8f0" : "#d8f5e2",
                          fontSize: "13px", lineHeight: "1.6",
                          wordBreak: "break-word",
                          boxShadow: isUser
                            ? "0 0 15px rgba(0, 255, 136, 0.08), inset 0 1px 0 rgba(255,255,255,0.03)"
                            : "none",
                          position: "relative",
                          overflow: "hidden",
                          letterSpacing: "0.2px",
                        }}>
                          {isUser && (
                            <div style={{
                              position: "absolute", inset: 0,
                              pointerEvents: "none",
                            }} />
                          )}
                          {isUser ? (
                            msg.content
                          ) : msg.content ? (
                            <div style={{ fontSize: "13px", lineHeight: "1.6", wordBreak: "break-word" }}>
                              <ReactMarkdown
                                components={{
                                  code({ className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    const isInline = !match && !String(children).includes("\n");
                                    if (isInline) {
                                      return (
                                        <code
                                          style={{
                                            background: "rgba(0, 255, 136, 0.08)",
                                            padding: "2px 6px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            fontFamily: "monospace",
                                            color: "#00ff88",
                                          }}
                                          {...props}
                                        >
                                          {children}
                                        </code>
                                      );
                                    }
                                    // Try to detect filename from the code block
                                    const codeStr = String(children);
                                    let filename: string | undefined;
                                    const filenameMatch = codeStr.match(/^(?:\/\/|#|--|\/\*)\s*(?:File:\s*)?([\w.-]+\.\w+)/m);
                                    if (filenameMatch) {
                                      filename = filenameMatch[1];
                                    }
                                    return (
                                      <ElyraCodeBlock language={match ? match[1] : undefined} filename={filename}>
                                        {codeStr.replace(/\n$/, "")}
                                      </ElyraCodeBlock>
                                    );
                                  },
                                  p({ children }) {
                                    return <p style={{ margin: "0 0 10px" }}>{children}</p>;
                                  },
                                  ul({ children }) {
                                    return <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>{children}</ul>;
                                  },
                                  ol({ children }) {
                                    return <ol style={{ margin: "4px 0", paddingLeft: "20px" }}>{children}</ol>;
                                  },
                                  li({ children }) {
                                    return <li style={{ margin: "2px 0" }}>{children}</li>;
                                  },
                                  strong({ children }) {
                                    return <strong style={{ color: "#e2e8f0", fontWeight: 600 }}>{children}</strong>;
                                  },
                                  em({ children }) {
                                    return <em style={{ color: "#d8f5e2" }}>{children}</em>;
                                  },
                                  a({ href, children }) {
                                    return (
                                      <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "#00ff88", textDecoration: "underline" }}
                                      >
                                        {children}
                                      </a>
                                    );
                                  },
                                  h1({ children }) {
                                    return <h1 style={{ fontSize: "18px", fontWeight: 600, color: "#e2e8f0", margin: "16px 0 8px" }}>{children}</h1>;
                                  },
                                  h2({ children }) {
                                    return <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#e2e8f0", margin: "14px 0 6px" }}>{children}</h2>;
                                  },
                                  h3({ children }) {
                                    return <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0", margin: "12px 0 4px" }}>{children}</h3>;
                                  },
                                  blockquote({ children }) {
                                    return (
                                      <blockquote
                                        style={{
                                          borderLeft: "3px solid rgba(0, 255, 136, 0.3)",
                                          paddingLeft: "12px",
                                          margin: "8px 0",
                                          color: "#d8f5e2",
                                          fontStyle: "italic",
                                        }}
                                      >
                                        {children}
                                      </blockquote>
                                    );
                                  },
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : loading && isLast ? (
                            <span style={{ display: "inline-flex", gap: "5px", padding: "4px 0" }}>
                              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#00ff88", animation: "bounce 1.4s infinite 0s", boxShadow: "0 0 6px rgba(0, 255, 136, 0.5)" }} />
                              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#00ff88", animation: "bounce 1.4s infinite 0.2s", boxShadow: "0 0 6px rgba(0, 255, 136, 0.5)" }} />
                              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#00ff88", animation: "bounce 1.4s infinite 0.4s", boxShadow: "0 0 6px rgba(0, 255, 136, 0.5)" }} />
                            </span>
                          ) : null}
                        </div>
                        <span style={{
                          fontSize: "8px", color: "#d9f5e3",
                          marginTop: "4px", padding: "0 4px",
                          letterSpacing: "1px", fontFamily: "monospace",
                          display: "flex", alignItems: "center", gap: "8px",
                        }}>
                          {formatTime(msg.timestamp)}
                          {!isUser && msg.content && (
                            <button
                              onClick={() => copyMessage(msg.content)}
                              style={{
                                background: "none", border: "none",
                                color: "#d9f5e3", cursor: "pointer",
                                padding: "2px 4px", fontSize: "9px",
                                letterSpacing: "1px", textTransform: "uppercase",
                                transition: "all 0.2s",
                              }}
                              onMouseOver={e => { e.currentTarget.style.color = "#00ff88"; }}
                              onMouseOut={e => { e.currentTarget.style.color = "#d9f5e3"; }}
                            >
                              Copy
                            </button>
                          )}
                        </span>
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
                  maxWidth: "80%", padding: "12px 16px", borderRadius: "8px",
                  background: "rgba(0, 255, 136, 0.05)",
                  border: "1px solid rgba(0, 255, 136, 0.12)",
                  display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <span style={{ fontSize: "16px" }}>{lastMood.emoji}</span>
                  <span style={{ fontSize: "12px", color: "#d8f5e2", flex: 1, lineHeight: "1.4" }}>{lastMood.suggestion}</span>
                  <Link href={`/${lastMood.roomSlug}`} style={{
                    fontSize: "10px", color: "#00ff88", textDecoration: "none",
                    padding: "6px 12px", borderRadius: "4px",
                    background: "rgba(0, 255, 136, 0.08)",
                    border: "1px solid rgba(0, 255, 136, 0.2)",
                    whiteSpace: "nowrap", transition: "all 0.2s",
                    letterSpacing: "1px", textTransform: "uppercase",
                  }}>Access</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input bar */}
      <div style={{
        flexShrink: 0,
        background: "rgba(2, 6, 23, 0.7)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(0, 255, 136, 0.08)",
        padding: "12px 14px 16px",
        position: "relative",
      }}>
        {/* Top accent line */}
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent)",
        }} />

        <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
          <div style={{
            flex: 1,
            background: "rgba(0, 255, 136, 0.02)",
            border: "1px solid rgba(0, 255, 136, 0.12)",
            borderRadius: "4px",
            padding: "4px 4px 4px 14px",
            display: "flex", alignItems: "flex-end", gap: "4px",
            transition: "all 0.3s",
            position: "relative",
          }}>
            {/* Input corner accents */}
            <div style={{ position: "absolute", top: "-1px", left: "-1px", width: "8px", height: "1px", background: "#00ff88" }} />
            <div style={{ position: "absolute", bottom: "-1px", right: "-1px", width: "8px", height: "1px", background: "#00ff88" }} />

            {/* File upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "32px", height: "32px", borderRadius: "4px",
                background: "rgba(0, 255, 136, 0.04)",
                border: "1px solid rgba(0, 255, 136, 0.15)",
                color: "rgba(0, 255, 136, 0.85)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 255, 136, 0.08)";
                e.currentTarget.style.color = "rgba(0, 255, 136, 0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 255, 136, 0.04)";
                e.currentTarget.style.color = "rgba(0, 255, 136, 0.85)";
              }}
              title="Upload file"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".js,.jsx,.ts,.tsx,.html,.css,.json,.py,.sql,.md,.txt,.jpg,.jpeg,.png,.gif,.webp,.svg"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />

            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              onPaste={handlePaste}
              placeholder={isPlus ? `◈ Transmit to ${name}...` : `◈ Transmit... (${MAX_FREE_MESSAGES - messageCount} remaining)`}
              rows={1}
              disabled={loading}
              style={{
                flex: 1, border: "1px solid rgba(0, 255, 136, 0.15)", background: "rgba(0, 255, 136, 0.04)",
                fontSize: "13px", color: "#e2e8f0", outline: "none", resize: "none",
                lineHeight: "1.4", minHeight: "20px", maxHeight: "80px",
                padding: "8px 8px", fontFamily: "inherit",
                letterSpacing: "0.5px", borderRadius: "4px",
              }}
            />
          </div>
          {loading ? (
            <button onClick={stopGeneration} style={{
              width: "44px", height: "44px", borderRadius: "4px",
              background: "rgba(255, 80, 80, 0.15)",
              border: "1px solid rgba(255, 80, 80, 0.3)",
              color: "#ff5050",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : input.trim() ? (
            <button onClick={send} disabled={loading} style={{
              width: "44px", height: "44px", borderRadius: "4px",
              background: "linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(139, 92, 246, 0.15))",
              border: "1px solid rgba(0, 255, 136, 0.3)",
              color: "#00ff88",
              boxShadow: "0 2px 16px rgba(0, 255, 136, 0.2)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s",
              position: "relative",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          ) : (
            <button disabled style={{
              width: "44px", height: "44px", borderRadius: "4px",
              background: "rgba(0, 255, 136, 0.02)",
              border: "1px solid rgba(0, 255, 136, 0.06)",
              color: "rgba(240, 255, 245, 0.5)",
              cursor: "default", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          )}
        </div>

        {/* Uploaded files preview */}
        {uploadedFiles.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
            {uploadedFiles.map((file, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "4px 8px", borderRadius: "4px",
                background: "rgba(0, 255, 136, 0.04)",
                border: "1px solid rgba(0, 255, 136, 0.15)",
                fontSize: "10px", color: "rgba(0, 255, 136, 0.85)",
              }}>
                <span>{file.name}</span>
                <button
                  onClick={() => removeFile(i)}
                  style={{
                    background: "none", border: "none",
                    color: "rgba(255, 80, 80, 0.6)", cursor: "pointer",
                    padding: "0", fontSize: "12px",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {errorNotice && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            marginTop: "10px", padding: "8px 12px", borderRadius: "6px",
            background: "rgba(255, 80, 80, 0.06)",
            border: "1px solid rgba(255, 80, 80, 0.15)",
          }}>
            <span style={{ fontSize: "10px", color: "#ff8a8a", flex: 1, textAlign: "center", lineHeight: "1.4" }}>{errorNotice}</span>
            {lastUserMessage && !loading && (
              <button onClick={() => { setErrorNotice(null); setInput(lastUserMessage); }} style={{
                fontSize: "9px", color: "#00ff88", letterSpacing: "1px", textTransform: "uppercase",
                background: "rgba(0, 255, 136, 0.08)", border: "1px solid rgba(0, 255, 136, 0.2)",
                padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontFamily: "monospace",
                whiteSpace: "nowrap",
              }}>Retry</button>
            )}
          </div>
        )}
        {messages.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "12px", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={startNewConversation} style={controlButtonStyle}
              onMouseOver={e => { e.currentTarget.style.color = "#00ff88"; e.currentTarget.style.textShadow = "0 0 8px rgba(0, 255, 136, 0.5)"; }}
              onMouseOut={e => { e.currentTarget.style.color = "#d9f5e3"; e.currentTarget.style.textShadow = "none"; }}>◇ New</button>
            <div style={{ width: "1px", background: "rgba(0, 255, 136, 0.1)" }} />
            <button onClick={() => { setShowProjects(true); setShowHistory(false); setShowMemory(false); setShowSettings(false); }} style={controlButtonStyle}
              onMouseOver={e => { e.currentTarget.style.color = "#00ff88"; e.currentTarget.style.textShadow = "0 0 8px rgba(0, 255, 136, 0.5)"; }}
              onMouseOut={e => { e.currentTarget.style.color = "#d9f5e3"; e.currentTarget.style.textShadow = "none"; }}>◈ Projects</button>
            <div style={{ width: "1px", background: "rgba(0, 255, 136, 0.1)" }} />
            <button onClick={() => { setShowHistory(!showHistory); setShowProjects(false); setShowMemory(false); setShowSettings(false); }} style={controlButtonStyle}
              onMouseOver={e => { e.currentTarget.style.color = "#00ff88"; e.currentTarget.style.textShadow = "0 0 8px rgba(0, 255, 136, 0.5)"; }}
              onMouseOut={e => { e.currentTarget.style.color = "#d9f5e3"; e.currentTarget.style.textShadow = "none"; }}>◈ History</button>
            <div style={{ width: "1px", background: "rgba(0, 255, 136, 0.1)" }} />
            <button onClick={() => { setShowMemory(!showMemory); setShowProjects(false); setShowHistory(false); setShowSettings(false); }} style={controlButtonStyle}
              onMouseOver={e => { e.currentTarget.style.color = "#00ff88"; e.currentTarget.style.textShadow = "0 0 8px rgba(0, 255, 136, 0.5)"; }}
              onMouseOut={e => { e.currentTarget.style.color = "#d9f5e3"; e.currentTarget.style.textShadow = "none"; }}>◇ Memory</button>
            <div style={{ width: "1px", background: "rgba(0, 255, 136, 0.1)" }} />
            <button onClick={() => { setShowSettings(!showSettings); setShowProjects(false); setShowHistory(false); setShowMemory(false); }} style={controlButtonStyle}
              onMouseOver={e => { e.currentTarget.style.color = "#00ff88"; e.currentTarget.style.textShadow = "0 0 8px rgba(0, 255, 136, 0.5)"; }}
              onMouseOut={e => { e.currentTarget.style.color = "#d9f5e3"; e.currentTarget.style.textShadow = "none"; }}>◈ Configure</button>
            {lastUserMessage && !loading && (
              <>
                <div style={{ width: "1px", background: "rgba(0, 255, 136, 0.1)" }} />
                <button onClick={editLastMessage} style={controlButtonStyle}
                  onMouseOver={e => { e.currentTarget.style.color = "#00ff88"; e.currentTarget.style.textShadow = "0 0 8px rgba(0, 255, 136, 0.5)"; }}
                  onMouseOut={e => { e.currentTarget.style.color = "#d9f5e3"; e.currentTarget.style.textShadow = "none"; }}>✎ Edit</button>
                <div style={{ width: "1px", background: "rgba(0, 255, 136, 0.1)" }} />
                <button onClick={regenerateResponse} style={controlButtonStyle}
                  onMouseOver={e => { e.currentTarget.style.color = "#00ff88"; e.currentTarget.style.textShadow = "0 0 8px rgba(0, 255, 136, 0.5)"; }}
                  onMouseOut={e => { e.currentTarget.style.color = "#d9f5e3"; e.currentTarget.style.textShadow = "none"; }}>↻ Regenerate</button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Settings overlay */}
      {showSettings && (
        <div style={{
          position: "absolute", bottom: "80px", left: "16px", right: "16px",
          background: "rgba(3, 7, 18, 0.95)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderRadius: "12px",
          boxShadow: "0 0 40px rgba(0, 255, 136, 0.1), 0 0 0 1px rgba(0, 255, 136, 0.15)",
          padding: "20px", zIndex: 20, maxHeight: "60vh", overflowY: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase" }}>Configuration</span>
            <button onClick={() => setShowSettings(false)} style={{
              background: "rgba(0, 255, 136, 0.08)",
              border: "1px solid rgba(0, 255, 136, 0.15)",
              color: "#a8e4b8",
              fontSize: "12px", width: "28px", height: "28px",
              borderRadius: "6px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "10px", color: "#00ff88", display: "block", marginBottom: "10px", letterSpacing: "2px", textTransform: "uppercase" }}>Interface Mode</label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {PERSONALITIES.map(p => (
                <button key={p.id} onClick={() => updateSettings({ personality: p.id })} style={{
                  padding: "8px 14px", borderRadius: "6px",
                  border: `1px solid ${settings.personality === p.id ? "rgba(0, 255, 136, 0.65)" : "rgba(0, 255, 136, 0.1)"}`,
                  background: settings.personality === p.id ? "rgba(0, 255, 136, 0.1)" : "transparent",
                  color: settings.personality === p.id ? "#00ff88" : "#a8e4b8",
                  fontSize: "11px", cursor: "pointer", transition: "all 0.2s",
                  letterSpacing: "0.5px",
                }}>{p.emoji} {p.name}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "10px", color: "#00ff88", display: "block", marginBottom: "10px", letterSpacing: "2px", textTransform: "uppercase" }}>Designation</label>
            <input type="text" value={settings.customName} onChange={e => updateSettings({ customName: e.target.value })} style={{
              width: "100%", background: "rgba(0, 255, 136, 0.04)",
              border: "1px solid rgba(0, 255, 136, 0.15)", borderRadius: "8px",
              padding: "10px 14px", color: "#e2e8f0", fontSize: "13px",
              outline: "none", boxSizing: "border-box",
              letterSpacing: "0.5px",
            }} />
          </div>
          <div>
            <label style={{ fontSize: "10px", color: "#00ff88", display: "block", marginBottom: "10px", letterSpacing: "2px", textTransform: "uppercase" }}>Response Protocol</label>
            <div style={{ display: "flex", gap: "6px" }}>
              {(["short", "medium", "long"] as const).map(l => (
                <button key={l} onClick={() => updateSettings({ responseLength: l })} style={{
                  flex: 1, padding: "8px", borderRadius: "6px",
                  border: `1px solid ${settings.responseLength === l ? "rgba(0, 255, 136, 0.65)" : "rgba(0, 255, 136, 0.1)"}`,
                  background: settings.responseLength === l ? "rgba(0, 255, 136, 0.1)" : "transparent",
                  color: settings.responseLength === l ? "#00ff88" : "#a8e4b8",
                  fontSize: "11px", cursor: "pointer", textTransform: "capitalize",
                  transition: "all 0.2s", letterSpacing: "0.5px",
                }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conversation history panel */}
      {showHistory && (
        <div style={{
          position: "absolute", bottom: "80px", left: "16px", right: "16px",
          background: "rgba(3, 7, 18, 0.95)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderRadius: "12px",
          boxShadow: "0 0 40px rgba(0, 255, 136, 0.1), 0 0 0 1px rgba(0, 255, 136, 0.15)",
          padding: "20px", zIndex: 20, maxHeight: "60vh", overflowY: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase" }}>History</span>
            <button onClick={() => setShowHistory(false)} style={{
              background: "rgba(0, 255, 136, 0.08)",
              border: "1px solid rgba(0, 255, 136, 0.15)",
              color: "#a8e4b8",
              fontSize: "12px", width: "28px", height: "28px",
              borderRadius: "6px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>
          {conversations.length === 0 ? (
            <p style={{ fontSize: "11px", color: "#a8e4b8", textAlign: "center", padding: "20px 0" }}>No conversations yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {conversations.slice(0, 20).map(conv => (
                <div key={conv.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: "8px",
                  background: currentConversationId === conv.id ? "rgba(0, 255, 136, 0.08)" : "rgba(0, 255, 136, 0.02)",
                  border: `1px solid ${currentConversationId === conv.id ? "rgba(0, 255, 136, 0.2)" : "rgba(0, 255, 136, 0.08)"}`,
                  transition: "all 0.2s",
                }}>
                  {editingConvId === conv.id ? (
                    <div style={{ flex: 1, minWidth: 0, display: "flex", gap: "6px", alignItems: "center" }}>
                      <input
                        autoFocus
                        value={convRenameDraft}
                        onChange={e => setConvRenameDraft(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") { renameConversation(conv.id, convRenameDraft); setEditingConvId(null); }
                          if (e.key === "Escape") setEditingConvId(null);
                        }}
                        onClick={e => e.stopPropagation()}
                        style={{
                          flex: 1, minWidth: 0, boxSizing: "border-box",
                          background: "rgba(0, 255, 136, 0.04)",
                          border: "1px solid rgba(0, 255, 136, 0.2)", borderRadius: "4px",
                          padding: "4px 8px", color: "#e2e8f0", fontSize: "12px", outline: "none",
                        }}
                      />
                      <button onClick={(e) => { e.stopPropagation(); renameConversation(conv.id, convRenameDraft); setEditingConvId(null); }} style={{
                        background: "none", border: "none", color: "#00ff88", cursor: "pointer",
                        padding: "4px", fontSize: "12px",
                      }}>✓</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => loadConversation(conv)}>
                        <div style={{ fontSize: "12px", color: "#e2e8f0", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {conv.title}
                        </div>
                        <div style={{ fontSize: "9px", color: "#a8e4b8" }}>
                          {new Date(conv.updatedAt).toLocaleDateString()} · {conv.messages.length} msg
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setEditingConvId(conv.id); setConvRenameDraft(conv.title); }} style={{
                        background: "none", border: "none",
                        color: "#a8e4b8", cursor: "pointer", padding: "4px",
                        fontSize: "12px", transition: "color 0.2s",
                      }} onMouseOver={e => e.currentTarget.style.color = "#00ff88"} onMouseOut={e => e.currentTarget.style.color = "#a8e4b8"}>
                        ✎
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} style={{
                        background: "none", border: "none",
                        color: "#a8e4b8", cursor: "pointer", padding: "4px",
                        fontSize: "12px", transition: "color 0.2s",
                      }} onMouseOver={e => e.currentTarget.style.color = "#ff5050"} onMouseOut={e => e.currentTarget.style.color = "#a8e4b8"}>
                        ✕
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Memory panel */}
      {showMemory && (
        <div style={{
          position: "absolute", bottom: "80px", left: "16px", right: "16px",
          background: "rgba(3, 7, 18, 0.95)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderRadius: "12px",
          boxShadow: "0 0 40px rgba(0, 255, 136, 0.1), 0 0 0 1px rgba(0, 255, 136, 0.15)",
          padding: "20px", zIndex: 20, maxHeight: "60vh", overflowY: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase" }}>Memory</span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={toggleMemoryEnabled} style={{
                fontSize: "9px", color: memoryEnabled ? "#00ff88" : "#a8e4b8",
                background: memoryEnabled ? "rgba(0, 255, 136, 0.08)" : "transparent",
                border: `1px solid ${memoryEnabled ? "rgba(0, 255, 136, 0.2)" : "rgba(0, 255, 136, 0.08)"}`,
                cursor: "pointer", padding: "4px 8px", borderRadius: "4px",
                letterSpacing: "1px", textTransform: "uppercase",
                transition: "all 0.2s",
              }}>{memoryEnabled ? "◉ Enabled" : "○ Disabled"}</button>
              {memory.length > 0 && (
                <button onClick={clearMemory} style={{
                  fontSize: "9px", color: "#ff5050",
                  background: "none", border: "none", cursor: "pointer",
                  letterSpacing: "1px", textTransform: "uppercase",
                }}>Clear All</button>
              )}
              <button onClick={() => setShowMemory(false)} style={{
                background: "rgba(0, 255, 136, 0.08)",
                border: "1px solid rgba(0, 255, 136, 0.15)",
                color: "#a8e4b8",
                fontSize: "12px", width: "28px", height: "28px",
                borderRadius: "6px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
            </div>
          </div>
          {memory.length === 0 ? (
            <p style={{ fontSize: "11px", color: "#a8e4b8", textAlign: "center", padding: "20px 0" }}>No memories saved</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {memory.map(item => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: "8px",
                  background: "rgba(0, 255, 136, 0.02)",
                  border: "1px solid rgba(0, 255, 136, 0.08)",
                }}>
                  <div style={{ fontSize: "11px", color: "#e2e8f0", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.text}
                  </div>
                  <button onClick={() => removeFromMemory(item.id)} style={{
                    background: "none", border: "none",
                    color: "#a8e4b8", cursor: "pointer", padding: "4px",
                    fontSize: "12px", transition: "color 0.2s",
                  }} onMouseOver={e => e.currentTarget.style.color = "#ff5050"} onMouseOut={e => e.currentTarget.style.color = "#a8e4b8"}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}>
            <input
              placeholder="Save something to remember..."
              id="elyra-memory-input"
              style={{
                flex: 1, minWidth: 0,
                background: "rgba(0, 255, 136, 0.04)",
                border: "1px solid rgba(0, 255, 136, 0.15)", borderRadius: "6px",
                padding: "8px 12px", color: "#e2e8f0", fontSize: "12px", outline: "none",
              }}
            />
            <button onClick={() => {
              const el = document.getElementById("elyra-memory-input") as HTMLInputElement | null;
              if (el && el.value.trim()) {
                addToMemory(el.value);
                el.value = "";
              }
            }} style={{
              padding: "8px 14px", borderRadius: "6px", cursor: "pointer",
              background: "rgba(0, 255, 136, 0.08)", border: "1px solid rgba(0, 255, 136, 0.2)",
              color: "#00ff88", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}>Save</button>
          </div>
          <p style={{ fontSize: "9px", color: "#a8e4b8", marginTop: "10px", lineHeight: "1.5" }}>
            {memoryEnabled ? "Luna uses your memories to personalize responses. They're private to you and can be cleared anytime." : "Memory is currently disabled — Luna won't receive these notes."}
          </p>
        </div>
      )}

      {/* Projects panel */}
      {showProjects && (
        <div style={{
          position: "absolute", bottom: "80px", left: "16px", right: "16px",
          background: "rgba(3, 7, 18, 0.95)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderRadius: "12px",
          boxShadow: "0 0 40px rgba(0, 255, 136, 0.1), 0 0 0 1px rgba(0, 255, 136, 0.15)",
          padding: "20px", zIndex: 20, maxHeight: "60vh", overflowY: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#00ff88", letterSpacing: "2px", textTransform: "uppercase" }}>Projects</span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={startNewProject} style={{
                fontSize: "9px", color: "#00ff88",
                background: "rgba(0, 255, 136, 0.08)",
                border: "1px solid rgba(0, 255, 136, 0.2)",
                cursor: "pointer", padding: "4px 10px", borderRadius: "4px",
                letterSpacing: "1px", textTransform: "uppercase",
              }}>＋ New</button>
              <button onClick={() => setShowProjects(false)} style={{
                background: "rgba(0, 255, 136, 0.08)",
                border: "1px solid rgba(0, 255, 136, 0.15)",
                color: "#a8e4b8",
                fontSize: "12px", width: "28px", height: "28px",
                borderRadius: "6px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
            </div>
          </div>

          {/* New project form */}
          {newProjectOpen && (
            <div style={{ marginBottom: "16px", padding: "14px", borderRadius: "8px", background: "rgba(0, 255, 136, 0.03)", border: "1px solid rgba(0, 255, 136, 0.12)" }}>
              {([
                ["name", "Project name"],
                ["whatBuilding", "What are you building?"],
                ["language", "Language (e.g. JavaScript)"],
                ["framework", "Framework (e.g. React)"],
              ] as const).map(([field, placeholder]) => (
                <div key={field} style={{ marginBottom: "8px" }}>
                  <input
                    placeholder={placeholder}
                    value={newProjectDraft[field]}
                    onChange={e => setNewProjectDraft(d => ({ ...d, [field]: e.target.value }))}
                    onKeyDown={e => { if (e.key === "Enter") createProject(); }}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      background: "rgba(0, 255, 136, 0.04)",
                      border: "1px solid rgba(0, 255, 136, 0.15)", borderRadius: "6px",
                      padding: "8px 12px", color: "#e2e8f0", fontSize: "12px", outline: "none",
                    }}
                  />
                </div>
              ))}
              <button onClick={createProject} style={{
                width: "100%", padding: "8px", borderRadius: "6px", cursor: "pointer",
                background: "rgba(0, 255, 136, 0.1)", border: "1px solid rgba(0, 255, 136, 0.3)",
                color: "#00ff88", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase",
              }}>Create Project</button>
            </div>
          )}

          {projectDetailId && detailProject ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                <button onClick={() => setProjectDetailId(null)} style={{
                  background: "rgba(0, 255, 136, 0.08)",
                  border: "1px solid rgba(0, 255, 136, 0.15)",
                  color: "#a8e4b8", fontSize: "11px", width: "26px", height: "26px",
                  borderRadius: "6px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>←</button>
                <span style={{ fontSize: "12px", color: "#00ff88", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{detailProject.name}</span>
                {currentProjectId === detailProject.id && (
                  <span style={{ fontSize: "8px", color: "#22d3ee", letterSpacing: "1px", textTransform: "uppercase" }}>● Active</span>
                )}
              </div>
              {([
                ["name", "Project name"],
                ["whatBuilding", "What are you building?"],
                ["language", "Language"],
                ["framework", "Framework"],
                ["files", "Files involved (optional)"],
                ["decisions", "Decisions made (optional)"],
                ["progress", "Progress (optional)"],
                ["instructions", "Instructions for Luna (optional)"],
              ] as [keyof Pick<ElyraProject, "name" | "whatBuilding" | "language" | "framework" | "files" | "decisions" | "progress" | "instructions">, string][]).map(([field, label]) => (
                <div key={field} style={{ marginBottom: "8px" }}>
                  <label style={{ fontSize: "9px", color: "#00ff88", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>{label}</label>
                  <textarea
                    rows={["whatBuilding", "decisions", "progress", "instructions"].includes(field) ? 2 : 1}
                    value={String(detailProject[field])}
                    onChange={e => updateProjectField(detailProject.id, field, e.target.value)}
                    placeholder={label}
                    style={{
                      width: "100%", boxSizing: "border-box", resize: "vertical",
                      background: "rgba(0, 255, 136, 0.04)",
                      border: "1px solid rgba(0, 255, 136, 0.15)", borderRadius: "6px",
                      padding: "8px 12px", color: "#e2e8f0", fontSize: "12px", outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              ))}
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button onClick={() => openProject(detailProject)} style={{
                  flex: 1, padding: "9px", borderRadius: "6px", cursor: "pointer",
                  background: "rgba(0, 255, 136, 0.1)", border: "1px solid rgba(0, 255, 136, 0.3)",
                  color: "#00ff88", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase",
                }}>{detailProject.conversationId ? "Continue Chat" : "Start Chat"}</button>
                <button onClick={() => deleteProject(detailProject.id)} style={{
                  padding: "9px 16px", borderRadius: "6px", cursor: "pointer",
                  background: "rgba(255, 80, 80, 0.08)", border: "1px solid rgba(255, 80, 80, 0.25)",
                  color: "#ff8a8a", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase",
                }}>Delete</button>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <p style={{ fontSize: "11px", color: "#a8e4b8", textAlign: "center", padding: "20px 0", lineHeight: "1.6" }}>
              {newProjectOpen ? "Fill in the details above to create your first project." : "No projects yet. Start one so Luna stays grounded in what you're building."}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {projects.map(proj => (
                <div key={proj.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                  background: currentProjectId === proj.id ? "rgba(0, 255, 136, 0.08)" : "rgba(0, 255, 136, 0.02)",
                  border: `1px solid ${currentProjectId === proj.id ? "rgba(0, 255, 136, 0.2)" : "rgba(0, 255, 136, 0.08)"}`,
                  transition: "all 0.2s",
                }} onClick={() => setProjectDetailId(proj.id)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{proj.name}</div>
                    <div style={{ fontSize: "9px", color: "#a8e4b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {[proj.language, proj.framework].filter(Boolean).join(" · ") || proj.whatBuilding || "—"}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); openProject(proj); }} style={{
                    background: "rgba(0, 255, 136, 0.08)",
                    border: "1px solid rgba(0, 255, 136, 0.2)",
                    color: "#00ff88", cursor: "pointer", padding: "4px 10px",
                    borderRadius: "4px", fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}>Open</button>
                  <button onClick={(e) => { e.stopPropagation(); deleteProject(proj.id); }} style={{
                    background: "none", border: "none",
                    color: "#a8e4b8", cursor: "pointer", padding: "4px",
                    fontSize: "12px", transition: "color 0.2s",
                  }} onMouseOver={e => e.currentTarget.style.color = "#ff5050"} onMouseOut={e => e.currentTarget.style.color = "#a8e4b8"}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        textarea::placeholder { color: #d9f5e3; letter-spacing: 1px; font-size: 11px; }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
        @keyframes breathe {
          0%, 100% { opacity: 0.8; transform: scale(1); filter: drop-shadow(0 0 25px rgba(0, 255, 136, 0.5)); }
          50% { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 50px rgba(0, 255, 136, 0.7)); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        /* Markdown styles */
        .elyra-message p { margin: 0 0 10px; }
        .elyra-message p:last-child { margin-bottom: 0; }
        .elyra-message ul, .elyra-message ol { margin: 4px 0; padding-left: 20px; }
        .elyra-message li { margin: 2px 0; }
        .elyra-message strong { color: #e2e8f0; font-weight: 600; }
        .elyra-message em { color: #d8f5e2; }
        .elyra-message a { color: #00ff88; text-decoration: underline; }
        .elyra-message h1, .elyra-message h2, .elyra-message h3 { color: #e2e8f0; font-weight: 600; }
        .elyra-message h1 { font-size: 18px; margin: 16px 0 8px; }
        .elyra-message h2 { font-size: 16px; margin: 14px 0 6px; }
        .elyra-message h3 { font-size: 14px; margin: 12px 0 4px; }
        .elyra-message blockquote {
          border-left: 3px solid rgba(0, 255, 136, 0.3);
          padding-left: 12px;
          margin: 8px 0;
          color: #d8f5e2;
          font-style: italic;
        }
        /* Code block scrollbar */
        .elyra-code-block::-webkit-scrollbar { height: 6px; }
        .elyra-code-block::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 3px; }
        .elyra-code-block::-webkit-scrollbar-thumb { background: rgba(0, 255, 136, 0.2); border-radius: 3px; }
        .elyra-code-block::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 136, 0.65); }
      `}</style>
    </div>
  );
}
