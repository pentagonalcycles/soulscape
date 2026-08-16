"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const sections = [
  {
    icon: "✦",
    title: "What is Elovayne?",
    content: `Elovayne is a home for people who need a quiet place. A place where you can share what is in your heart — a story, a feeling, something you have been carrying alone — and know that someone understands. You do not need to be brave here. You just need to be yourself.`,
    color: "#00ff88",
  },
  {
    icon: "◎",
    title: "Why does this exist?",
    content: `The internet can be a loud place. Elovayne is the opposite — a quiet corner with no followers, no likes, no algorithms. Just people being real with each other, sharing what matters, and finding comfort in knowing they are not alone.`,
    color: "#00cc6a",
  },
  {
    icon: "◇",
    title: "Your privacy is sacred",
    items: [
      "You can speak completely anonymously — no name, no email, no trace required.",
      "Anonymous posts cannot be traced back to you.",
      "You can delete any of your posts at any time, permanently.",
      "Your private data stays on your device only.",
      "No ads, no tracking, no algorithms watching.",
    ],
    color: "#3b82f6",
  },
  {
    icon: "◈",
    title: "How we take care of each other",
    items: [
      "Be kind. Everyone here is navigating something tender.",
      "No cruelty, no hate speech, no discrimination.",
      "No unsolicited advice unless someone asks.",
      "No revealing information about others without consent.",
      "No spam, self-promotion, or commercial content.",
      "Respect boundaries. If someone asks for space, give it.",
    ],
    color: "#eab308",
  },
  {
    icon: "✧",
    title: "This is not therapy",
    content: `Elovayne is a safe place, but it is not a substitute for professional care. If you are struggling, please reach out to someone who can help. You deserve real support.`,
    items: [
      "You can report any post that feels harmful.",
      "Reports are reviewed with care and action is taken.",
      "If you are in immediate danger, contact local emergency services.",
    ],
    color: "#ec4899",
  },
  {
    icon: "△",
    title: "What you can do here",
    items: [
      "Talk to Elyra, an AI companion who listens without judgment.",
      "Explore Arcana — a full 78-card Tarot deck for reflection and insight.",
      "Share your feelings through Soul Echo and connect with someone who understands.",
      "Reflect in the Reflection Room with daily prompts.",
      "Create art in the Dream Canvas with 32 brush types.",
      "Paint together in the Collaborative Mural in real-time.",
      "Release glowing Wish Lanterns into the night sky.",
      "Sit around a Campfire and chat anonymously.",
      "Write poems inspired by daily prompts in Poetry.",
      "Map your inner world with Soul Map — a private mandala.",
      "Play Nebula Orb, a multiplayer cosmic arena game.",
      "Use Cosmic Camera with 36 filters and creative effects.",
      "Share music and art with the Community Share.",
      "Send a Human Signal to find someone who feels what you feel.",
    ],
    color: "#39ff14",
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-14"
            style={{ textShadow: "0 0 30px rgba(0, 255, 136, 0.2), 0 0 60px rgba(57, 255, 20, 0.08)" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              className="text-3xl mb-5 opacity-60"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              ✦
            </motion.div>
            <h1
              className="text-3xl sm:text-4xl mb-4"
              style={{
                background: "linear-gradient(135deg, #00ff88, #00cc6a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 300,
                letterSpacing: "0.02em",
              }}
            >
              About Elovayne
            </h1>
            <p className="text-sm" style={{ color: "rgba(240, 255, 245, 0.65)", fontWeight: 300 }}>
              A letter to anyone who needs a quiet place to land
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                className="glass-elevated p-6 sm:p-7"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-glow" style={{ borderColor: `${section.color}20`, background: `${section.color}08` }}>
                    <span style={{ color: section.color }}>{section.icon}</span>
                  </div>
                  <h2 className="text-base" style={{ color: section.color, fontWeight: 400, letterSpacing: "0.01em" }}>
                    {section.title}
                  </h2>
                </div>

                {section.content && (
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(240, 255, 245, 0.75)", fontWeight: 300 }}>
                    {section.content}
                  </p>
                )}

                {section.items && (
                  <ul className="space-y-2.5">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0" style={{ background: section.color, opacity: 0.4 }} />
                        <span className="text-xs leading-relaxed" style={{ color: "rgba(240, 255, 245, 0.75)", fontWeight: 300 }}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}

            {/* Divider */}
            <div className="section-divider my-8" />

            {/* Crisis support */}
            <motion.div
              className="glass-elevated p-6 sm:p-7"
              style={{ borderColor: "rgba(236, 72, 153, 0.1)", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(236, 72, 153, 0.02), inset 0 1px 0 rgba(236, 72, 153, 0.06)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-glow" style={{ borderColor: "rgba(236, 72, 153, 0.2)", background: "rgba(236, 72, 153, 0.08)" }}>
                  <span style={{ color: "#ec4899" }}>✦</span>
                </div>
                <h2 className="text-base" style={{ color: "#ec4899", fontWeight: 400 }}>
                  If you are in crisis
                </h2>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(240, 255, 245, 0.75)", fontWeight: 300 }}>
                You are not alone. Please reach out. There are people who want to help.
              </p>
              <div className="space-y-2 text-xs">
                <p style={{ color: "var(--text-dim)" }}>
                  <span style={{ color: "#3b82f6", fontWeight: 400 }}>International:</span>{" "}
                  <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ color: "#00ff88", textDecoration: "none", borderBottom: "1px solid rgba(0, 255, 136, 0.2)" }}>
                    findahelpline.com
                  </a>
                </p>
                <p style={{ color: "var(--text-dim)" }}>
                  <span style={{ color: "#3b82f6", fontWeight: 400 }}>US:</span>{" "}
                  <span style={{ color: "rgba(240, 255, 245, 0.75)" }}>988 Lifeline — call or text 988</span>
                </p>
                <p style={{ color: "var(--text-dim)" }}>
                  <span style={{ color: "#3b82f6", fontWeight: 400 }}>UK:</span>{" "}
                  <span style={{ color: "rgba(240, 255, 245, 0.75)" }}>Samaritans — call 116 123</span>
                </p>
              </div>
            </motion.div>

            {/* Free */}
            <motion.div
              className="glass-elevated p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm" style={{ color: "rgba(240, 255, 245, 0.75)", fontWeight: 300 }}>
                Elovayne is <strong style={{ color: "#10b981", fontWeight: 500 }}>free for everyone</strong>. Always.
                No premium walls. No hidden fees. No ads.
              </p>
            </motion.div>
          </div>

          {/* Back */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Link href="/" className="text-xs hover:opacity-50 transition-opacity" style={{ color: "var(--text-faint)", textDecoration: "none", fontSize: "11px", letterSpacing: "0.05em" }}>
              ← Return home
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
