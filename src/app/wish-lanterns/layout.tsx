import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wish Lanterns | Elovayne",
  description: "Release your wishes into the sky. A beautiful, meditative experience of letting go and hoping.",
  openGraph: { title: "Wish Lanterns | Elovayne", description: "Release your wishes into the sky.", url: "https://elovayne.com/wish-lanterns", siteName: "Elovayne", type: "website" },
  twitter: { card: "summary", title: "Wish Lanterns | Elovayne", description: "Release your wishes into the sky." },
  robots: { index: true, follow: true },
};

export default function WishLanternsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
