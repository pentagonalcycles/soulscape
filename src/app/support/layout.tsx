import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | Crochet World",
  description: "Get help with Crochet World. Report problems, ask questions, or reach out for technical support.",
  openGraph: { title: "Support | Crochet World", description: "Get help with Crochet World.", url: "https://elovayne.com/support", siteName: "Crochet World", type: "website" },
  twitter: { card: "summary", title: "Support | Crochet World", description: "Get help with Crochet World." },
  robots: { index: true, follow: true },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
