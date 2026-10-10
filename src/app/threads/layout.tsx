import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Threads | Crochet in Crochet World",
  description: "Make something, one stitch at a time. Count rounds, track projects, look up stitches, and work out how much yarn you need.",
  openGraph: {
    title: "Threads | Crochet in Crochet World",
    description: "Make something, one stitch at a time. Count rounds, track projects, look up stitches.",
    url: "https://elovayne.com/threads",
    siteName: "Crochet World",
    type: "website",
  },
  twitter: { card: "summary", title: "Threads | Crochet", description: "Count rounds, track projects, look up stitches." },
  robots: { index: true, follow: true },
};

export default function ThreadsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
