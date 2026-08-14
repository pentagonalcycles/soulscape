"use client";

import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/support", label: "Support" },
  { href: "/ideas", label: "Ideas" },
  { href: "https://findahelpline.com", label: "Crisis Support", external: true },
];

export default function Footer() {
  return (
    <footer className="relative z-10 py-12 px-6" style={{ background: "rgba(5, 10, 6, 0.9)", borderTop: "1px solid rgba(0, 255, 136, 0.08)", boxShadow: "0 -4px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(0, 255, 136, 0.04)", backdropFilter: "blur(16px)" }}>
      <style>{`.footer-link:hover { text-shadow: 0 0 8px rgba(0, 255, 136, 0.4); }`}</style>
      {/* Divider */}
      <div className="w-full h-px mx-auto mb-10" style={{
        background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent)",
      }} />

      <div className="max-w-2xl mx-auto text-center">
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          {footerLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link text-xs tracking-wide hover:opacity-50 transition-opacity duration-300"
                style={{ color: "rgba(224, 245, 232, 0.35)", textDecoration: "none", fontSize: "11px", letterSpacing: "0.03em" }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="footer-link text-xs tracking-wide hover:opacity-50 transition-opacity duration-300"
                style={{ color: "rgba(224, 245, 232, 0.35)", textDecoration: "none", fontSize: "11px", letterSpacing: "0.03em" }}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-5 mb-6">
          <div className="h-px w-12" style={{ background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.1))" }} />
          <span style={{ color: "rgba(0, 255, 136, 0.2)", fontSize: "8px" }}>✦</span>
          <div className="h-px w-12" style={{ background: "linear-gradient(90deg, rgba(0, 255, 136, 0.1), transparent)" }} />
        </div>

        {/* Tagline */}
        <p className="mb-3" style={{ color: "rgba(224, 245, 232, 0.25)", fontFamily: "var(--font-accent)", fontSize: "14px" }}>
          A safe place for anyone who needs a quiet moment
        </p>

        {/* Brand */}
        <p className="tracking-widest uppercase" style={{ color: "rgba(0, 255, 136, 0.15)", fontSize: "9px", letterSpacing: "0.15em" }}>
          Elovayne · Always free
        </p>
      </div>
    </footer>
  );
}
