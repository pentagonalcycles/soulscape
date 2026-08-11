"use client";

import Navigation from "@/components/Navigation";
import SoulEcho from "@/components/soul-echo/SoulEcho";

export default function SoulEchoPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="global-corners" />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navigation activePage="soul echo" />
        <div className="flex-1 pt-16">
          <SoulEcho />
        </div>
      </div>
    </main>
  );
}
