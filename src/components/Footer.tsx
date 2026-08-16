"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/support", label: "Support" },
  { href: "/ideas", label: "Ideas" },
  { href: "https://findahelpline.com", label: "Crisis Support", external: true },
];

export default function Footer() {
  return (
    <footer className="relative z-10 py-14 px-6"
      style={{
        background: "rgba(31, 56, 40, 0.98)",
        borderTop: "1px solid rgba(0, 255, 136, 0.1)",
        boxShadow: "0 -4px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(0, 255, 136, 0.04)",
        backdropFilter: "blur(20px) saturate(1.2)",
      }}>
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: "linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.3), rgba(255, 215, 0, 0.25), rgba(0, 212, 170, 0.3), transparent)",
      }} />

      <div className="max-w-2xl mx-auto text-center">
        {/* Links row */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-8">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs tracking-wider transition-all duration-300"
              style={{
                color: "rgba(240, 255, 245, 0.65)",
                textDecoration: "none",
                fontSize: "11px",
                letterSpacing: "0.05em",
              }}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px flex-1 max-w-16" style={{ background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.1))" }} />
          <span className="text-[10px]" style={{ color: "rgba(0, 255, 136, 0.3)" }}>✦</span>
          <div className="h-px flex-1 max-w-16" style={{ background: "linear-gradient(90deg, rgba(0, 255, 136, 0.1), transparent)" }} />
        </div>

        {/* Tagline */}
        <p className="text-xs mb-2" style={{
          color: "rgba(240, 255, 245, 0.55)",
          fontFamily: "var(--font-accent)",
          letterSpacing: "0.04em",
        }}>
          A safe place for anyone who needs a quiet moment
        </p>

        {/* Brand */}
        <p className="text-[10px]" style={{ color: "rgba(0, 255, 136, 0.2)", letterSpacing: "0.08em" }}>
          Elovayne · Always free
        </p>
      </div>
    </footer>
  );
}
