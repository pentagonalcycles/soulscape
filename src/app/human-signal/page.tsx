"use client";

import Navigation from "@/components/Navigation";
import HumanSignal from "@/components/human-signal/HumanSignal";

export default function HumanSignalPage() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#0a0a12" }}>
      <Navigation activePage="human signal" />
      <HumanSignal />
    </main>
  );
}
