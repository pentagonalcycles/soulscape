import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statistics | Elovayne",
  description: "Who comes to Elovayne, and how many — public community visitor stats.",
  openGraph: {
    title: "Statistics | Elovayne",
    description: "Who comes to Elovayne, and how many — public community visitor stats.",
    url: "https://elovayne.com/stats",
    siteName: "Elovayne",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
