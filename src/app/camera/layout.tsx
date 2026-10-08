import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cosmic Camera | Crochet World",
  description: "A browser-based camera with 36 CSS filters, timer, and creative effects. Capture and transform your photos.",
  openGraph: { title: "Cosmic Camera | Crochet World", description: "A browser-based camera with 36 CSS filters.", url: "https://elovayne.com/camera", siteName: "Crochet World", type: "website" },
  twitter: { card: "summary", title: "Cosmic Camera | Crochet World", description: "A browser-based camera with creative filters." },
  robots: { index: true, follow: true },
};

export default function CameraLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
