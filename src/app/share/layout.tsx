import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share | Community Files",
  description: "Share music and art with the Elovayne community. Upload and discover creative works.",
  openGraph: {
    title: "Share | Community Files",
    description: "Share music and art with the Elovayne community. Upload and discover creative works.",
    url: "https://elovayne.com/share",
    siteName: "Elovayne",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Share | Community Files",
    description: "Share music and art with the Elovayne community. Upload and discover creative works.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
