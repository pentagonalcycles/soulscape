"use client";

import { useEffect, useState } from "react";
import FeatureGate from "@/components/FeatureGate";
import NebulaOrbGame from "@/components/nebula-orb/NebulaOrbGame";

export default function NebulaOrbPage() {
  const [bgColor, setBgColor] = useState("#050510");

  useEffect(() => {
    const stored = localStorage.getItem("bg-color");
    if (stored) setBgColor(stored);
  }, []);

  return (
    <FeatureGate featureId="nebula-orb">
      <main className="relative h-screen supports-[height:100dvh]:h-dvh overflow-hidden" style={{ background: bgColor }}>
        <NebulaOrbGame />
      </main>
    </FeatureGate>
  );
}
