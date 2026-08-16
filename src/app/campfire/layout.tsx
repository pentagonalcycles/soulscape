import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campfire | Elovayne",
  description: "Anonymous group chat around a virtual campfire. A warm, safe space for real conversation.",
  openGraph: { title: "Campfire | Elovayne", description: "Anonymous group chat around a virtual campfire.", url: "https://elovayne.com/campfire", siteName: "Elovayne", type: "website" },
  twitter: { card: "summary", title: "Campfire | Elovayne", description: "Anonymous group chat around a virtual campfire." },
  robots: { index: true, follow: true },
};

export default function CampfireLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
