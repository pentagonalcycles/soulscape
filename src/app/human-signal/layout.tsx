import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Human Signal | Elovayne",
  description: "Find someone who feels what you feel. An anonymous emotional connection system.",
  openGraph: { title: "Human Signal | Elovayne", description: "Find someone who feels what you feel.", url: "https://elovayne.com/human-signal", siteName: "Elovayne", type: "website" },
  twitter: { card: "summary", title: "Human Signal | Elovayne", description: "Anonymous emotional connection." },
  robots: { index: true, follow: true },
};

export default function HumanSignalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
