import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Crochet World",
  description: "Frequently asked questions about Crochet World, Luna AI, Tarot, privacy, and how the community works.",
  openGraph: { title: "FAQ | Crochet World", description: "Frequently asked questions about Crochet World, Luna AI, Tarot, and more.", url: "https://elovayne.com/faq", siteName: "Crochet World", type: "website" },
  twitter: { card: "summary", title: "FAQ | Crochet World", description: "Frequently asked questions about Crochet World." },
  robots: { index: true, follow: true },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
