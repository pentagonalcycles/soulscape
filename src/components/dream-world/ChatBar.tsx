"use client";

import { useState, useRef, useEffect } from "react";

interface ChatBarProps {
  onSendMessage: (msg: string) => void;
  messages: { sender: string; text: string; time: string }[];
  onClose: () => void;
}

export default function ChatBar({ onSendMessage, messages, onClose }: ChatBarProps) {
  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div className="dw-chat" onKeyDown={handleKeyDown}>
      <div className="dw-chat-header">
        <span className="dw-chat-title">◈ Dream Chat</span>
        <button onClick={onClose} className="dw-chat-close">✕</button>
      </div>

      <div className="dw-chat-messages" ref={messagesRef}>
        {messages.length === 0 ? (
          <div className="dw-chat-empty">
            <span className="dw-chat-empty-icon">◇</span>
            <span>No messages yet. Say hello to the cosmos.</span>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="dw-chat-msg">
              <span className="dw-chat-sender">{msg.sender}</span>
              <span className="dw-chat-text">{msg.text}</span>
              <span className="dw-chat-time">{msg.time}</span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="dw-chat-form">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="dw-chat-input"
          maxLength={200}
        />
        <button type="submit" className="dw-chat-send" disabled={!input.trim()}>
          →
        </button>
      </form>
    </div>
  );
}
