"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useIsMobile } from "@/lib/useIsMobile";

const navLinks = [
  { href: "/nera", label: "NERA", icon: "\ud83e\udee7" },
  { href: "/elyra", label: "Elyra AI", icon: "✦" },
  { href: "/soul-echo", label: "Soul Echo", icon: "◎" },
  { href: "/stargazing", label: "Stargazing", icon: "✧" },
  { href: "/reflection-room", label: "Reflection", icon: "◈" },
  { href: "/dream-canvas", label: "Canvas", icon: "△" },
  { href: "/camera", label: "Camera", icon: "⊡" },
  { href: "/mural", label: "Mural", icon: "◇" },
  { href: "/wish-lanterns", label: "Wish Lanterns", icon: "◈" },
  { href: "/campfire", label: "Campfire", icon: "◆" },
  { href: "/poetry", label: "Poetry", icon: "❋" },
  { href: "/soul-map", label: "Soul Map", icon: "◎" },
  { href: "/nebula-orb", label: "Nebula Orb", icon: "●" },
  { href: "/human-weather", label: "Human Weather", icon: "🌤\ufe0f" },
  { href: "/human-signal", label: "Human Signal", icon: "\ud83d\udce1" },
  { href: "/unseen", label: "UNSEEN", icon: "◎" },
  { href: "/ideas", label: "Ideas", icon: "\ud83d\udca1" },
  { href: "/settings", label: "Settings", icon: "\u2699" },
];

const bottomLinks = [
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
  { href: "/faq", label: "FAQ" },
  { href: "/stats", label: "Stats" },
];

interface NavigationProps {
  activePage?: string;
}

export default function Navigation({ activePage }: NavigationProps) {
  const { isAdmin } = useAuth();
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
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          className={`btn-icon fixed top-5 left-5 z-[1000] ${isMobile ? "w-12 h-12" : ""}`}
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            fontSize: isMobile ? "18px" : "16px",
          }}
        >
        {isOpen ? "✕" : "◈"}
      </motion.button>

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
              className="nav-sidebar"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: isMobile ? "min(300px, 90vw)" : "min(260px, 85vw)",
                background: "#ffffff",
                borderRight: "1px solid rgba(13, 148, 136, 0.06)",
                boxShadow: "8px 0 40px rgba(0,0,0,0.04)",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
              }}
            >
              {/* Header */}
              <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(13, 148, 136, 0.05)" }}>
                <div style={{
                  fontSize: "20px",
                  fontWeight: 300,
                  letterSpacing: "0.12em",
                  background: "linear-gradient(135deg, #0d9488, #06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  Elovayne
                </div>
                <div style={{ fontSize: "11px", color: "rgba(15, 23, 42, 0.25)", marginTop: "4px", letterSpacing: "0.02em" }}>
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
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: isMobile ? "12px 16px" : "10px 16px",
                          borderRadius: "10px",
                          textDecoration: "none",
                          color: isActive ? "#0f172a" : "rgba(15, 23, 42, 0.5)",
                          background: isActive ? "rgba(13, 148, 136, 0.06)" : "transparent",
                          transition: "all 0.2s ease",
                          marginBottom: "2px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = "rgba(13, 148, 136, 0.04)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span style={{
                          fontSize: "14px",
                          width: "20px",
                          textAlign: "center",
                          opacity: isActive ? 1 : 0.4,
                          color: isActive ? "#0d9488" : "rgba(15, 23, 42, 0.5)",
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
              <div style={{ padding: "16px 16px 20px", borderTop: "1px solid rgba(13, 148, 136, 0.05)" }}>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={close}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      textDecoration: "none",
                      color: "rgba(239, 68, 68, 0.7)",
                      background: "rgba(239, 68, 68, 0.04)",
                      border: "1px solid rgba(239, 68, 68, 0.08)",
                      transition: "all 0.2s ease",
                      marginBottom: "8px",
                      fontSize: "13px",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.04)"; }}
                  >
                    <span style={{ fontSize: "14px", width: "20px", textAlign: "center" }}>⚙</span>
                    Admin Dashboard
                  </Link>
                )}
                <div className="flex gap-2 mb-4">
                  {bottomLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className="flex-1 text-center py-2.5 rounded-lg text-[11px] tracking-wide transition-all hover:shadow-sm"
                      style={{
                        color: "rgba(15, 23, 42, 0.4)",
                        textDecoration: "none",
                        background: "rgba(13, 148, 136, 0.03)",
                        border: "1px solid rgba(13, 148, 136, 0.06)",
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/"
                  onClick={close}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "10px",
                    borderRadius: "10px",
                    background: "rgba(13, 148, 136, 0.04)",
                    border: "1px solid rgba(13, 148, 136, 0.08)",
                    color: "#0d9488",
                    textDecoration: "none",
                    fontSize: "12px",
                    letterSpacing: "0.02em",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(13, 148, 136, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(13, 148, 136, 0.04)";
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
