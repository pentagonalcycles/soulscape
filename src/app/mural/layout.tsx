import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mural | Elovayne",
  description: "Paint together with others in real-time on a collaborative canvas. A shared creative experience.",
  openGraph: { title: "Mural | Elovayne", description: "Paint together with others in real-time.", url: "https://elovayne.com/mural", siteName: "Elovayne", type: "website" },
  twitter: { card: "summary", title: "Mural | Elovayne", description: "Collaborative real-time painting." },
  robots: { index: true, follow: true },
};

export default function MuralLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
