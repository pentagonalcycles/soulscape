import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reflection Room | Crochet World",
  description: "A quiet space for journaling, daily prompts, and personal reflection. Write freely in a private, supportive environment.",
  openGraph: { title: "Reflection Room | Crochet World", description: "A quiet space for journaling and personal reflection.", url: "https://elovayne.com/reflection-room", siteName: "Crochet World", type: "website" },
  twitter: { card: "summary", title: "Reflection Room | Crochet World", description: "A quiet space for journaling and reflection." },
  robots: { index: true, follow: true },
};

export default function ReflectionRoomLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
