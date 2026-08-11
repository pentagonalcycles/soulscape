import {
  getSyncQueue,
  removeFromSyncQueue,
  markJournalSynced,
  deleteJournalOffline,
  type SyncQueueItem,
} from "./offline-db";
import { supabase } from "./supabase";

let syncing = false;

export async function processSyncQueue(): Promise<void> {
  if (syncing || !navigator.onLine) return;
  syncing = true;

  try {
    const queue = await getSyncQueue();
    if (queue.length === 0) { syncing = false; return; }

    const client = supabase();

    for (const item of queue) {
      try {
        await processItem(client, item);
        await removeFromSyncQueue(item.id);
      } catch {
        // Keep in queue for next attempt
      }
    }
  } finally {
    syncing = false;
  }
}

async function processItem(client: ReturnType<typeof supabase>, item: SyncQueueItem): Promise<void> {
  const { action, table, data } = item;

  switch (action) {
    case "create": {
      const { id, synced, pending_delete, ...insertData } = data as Record<string, unknown>;
      const { error } = await client.from(table).insert(insertData);
      if (error) throw error;
      if (table === "journals" && typeof id === "string") {
        await markJournalSynced(id);
      }
      break;
    }
    case "update": {
      const { id, synced, pending_delete, ...updateData } = data as Record<string, unknown>;
      if (typeof id !== "string") break;
      const { error } = await client.from(table).update(updateData).eq("id", id);
      if (error) throw error;
      if (table === "journals") {
        await markJournalSynced(id);
      }
      break;
    }
    case "delete": {
      const { id } = data as { id: string };
      if (!id) break;
      const { error } = await client.from(table).delete().eq("id", id);
      if (error) throw error;
      if (table === "journals") {
        await deleteJournalOffline(id);
      }
      break;
    }
  }
}

// Listen for online events to auto-sync
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    processSyncQueue();
  });
}
