import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Elovayne",
  description: "Elovayne is a safe, creative community where people express themselves, share stories, and connect through meaningful experiences. No ads, no tracking, no algorithms.",
  openGraph: {
    title: "About | Elovayne",
    description: "A safe, creative community where people express themselves, share stories, and connect through meaningful experiences.",
    url: "https://elovayne.com/about",
    siteName: "Elovayne",
    type: "website",
  },
  twitter: { card: "summary", title: "About | Elovayne", description: "A safe, creative community for meaningful expression." },
  robots: { index: true, follow: true },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
