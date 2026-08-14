"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import CreateView from "./CreateView";
import LibraryView from "./LibraryView";
import CommunityView from "./CommunityView";

type Tab = "create" | "library" | "community";

const navItems = [
  { id: "create" as Tab, label: "Create", icon: "plus" },
  { id: "library" as Tab, label: "Library", icon: "library" },
  { id: "community" as Tab, label: "Discover", icon: "compass" },
];

function SunoIcon({ name, size = 18 }: { name: string; size?: number }) {
  const s = size;
  const icons: Record<string, JSX.Element> = {
    plus: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    library: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
    ),
    compass: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
    music: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function MusicPage() {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("create");
  const [refreshKey, setRefreshKey] = useState(0);

  const accent = "#0d9488";

  const handleTrackCreated = () => {
    setRefreshKey((k) => k + 1);
    setActiveTab("library");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-color, #ffffff)" }}>
      {/* Sidebar */}
      <aside
        className="hidden sm:flex flex-col w-56 flex-shrink-0 py-6 px-3 fixed left-0 top-0 h-full z-20"
        style={{
          background: "rgba(13, 148, 136, 0.03)",
          borderRight: "1px solid var(--border-subtle)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accent}, #06b6d4)`,
              boxShadow: `0 2px 12px ${accent}30`,
            }}
          >
            <SunoIcon name="music" size={16} />
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Music Studio</div>
            <div className="text-[9px]" style={{ color: "var(--text-dim)" }}>AI-Powered Creation</div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left"
              style={{
                color: activeTab === item.id ? accent : "var(--text-muted)",
                background: activeTab === item.id ? `${accent}10` : "transparent",
                border: "none",
              }}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="musicNav"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: `${accent}08`, border: `1px solid ${accent}15` }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative z-10"><SunoIcon name={item.icon} size={16} /></span>
              <span className="relative z-10 font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Daily Limit */}
        {userId && (
          <div className="mt-auto px-3">
            <div className="p-3 rounded-xl" style={{ background: "var(--card-bg)", border: "1px solid var(--border-subtle)" }}>
              <div className="text-[9px] mb-1" style={{ color: "var(--text-dim)" }}>Daily creations</div>
              <div className="text-xs font-medium" style={{ color: accent }}>Free for everyone</div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Tab Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 px-4 pb-4">
        <div
          className="flex gap-1 p-1.5 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] transition-all cursor-pointer"
              style={{
                color: activeTab === item.id ? accent : "var(--text-dim)",
                background: activeTab === item.id ? `${accent}10` : "transparent",
                border: "none",
              }}
            >
              <SunoIcon name={item.icon} size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 sm:ml-56 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-6 sm:pt-10 pb-24 sm:pb-10">
          <AnimatePresence mode="wait">
            {activeTab === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <CreateView onTrackCreated={handleTrackCreated} userId={userId} />
              </motion.div>
            )}
            {activeTab === "library" && (
              <motion.div
                key={`library-${refreshKey}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <LibraryView userId={userId} />
              </motion.div>
            )}
            {activeTab === "community" && (
              <motion.div
                key="community"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <CommunityView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
