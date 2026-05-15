import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const siteDescription =
  "A calmer developer workspace for GitHub activity, focus sessions, searchable notes, and weekly momentum.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Yevora",
  title: {
    default: "Yevora",
    template: "%s | Yevora",
  },
  description: siteDescription,
  keywords: [
    "developer dashboard",
    "github",
    "pomodoro",
    "focus sessions",
    "notes",
    "productivity",
    "today queue",
  ],
  authors: [{ name: "Yevora" }],
  creator: "Yevora",
  publisher: "Yevora",
  category: "productivity",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Yevora",
    title: "Yevora",
    description: siteDescription,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Yevora workspace overview card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yevora",
    description: siteDescription,
    images: ["/twitter-image"],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${jakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
