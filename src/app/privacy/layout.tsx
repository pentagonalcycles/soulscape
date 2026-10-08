import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Crochet World",
  description: "How Crochet World handles your data, conversations, uploads, and privacy.",
  openGraph: { title: "Privacy Policy | Crochet World", description: "How Crochet World handles your data and privacy.", url: "https://elovayne.com/privacy", siteName: "Crochet World", type: "website" },
  robots: { index: true, follow: true },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
