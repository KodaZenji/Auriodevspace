import "../globals.css";

export const metadata = {
  title: "Sonic x Kaito Yapper Rewards Calculator",
  description:
    "Estimate your S token rewards based on your leaderboard ranking in Round 1 of the Sonic Yapper campaign",
  icons: {
    icon: '/sonic-labs-logo.png', 
    shortcut: '/sonic-labs-logo.png',
    apple: '/sonic-labs-logo.png',
  }
};

export default function SonicLayout({
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
