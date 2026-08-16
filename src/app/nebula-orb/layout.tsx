import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nebula Orb | Elovayne",
  description: "A multiplayer cosmic arena game. Navigate, collect, and compete in a neon-lit space.",
  openGraph: { title: "Nebula Orb | Elovayne", description: "A multiplayer cosmic arena game.", url: "https://elovayne.com/nebula-orb", siteName: "Elovayne", type: "website" },
  twitter: { card: "summary", title: "Nebula Orb | Elovayne", description: "A multiplayer cosmic arena game." },
  robots: { index: true, follow: true },
};

export default function NebulaOrbLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
