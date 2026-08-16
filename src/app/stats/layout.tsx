import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Stats | Elovayne",
  description: "See how the Elovayne community is growing. Real-time visitor tracking and community analytics.",
  openGraph: { title: "Community Stats | Elovayne", description: "See how the Elovayne community is growing.", url: "https://elovayne.com/stats", siteName: "Elovayne", type: "website" },
  twitter: { card: "summary", title: "Community Stats | Elovayne", description: "Real-time community analytics." },
  robots: { index: true, follow: true },
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
