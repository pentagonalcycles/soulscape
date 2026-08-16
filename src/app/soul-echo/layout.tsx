import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Soul Echo | Elovayne",
  description: "Share a reflection and connect anonymously with someone who understands. Soul Echo matches you with a stranger through shared emotions.",
  openGraph: { title: "Soul Echo | Elovayne", description: "Share a reflection and connect anonymously with someone who understands.", url: "https://elovayne.com/soul-echo", siteName: "Elovayne", type: "website" },
  twitter: { card: "summary", title: "Soul Echo | Elovayne", description: "Connect anonymously through shared emotions." },
  robots: { index: true, follow: true },
};

export default function SoulEchoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
