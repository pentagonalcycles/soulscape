"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeContext";
import Footer from "@/components/Footer";
import Starfield from "@/components/Starfield";
import Nebula from "@/components/Nebula";
import ArtisticBackground from "@/components/ArtisticBackground";
import ElyraButton from "@/components/ElyraButton";
import Navigation from "@/components/Navigation";

const HEAVY_BG_ROUTES = ["/nebula-orb", "/camera", "/mural", "/wish-lanterns", "/campfire", "/poetry", "/soul-map"];
const NO_ARTISTIC_BG_ROUTES = ["/dream-canvas", "/nebula-orb", "/camera", "/elyra", "/mural", "/wish-lanterns", "/campfire", "/poetry", "/soul-map"];
const NO_ELYRA_BUTTON_ROUTES = ["/elyra", "/camera", "/mural", "/wish-lanterns", "/campfire", "/poetry", "/soul-map"];
const NO_FOOTER_ROUTES = ["/elyra", "/mural", "/wish-lanterns", "/campfire", "/poetry", "/soul-map"];
const DARK_PAGES = ["/wish-lanterns", "/campfire", "/soul-map", "/poetry"];

function BannedScreen() {
  const { banReason, signOut } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg-color, #ffffff)" }}>
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center"
        style={{
          background: "var(--card-bg, rgba(13, 148, 136, 0.04))",
          border: "1px solid var(--border-subtle, rgba(13, 148, 136, 0.12))",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div className="text-4xl mb-4">◈</div>
        <h1 className="text-xl font-heading mb-2" style={{ color: "var(--text-primary, #0f172a)", fontFamily: "var(--font-heading)" }}>
          Account Suspended
        </h1>
        <p className="text-sm mb-4" style={{ color: "var(--text-muted, #64748b)" }}>
          Your account has been suspended by an administrator.
        </p>
        {banReason && (
          <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.12)" }}>
            <p className="text-xs" style={{ color: "#ef4444" }}>Reason: {banReason}</p>
          </div>
        )}
        <p className="text-xs mb-6" style={{ color: "var(--text-dim, #94a3b8)" }}>
          If you believe this is a mistake, please contact support.
        </p>
        <button
          onClick={() => signOut()}
          className="px-6 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
          style={{
            background: "var(--card-bg, rgba(13, 148, 136, 0.06))",
            border: "1px solid var(--border-subtle, rgba(13, 148, 136, 0.12))",
            color: "var(--text-secondary, #334155)",
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function LayoutInner({ children }: { children: ReactNode }) {
  const { isBanned, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const storedBg = localStorage.getItem("bg-color");
    if (storedBg) {
      document.documentElement.style.setProperty("--bg-color", storedBg);
      document.body.style.background = storedBg;

      // Determine if background is light or dark
      let isLight = true;
      if (storedBg.startsWith("#") && storedBg.length >= 7) {
        const r = parseInt(storedBg.slice(1, 3), 16) / 255;
        const g = parseInt(storedBg.slice(3, 5), 16) / 255;
        const b = parseInt(storedBg.slice(5, 7), 16) / 255;
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        isLight = luminance > 0.5;
      } else if (storedBg.startsWith("linear-gradient") || storedBg.startsWith("radial-gradient")) {
        const hexMatch = storedBg.match(/#[0-9a-fA-F]{6}/);
        if (hexMatch) {
          const hex = hexMatch[0];
          const r = parseInt(hex.slice(1, 3), 16) / 255;
          const g = parseInt(hex.slice(3, 5), 16) / 255;
          const b = parseInt(hex.slice(5, 7), 16) / 255;
          const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          isLight = luminance > 0.5;
        }
      }

      const root = document.documentElement.style;
      if (isLight) {
        root.setProperty("--text-primary", "#0f172a");
        root.setProperty("--text-secondary", "#334155");
        root.setProperty("--text-muted", "#64748b");
        root.setProperty("--text-dim", "#94a3b8");
        root.setProperty("--text-faint", "rgba(15, 23, 42, 0.4)");
        root.setProperty("--border-subtle", "rgba(13, 148, 136, 0.12)");
        root.setProperty("--card-bg", "rgba(13, 148, 136, 0.04)");
        root.setProperty("--input-bg", "rgba(13,148,136,0.06)");
        // Brighter animations on light backgrounds
        root.setProperty("--nebula-opacity", "0.25");
        root.setProperty("--particle-opacity", "0.9");
        root.setProperty("--constellation-opacity", "0.35");
        root.setProperty("--glow-opacity", "0.1");
        root.setProperty("--orb-opacity", "0.2");
      } else {
        root.setProperty("--text-primary", "#f1f5f9");
        root.setProperty("--text-secondary", "#e2e8f0");
        root.setProperty("--text-muted", "#94a3b8");
        root.setProperty("--text-dim", "#64748b");
        root.setProperty("--text-faint", "rgba(241, 245, 249, 0.4)");
        root.setProperty("--border-subtle", "rgba(13, 148, 136, 0.2)");
        root.setProperty("--card-bg", "rgba(13, 148, 136, 0.08)");
        root.setProperty("--input-bg", "rgba(13,148,136,0.12)");
        // Subtle animations on dark backgrounds
        root.setProperty("--nebula-opacity", "0.15");
        root.setProperty("--particle-opacity", "0.7");
        root.setProperty("--constellation-opacity", "0.25");
        root.setProperty("--glow-opacity", "0.06");
        root.setProperty("--orb-opacity", "0.12");
      }
    }
  }, []);

  const isHeavyPage = HEAVY_BG_ROUTES.some((r) => pathname?.startsWith(r));
  const hideArtisticBg = NO_ARTISTIC_BG_ROUTES.some((r) => pathname?.startsWith(r));
  const hideElyraButton = NO_ELYRA_BUTTON_ROUTES.some((r) => pathname?.startsWith(r));
  const hideFooter = NO_FOOTER_ROUTES.some((r) => pathname?.startsWith(r));
  const isDarkPage = DARK_PAGES.some((r) => pathname?.startsWith(r));
  const isHome = pathname === "/";

  const pathToActivePage: Record<string, string> = {
    "/nera": "nera",
    "/elyra": "elyra ai",
    "/soul-echo": "soul echo",
    "/stargazing": "stargazing",
    "/reflection-room": "reflection",
    "/dream-canvas": "canvas",
    "/camera": "camera",
    "/mural": "mural",
    "/wish-lanterns": "wish lanterns",
    "/campfire": "campfire",
    "/poetry": "poetry",
    "/soul-map": "soul map",
    "/nebula-orb": "nebula orb",
    "/human-weather": "human weather",
    "/human-signal": "human signal",
    "/unseen": "unseen",
    "/ideas": "ideas",
    "/settings": "settings",
    "/admin": "admin",
    "/moderation": "moderation",
    "/shop": "shop",
    "/about": "about",
    "/support": "support",
    "/faq": "faq",
    "/account": "account",
  };
  const activePage = pathname ? pathToActivePage[pathname] || (pathname.startsWith("/shop/") ? "shop" : undefined) : undefined;

  return (
    <>
      {!hideArtisticBg && <ArtisticBackground variant="cosmic" />}
      {!isHeavyPage && (
        <>
          <Starfield />
          <Nebula />
        </>
      )}
      <div className="min-h-screen flex flex-col relative" style={{ zIndex: 1 }}>
        <div className="flex-1">
          {loading ? null : isBanned ? <BannedScreen /> : children}
        </div>
        {!hideFooter && <Footer />}
      </div>
      {!hideElyraButton && <ElyraButton />}
      <Navigation activePage={activePage} />


    </>
  );
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LayoutInner>{children}</LayoutInner>
      </ThemeProvider>
    </AuthProvider>
  );
}
