import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { CampfireMessage, CampfirePresence, WARM_COLORS } from "./types";

export type OnMessage = (msg: CampfireMessage) => void;
export type OnPresenceUpdate = (presences: CampfirePresence[]) => void;

export class CampfireMultiplayer {
  private channel: RealtimeChannel | null = null;
  private roomId: string = "";
  private userId: string = "";
  private userName: string = "";
  private userColor: string = "";
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;

  onMessage: OnMessage | null = null;
  onPresenceUpdate: OnPresenceUpdate | null = null;

  async join(roomId: string, userId: string, userName: string): Promise<void> {
    this.roomId = roomId;
    this.userId = userId;
    this.userName = userName;
    this.userColor = WARM_COLORS[Math.abs(this.hashCode(userId + userName)) % WARM_COLORS.length];

    this.channel = supabase().channel(`campfire-${roomId}`, {
      config: { broadcast: { self: false } },
    });

    this.channel
      .on("broadcast", { event: "chat_message" }, ({ payload }) => {
        this.onMessage?.(payload as CampfireMessage);
      })
      .on("broadcast", { event: "typing_start" }, ({ payload }) => {
        const data = payload as { name: string; color: string };
        this.onMessage?.({
          name: data.name,
          color: data.color,
          text: "",
          timestamp: Date.now(),
          type: "typing",
        });
      })
      .on("broadcast", { event: "typing_stop" }, ({ payload }) => {
        const data = payload as { name: string };
        this.onMessage?.({
          name: data.name,
          color: "",
          text: "",
          timestamp: Date.now(),
          type: "typing",
        });
      })
      .on("presence", { event: "sync" }, () => {
        if (!this.channel) return;
        const state = this.channel.presenceState<CampfirePresence>();
        const all: CampfirePresence[] = [];
        for (const key in state) {
          const entries = state[key];
          if (Array.isArray(entries)) {
            for (const entry of entries) {
              all.push({ name: entry.name, color: entry.color });
            }
          }
        }
        this.onPresenceUpdate?.(all);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        for (const p of newPresences) {
          const data = p as unknown as CampfirePresence;
          if (data.name !== this.userName) {
            this.onMessage?.({
              name: "fire",
              color: "#f59e0b",
              text: `Welcome, ${data.name}. Pull up a seat.`,
              timestamp: Date.now(),
              type: "system",
            });
          }
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        for (const p of leftPresences) {
          const data = p as unknown as CampfirePresence;
          if (data.name !== this.userName) {
            this.onMessage?.({
              name: "fire",
              color: "#f59e0b",
              text: `${data.name} left the campfire.`,
              timestamp: Date.now(),
              type: "system",
            });
          }
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await this.channel?.track({
            name: this.userName,
            color: this.userColor,
          });
        }
      });
  }

  sendMessage(text: string): void {
    if (!this.channel || !text.trim()) return;
    const msg: CampfireMessage = {
      name: this.userName,
      color: this.userColor,
      text: text.trim(),
      timestamp: Date.now(),
      type: "message",
    };
    this.channel.send({
      type: "broadcast",
      event: "chat_message",
      payload: msg,
    });
    this.onMessage?.(msg);
    // Persist to database (fire and forget)
    supabase().from("campfire_messages").insert({
      room_id: this.roomId,
      user_name: this.userName,
      user_color: this.userColor,
      message: text.trim(),
    }).then(({ error }) => {
      if (error) console.error("[Campfire] Error saving message:", error);
    });
  }

  async loadRecent(): Promise<CampfireMessage[]> {
    try {
      const { data, error } = await supabase()
        .from("campfire_messages")
        .select("user_name, user_color, message, created_at")
        .eq("room_id", this.roomId)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) {
        console.error("[Campfire] Error loading messages:", error);
        return [];
      }
      if (!data) return [];
      return data.reverse().map((row) => ({
        name: row.user_name,
        color: row.user_color,
        text: row.message,
        timestamp: new Date(row.created_at).getTime(),
        type: "message" as const,
      }));
    } catch (err) {
      console.error("[Campfire] Failed to load messages:", err);
      return [];
    }
  }

  startTyping(): void {
    if (!this.channel) return;
    this.channel.send({
      type: "broadcast",
      event: "typing_start",
      payload: { name: this.userName, color: this.userColor },
    });
  }

  stopTyping(): void {
    if (!this.channel) return;
    this.channel.send({
      type: "broadcast",
      event: "typing_stop",
      payload: { name: this.userName },
    });
  }

  scheduleStopTyping(): void {
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => this.stopTyping(), 2000);
  }

  getUserColor(): string {
    return this.userColor;
  }

  getUserName(): string {
    return this.userName;
  }

  leave(): void {
    if (this.channel) {
      this.channel.untrack();
      supabase().removeChannel(this.channel);
      this.channel = null;
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
