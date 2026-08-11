"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { NeraWithMeta, Nera } from "@/lib/nera/types";
import NeraBackground from "./NeraBackground";
import NeraFeed from "./NeraFeed";
import NeraCreator from "./NeraCreator";
import NeraDetail from "./NeraDetail";

type View = "feed" | "create" | "detail";

export default function NeraPage() {
  const { userId } = useAuth();
  const [view, setView] = useState<View>("feed");
  const [selectedNera, setSelectedNera] = useState<NeraWithMeta | null>(null);

  function handleSelect(nera: NeraWithMeta) {
    setSelectedNera(nera);
    setView("detail");
  }

  function handleNeraCreated(_nera: Nera) {
    setView("feed");
  }

  async function handleAdminDelete(neraId: string) {
    await fetch("/api/admin/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "neras", id: neraId }),
    });
    setSelectedNera(null);
    setView("feed");
  }

  return (
    <>
      <NeraBackground />
      <div className="relative z-10">
        {view === "feed" && (
          <NeraFeed onSelect={handleSelect} onCreate={() => setView("create")} />
        )}
        {view === "create" && (
          <NeraCreator onSubmit={handleNeraCreated} onCancel={() => setView("feed")} />
        )}
        {view === "detail" && selectedNera && (
          <NeraDetail nera={selectedNera} onBack={() => setView("feed")} onDelete={handleAdminDelete} />
        )}
      </div>
    </>
  );
}
