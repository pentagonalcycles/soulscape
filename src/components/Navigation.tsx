"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/sanctuary", label: "Sanctuary" },
  { href: "/rooms", label: "Rooms" },
  { href: "/journal", label: "Journal" },
  { href: "/saves", label: "Saved" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

interface NavigationProps {
  activePage?: string;
}

export default function Navigation({ activePage }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="backdrop-blur-xl bg-elovayne-void/50 border-b border-elovayne-violet/10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-heading text-2xl text-elovayne-light glow-text">
              Elovayne
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              {navLinks.map((link) => {
                const isActive = activePage === link.label.toLowerCase();
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative py-1 font-body text-sm transition-colors duration-300 ${
                      isActive
                        ? "text-elovayne-light"
                        : "text-elovayne-dim hover:text-elovayne-muted"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-px bg-elovayne-violet/60"
                        layoutId="navUnderline"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    {isActive && (
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-elovayne-violet/60">
                        ✦
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-elovayne-muted hover:text-elovayne-light transition-colors p-2 -mr-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <div className="w-5 flex flex-col gap-1">
                <motion.div
                  className="w-full h-px bg-current origin-center"
                  animate={mobileOpen ? { rotate: 45, y: 3 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="w-full h-px bg-current"
                  animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  className="w-full h-px bg-current origin-center"
                  animate={mobileOpen ? { rotate: -45, y: -3 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-elovayne-void/60 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              className="fixed top-0 right-0 bottom-0 w-72 z-50 md:hidden p-8 pt-24 flex flex-col gap-2"
              style={{
                background: "rgba(10, 10, 46, 0.95)",
                backdropFilter: "blur(20px)",
                borderLeft: "1px solid rgba(157, 124, 216, 0.1)",
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              aria-label="Mobile navigation"
            >
              {navLinks.map((link, i) => {
                const isActive = activePage === link.label.toLowerCase();
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block py-3 px-4 rounded-xl font-body text-base transition-all duration-300 ${
                        isActive
                          ? "text-elovayne-light bg-elovayne-violet/10 border border-elovayne-violet/20"
                          : "text-elovayne-dim hover:text-elovayne-muted hover:bg-elovayne-violet/5"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isActive && <span className="text-elovayne-violet text-xs">✦</span>}
                        {link.label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
