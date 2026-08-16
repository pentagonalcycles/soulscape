"use client";

import { ReactNode, useEffect, useState } from "react";
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
import { supabase } from "@/lib/supabase";

function PageVisitors({ pathname }: { pathname: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const client = supabase();
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data } = await client
        .from("site_stats")
        .select("visitor_id")
        .eq("page", pathname)
        .gte("created_at", fiveMinAgo);
      const unique = new Set(data?.map((v) => v.visitor_id) || []).size;
      setCount(unique);
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (count === 0) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full"
      style={{
        background: "rgba(0, 255, 136, 0.08)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(0, 255, 136, 0.15)",
      }}
    >
      <div className="relative">
        <div className="w-2 h-2 rounded-full" style={{ background: "#10b981" }} />
        <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping" style={{ background: "#10b981", opacity: 0.4 }} />
      </div>
      <span className="text-[10px]" style={{ color: "rgba(0, 255, 136, 0.7)" }}>
        {count} {count === 1 ? "person" : "people"} here
      </span>
    </div>
  );
}

const HEAVY_BG_ROUTES = ["/nebula-orb", "/camera", "/mural", "/wish-lanterns", "/campfire", "/poetry", "/soul-map", "/tarot"];
const NO_ARTISTIC_BG_ROUTES = ["/dream-canvas", "/nebula-orb", "/camera", "/elyra", "/mural", "/wish-lanterns", "/campfire", "/poetry", "/soul-map", "/tarot"];
const NO_ELYRA_BUTTON_ROUTES = ["/elyra", "/camera", "/mural", "/wish-lanterns", "/campfire", "/poetry", "/soul-map", "/tarot"];
const NO_FOOTER_ROUTES = ["/elyra", "/mural", "/wish-lanterns", "/campfire", "/poetry", "/soul-map", "/tarot"];
const DARK_PAGES = ["/wish-lanterns", "/campfire", "/soul-map", "/poetry", "/tarot"];

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

  // Track page views
  useEffect(() => {
    if (typeof window === "undefined") return;
    let visitorId = localStorage.getItem("elovayne-visitor-id");
    if (!visitorId) {
      visitorId = `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem("elovayne-visitor-id", visitorId);
    }
    const client = supabase();
    client.from("site_stats").insert({ page: pathname, visitor_id: visitorId }).then(() => {});
  }, [pathname]);

  useEffect(() => {
    // Always use dark bioluminescent theme
    document.documentElement.style.setProperty("--bg-color", "#1a3024");
    document.body.style.background = "#1a3024";

    const root = document.documentElement.style;
    root.setProperty("--text-primary", "#e0f5e8");
    root.setProperty("--text-secondary", "#b0d4be");
    root.setProperty("--text-muted", "#6b9a7a");
    root.setProperty("--text-dim", "#3d6b4e");
    root.setProperty("--text-faint", "rgba(224, 245, 232, 0.3)");
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
    "/soul-echo": "soul echo",
    "/reflection-room": "reflection",
    "/tarot": "arcana",
    "/threads": "threads",
    "/dream-canvas": "canvas",
    "/camera": "camera",
    "/mural": "mural",
    "/wish-lanterns": "wish lanterns",
    "/campfire": "campfire",
    "/poetry": "poetry",
    "/soul-map": "soul map",
    "/nebula-orb": "nebula orb",
    "/human-signal": "human signal",
    "/ideas": "ideas board",
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
      <div className="min-h-screen flex flex-col relative scanlines grain-overlay" style={{ zIndex: 1 }}>
        <div className="flex-1">
          {loading ? null : isBanned ? <BannedScreen /> : children}
        </div>
        {!hideFooter && <Footer />}
      </div>
      {!hideElyraButton && <ElyraButton />}
      <Navigation activePage={activePage} />
      {pathname && <PageVisitors pathname={pathname} />}


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
