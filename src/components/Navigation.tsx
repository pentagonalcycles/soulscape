"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/lib/useIsMobile";

const navLinks = [
  { href: "/elyra", label: "Luna AI", icon: "✦" },
  { href: "/tarot", label: "Arcana", icon: "☽" },
  { href: "/threads", label: "Threads", icon: "🧶" },
  { href: "/reflection-room", label: "Reflection", icon: "◈" },
  { href: "/dream-canvas", label: "Canvas", icon: "△" },
  { href: "/mural", label: "Mural", icon: "◇" },
  { href: "/poetry", label: "Poetry", icon: "❋" },
  { href: "/campfire", label: "Campfire", icon: "◆" },
  { href: "/nebula-orb", label: "Nebula Orb", icon: "●" },
  { href: "/camera", label: "Camera", icon: "⊡" },
];

const bottomLinks = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/support", label: "Support" },
  { href: "/share", label: "Share" },
  { href: "/ideas", label: "Ideas" },
  { href: "/stats", label: "Stats" },
];

interface NavigationProps {
  activePage?: string;
  hideToggle?: boolean;
}

export default function Navigation({ activePage, hideToggle }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Toggle button */}
      {!hideToggle && (
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          className={`btn-icon fixed top-5 left-5 z-[1000] ${isMobile ? "w-12 h-12" : ""}`}
          data-nav-toggle
          style={{
            background: "rgba(30, 58, 42, 0.9)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 0 20px rgba(0, 255, 136, 0.12), inset 0 0 20px rgba(0, 255, 136, 0.04)",
            border: "1px solid rgba(0, 255, 136, 0.2)",
            fontSize: isMobile ? "18px" : "16px",
          }}
        >
        {isOpen ? "✕" : "◈"}
      </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={close}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.15)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                zIndex: 999,
              }}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="nav-sidebar hex-pattern"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: isMobile ? "min(300px, 90vw)" : "min(260px, 85vw)",
                background: "rgba(8, 16, 12, 0.98)",
                backdropFilter: "blur(24px) saturate(1.3)",
                WebkitBackdropFilter: "blur(24px) saturate(1.3)",
                borderRight: "1px solid rgba(0, 255, 136, 0.2)",
                boxShadow: "8px 0 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 255, 136, 0.05)",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
              }}
            >
              {/* Header */}
              <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(0, 212, 170, 0.12)", position: "relative" }}>
                <div style={{ position: "absolute", bottom: 0, left: "24px", right: "24px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.35), transparent)" }} />
                <div style={{
                  fontSize: "20px",
                  fontWeight: 300,
                  letterSpacing: "0.12em",
                  background: "linear-gradient(135deg, var(--elovayne-nebula), #ffd700, var(--elovayne-nebula))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  Elovayne
                </div>
                <div style={{ fontSize: "11px", color: "rgba(0, 212, 170, 0.45)", marginTop: "4px", letterSpacing: "0.02em" }}>
                  A safe place for your soul
                </div>
              </div>

              {/* Links */}
              <div style={{ padding: "12px 12px", flex: 1 }}>
                {navLinks.map((link, i) => {
                  const isActive = activePage === link.label.toLowerCase();
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.025, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        onClick={close}
                        className={isActive ? "nav-link-active" : "nav-link"}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: isMobile ? "12px 16px" : "10px 16px",
                          borderRadius: "10px",
                          textDecoration: "none",
                          transition: "all 0.3s ease",
                          marginBottom: "2px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = "rgba(0, 212, 170, 0.06)";
                            e.currentTarget.style.borderColor = "rgba(0, 212, 170, 0.1)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "transparent";
                          }
                        }}
                      >
                        <span className={isActive ? "nav-icon-active" : "nav-icon"} style={{
                          fontSize: "14px",
                          width: "20px",
                          textAlign: "center",
                        }}>
                          {link.icon}
                        </span>
                        <span style={{
                          fontSize: "13px",
                          fontWeight: isActive ? 500 : 400,
                          letterSpacing: "0.01em",
                        }}>
                          {link.label}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom */}
              <div style={{ padding: "16px 16px 20px", borderTop: "1px solid rgba(0, 212, 170, 0.1)" }}>
                <div className="flex gap-2 mb-3">
                  {bottomLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className="flex-1 text-center py-2.5 rounded-lg text-[11px] tracking-wide transition-all hover:shadow-sm"
                      style={{
                        color: "rgba(0, 212, 170, 0.5)",
                        textDecoration: "none",
                        background: "rgba(0, 212, 170, 0.06)",
                        border: "1px solid rgba(0, 212, 170, 0.1)",
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Settings button */}
                <Link
                  href="/settings"
                  onClick={close}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px",
                    marginBottom: "8px",
                    borderRadius: "10px",
                    background: "rgba(0, 212, 170, 0.06)",
                    border: "1px solid rgba(0, 212, 170, 0.15)",
                    color: "rgba(0, 212, 170, 0.6)",
                    textDecoration: "none",
                    fontSize: "12px",
                    letterSpacing: "0.02em",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0, 212, 170, 0.12)";
                    e.currentTarget.style.color = "var(--elovayne-nebula)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0, 212, 170, 0.06)";
                    e.currentTarget.style.color = "rgba(0, 212, 170, 0.6)";
                  }}
                >
                  <span style={{ fontSize: "14px" }}>⚙</span>
                  Settings
                </Link>

                <Link
                  href="/"
                  onClick={close}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "10px",
                    borderRadius: "10px",
                    background: "rgba(0, 212, 170, 0.08)",
                    border: "1px solid rgba(0, 212, 170, 0.15)",
                    color: "var(--elovayne-nebula)",
                    textDecoration: "none",
                    fontSize: "12px",
                    letterSpacing: "0.02em",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(0, 212, 170, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0, 212, 170, 0.08)";
                  }}
                >
                  ← Home
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
