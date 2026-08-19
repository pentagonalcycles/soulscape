"use client";

import { useEffect, useState } from "react";
import NebulaOrbGame from "@/components/nebula-orb/NebulaOrbGame";
import { useBgTheme } from "@/lib/useBgTheme";

export default function NebulaOrbPage() {
  const { darkBg } = useBgTheme();
  const [bgColor, setBgColor] = useState("#050510");

  useEffect(() => {
    const stored = localStorage.getItem("bg-color");
    if (stored) setBgColor(stored);
  }, []);

  return (
    <main className="relative h-screen supports-[height:100dvh]:h-dvh overflow-hidden" style={{ background: darkBg ? "#000000" : "transparent" }}>
      <NebulaOrbGame />
    </main>
  );
}
