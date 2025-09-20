import "../globals.css";

export const metadata = {
  title: "Sonic x Kaito Yapper Rewards Calculator",
  description: "Estimate your S token rewards based on your leaderboard ranking in Round 1 of the Sonic Yapper campaign",
  
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
