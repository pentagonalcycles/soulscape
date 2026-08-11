import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { StrokeSegment, CursorUpdate } from "./types";

export interface ChatMessage {
  userId: string;
  name: string;
  color: string;
  text: string;
  timestamp: number;
}

export type OnCursorMove = (userId: string, data: CursorUpdate) => void;
export type OnStrokeSegment = (userId: string, data: StrokeSegment) => void;
export type OnUserJoin = (userId: string, data: { color: string; name: string }) => void;
export type OnUserLeave = (userId: string) => void;
export type OnChatMessage = (data: ChatMessage) => void;

export class MuralMultiplayer {
  private channel: RealtimeChannel | null = null;
  private userId: string = "";
  private userColor: string = "";
  private userName: string = "";
  private cursorThrottle: ReturnType<typeof setTimeout> | null = null;

  onCursorMove: OnCursorMove | null = null;
  onStrokeSegment: OnStrokeSegment | null = null;
  onUserJoin: OnUserJoin | null = null;
  onUserLeave: OnUserLeave | null = null;
  onChatMessage: OnChatMessage | null = null;

  async join(roomId: string, userId: string, userColor: string, userName: string): Promise<void> {
    this.userId = userId;
    this.userColor = userColor;
    this.userName = userName;

    this.channel = supabase().channel(`mural-${roomId}`, {
      config: { broadcast: { self: false } },
    });

    this.channel
      .on("broadcast", { event: "cursor_move" }, ({ payload }) => {
        const data = payload as CursorUpdate;
        if (data.userId !== this.userId) {
          this.onCursorMove?.(data.userId, data);
        }
      })
      .on("broadcast", { event: "stroke_segment" }, ({ payload }) => {
        const data = payload as StrokeSegment;
        if (data.userId !== this.userId) {
          this.onStrokeSegment?.(data.userId, data);
        }
      })
      .on("broadcast", { event: "user_join" }, ({ payload }) => {
        const data = payload as { userId: string; color: string; name: string };
        if (data.userId !== this.userId) {
          this.onUserJoin?.(data.userId, data);
        }
      })
      .on("broadcast", { event: "user_leave" }, ({ payload }) => {
        const data = payload as { userId: string };
        if (data.userId !== this.userId) {
          this.onUserLeave?.(data.userId);
        }
      })
      .on("broadcast", { event: "chat_message" }, ({ payload }) => {
        this.onChatMessage?.(payload as ChatMessage);
      })
      .subscribe();

    this.channel.send({
      type: "broadcast",
      event: "user_join",
      payload: { userId, color: userColor, name: userName },
    });
  }

  broadcastCursor(x: number, y: number, color: string, name: string): void {
    if (!this.channel || this.cursorThrottle) return;

    this.cursorThrottle = setTimeout(() => {
      this.cursorThrottle = null;
    }, 50);

    this.channel.send({
      type: "broadcast",
      event: "cursor_move",
      payload: { userId: this.userId, x, y, color, name },
    });
  }

  broadcastStrokeSegment(segment: Omit<StrokeSegment, "userId">): void {
    if (!this.channel) return;
    this.channel.send({
      type: "broadcast",
      event: "stroke_segment",
      payload: { ...segment, userId: this.userId },
    });
  }

  broadcastChatMessage(text: string): void {
    if (!this.channel) return;
    const msg: ChatMessage = {
      userId: this.userId,
      name: this.userName,
      color: this.userColor,
      text,
      timestamp: Date.now(),
    };
    this.channel.send({
      type: "broadcast",
      event: "chat_message",
      payload: msg,
    });
    this.onChatMessage?.(msg);
  }

  leave(): void {
    if (this.channel) {
      this.channel.send({
        type: "broadcast",
        event: "user_leave",
        payload: { userId: this.userId },
      });
      supabase().removeChannel(this.channel);
      this.channel = null;
    }
    if (this.cursorThrottle) {
      clearTimeout(this.cursorThrottle);
      this.cursorThrottle = null;
    }
  }
}
