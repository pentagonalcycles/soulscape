import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "elovayne-offline";
const DB_VERSION = 1;

export interface OfflineEntry {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  stickers: string[] | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  synced: boolean;
  pending_delete: boolean;
}

export interface SyncQueueItem {
  id: string;
  action: "create" | "update" | "delete";
  table: string;
  data: Record<string, unknown>;
  timestamp: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("journals")) {
          const journalStore = db.createObjectStore("journals", { keyPath: "id" });
          journalStore.createIndex("user_id", "user_id");
          journalStore.createIndex("synced", "synced");
        }
        if (!db.objectStoreNames.contains("sync_queue")) {
          const syncStore = db.createObjectStore("sync_queue", { keyPath: "id" });
          syncStore.createIndex("timestamp", "timestamp");
        }
      },
    });
  }
  return dbPromise;
}

// ─── Journal Entries ───

export async function saveJournalOffline(entry: OfflineEntry): Promise<void> {
  const db = await getDB();
  await db.put("journals", entry);
}

export async function getJournalOffline(userId: string): Promise<OfflineEntry[]> {
  const db = await getDB();
  const all = await db.getAll("journals");
  return all.filter((e) => e.user_id === userId).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function deleteJournalOffline(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("journals", id);
}

export async function markJournalSynced(id: string): Promise<void> {
  const db = await getDB();
  const entry = await db.get("journals", id);
  if (entry) {
    entry.synced = true;
    await db.put("journals", entry);
  }
}

// ─── Sync Queue ───

export async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  const db = await getDB();
  await db.put("sync_queue", item);
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAll("sync_queue");
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("sync_queue", id);
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getDB();
  await db.clear("sync_queue");
}

// ─── Utility ───

export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}

export function generateOfflineId(): string {
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
