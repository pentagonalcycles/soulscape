import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ideas | Shape Crochet World",
  description: "Help shape Crochet World. Share your ideas, vote on what matters, and see what gets built.",
  openGraph: {
    title: "Ideas | Shape Crochet World",
    description: "Help shape Crochet World. Share your ideas, vote on what matters, and see what gets built.",
    url: "https://elovayne.com/ideas",
    siteName: "Crochet World",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ideas | Shape Crochet World",
    description: "Help shape Crochet World. Share your ideas, vote on what matters, and see what gets built.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function IdeasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
