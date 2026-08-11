"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ElovayneLogo from "./ElovayneLogo";

const WELCOME_KEY = "elovayne_welcomed";

const quickActions = [
  { label: "Talk to Elyra", icon: "✦", href: "/elyra" },
  { label: "Share your reflection", icon: "◎", href: "/soul-echo" },
  { label: "Visit the Reflection Room", icon: "◈", href: "/reflection-room" },
];

export default function WelcomeModal() {
  const [show, setShow] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hasSeen = localStorage.getItem(WELCOME_KEY);
    if (!hasSeen) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    if (dontShow) {
      localStorage.setItem(WELCOME_KEY, "true");
    }
    setShow(false);
  };

  const handleAction = (href: string) => {
    dismiss();
    router.push(href);
  };

  const [particles] = useState(() =>
    Array.from({ length: 10 }).map((_, i) => ({
      width: 1.5 + (((i * 7 + 3) % 10) / 10) * 2,
      height: 1.5 + (((i * 11 + 5) % 10) / 10) * 2,
      left: `${15 + ((i * 17 + 2) % 70)}%`,
      top: `${15 + ((i * 23 + 7) % 70)}%`,
      color: ['#0d9488', '#06b6d4', '#10b981'][i % 3],
      opacity: 0.12 + (((i * 13 + 1) % 10) / 10) * 0.2,
      duration: 4 + ((i * 9 + 4) % 10) * 0.3,
      delay: ((i * 7 + 6) % 10) * 0.3,
    }))
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center p-6"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(13, 148, 136, 0.04)' }}
            onClick={dismiss}
          >
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: p.width,
                  height: p.height,
                  left: p.left,
                  top: p.top,
                  backgroundColor: p.color,
                  opacity: p.opacity,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.08, 0.3, 0.08],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                }}
              />
            ))}
          </motion.div>

          {/* Modal */}
          <motion.div
            className="relative glass rounded-2xl p-7 sm:p-8 max-w-md w-full mx-4"
            initial={{ opacity: 0, y: 16, scale: 0.97, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, scale: 0.97, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="text-center mb-8">
              <div className="flex justify-center mb-5">
                <ElovayneLogo />
              </div>
              <h2 className="text-2xl mb-4" style={{ color: "#0f172a", fontWeight: 300, letterSpacing: "0.02em" }}>
                You are safe here
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(15, 23, 42, 0.5)", fontWeight: 300 }}>
                Welcome home. This is a quiet place where your feelings are welcome,
                your words are held gently, and you never have to face the dark alone.
                You can share, or you can simply listen. There is no rush.
              </p>
            </div>

            {/* Quick actions */}
            <div className="space-y-3 mb-8">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleAction(action.href)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left group"
                  style={{
                    background: "rgba(13, 148, 136, 0.03)",
                    border: "1px solid rgba(13, 148, 136, 0.08)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(13, 148, 136, 0.06)";
                    e.currentTarget.style.borderColor = "rgba(13, 148, 136, 0.15)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(13, 148, 136, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(13, 148, 136, 0.03)";
                    e.currentTarget.style.borderColor = "rgba(13, 148, 136, 0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span className="text-lg opacity-60">{action.icon}</span>
                  <span className="text-sm" style={{ color: "#0f172a", fontWeight: 400 }}>
                    {action.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Don't show again + dismiss */}
            <div className="flex flex-col items-center gap-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShow}
                  onChange={(e) => setDontShow(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "#0d9488" }}
                />
                <span className="text-xs" style={{ color: "rgba(13, 148, 136, 0.5)", fontWeight: 300 }}>
                  I&apos;ll remember this path
                </span>
              </label>

              <button
                onClick={dismiss}
                className="text-sm transition-colors hover:opacity-60"
                style={{ color: "rgba(13, 148, 136, 0.6)", fontWeight: 300 }}
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
