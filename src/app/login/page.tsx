"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";

export default function LoginPage() {
  const { signInWithEmail, isAnonymous, signOut, userProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setError("");

    const result = await signInWithEmail(email.trim());

    if (result.error) {
      setError(result.error);
      setSending(false);
    } else {
      setSent(true);
      setSending(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <Nebula />
      <Starfield />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(5, 5, 16, 0.8) 100%)",
          zIndex: 2,
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <Link href="/" className="font-heading text-3xl text-elovayne-light glow-text">
            Elovayne
          </Link>
        </motion.div>

        <motion.div
          className="glass rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {isAnonymous ? (
            <>
              <h1 className="font-heading text-2xl text-elovayne-light glow-text text-center mb-2">
                Anchor Your Whispers to the Stars
              </h1>
              <p className="text-elovayne-muted text-sm text-center mb-8">
                Upgrade your anonymous constellation to keep your stories, journal, and saved whispers forever.
              </p>

              {sent ? (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="text-4xl block mb-4">✨</span>
                  <h2 className="font-heading text-xl text-elovayne-light mb-2">
                    Check your inbox
                  </h2>
                  <p className="text-elovayne-muted text-sm">
                    A stardust message is on its way to <span className="text-elovayne-light">{email}</span>.
                    Follow the light to sign in.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-elovayne-dim uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full bg-elovayne-deep/50 border border-elovayne-violet/20 rounded-xl px-4 py-3 text-elovayne-light placeholder-elovayne-dim focus:outline-none focus:border-elovayne-violet/50 transition-colors"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-elovayne-cosmic-pink">{error}</p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={sending || !email.trim()}
                    className="w-full py-3 rounded-xl font-heading tracking-wider text-elovayne-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: email.trim()
                        ? "linear-gradient(135deg, rgba(107, 63, 160, 0.8), rgba(157, 124, 216, 0.8))"
                        : "rgba(107, 63, 160, 0.3)",
                      boxShadow: email.trim()
                        ? "0 0 20px rgba(157, 124, 216, 0.3)"
                        : "none",
                    }}
                    whileHover={email.trim() ? { scale: 1.02 } : {}}
                    whileTap={email.trim() ? { scale: 0.98 } : {}}
                  >
                    {sending ? "Sending stardust..." : "Send a stardust message"}
                  </motion.button>

                  <p className="text-xs text-elovayne-dim text-center">
                    No passwords here. We&apos;ll send you a stardust message to sign in.
                  </p>
                </form>
              )}
            </>
          ) : (
            <div className="text-center">
              <span className="text-4xl block mb-4">🌟</span>
              <h1 className="font-heading text-2xl text-elovayne-light glow-text mb-2">
                You&apos;re Signed In
              </h1>
              <p className="text-elovayne-muted text-sm mb-6">
                Your constellation is permanent. Your stories and journal are safe among the stars.
              </p>
              {userProfile?.display_name && (
                <p className="text-elovayne-light text-sm mb-2">
                  Signed in as <span className="text-elovayne-violet">{userProfile.display_name}</span>
                </p>
              )}
              <button
                onClick={signOut}
                className="text-sm text-elovayne-dim hover:text-elovayne-cosmic-pink transition-colors mt-4"
              >
                Sign out
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/sanctuary"
            className="text-sm text-elovayne-dim hover:text-elovayne-muted transition-colors"
          >
            Drift onward →
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
