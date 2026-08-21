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
import VisitorTracker from "@/components/VisitorTracker";
import PresenceMap from "@/components/PresenceMap";
import SignalNotification from "@/components/human-signal/SignalNotification";
import ErrorBoundary from "@/components/ErrorBoundary";

const HEAVY_BG_ROUTES = ["/nebula-orb", "/camera", "/mural", "/campfire", "/poetry", "/tarot", "/threads"];
const NO_ARTISTIC_BG_ROUTES = ["/dream-canvas", "/nebula-orb", "/camera", "/elyra", "/mural", "/campfire", "/poetry", "/tarot", "/threads"];
const NO_ELYRA_BUTTON_ROUTES = ["/", "/elyra", "/camera", "/mural", "/campfire", "/poetry", "/tarot", "/threads"];
const NO_FOOTER_ROUTES = ["/elyra", "/mural", "/campfire", "/poetry", "/tarot", "/threads"];
const DARK_PAGES = ["/campfire", "/poetry", "/tarot", "/threads"];

function BannedScreen() {
  const { banReason, signOut } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg-color, #ffffff)" }}>
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center"
        style={{
          background: "var(--card-bg, rgba(0, 255, 136, 0.04))",
          border: "1px solid var(--border-subtle, rgba(0, 255, 136, 0.12))",
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
            background: "var(--card-bg, rgba(0, 255, 136, 0.06))",
            border: "1px solid var(--border-subtle, rgba(0, 255, 136, 0.12))",
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
    // Always use dark bioluminescent theme
    document.documentElement.style.setProperty("--bg-color", "#000000");
    document.body.style.background = "#000000";

    const root = document.documentElement.style;
    root.setProperty("--text-primary", "#e8fff0");
    root.setProperty("--text-secondary", "#c0e8d0");
    root.setProperty("--text-muted", "#78b890");
    root.setProperty("--text-dim", "#4a8a60");
    root.setProperty("--text-faint", "rgba(240, 255, 245, 0.6)");
    root.setProperty("--border-subtle", "rgba(0, 255, 136, 0.1)");
    root.setProperty("--card-bg", "rgba(0, 255, 136, 0.03)");
    root.setProperty("--input-bg", "rgba(0, 255, 136, 0.05)");
    root.setProperty("--nebula-opacity", "0.2");
    root.setProperty("--particle-opacity", "0.8");
    root.setProperty("--constellation-opacity", "0.3");
    root.setProperty("--glow-opacity", "0.08");
    root.setProperty("--orb-opacity", "0.15");
  }, []);

  const isHeavyPage = HEAVY_BG_ROUTES.some((r) => pathname?.startsWith(r));
  const hideArtisticBg = NO_ARTISTIC_BG_ROUTES.some((r) => pathname?.startsWith(r));
  const hideElyraButton = NO_ELYRA_BUTTON_ROUTES.some((r) => pathname?.startsWith(r));
  const hideFooter = NO_FOOTER_ROUTES.some((r) => pathname?.startsWith(r));
  const isDarkPage = DARK_PAGES.some((r) => pathname?.startsWith(r));
  const isHome = pathname === "/";

  const pathToActivePage: Record<string, string> = {
    "/elyra": "elyra ai",
    "/reflection-room": "reflection",
    "/tarot": "arcana",
    "/threads": "threads",
    "/dream-canvas": "canvas",
    "/camera": "camera",
    "/mural": "mural",
    "/campfire": "campfire",
    "/poetry": "poetry",
    "/nebula-orb": "nebula orb",
    "/human-signal": "human signal",
    "/ideas": "ideas board",
    "/moderation": "moderation",
    "/about": "about",
    "/support": "support",
    "/faq": "faq",
    "/account": "account",
    "/stats": "stats",
    "/settings": "settings",
  };
  const activePage = pathname ? pathToActivePage[pathname] : undefined;

  return (
    <>
      {/* Global colour-shifting background (always visible) */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: -1,
          background: "linear-gradient(135deg, #00ff88 0%, #0088ff 50%, #8800ff 100%)",
        }}
      />
      {!hideArtisticBg && <ArtisticBackground variant="cosmic" />}
      {!isHeavyPage && (
        <>
          <Starfield />
          <Nebula />
        </>
      )}
      <div className="min-h-screen flex flex-col relative scanlines grain-overlay" style={{ zIndex: 1 }}>
        <div className="flex-1">
          <ErrorBoundary>
            {loading ? null : isBanned ? <BannedScreen /> : children}
          </ErrorBoundary>
        </div>
        {!hideFooter && <Footer />}
      </div>
      {!hideElyraButton && <ElyraButton />}
      <Navigation activePage={activePage} hideToggle={isHome} />
      <VisitorTracker />
      {!isHome && <PresenceMap />}
      <SignalNotification />

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
