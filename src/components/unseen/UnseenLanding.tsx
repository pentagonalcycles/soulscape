"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UnseenLandingProps {
  onEnter: () => void;
}

export default function UnseenLanding({ onEnter }: UnseenLandingProps) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const stages = [
    { number: "1", title: "Discover their mind", desc: "Read their personality, values, and answers before anything else." },
    { number: "2", title: "Hear their voice", desc: "Listen to a voice introduction if they choose to share one." },
    { number: "3", title: "Reveal each other", desc: "If curiosity is mutual, photographs gradually come into focus." },
    { number: "4", title: "Open the door", desc: "Answer a shared question together, then begin a real conversation." },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        className="text-center max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Logo */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl mb-4"
          style={{
            fontWeight: 200,
            letterSpacing: "0.15em",
            background: "linear-gradient(135deg, #8b5cf6, #ec4899, #6366f1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          UNSEEN
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg mb-12"
          style={{ color: "rgba(224, 231, 255, 0.6)", fontWeight: 300, fontStyle: "italic" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Meet the person before the picture.
        </motion.p>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-12 w-full max-w-sm mx-auto"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={onEnter}
            className="flex-1 py-4 px-8 rounded-2xl text-sm tracking-widest uppercase transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.15))",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              color: "rgba(224, 231, 255, 0.9)",
              letterSpacing: "0.15em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 30px rgba(139, 92, 246, 0.2)";
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.2))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.15))";
            }}
          >
            Enter UNSEEN
          </button>

          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="flex-1 py-4 px-8 rounded-2xl text-sm tracking-widest uppercase transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "rgba(224, 231, 255, 0.6)",
              letterSpacing: "0.15em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
              e.currentTarget.style.color = "rgba(224, 231, 255, 0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              e.currentTarget.style.color = "rgba(224, 231, 255, 0.6)";
            }}
          >
            How It Works
          </button>
        </motion.div>

        {/* How It Works */}
        <AnimatePresence>
          {showHowItWorks && (
            <motion.div
              className="text-left max-w-md mx-auto"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="space-y-6 pb-4">
                {stages.map((stage, i) => (
                  <motion.div
                    key={stage.number}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                      style={{
                        background: "rgba(139, 92, 246, 0.15)",
                        color: "rgba(139, 92, 246, 0.8)",
                        border: "1px solid rgba(139, 92, 246, 0.2)",
                      }}
                    >
                      {stage.number}
                    </div>
                    <div>
                      <h3
                        className="text-sm mb-1"
                        style={{ color: "rgba(224, 231, 255, 0.9)", fontWeight: 400 }}
                      >
                        {stage.title}
                      </h3>
                      <p className="text-xs" style={{ color: "rgba(148, 163, 184, 0.5)" }}>
                        {stage.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tagline */}
        <motion.p
          className="text-[10px] mt-8 tracking-wider uppercase"
          style={{ color: "rgba(148, 163, 184, 0.25)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          No endless swiping · No judging from one photograph
        </motion.p>
      </motion.div>
    </div>
  );
}
