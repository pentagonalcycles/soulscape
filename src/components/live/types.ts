export interface LiveStream {
  id: string;
  user_id: string;
  title: string;
  status: string;
  viewer_count: number;
  started_at: string;
  filter?: string;
  slow_mode?: boolean;
  slow_mode_delay?: number;
  pinned_message_id?: string | null;
  broadcaster_name?: string;
  broadcaster_avatar?: string | null;
}

export interface LiveChatMessage {
  id: string;
  stream_id?: string;
  user_id: string;
  message: string;
  created_at: string;
  display_name?: string;
  avatar_url?: string | null;
  reply_to_id?: string | null;
  reply_to_user_id?: string | null;
  reply_to_text?: string | null;
  deleted?: boolean;
}

export interface JoinNotice {
  kind: "notice";
  id: string;
  text: string;
}

export type ChatRow = { kind: "msg"; msg: LiveChatMessage } | JoinNotice;

export interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

export type LiveView = "home" | "start" | "broadcasting" | "watching";

export type LiveConnection =
  | "connecting"
  | "live"
  | "reconnecting"
  | "weak"
  | "disconnected"
  | "ended"
  | "off";

export type ActionSheetAction =
  | { type: "reply" }
  | { type: "pin" }
  | { type: "unpin" }
  | { type: "remove" }
  | { type: "mute" }
  | { type: "block" }
  | { type: "report" };