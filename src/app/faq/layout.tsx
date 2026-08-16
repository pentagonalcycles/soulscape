import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Elovayne",
  description: "Frequently asked questions about Elovayne, Elyra AI, Tarot, privacy, and how the community works.",
  openGraph: { title: "FAQ | Elovayne", description: "Frequently asked questions about Elovayne, Elyra AI, Tarot, and more.", url: "https://elovayne.com/faq", siteName: "Elovayne", type: "website" },
  twitter: { card: "summary", title: "FAQ | Elovayne", description: "Frequently asked questions about Elovayne." },
  robots: { index: true, follow: true },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
