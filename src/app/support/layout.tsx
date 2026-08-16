import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | Elovayne",
  description: "Get help with Elovayne. Report problems, ask questions, or reach out for technical support.",
  openGraph: { title: "Support | Elovayne", description: "Get help with Elovayne.", url: "https://elovayne.com/support", siteName: "Elovayne", type: "website" },
  twitter: { card: "summary", title: "Support | Elovayne", description: "Get help with Elovayne." },
  robots: { index: true, follow: true },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
