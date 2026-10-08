import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account | Crochet World",
  description: "Manage your Crochet World account, membership, and purchases.",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
