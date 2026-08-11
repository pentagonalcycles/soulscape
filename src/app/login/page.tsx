"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

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
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-10"
        >
          <motion.div
            className="text-5xl mb-4"
            animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            ✦
          </motion.div>
          <h1
            className="text-3xl font-light tracking-widest mb-2"
            style={{
              background: "linear-gradient(135deg, #0d9488, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Elovayne
          </h1>
          <p className="text-xs" style={{ color: "rgba(15, 23, 42, 0.4)" }}>
            A safe place where your soul can rest
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            background: "rgba(13, 148, 136, 0.04)",
            border: "1px solid rgba(13, 148, 136, 0.1)",
          }}
        >
          {isAnonymous ? (
            <>
              <h2 className="text-xl font-light text-center mb-2" style={{ color: "rgba(15, 23, 42, 0.9)" }}>
                {sent ? "Check your email" : "Keep Your Stories Safe"}
              </h2>
              <p className="text-xs text-center mb-8" style={{ color: "rgba(15, 23, 42, 0.5)" }}>
                {sent
                    ? "Check your inbox for your sign-in link."
                    : "Sign in to keep your stories and saved posts forever."}
              </p>

              {sent ? (
                <motion.div
                  className="text-center py-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    className="text-4xl mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    💌
                  </motion.div>
                  <p className="text-sm mb-1" style={{ color: "rgba(15, 23, 42, 0.8)" }}>
                    A sign-in link is heading to
                  </p>
                  <p className="text-sm font-medium" style={{ color: "#0d9488" }}>{email}</p>
                  <p className="text-xs mt-3" style={{ color: "rgba(15, 23, 42, 0.4)" }}>
                    Click the link in your email to sign in. No password needed.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider mb-2" style={{ color: "rgba(15, 23, 42, 0.4)" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full rounded-xl px-4 py-3 text-sm"
                      style={{
                        background: "rgba(13, 148, 136, 0.04)",
                        border: "1px solid rgba(13, 148, 136, 0.12)",
                        color: "rgba(15, 23, 42, 0.9)",
                        outline: "none",
                        fontSize: "16px",
                      }}
                    />
                  </div>

                  {error && (
                    <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={sending || !email.trim()}
                    className="w-full py-3.5 rounded-xl font-medium text-sm cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: email.trim()
                        ? "linear-gradient(135deg, #0d9488, #06b6d4)"
                        : "rgba(13, 148, 136, 0.08)",
                      color: email.trim() ? "#fff" : "rgba(15, 23, 42, 0.3)",
                      border: "none",
                      boxShadow: email.trim() ? "0 4px 20px rgba(13, 148, 136, 0.2)" : "none",
                    }}
                    whileHover={email.trim() ? { scale: 1.02 } : {}}
                    whileTap={email.trim() ? { scale: 0.98 } : {}}
                  >
                    {sending ? "Sending your link..." : "Send sign-in link ✦"}
                  </motion.button>

                  <p className="text-[10px] text-center" style={{ color: "rgba(15, 23, 42, 0.3)" }}>
                    No passwords. No tracking. Just simplicity.
                  </p>
                </form>
              )}

              <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(13, 148, 136, 0.08)" }}>
                <p className="text-[10px] text-center" style={{ color: "rgba(15, 23, 42, 0.3)" }}>
                  Or skip this entirely —{" "}
                  <Link href="/" style={{ color: "#0d9488", textDecoration: "none" }}>
                    explore anonymously
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <motion.div
                className="text-4xl mb-4"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🌟
              </motion.div>
              <h2 className="text-xl font-light mb-2" style={{ color: "rgba(15, 23, 42, 0.9)" }}>
                Your account is ready
              </h2>
              <p className="text-xs mb-6" style={{ color: "rgba(15, 23, 42, 0.5)" }}>
                Your stories are safe here.
              </p>
              {userProfile?.display_name && (
                <p className="text-sm mb-2" style={{ color: "rgba(15, 23, 42, 0.8)" }}>
                  Signed in as <span style={{ color: "#0d9488" }}>{userProfile.display_name}</span>
                </p>
              )}
              <button
                onClick={signOut}
                className="text-xs mt-4 cursor-pointer transition-colors"
                style={{ color: "rgba(15, 23, 42, 0.4)", background: "none", border: "none" }}
              >
                Sign out
              </button>
            </div>
          )}
        </motion.div>

        {/* Footer link */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
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
    </main>
  );
}
