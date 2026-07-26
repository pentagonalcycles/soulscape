"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type IdentityType = "anonymous" | "alias" | "real";
type ContentType = "text" | "poem" | "story" | "art" | "voice";

const roomOptions = [
  { slug: "sanctuary", label: "Sanctuary", icon: "🌌" },
  { slug: "healing", label: "Healing", icon: "💚" },
  { slug: "hope", label: "Hope", icon: "✨" },
  { slug: "loneliness", label: "Loneliness", icon: "🌙" },
  { slug: "grief", label: "Grief", icon: "🩶" },
  { slug: "creativity", label: "Creativity", icon: "🎨" },
  { slug: "love", label: "Love", icon: "💗" },
  { slug: "anxiety", label: "Anxiety", icon: "🌊" },
  { slug: "new-beginnings", label: "New Beginnings", icon: "🌅" },
  { slug: "self-discovery", label: "Self-Discovery", icon: "🔮" },
  { slug: "small-wins", label: "Small Wins", icon: "🎉" },
  { slug: "dreams", label: "Dreams", icon: "🌙" },
  { slug: "gratitude", label: "Gratitude", icon: "🙏" },
  { slug: "art-poetry", label: "Art & Poetry", icon: "🎭" },
  { slug: "breathe", label: "Breathe", icon: "🫧" },
];

interface PostCreatorProps {
  roomId?: string;
  onSubmit?: (post: {
    content: string;
    contentType: ContentType;
    identityType: IdentityType;
    displayName?: string;
    isAnonymous: boolean;
    roomId?: string;
  }) => void;
}

const contentTypes = [
  { value: "text" as ContentType, label: "Thought", icon: "💭" },
  { value: "poem" as ContentType, label: "Poem", icon: "📜" },
  { value: "story" as ContentType, label: "Story", icon: "📖" },
  { value: "art" as ContentType, label: "Art", icon: "🎨" },
  { value: "voice" as ContentType, label: "Voice", icon: "🎙️", disabled: true },
];

const identityOptions = [
  { value: "anonymous" as IdentityType, label: "Anonymous", description: "No name, just your words" },
  { value: "alias" as IdentityType, label: "Creative Alias", description: "Choose a unique name" },
  { value: "real" as IdentityType, label: "Real Identity", description: "Show your true self" },
];

