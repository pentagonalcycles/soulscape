import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Elovayne",
  description: "How Elovayne handles your data, conversations, uploads, and privacy.",
  openGraph: { title: "Privacy Policy | Elovayne", description: "How Elovayne handles your data and privacy.", url: "https://elovayne.com/privacy", siteName: "Elovayne", type: "website" },
  robots: { index: true, follow: true },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
