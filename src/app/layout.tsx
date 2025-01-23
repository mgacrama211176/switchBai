import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SwitchBai",
  description:
    "Whether you're looking to buy, sell, or trade your Nintendo Switch games, our community is all about connecting gamers and creating a friendly environment—both online and offline. So come on, bai—let's play!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
