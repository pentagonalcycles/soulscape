import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elyra | AI Inside Elovayne",
  description: "Talk, create, learn and code with Elyra, the AI inside Elovayne.",
  openGraph: {
    title: "Elyra | AI Inside Elovayne",
    description: "Talk, create, learn and code with Elyra, the AI inside Elovayne.",
    url: "https://elovayne.com/elyra",
    siteName: "Elovayne",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elyra | AI Inside Elovayne",
    description: "Talk, create, learn and code with Elyra, the AI inside Elovayne.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ElyraLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
