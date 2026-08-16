import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | Elovayne",
  description: "Digital products, soundscapes, wallpapers, and Elovayne Plus membership.",
  openGraph: { title: "Shop | Elovayne", description: "Digital products and Elovayne Plus membership.", url: "https://elovayne.com/shop", siteName: "Elovayne", type: "website" },
  twitter: { card: "summary", title: "Shop | Elovayne", description: "Digital products and membership." },
  robots: { index: true, follow: true },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
