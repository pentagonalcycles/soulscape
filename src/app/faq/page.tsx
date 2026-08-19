"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useMemo } from "react";

const faqSections = [
  {
    title: "Getting Started",
    icon: "✦",
    color: "#00ff88",
    items: [
      {
        q: "What is Elovayne?",
        a: "Elovayne is a quiet place where people share feelings, stories, and creative work. A place to be heard without judgment, to connect through empathy, and to find comfort in knowing you are not alone.",
      },
      {
        q: "How much does it cost?",
        a: "Everything is free — Dream Canvas, Mural, Campfire, Poetry, Tarot, Camera, and more. The only paid feature is Luna AI (your personal AI companion), which has a small one-time fee of £6.99.",
      },
      {
        q: "Do I need to create an account?",
        a: "No. You can browse and use everything anonymously. No account needed.",
      },
      {
        q: "How do I start sharing?",
        a: "Write poems in Poetry, paint on the Mural, chat at the Campfire, or send a Human Signal to find someone who feels what you feel.",
      },
    ],
  },
  {
    title: "Privacy & Safety",
    icon: "◎",
    color: "#10b981",
    items: [
      {
        q: "Can anyone see what I write?",
        a: "Only if you choose to share. Your private data stays on your device only. Anonymous posts cannot be traced back to you. There is no hidden thread.",
      },
      {
        q: "Can I delete my posts?",
        a: "Yes. Any post you share can be deleted at any time. Once gone, it's gone forever — no archive, no backup, no trace.",
      },
      {
        q: "Do you sell my data?",
        a: "Never. There are no ads, no tracking, no algorithms watching. We don't sell your words or share your information with third parties.",
      },
      {
        q: "How do I report something harmful?",
        a: "Every post has a report option. Our moderation team reviews every report with care and takes action to protect the community.",
      },
      {
        q: "What content is not allowed?",
        a: "No hate speech, no cruelty, no discrimination, no spam, no self-promotion, and no revealing information about others without their consent.",
      },
    ],
  },
  {
    title: "Features",
    icon: "◇",
    color: "#00cc6a",
    items: [
      {
        q: "What is Luna AI?",
        a: "An AI companion you can chat with anytime. Not a therapist — just a kind presence when you need someone. Customize her personality and response length. Small one-time unlock fee.",
      },
      {
        q: "What is the Dream Canvas?",
        a: "A full drawing tool with 32 brush types — pen, neon, watercolor, galaxy, fire, sparkle, and more. Export your art.",
      },
      {
        q: "What is the Mural?",
        a: "A shared painting canvas where everyone creates art together in real-time. 32 brushes, live cursors, room chat. Create together.",
      },
      {
        q: "What is the Campfire?",
        a: "Anonymous group chat around a virtual fire. Choose a display name, sit by the fire, and talk with strangers. Cozy, warm, crackling sounds.",
      },
      {
        q: "What is Poetry?",
        a: "Daily prompts inspire anonymous poems. Write with a pen name, read others page by page, and react with hearts and poetic reactions.",
      },
      {
        q: "What is Nebula Orb?",
        a: "A multiplayer cosmic arena where you consume orbs, grow, and compete. Choose your skin, trail, and pet. Play on mobile or desktop.",
      },
    ],
  },
  {
    title: "Crisis Support",
    icon: "✦",
    color: "#ec4899",
    items: [
      {
        q: "Is Elovayne a replacement for therapy?",
        a: "No. Elovayne is a safe place, not professional care. If you're struggling, please reach out to a licensed professional or crisis service.",
      },
      {
        q: "What if I'm in crisis?",
        a: "Please reach out immediately: 988 Suicide & Crisis Lifeline (call/text 988 in the US), Crisis Text Line (text HOME to 741741), or find your local crisis center at findahelpline.com.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const toggle = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredSections = useMemo(() => {
    if (!search.trim()) return faqSections;
    const q = search.toLowerCase();
    return faqSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [search]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 pt-20 sm:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1
              className="text-3xl sm:text-4xl font-light tracking-wide mb-3"
              style={{
                background: "linear-gradient(135deg, #00ff88, #00cc6a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 30px rgba(0, 255, 136, 0.2), 0 0 60px rgba(57, 255, 20, 0.08)",
              }}
            >
              Frequently Asked
            </h1>
            <p className="text-sm" style={{ color: "rgba(240, 255, 245, 0.75)" }}>
              Every question answered with care
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="neon-input w-full pl-10 pr-4 py-3"
              />
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                fill="none"
                stroke="rgba(240, 255, 245, 0.6)"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" strokeWidth="1.5" />
                <path d="M21 21l-4.35-4.35" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </motion.div>

          {/* FAQ sections */}
          {filteredSections.map((section, si) => (
            <motion.div
              key={section.title}
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: si * 0.08 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="icon-glow" style={{ width: "28px", height: "28px", fontSize: "12px", borderColor: `${section.color}20`, background: `${section.color}08` }}>
                  <span style={{ color: section.color }}>{section.icon}</span>
                </div>
                <h2 className="text-sm uppercase tracking-wider" style={{ color: section.color }}>
                  {section.title}
                </h2>
              </div>

              <div className="space-y-2">
                {section.items.map((item, ii) => {
                  const key = `${si}-${ii}`;
                  const isOpen = openItems.has(key);
                  return (
                    <motion.div
                      key={key}
                      className="glass-elevated overflow-hidden"
                      style={isOpen ? { borderColor: `${section.color}20` } : {}}
                      layout
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
                        style={{ background: "none", border: "none", color: "rgba(224, 245, 232, 0.9)" }}
                      >
                        <span className="text-sm font-medium pr-4">{item.q}</span>
                        <motion.span
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-lg flex-shrink-0"
                          style={{ color: section.color }}
                        >
                          +
                        </motion.span>
                      </button>
                      <motion.div
                        initial={false}
                        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-xs leading-relaxed" style={{ color: "rgba(224, 245, 232, 0.6)" }}>
                          {item.a}
                        </p>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* No results */}
          {filteredSections.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm" style={{ color: "rgba(240, 255, 245, 0.65)" }}>
                No matching questions found
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-3 text-xs"
                style={{ color: "#00ff88", background: "none", border: "none", cursor: "pointer" }}
              >
                Clear search
              </button>
            </motion.div>
          )}

          {/* Still have questions */}
          <motion.div
            className="glass-elevated text-center mt-8 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm mb-3" style={{ color: "rgba(224, 245, 232, 0.55)" }}>
              Still have questions?
            </p>
            <Link
              href="/support"
              className="btn btn-primary btn-sm"
            >
              Contact Support
            </Link>
          </motion.div>

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link href="/" className="text-xs" style={{ color: "rgba(240, 255, 245, 0.6)", textDecoration: "none" }}>
              ← Go back
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
