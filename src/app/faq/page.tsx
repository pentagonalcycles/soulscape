"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useState } from "react";

const faqSections = [
  {
    title: "Getting Started",
    icon: "✦",
    color: "#0d9488",
    items: [
      {
        q: "What is Elovayne?",
        a: "Elovayne is a quiet place where people share feelings, stories, and creative work. A place to be heard without judgment, to connect through empathy, and to find comfort in knowing you are not alone.",
      },
      {
        q: "Is it really free?",
        a: "Yes. Every room, every post, every tool — completely free. No hidden fees, no premium walls.",
      },
      {
        q: "Do I need to create an account?",
        a: "No. You can browse anonymously. If you want to save posts, you can optionally sign in with just an email — no password needed.",
      },
      {
        q: "How do I start sharing?",
        a: "Head to Stargazing and leave a message in the stars, or use Soul Echo to connect with someone. You can also write poems in Poetry, paint on the Mural, or chat at the Campfire.",
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
    color: "#06b6d4",
    items: [
      {
        q: "What is Elyra AI?",
        a: "An AI companion you can chat with anytime. Not a therapist — just a kind presence when you need someone. Customize her personality and response length. Free, no limits.",
      },
      {
        q: "What is Soul Echo?",
        a: "Connects you with another person based on shared emotional reflections. Write what you're feeling, and the system finds someone who understands. Anonymous conversations.",
      },
      {
        q: "What is the Ambient Room?",
        a: "Calming procedural sounds — rain, ocean, wind, singing bowls, fire, birdsong, and more. Includes a timer and 12 different sound scenes.",
      },
      {
        q: "What is Stargazing?",
        a: "A peaceful night sky where every star holds an anonymous message. Click stars to read, leave your own for others. 3 messages per day.",
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
        q: "What are Wish Lanterns?",
        a: "Write a wish and release a glowing lantern into the night sky. Watch it float with everyone else's hopes. Click lanterns to read their wishes.",
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
        q: "What is Soul Map?",
        a: "Answer deep questions about yourself. Each answer adds a ring to your mandala. Watch your inner world grow. Fully private, stored on your device.",
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

  const toggle = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Navigation activePage="faq" />

      <div className="relative z-10 pt-20 sm:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1
              className="text-3xl sm:text-4xl font-light tracking-wide mb-3"
              style={{
                background: "linear-gradient(135deg, #0d9488, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Frequently Asked
            </h1>
            <p className="text-sm" style={{ color: "rgba(15, 23, 42, 0.5)" }}>
              Every question answered with care
            </p>
          </motion.div>

          {/* FAQ sections */}
          {faqSections.map((section, si) => (
            <motion.div
              key={section.title}
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: si * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: section.color }}>{section.icon}</span>
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
                      className="rounded-xl overflow-hidden"
                      style={{
                        background: isOpen ? `${section.color}08` : "rgba(13, 148, 136, 0.03)",
                        border: `1px solid ${isOpen ? `${section.color}20` : "rgba(13, 148, 136, 0.08)"}`,
                      }}
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
                        style={{ background: "none", border: "none", color: "rgba(15, 23, 42, 0.9)" }}
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
                        <p className="px-4 pb-4 text-xs leading-relaxed" style={{ color: "rgba(15, 23, 42, 0.6)" }}>
                          {item.a}
                        </p>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Still have questions */}
          <motion.div
            className="text-center mt-8 p-6 rounded-2xl"
            style={{
              background: "rgba(13, 148, 136, 0.04)",
              border: "1px solid rgba(13, 148, 136, 0.1)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm mb-3" style={{ color: "rgba(15, 23, 42, 0.55)" }}>
              Still have questions?
            </p>
            <Link
              href="/support"
              className="px-5 py-2 rounded-lg text-xs"
              style={{
                background: "rgba(13, 148, 136, 0.08)",
                border: "1px solid rgba(13, 148, 136, 0.15)",
                color: "#0d9488",
                textDecoration: "none",
              }}
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
            <Link href="/" className="text-xs" style={{ color: "rgba(15, 23, 42, 0.3)", textDecoration: "none" }}>
              ← Go back
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
