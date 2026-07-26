"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const WELCOME_KEY = "elovayne_welcomed";

const quickActions = [
  { label: "Share something", icon: "✍️", href: "/sanctuary" },
  { label: "Explore rooms", icon: "🌌", href: "/rooms" },
  { label: "Read stories", icon: "📖", href: "/sanctuary" },
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
            className="absolute inset-0 bg-elovayne-void/90 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            className="relative glass rounded-2xl p-8 max-w-md w-full"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl text-elovayne-light glow-text-strong mb-3">
                Welcome to Elovayne
              </h2>
              <p className="text-elovayne-muted font-body text-sm leading-relaxed">
                You can share anonymously, explore a room, or simply look around.
                There&apos;s no pressure here — take your time.
              </p>
            </div>

            {/* Quick actions */}
            <div className="space-y-3 mb-8">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleAction(action.href)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-elovayne-deep/50 border border-elovayne-violet/20 hover:border-elovayne-violet/40 hover:bg-elovayne-midnight/30 transition-all text-left group"
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-elovayne-light font-body text-sm group-hover:text-elovayne-light/90 transition-colors">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Don't show again + dismiss */}
            <div className="flex flex-col items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShow}
                  onChange={(e) => setDontShow(e.target.checked)}
                  className="w-4 h-4 rounded border-elovayne-violet/30 bg-elovayne-deep/50 text-elovayne-violet focus:ring-elovayne-violet/50 focus:ring-offset-0"
                />
                <span className="text-elovayne-dim font-body text-xs">
                  Don&apos;t show this again
                </span>
              </label>

              <button
                onClick={dismiss}
                className="text-elovayne-dim hover:text-elovayne-muted font-body text-sm transition-colors"
              >
                Continue anonymously
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
