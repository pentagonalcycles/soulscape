import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { CampfireMessage, CampfirePresence, WARM_COLORS } from "./types";

export type OnMessage = (msg: CampfireMessage) => void;
export type OnPresenceUpdate = (presences: CampfirePresence[]) => void;

export class CampfireMultiplayer {
  private channel: RealtimeChannel | null = null;
  private userId: string = "";
  private userName: string = "";
  private userColor: string = "";
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;
  private presences: Map<string, CampfirePresence> = new Map();

  onMessage: OnMessage | null = null;
  onPresenceUpdate: OnPresenceUpdate | null = null;

  async join(roomId: string, userId: string, userName: string): Promise<void> {
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
      .on("broadcast", { event: "user_join" }, ({ payload }) => {
        const data = payload as { name: string; color: string };
        this.presences.set(data.name, { name: data.name, color: data.color });
        this.onPresenceUpdate?.(Array.from(this.presences.values()));
        this.onMessage?.({
          name: "fire",
          color: "#f59e0b",
          text: `Welcome, ${data.name}. Pull up a seat.`,
          timestamp: Date.now(),
          type: "system",
        });
      })
      .on("broadcast", { event: "user_leave" }, ({ payload }) => {
        const data = payload as { name: string };
        this.presences.delete(data.name);
        this.onPresenceUpdate?.(Array.from(this.presences.values()));
      })
      .subscribe();

    // Add self to presence
    this.presences.set(userName, { name: userName, color: this.userColor });
    this.onPresenceUpdate?.(Array.from(this.presences.values()));

    // Announce join
    this.channel.send({
      type: "broadcast",
      event: "user_join",
      payload: { name: userName, color: this.userColor },
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
    // Fire locally for sender
    this.onMessage?.(msg);
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
      this.channel.send({
        type: "broadcast",
        event: "user_leave",
        payload: { name: this.userName },
      });
      supabase().removeChannel(this.channel);
      this.channel = null;
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
    this.presences.clear();
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
