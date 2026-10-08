import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share | Community Files",
  description: "Share music and art with the Crochet World community. Upload and discover creative works.",
  openGraph: {
    title: "Share | Community Files",
    description: "Share music and art with the Crochet World community. Upload and discover creative works.",
    url: "https://elovayne.com/share",
    siteName: "Crochet World",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Share | Community Files",
    description: "Share music and art with the Crochet World community. Upload and discover creative works.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
