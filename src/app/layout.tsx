import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = "https://switchbai.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Nintendo Switch games",
    "second-hand games",
    "game rentals",
    "buy Switch games",
    "sell Switch games",
    "trade Switch games",
    "Nintendo Switch Cebu",
    "game marketplace Philippines",
    "Switch game rentals",
    "pre-owned games",
    "affordable Switch games",
    "game trading",
    "Cebu City games",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "Gaming",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: "/open-graph.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Your trusted source for quality second-hand Nintendo Switch games and rentals`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/open-graph.png"],
    creator: "@switchbai",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} pt-24`}>{children}</body>
    </html>
  );
}
