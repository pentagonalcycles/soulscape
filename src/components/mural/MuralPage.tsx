"use client";

import { useState } from "react";
import { MuralRoom } from "@/lib/mural/types";
import MuralLobby from "./MuralLobby";
import MuralCanvas from "./MuralCanvas";

export default function MuralPage() {
  const [currentRoom, setCurrentRoom] = useState<MuralRoom | null>(null);

  if (currentRoom) {
    return <MuralCanvas room={currentRoom} onLeave={() => setCurrentRoom(null)} />;
  }

  return <MuralLobby onJoinRoom={setCurrentRoom} />;
}
