import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luna | AI Inside Crochet World",
  description: "Talk, create, learn and code with Luna, the AI inside Crochet World.",
  openGraph: {
    title: "Luna | AI Inside Crochet World",
    description: "Talk, create, learn and code with Luna, the AI inside Crochet World.",
    url: "https://elovayne.com/elyra",
    siteName: "Crochet World",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luna | AI Inside Crochet World",
    description: "Talk, create, learn and code with Luna, the AI inside Crochet World.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ElyraLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
