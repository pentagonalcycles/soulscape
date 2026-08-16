import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cosmic Camera | Elovayne",
  description: "A browser-based camera with 36 CSS filters, timer, and creative effects. Capture and transform your photos.",
  openGraph: { title: "Cosmic Camera | Elovayne", description: "A browser-based camera with 36 CSS filters.", url: "https://elovayne.com/camera", siteName: "Elovayne", type: "website" },
  twitter: { card: "summary", title: "Cosmic Camera | Elovayne", description: "A browser-based camera with creative filters." },
  robots: { index: true, follow: true },
};

export default function CameraLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
