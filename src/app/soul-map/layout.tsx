import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Soul Map | Elovayne",
  description: "Build your inner mandala, one answer at a time. A self-discovery journey through daily questions.",
  openGraph: { title: "Soul Map | Elovayne", description: "Build your inner mandala through daily questions.", url: "https://elovayne.com/soul-map", siteName: "Elovayne", type: "website" },
  twitter: { card: "summary", title: "Soul Map | Elovayne", description: "A self-discovery journey through daily questions." },
  robots: { index: true, follow: true },
};

export default function SoulMapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
