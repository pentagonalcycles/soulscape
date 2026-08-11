"use client";

import { useEffect, useState } from "react";
import NebulaOrbGame from "@/components/nebula-orb/NebulaOrbGame";

export default function NebulaOrbPage() {
  const [bgColor, setBgColor] = useState("#050510");

  useEffect(() => {
    const stored = localStorage.getItem("bg-color");
    if (stored) setBgColor(stored);
  }, []);

  return (
    <main className="relative h-screen overflow-hidden" style={{ background: bgColor }}>
      <NebulaOrbGame />
    </main>
  );
}
