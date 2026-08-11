"use client";

import { useIsPlus } from "@/lib/premium";

export default function PlusBadge({ className = "" }: { className?: string }) {
  const isPlus = useIsPlus();
  if (isPlus) return null;

  return (
    <span className={`inline-block px-1.5 py-0.5 rounded bg-elovayne-violet/15 border border-elovayne-violet/25 text-elovayne-violet text-[9px] font-body font-medium tracking-wider ml-1.5 ${className}`}>
      PLUS
    </span>
  );
}
