"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useState } from "react";

const faqItems = [
  {
    q: "Is Elovayne really free?",
    a: "Yes. Every room, every post, every tool — completely free. No hidden fees, no premium walls. Everyone deserves a quiet place to be heard.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. You can browse anonymously. If you want to save posts, you can optionally sign in with just an email — no password needed.",
  },
  {
    q: "Can anyone see what I write?",
    a: "Only if you choose to share. Your private data stays on your device. Anonymous posts cannot be traced back to you — there is no hidden thread.",
  },
  {
    q: "Can I delete my posts?",
    a: "Yes. Any post you share can be deleted at any time. Once gone, it's gone forever — no archive, no backup, no trace.",
  },
  {
    q: "Is this a replacement for therapy?",
    a: "No. Elovayne is a safe place, not professional care. If you're struggling, please reach out to a licensed professional or crisis service.",
  },
  {
    q: "How do I report something harmful?",
    a: "Every post has a report option. Our moderation team reviews every report with care and takes action to protect the community.",
  },
];

const resources = [
  {
    icon: "🌿",
    title: "Crisis Text Line",
    desc: "Text HOME to 741741",
    link: "https://www.crisistextline.org",
    color: "#10b981",
  },
  {
    icon: "📞",
    title: "988 Suicide & Crisis Lifeline",
    desc: "Call or text 988",
    link: "https://988lifeline.org",
    color: "#3b82f6",
  },
  {
    icon: "🌍",
    title: "International Association for Suicide Prevention",
    desc: "Crisis centers worldwide",
    link: "https://www.iasp.info/resources/Crisis_Centres/",
    color: "#0d9488",
  },
  {
    icon: "💜",
    title: "Trevor Project (LGBTQ+)",
    desc: "Call 1-866-488-7386",
    link: "https://www.thetrevorproject.org",
    color: "#ec4899",
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Navigation activePage="support" />

      <div className="relative z-10 pt-20 sm:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🌿
            </motion.div>
            <h1
              className="text-3xl sm:text-4xl font-light tracking-wide mb-3"
              style={{
                background: "linear-gradient(135deg, #0d9488, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              We&apos;re Here For You
            </h1>
            <p className="text-sm" style={{ color: "rgba(15, 23, 42, 0.5)" }}>
              No question is too small. No concern is too quiet. You are not alone.
            </p>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            className="grid grid-cols-2 gap-3 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/faq"
              className="p-5 rounded-2xl text-center transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(13, 148, 136, 0.04)",
                border: "1px solid rgba(13, 148, 136, 0.1)",
                textDecoration: "none",
              }}
            >
              <div className="text-2xl mb-2">📖</div>
              <div className="text-sm font-medium" style={{ color: "rgba(15, 23, 42, 0.9)" }}>FAQ</div>
              <div className="text-[10px]" style={{ color: "rgba(15, 23, 42, 0.4)" }}>Common questions</div>
            </Link>
            <a
              href="https://discord.gg/elovayne"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl text-center transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(13, 148, 136, 0.04)",
                border: "1px solid rgba(13, 148, 136, 0.1)",
                textDecoration: "none",
              }}
            >
              <div className="text-2xl mb-2">💬</div>
              <div className="text-sm font-medium" style={{ color: "rgba(15, 23, 42, 0.9)" }}>Discord</div>
              <div className="text-[10px]" style={{ color: "rgba(15, 23, 42, 0.4)" }}>Join our community</div>
            </a>
            <a
              href="mailto:support@elovayne.com"
              className="p-5 rounded-2xl text-center transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(13, 148, 136, 0.04)",
                border: "1px solid rgba(13, 148, 136, 0.1)",
                textDecoration: "none",
              }}
            >
              <div className="text-2xl mb-2">📧</div>
              <div className="text-sm font-medium" style={{ color: "rgba(15, 23, 42, 0.9)" }}>Email</div>
              <div className="text-[10px]" style={{ color: "rgba(15, 23, 42, 0.4)" }}>support@elovayne.com</div>
            </a>
            <Link
              href="/about"
              className="p-5 rounded-2xl text-center transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(13, 148, 136, 0.04)",
                border: "1px solid rgba(13, 148, 136, 0.1)",
                textDecoration: "none",
              }}
            >
              <div className="text-2xl mb-2">✨</div>
              <div className="text-sm font-medium" style={{ color: "rgba(15, 23, 42, 0.9)" }}>About</div>
              <div className="text-[10px]" style={{ color: "rgba(15, 23, 42, 0.4)" }}>Our story</div>
            </Link>
          </motion.div>

          {/* FAQ accordion */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-lg font-light mb-4" style={{ color: "rgba(15, 23, 42, 0.9)" }}>
              Frequently Asked
            </h2>
            <div className="space-y-2">
              {faqItems.map((item, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: openFaq === i ? "rgba(13, 148, 136, 0.06)" : "rgba(13, 148, 136, 0.03)",
                    border: `1px solid ${openFaq === i ? "rgba(13, 148, 136, 0.15)" : "rgba(13, 148, 136, 0.08)"}`,
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
                    style={{ background: "none", border: "none", color: "rgba(15, 23, 42, 0.9)" }}
                  >
                    <span className="text-sm font-medium pr-4">{item.q}</span>
                    <motion.span
                      animate={{ rotate: openFaq === i ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-lg flex-shrink-0"
                      style={{ color: "#0d9488" }}
                    >
                      +
                    </motion.span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaq === i ? "auto" : 0,
                      opacity: openFaq === i ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-xs leading-relaxed" style={{ color: "rgba(15, 23, 42, 0.6)" }}>
                      {item.a}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Crisis Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-lg font-light mb-4" style={{ color: "rgba(15, 23, 42, 0.9)" }}>
              Crisis Resources
            </h2>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: "rgba(15, 23, 42, 0.5)" }}>
              If you or someone you know is in crisis, please reach out. You are not alone.
            </p>
            <div className="space-y-3">
              {resources.map((r, i) => (
                <motion.a
                  key={i}
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                  style={{
                    background: "rgba(13, 148, 136, 0.03)",
                    border: `1px solid ${r.color}20`,
                    textDecoration: "none",
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <div className="text-sm font-medium" style={{ color: r.color }}>{r.title}</div>
                    <div className="text-[11px]" style={{ color: "rgba(15, 23, 42, 0.5)" }}>{r.desc}</div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Back link */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link
              href="/"
              className="text-xs"
              style={{ color: "rgba(15, 23, 42, 0.3)", textDecoration: "none" }}
            >
              ← Go back
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
