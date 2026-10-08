import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poetry | Crochet World",
  description: "Daily poetry prompts inspire your words. Write, share, and read poems in a supportive creative community.",
  openGraph: { title: "Poetry | Crochet World", description: "Daily poetry prompts inspire your words.", url: "https://elovayne.com/poetry", siteName: "Crochet World", type: "website" },
  twitter: { card: "summary", title: "Poetry | Crochet World", description: "Daily poetry prompts and creative writing." },
  robots: { index: true, follow: true },
};

export default function PoetryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
