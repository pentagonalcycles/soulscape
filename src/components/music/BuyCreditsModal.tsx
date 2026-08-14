"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PACKAGES = [
  { id: "credits_100", credits: 100, price: "$10", label: "10 Songs", perSong: "$1.00" },
  { id: "credits_500", credits: 500, price: "$40", label: "50 Songs", perSong: "$0.80" },
];

export default function BuyCreditsModal({ isOpen, onClose }: BuyCreditsModalProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (packageId: string) => {
    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase().auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-md rounded-2xl p-6"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              background: "rgba(5, 10, 6, 0.95)",
              border: "1px solid rgba(0, 255, 136, 0.15)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 255, 136, 0.05)",
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-sm cursor-pointer transition-colors"
              style={{ color: "rgba(224, 245, 232, 0.3)", background: "none", border: "none" }}
            >
              ✕
            </button>

            <h3 className="text-lg font-medium mb-1" style={{ color: "#e0f5e8" }}>
              Buy Music Credits
            </h3>
            <p className="text-xs mb-6" style={{ color: "rgba(224, 245, 232, 0.4)" }}>
              Each song costs 10 credits
            </p>

            <div className="space-y-3">
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all disabled:opacity-50"
                  style={{
                    background: "rgba(0, 255, 136, 0.04)",
                    border: "1px solid rgba(0, 255, 136, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0, 255, 136, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(0, 255, 136, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0, 255, 136, 0.04)";
                    e.currentTarget.style.borderColor = "rgba(0, 255, 136, 0.1)";
                  }}
                >
                  <div className="text-left">
                    <div className="text-sm font-medium" style={{ color: "#e0f5e8" }}>
                      {pkg.label}
                    </div>
                    <div className="text-[10px]" style={{ color: "rgba(224, 245, 232, 0.35)" }}>
                      {pkg.credits} credits · {pkg.perSong}/song
                    </div>
                  </div>
                  <div className="text-sm font-medium" style={{ color: "#00ff88" }}>
                    {pkg.price}
                  </div>
                </button>
              ))}
            </div>

            <p className="text-[10px] text-center mt-4" style={{ color: "rgba(224, 245, 232, 0.25)" }}>
              Powered by Stripe · Secure payment
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
