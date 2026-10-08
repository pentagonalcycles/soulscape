import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Human Signal | Crochet World",
  description: "Find someone who feels what you feel. An anonymous emotional connection system.",
  openGraph: { title: "Human Signal | Crochet World", description: "Find someone who feels what you feel.", url: "https://elovayne.com/human-signal", siteName: "Crochet World", type: "website" },
  twitter: { card: "summary", title: "Human Signal | Crochet World", description: "Anonymous emotional connection." },
  robots: { index: true, follow: true },
};

export default function HumanSignalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
