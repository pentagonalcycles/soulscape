"use client";

import { useState, lazy, Suspense } from "react";
import { MuralRoom } from "@/lib/mural/types";
import MuralLobby from "./MuralLobby";

const MuralCanvas = lazy(() => import("./MuralCanvas").catch(() => ({ default: () => <div>Error loading canvas</div> })));

export default function MuralPage() {
  const [currentRoom, setCurrentRoom] = useState<MuralRoom | null>(null);

  if (currentRoom) {
    return (
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center" style={{ background: "#f0fdf9" }}>
          <p style={{ color: "rgba(15, 23, 42, 0.3)" }}>Loading canvas...</p>
        </div>
      }>
        <MuralCanvas room={currentRoom} onLeave={() => setCurrentRoom(null)} />
      </Suspense>
    );
  }

  return <MuralLobby onJoinRoom={setCurrentRoom} />;
}
