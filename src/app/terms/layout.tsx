import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Elovayne",
  description: "Terms and conditions for using Elovayne, its features, and community.",
  openGraph: { title: "Terms of Use | Elovayne", description: "Terms and conditions for using Elovayne.", url: "https://elovayne.com/terms", siteName: "Elovayne", type: "website" },
  robots: { index: true, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
