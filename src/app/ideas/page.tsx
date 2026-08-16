"use client";

import { motion } from "framer-motion";
import IdeasFeed from "@/components/ideas/IdeasFeed";

export default function IdeasPage() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{
      background: "linear-gradient(180deg, #1a1a00 0%, #2d2d00 50%, #1a1a00 100%)",
    }}>
      {/* Ambient yellow orbs */}
      <div style={{
        position: "fixed", top: "-20%", left: "-10%", width: 500, height: 500,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(234, 179, 8, 0.06) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", right: "-10%", width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(253, 224, 71, 0.05) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div className="relative z-10 pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="text-3xl mb-4"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              💡
            </motion.div>
            <h1
              className="text-2xl sm:text-3xl mb-3"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 300,
                letterSpacing: "0.02em",
              }}
            >
              Ideas Board
            </h1>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-muted, #64748b)", fontWeight: 300 }}>
              Help shape Elovayne. Share your ideas, vote on what matters, and see what gets built.
            </p>
          </motion.div>

          {/* Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <IdeasFeed />
          </motion.div>

          {/* Bottom link */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <a
              href="/"
              className="text-xs hover:opacity-50 transition-opacity"
              style={{ color: "var(--text-faint, rgba(224, 245, 232, 0.3))", textDecoration: "none", fontSize: "11px", letterSpacing: "0.05em" }}
            >
              ← Return home
            </a>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
