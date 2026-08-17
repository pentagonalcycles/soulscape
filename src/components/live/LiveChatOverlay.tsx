"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatRow,
  LiveChatMessage,
  ActionSheetAction,
} from "@/components/live/types";

interface LiveChatOverlayProps {
  rows: ChatRow[];
  pinnedMessage: LiveChatMessage | null;
  currentUserId: string | null;
  canModerate: boolean;
  onAction: (action: ActionSheetAction, target: LiveChatMessage) => void;
}

function Avatar({ name, url, size = 24 }: { name?: string; url?: string | null; size?: number }) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0, background: "rgba(0,255,136,0.1)" }}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(0, 255, 136, 0.18)",
        color: "#00ff88",
        fontSize: size * 0.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

export default function LiveChatOverlay({
  rows,
  pinnedMessage,
  currentUserId,
  canModerate,
  onAction,
}: LiveChatOverlayProps) {
  const [menuFor, setMenuFor] = useState<LiveChatMessage | null>(null);

  const openMenu = (msg: LiveChatMessage) => {
    setMenuFor(msg);
  };

  const isPinned = (m: LiveChatMessage) => pinnedMessage?.id === m.id;
  const isMine = (m: LiveChatMessage) => m.user_id === currentUserId;

  const showOnScreenMenu = !!menuFor;

  const menuActions: Array<{ type: ActionSheetAction["type"]; label: string }> = [
    { type: "reply", label: "Reply" },
  ];
  if (canModerate) {
    menuActions.push(
      menuFor && isPinned(menuFor)
        ? { type: "unpin", label: "Unpin comment" }
        : { type: "pin", label: "Pin comment" }
    );
    menuActions.push(
      { type: "remove", label: "Remove comment" },
      { type: "mute", label: "Mute for 15 min" },
      { type: "block", label: "Block user" }
    );
  }
  if (menuFor && !isMine(menuFor)) {
    menuActions.push({ type: "report", label: "Report comment" });
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 12,
        bottom: 96,
        width: "min(320px, 74vw)",
        maxHeight: "44vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        pointerEvents: "none",
        zIndex: 6,
      }}
    >
      {pinnedMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 12,
            marginBottom: 8,
            background: "rgba(255, 196, 0, 0.12)",
            border: "1px solid rgba(255, 196, 0, 0.35)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <span style={{ fontSize: 12 }}>📌</span>
          <div style={{ minWidth: 0, pointerEvents: "auto", cursor: "pointer" }} onClick={() => setMenuFor(pinnedMessage)}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255, 216, 120, 0.95)" }}>
              {pinnedMessage.display_name || "Pinned"}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255, 240, 200, 0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {pinnedMessage.message}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column-reverse", justifyContent: "flex-start", overflow: "hidden" }}>
        {rows.map((row) =>
          row.kind === "notice" ? (
            <div
              key={row.id}
              style={{
                fontSize: 10,
                color: "rgba(224, 245, 232, 0.45)",
                padding: "4px 10px",
                animation: "liveMsgIn 0.3s ease",
              }}
            >
              {row.text}
            </div>
          ) : (
            <div
              key={row.msg.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                padding: "4px 10px",
                pointerEvents: "auto",
                animation: "liveMsgIn 0.25s ease",
              }}
              onClick={() => openMenu(row.msg)}
            >
              <Avatar name={row.msg.display_name} url={row.msg.avatar_url} />
              <div style={{ minWidth: 0, flex: 1 }}>
                {row.msg.reply_to_text && (
                  <div style={{ fontSize: 10, color: "rgba(224, 245, 232, 0.45)", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    ↳ replying to {row.msg.reply_to_user_id === currentUserId ? "you" : (row.msg.reply_to_user_id ? "a message" : "")}
                  </div>
                )}
                <div
                  style={{
                    display: "inline-block",
                    padding: "7px 11px",
                    borderRadius: 14,
                    background: "rgba(13, 27, 20, 0.72)",
                    border: "1px solid rgba(0, 255, 136, 0.1)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    maxWidth: "100%",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#00ff88", marginRight: 6 }}>
                    {row.msg.display_name || "Anonymous"}
                  </span>
                  <span style={{ fontSize: 12, color: "#e0f5e8", wordBreak: "break-word" }}>
                    {row.msg.deleted ? <em style={{ opacity: 0.5 }}>message removed</em> : row.msg.message}
                  </span>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Action sheet (message menu) */}
      <AnimatePresence>
        {showOnScreenMenu && menuFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 90,
            }}
            onClick={() => setMenuFor(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showOnScreenMenu && menuFor && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 91,
              background: "rgba(18, 34, 25, 0.98)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(0, 255, 136, 0.15)",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: "20px 20px calc(20px + env(safe-area-inset-bottom))",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ textAlign: "center", fontSize: 12, color: "rgba(224,245,232,0.5)", marginBottom: 6 }}>
              {(menuFor.display_name || "Anonymous")}
              {isPinned(menuFor) ? " · pinned" : ""}
            </div>
            {menuActions.map((a) => (
              <button
                key={a.label}
                onClick={() => {
                  onAction({ type: a.type }, menuFor);
                  setMenuFor(null);
                }}
                style={{
                  padding: "13px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(0, 255, 136, 0.1)",
                  background: a.type === "report" || a.type === "block" ? "rgba(239, 68, 68, 0.12)" : "rgba(0, 255, 136, 0.05)",
                  color: a.type === "report" || a.type === "block" ? "#fca5a5" : "#e0f5e8",
                  fontSize: 13,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                {a.label}
              </button>
            ))}
            <button
              onClick={() => setMenuFor(null)}
              style={{ padding: "13px 16px", borderRadius: 12, border: "none", background: "rgba(255,255,255,0.05)", color: "rgba(224,245,232,0.6)", fontSize: 13, cursor: "pointer" }}
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}