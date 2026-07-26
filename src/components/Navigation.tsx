"use client";

import { motion } from "framer-motion";
import Link from "next/link";

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
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 glass"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-heading text-2xl text-elovayne-light glow-text">
          Elovayne
        </Link>
        <nav className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                activePage === link.label.toLowerCase()
                  ? "text-elovayne-light glow-text"
                  : "text-elovayne-muted hover:text-elovayne-light transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
