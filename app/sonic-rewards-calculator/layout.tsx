import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sonic x Kaito Yapper Rewards Calculator",
  description: "Estimate your S token rewards based on your leaderboard ranking in Round 1 of the Sonic Yapper campaign",
  icons: {
  icon: '/sonic-labs-logo.png', 
    shortcut: '/sonic-labs-logo.png',
    apple: '/sonic-labs-logo.png',
 } 
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
