"use client";

import Navigation from "@/components/Navigation";
import Unseen from "@/components/unseen/Unseen";

export default function UnseenPage() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#0c0a14" }}>
      <Navigation activePage="unseen" />
      <Unseen />
    </main>
  );
}
