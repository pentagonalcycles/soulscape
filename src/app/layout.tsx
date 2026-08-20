import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Share_Tech_Mono } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
  weight: "400",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#1f3828",
};

export const metadata: Metadata = {
  title: "Elovayne — Where Your Soul Can Rest",
  description:
    "A quiet place where people share stories, support each other, and find comfort in knowing they are not alone.",
  other: {
    "x-app-version": Date.now().toString(),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${inter.variable} ${shareTechMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            // Clear old dark theme setting on first load
            if (localStorage.getItem('elovayne-dark-bg') === 'true') {
              localStorage.removeItem('elovayne-dark-bg');
            }
          } catch(e) {}
        `}} />
      </head>
      <body className="min-h-full flex flex-col text-elovayne-light font-body">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
