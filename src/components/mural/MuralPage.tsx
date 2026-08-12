"use client";

import { useState } from "react";
import { MuralRoom } from "@/lib/mural/types";
import MuralLobby from "./MuralLobby";

export default function MuralPage() {
  const [currentRoom, setCurrentRoom] = useState<MuralRoom | null>(null);

  if (currentRoom) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "#f0fdf9" }}>
        <p style={{ color: "rgba(15, 23, 42, 0.3)" }}>Canvas loading disabled for testing</p>
      </div>
    );
  }

  return <MuralLobby onJoinRoom={setCurrentRoom} />;
}
