"use client";

import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/about#guidelines", label: "Guidelines" },
  { href: "/about#privacy", label: "Privacy" },
  { href: "https://findahelpline.com", label: "Crisis Support", external: true },
];

export default function Footer() {
  return (
    <footer className="relative z-10 py-8 px-6 border-t border-elovayne-violet/10">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex flex-wrap justify-center gap-6 mb-4">
          {footerLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-elovayne-dim hover:text-elovayne-muted font-body text-sm transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-elovayne-dim hover:text-elovayne-muted font-body text-sm transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </div>
        <p className="text-elovayne-dim font-accent text-sm">
          Built with love for those who need an escape
        </p>
      </div>
    </footer>
  );
}
