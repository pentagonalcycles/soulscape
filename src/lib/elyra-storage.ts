import { supabase } from "./supabase";

export interface ElyraMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

export interface ElyraConversation {
  id: string;
  title: string;
  messages: ElyraMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ElyraProject {
  id: string;
  name: string;
  whatBuilding: string;
  language: string;
  framework: string;
  files: string;
  decisions: string;
  progress: string;
  instructions: string;
  conversationId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ElyraMemoryItem {
  id: string;
  text: string;
  createdAt: number;
}

const UUID = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// A real Supabase session (anonymous auth enabled) vs the local fallback uid.
function isLocal(userId: string | null): boolean {
  return !userId || userId.startsWith("anon-");
}

function lsKey(userId: string | null, kind: string): string {
  return `elyra-${kind}-${userId || "anon"}`;
}

function lsGet<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function lsSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

// ---- row <-> model mapping ----
function convToRow(c: ElyraConversation) {
  return {
    id: c.id,
    user_id: null,
    title: c.title,
    messages: c.messages,
    created_at: new Date(c.createdAt).toISOString(),
    updated_at: new Date(c.updatedAt).toISOString(),
  };
}

function rowToConv(row: Record<string, unknown>): ElyraConversation {
  return {
    id: String(row.id),
    title: String(row.title || "New Conversation"),
    messages: Array.isArray(row.messages) ? (row.messages as ElyraMessage[]) : [],
    createdAt: row.created_at ? new Date(String(row.created_at)).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(String(row.updated_at)).getTime() : Date.now(),
  };
}

function projectToRow(p: ElyraProject) {
  return {
    id: p.id,
    user_id: null,
    name: p.name,
    what_building: p.whatBuilding || "",
    language: p.language || "",
    framework: p.framework || "",
    files: p.files || "",
    decisions: p.decisions || "",
    progress: p.progress || "",
    instructions: p.instructions || "",
    conversation_id: p.conversationId || null,
    created_at: new Date(p.createdAt).toISOString(),
    updated_at: new Date(p.updatedAt).toISOString(),
  };
}

function rowToProject(row: Record<string, unknown>): ElyraProject {
  return {
    id: String(row.id),
    name: String(row.name || "Untitled Project"),
    whatBuilding: String(row.what_building || ""),
    language: String(row.language || ""),
    framework: String(row.framework || ""),
    files: String(row.files || ""),
    decisions: String(row.decisions || ""),
    progress: String(row.progress || ""),
    instructions: String(row.instructions || ""),
    conversationId: row.conversation_id ? String(row.conversation_id) : null,
    createdAt: row.created_at ? new Date(String(row.created_at)).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(String(row.updated_at)).getTime() : Date.now(),
  };
}

function memoryToRow(m: ElyraMemoryItem) {
  return {
    user_id: null,
    text: m.text,
    created_at: new Date(m.createdAt).toISOString(),
  };
}

function rowToMemory(row: Record<string, unknown>): ElyraMemoryItem {
  return {
    id: String(row.id),
    text: String(row.text || ""),
    createdAt: row.created_at ? new Date(String(row.created_at)).getTime() : Date.now(),
  };
}

// ---- conversations ----
export async function loadConversations(userId: string | null): Promise<ElyraConversation[]> {
  if (isLocal(userId)) {
    const list = lsGet<ElyraConversation>(lsKey(userId, "conversations"));
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }
  try {
    const client = supabase();
    const { data, error } = await client
      .from("elyra_conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((r: Record<string, unknown>) => rowToConv(r));
  } catch {
    return lsGet<ElyraConversation>(lsKey(userId, "conversations"));
  }
}

export async function upsertConversation(userId: string | null, conv: ElyraConversation) {
  if (isLocal(userId)) {
    const key = lsKey(userId, "conversations");
    const list = lsGet<ElyraConversation>(key);
    const idx = list.findIndex((c) => c.id === conv.id);
    if (idx >= 0) list[idx] = conv;
    else list.unshift(conv);
    lsSet(key, list);
    return;
  }
  try {
    const row = convToRow(conv);
    const client = supabase();
    const { error } = await client.from("elyra_conversations").upsert({ ...row, user_id: userId });
    if (error) throw error;
  } catch {
    const key = lsKey(userId, "conversations");
    const list = lsGet<ElyraConversation>(key);
    const idx = list.findIndex((c) => c.id === conv.id);
    if (idx >= 0) list[idx] = conv;
    else list.unshift(conv);
    lsSet(key, list);
  }
}

export async function deleteConversation(userId: string | null, id: string) {
  if (isLocal(userId)) {
    const key = lsKey(userId, "conversations");
    lsSet(key, lsGet<ElyraConversation>(key).filter((c) => c.id !== id));
    return;
  }
  try {
    const client = supabase();
    const { error } = await client.from("elyra_conversations").delete().eq("id", id);
    if (error) throw error;
  } catch {
    const key = lsKey(userId, "conversations");
    lsSet(key, lsGet<ElyraConversation>(key).filter((c) => c.id !== id));
  }
}

// ---- projects ----
export async function loadProjects(userId: string | null): Promise<ElyraProject[]> {
  if (isLocal(userId)) {
    const list = lsGet<ElyraProject>(lsKey(userId, "projects"));
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }
  try {
    const client = supabase();
    const { data, error } = await client
      .from("elyra_projects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((r: Record<string, unknown>) => rowToProject(r));
  } catch {
    return lsGet<ElyraProject>(lsKey(userId, "projects"));
  }
}

export async function upsertProject(userId: string | null, proj: ElyraProject) {
  if (isLocal(userId)) {
    const key = lsKey(userId, "projects");
    const list = lsGet<ElyraProject>(key);
    const idx = list.findIndex((p) => p.id === proj.id);
    if (idx >= 0) list[idx] = proj;
    else list.unshift(proj);
    lsSet(key, list);
    return;
  }
  try {
    const row = projectToRow(proj);
    const client = supabase();
    const { error } = await client.from("elyra_projects").upsert({ ...row, user_id: userId });
    if (error) throw error;
  } catch {
    const key = lsKey(userId, "projects");
    const list = lsGet<ElyraProject>(key);
    const idx = list.findIndex((p) => p.id === proj.id);
    if (idx >= 0) list[idx] = proj;
    else list.unshift(proj);
    lsSet(key, list);
  }
}

export async function deleteProject(userId: string | null, id: string) {
  if (isLocal(userId)) {
    const key = lsKey(userId, "projects");
    lsSet(key, lsGet<ElyraProject>(key).filter((p) => p.id !== id));
    return;
  }
  try {
    const client = supabase();
    const { error } = await client.from("elyra_projects").delete().eq("id", id);
    if (error) throw error;
  } catch {
    const key = lsKey(userId, "projects");
    lsSet(key, lsGet<ElyraProject>(key).filter((p) => p.id !== id));
  }
}

// ---- memory ----
export async function loadMemory(userId: string | null): Promise<ElyraMemoryItem[]> {
  if (isLocal(userId)) {
    return lsGet<ElyraMemoryItem>(lsKey(userId, "memory"));
  }
  try {
    const client = supabase();
    const { data, error } = await client
      .from("elyra_memories")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((r: Record<string, unknown>) => rowToMemory(r));
  } catch {
    return lsGet<ElyraMemoryItem>(lsKey(userId, "memory"));
  }
}

export async function replaceMemory(userId: string | null, items: ElyraMemoryItem[]) {
  if (isLocal(userId)) {
    lsSet(lsKey(userId, "memory"), items);
    return;
  }
  try {
    const client = supabase();
    const { error: delErr } = await client.from("elyra_memories").delete().eq("user_id", userId);
    if (delErr) throw delErr;
    if (items.length > 0) {
      const rows = items.map((m) => ({ ...memoryToRow(m), user_id: userId }));
      const { error: insErr } = await client.from("elyra_memories").insert(rows);
      if (insErr) throw insErr;
    }
  } catch {
    lsSet(lsKey(userId, "memory"), items);
  }
}

// One-time migration: push legacy localStorage conversations up to Supabase.
export async function migrateLegacy(userId: string | null): Promise<void> {
  if (isLocal(userId)) return;
  try {
    const key = "elyra-conversations";
    const legacy = lsGet<ElyraConversation>(key);
    if (legacy.length === 0) return;
    const { data, error } = await supabase()
      .from("elyra_conversations")
      .select("id")
      .limit(1);
    if (error) throw error;
    if (data && data.length > 0) return; // already has data
    for (const c of legacy) {
      await upsertConversation(userId, c);
    }
    localStorage.removeItem(key);
  } catch {
    /* ignore migration errors */
  }
}

export function newConversationId(): string {
  return UUID();
}

export function newProjectId(): string {
  return UUID();
}