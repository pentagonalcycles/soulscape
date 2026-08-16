import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Threads | Knitting & Crochet in Elovayne",
  description: "Make something, one stitch at a time. Track projects, count rows, create patterns, learn stitches, and calculate yarn.",
  openGraph: {
    title: "Threads | Knitting & Crochet in Elovayne",
    description: "Make something, one stitch at a time. Track projects, count rows, create patterns, learn stitches.",
    url: "https://elovayne.com/threads",
    siteName: "Elovayne",
    type: "website",
  },
  twitter: { card: "summary", title: "Threads | Knitting & Crochet", description: "Track projects, count rows, create patterns." },
  robots: { index: true, follow: true },
};

export default function ThreadsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
