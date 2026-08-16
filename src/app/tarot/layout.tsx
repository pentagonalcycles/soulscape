import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARCANA | Tarot in Elovayne",
  description: "Draw cards, explore the full 78-card Tarot deck, get daily guidance, and keep private readings. A place to reflect, question and explore.",
  openGraph: {
    title: "ARCANA | Tarot in Elovayne",
    description: "Draw cards, explore the full 78-card Tarot deck, get daily guidance, and keep private readings.",
    url: "https://elovayne.com/tarot",
    siteName: "Elovayne",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARCANA | Tarot in Elovayne",
    description: "Draw cards, explore the full 78-card Tarot deck, get daily guidance, and keep private readings.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
