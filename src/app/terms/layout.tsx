import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Crochet World",
  description: "Terms and conditions for using Crochet World, its features, and community.",
  openGraph: { title: "Terms of Use | Crochet World", description: "Terms and conditions for using Crochet World.", url: "https://elovayne.com/terms", siteName: "Crochet World", type: "website" },
  robots: { index: true, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
