import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dream Canvas | Elovayne",
  description: "Paint and create with 32 brush types, layers, and tools. A browser-based digital art canvas for creative expression.",
  openGraph: { title: "Dream Canvas | Elovayne", description: "Paint and create with 32 brush types and tools.", url: "https://elovayne.com/dream-canvas", siteName: "Elovayne", type: "website" },
  twitter: { card: "summary", title: "Dream Canvas | Elovayne", description: "A browser-based digital art canvas." },
  robots: { index: true, follow: true },
};

export default function DreamCanvasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
