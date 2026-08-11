"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/mural/multiplayer";

interface MuralChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function MuralChat({ messages, onSend, isOpen, onToggle }: MuralChatProps) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-40 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: isOpen ? "rgba(239, 68, 68, 0.1)" : "rgba(13, 148, 136, 0.1)",
          border: `1px solid ${isOpen ? "rgba(239, 68, 68, 0.2)" : "rgba(13, 148, 136, 0.2)"}`,
          color: isOpen ? "#ef4444" : "#0d9488",
          fontSize: "16px",
        }}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-16 right-4 z-40 flex flex-col rounded-xl overflow-hidden"
          style={{
            width: "320px",
            height: "400px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(13, 148, 136, 0.12)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
          }}
        >
          <div
            className="px-4 py-2.5 text-xs font-medium"
            style={{
              borderBottom: "1px solid rgba(13, 148, 136, 0.08)",
              color: "rgba(15, 23, 42, 0.5)",
            }}
          >
            Room Chat
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: "rgba(15, 23, 42, 0.2)" }}>
                No messages yet. Say hi!
              </p>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[8px] font-bold mt-0.5"
                    style={{ background: msg.color }}
                  >
                    {msg.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium" style={{ color: msg.color }}>
                      {msg.name}
                    </span>
                    <p className="text-xs break-words" style={{ color: "rgba(15, 23, 42, 0.7)" }}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            className="flex gap-2 p-3"
            style={{ borderTop: "1px solid rgba(13, 148, 136, 0.08)" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              maxLength={200}
              className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
              style={{
                background: "rgba(13, 148, 136, 0.06)",
                border: "1px solid rgba(13, 148, 136, 0.1)",
                color: "#0f172a",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="px-3 py-1.5 rounded-lg text-xs text-white cursor-pointer disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #0d9488, #06b6d4)" }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
