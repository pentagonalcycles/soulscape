"use client";

import { useState, lazy, Suspense } from "react";
import { MuralRoom } from "@/lib/mural/types";
import MuralLobby from "./MuralLobby";

const MuralCanvas = lazy(() => import("./MuralCanvas"));

export default function MuralPage() {
  const [currentRoom, setCurrentRoom] = useState<MuralRoom | null>(null);

  if (currentRoom) {
    return (
      <Suspense fallback={
        <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#f0fdf9" }}>
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0d9488", borderTopColor: "transparent" }} />
          <p style={{ color: "rgba(15, 23, 42, 0.4)" }}>Loading canvas...</p>
        </div>
      }>
        <MuralCanvas room={currentRoom} onLeave={() => setCurrentRoom(null)} />
      </Suspense>
    );
  }

  return <MuralLobby onJoinRoom={setCurrentRoom} />;
}