export default function PostCreator({ roomId: defaultRoomId, onSubmit }: PostCreatorProps) {
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<ContentType>("text");
  const [identityType, setIdentityType] = useState<IdentityType>("anonymous");
  const [alias, setAlias] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(defaultRoomId || "sanctuary");

  const handleSubmit = () => {
    if (!content.trim()) return;

    onSubmit?.({
      content: content.trim(),
      contentType,
      identityType,
      displayName: identityType === "alias" ? alias : undefined,
      isAnonymous: identityType === "anonymous",
      roomId: selectedRoom,
    });

    setContent("");
    setAlias("");
    setIsExpanded(false);
  };

  const placeholders = {
    text: "What's on your mind?",
    poem: "Let your words flow like stardust...",
    story: "Share your story with the universe...",
    art: "Describe your artwork or share a link...",
    voice: "Voice recordings coming soon...",
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="trigger"
            className="w-full glass rounded-2xl p-6 text-left cursor-pointer hover:scale-[1.01] transition-all duration-300"
            style={{
              boxShadow: "0 0 30px rgba(157, 124, 216, 0.1)",
            }}
            onClick={() => setIsExpanded(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{
              boxShadow: "0 0 40px rgba(157, 124, 216, 0.2)",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-elovayne-nebula/20 flex items-center justify-center">
                <span className="text-elovayne-violet">✦</span>
              </div>
              <span className="text-elovayne-muted font-body">
                Share something with the sanctuary...
              </span>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="creator"
            className="glass rounded-2xl p-6"
            style={{
              boxShadow: "0 0 40px rgba(157, 124, 216, 0.15)",
            }}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg text-elovayne-light glow-text">
                Share with the Sanctuary
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-elovayne-dim hover:text-elovayne-light transition-colors text-sm"
              >
                Close
              </button>
            </div>

            {/* Content type selector */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => !type.disabled && setContentType(type.value)}
                  disabled={type.disabled}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    type.disabled
                      ? "opacity-40 cursor-not-allowed bg-elovayne-deep/30 text-elovayne-dim"
                      : contentType === type.value
                        ? "bg-elovayne-nebula/30 text-elovayne-light border border-elovayne-violet/30"
                        : "bg-elovayne-deep/50 text-elovayne-muted hover:text-elovayne-light border border-transparent"
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                  {type.disabled && <span className="text-xs">(coming soon)</span>}
                </button>
              ))}
            </div>

            {/* Room selector */}
            <div className="mb-4">
              <p className="text-xs text-elovayne-dim mb-2">Post to room:</p>
              <div className="flex gap-2 flex-wrap">
                {roomOptions.map((room) => (
                  <button
                    key={room.slug}
                    onClick={() => setSelectedRoom(room.slug)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${
                      selectedRoom === room.slug
                        ? "bg-elovayne-nebula/30 text-elovayne-light border border-elovayne-violet/30"
                        : "bg-elovayne-deep/50 text-elovayne-dim hover:text-elovayne-muted border border-transparent"
                    }`}
                  >
                    <span>{room.icon}</span>
                    <span>{room.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholders[contentType]}
              className={`w-full bg-transparent border border-elovayne-nebula/20 rounded-xl p-4 text-elovayne-light placeholder-elovayne-dim resize-none focus:outline-none focus:border-elovayne-violet/40 transition-colors font-body ${
                contentType === "poem" ? "font-accent text-lg" : "text-base"
              }`}
              rows={contentType === "story" ? 8 : 4}
              autoFocus
            />

            {/* Identity selector */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm text-elovayne-muted">Your identity is always protected. Choose how you&apos;d like to appear.</p>
                <a
                  href="/about"
                  target="_blank"
                  className="text-xs text-elovayne-violet hover:text-elovayne-light transition-colors whitespace-nowrap"
                >
                  Learn more →
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                {identityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setIdentityType(option.value)}
                    className={`flex flex-col items-start px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                      identityType === option.value
                        ? "bg-elovayne-nebula/20 border border-elovayne-violet/30"
                        : "bg-elovayne-deep/30 border border-transparent hover:border-elovayne-nebula/20"
                    }`}
                  >
                    <span
                      className={
                        identityType === option.value
                          ? "text-elovayne-light"
                          : "text-elovayne-muted"
                      }
                    >
                      {option.label}
                    </span>
                    <span className="text-xs text-elovayne-dim mt-1">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>

              {/* Alias input */}
              <AnimatePresence>
                {identityType === "alias" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <input
                      type="text"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      placeholder="Choose your creative alias..."
                      className="w-full mt-3 bg-elovayne-deep/50 border border-elovayne-nebula/20 rounded-xl px-4 py-3 text-elovayne-light placeholder-elovayne-dim focus:outline-none focus:border-elovayne-violet/40 transition-colors font-body"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit button */}
            <div className="mt-6 flex justify-end">
              <motion.button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="px-6 py-3 rounded-full font-body text-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: content.trim()
                    ? "linear-gradient(135deg, rgba(107, 63, 160, 0.8), rgba(157, 124, 216, 0.8))"
                    : "rgba(107, 63, 160, 0.3)",
                  boxShadow: content.trim()
                    ? "0 0 20px rgba(157, 124, 216, 0.3)"
                    : "none",
                }}
                whileHover={content.trim() ? { scale: 1.02 } : {}}
                whileTap={content.trim() ? { scale: 0.98 } : {}}
              >
                <span className="text-elovayne-light">Release into the void</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
