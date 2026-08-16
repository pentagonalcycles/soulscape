import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live | Elovayne",
  description: "Watch and broadcast live streams in real-time. Connect with the Elovayne community live.",
  openGraph: {
    title: "Live | Elovayne",
    description: "Watch and broadcast live streams in real-time.",
    url: "https://elovayne.com/live",
    siteName: "Elovayne",
    type: "website",
  },
  twitter: { card: "summary", title: "Live | Elovayne", description: "Real-time live streaming on Elovayne." },
  robots: { index: true, follow: true },
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
