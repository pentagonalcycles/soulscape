"use client";

import HumanSignal from "@/components/human-signal/HumanSignal";
import { useBgTheme } from "@/lib/useBgTheme";

export default function HumanSignalPage() {
  const { darkBg } = useBgTheme();

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: darkBg ? "#08080c" : "transparent" }}>
      <HumanSignal />
    </main>
  );
}
