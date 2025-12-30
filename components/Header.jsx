export default function Header() {
  return (
    <div className="text-center mb-8">
      <h1 
        className="text-4xl font-bold mb-2"
        style={{
          background: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        RankNexus
      </h1>
      <p className="text-gray-400">Your Cross-Platform Leaderboard Hub</p>
    </div>
  );
}
