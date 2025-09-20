"use client";

import React, { useState } from "react";

export default function SonicRewardsCalculator() {
  const globalPoolSize = 1800272;
  const regionalPoolSize = 349864;

  const [globalRank, setGlobalRank] = useState("");
  const [region, setRegion] = useState("");
  const [regionalRank, setRegionalRank] = useState("");

  // ---- Global Reward Logic ----
  const calculateGlobalReward = (rank) => {
    if (rank < 1 || rank > 1000) return 0;
    const rank1Reward = Math.round(globalPoolSize * 0.0277); // ~49,868
    if (rank === 1) return rank1Reward;
    if (rank === 1000) return 50;

    const powerLawExponent = 0.8;
    const rawReward = rank1Reward * Math.pow(rank, -powerLawExponent);

    if (rank <= 100) return Math.max(50, Math.round(rawReward * 0.9));
    if (rank <= 500) {
      const middleDecay = 0.5 + (0.4 * Math.pow((501 - rank) / 400, 0.5));
      return Math.max(50, Math.round(rawReward * middleDecay));
    }

    const bottomProgress = (rank - 500) / 500;
    const startReward = rank1Reward * Math.pow(500, -powerLawExponent) * 0.3;
    return Math.max(50, Math.round(startReward * Math.pow(1 - bottomProgress, 2) + 50));
  };

  // ---- Regional Reward Logic ----
  const calculateRegionalReward = (rank) => {
    if (rank < 1 || rank > 100) return 0;
    const topReward = regionalPoolSize * 0.0491;
    const decayRate = 0.9512;
    return Math.round(topReward * Math.pow(decayRate, rank - 1));
  };

  // ---- Format numbers ----
  const formatNumber = (num) => num.toLocaleString();

  // ---- Display values ----
  const globalReward = globalRank ? calculateGlobalReward(Number(globalRank)) : 0;
  const regionalReward = regionalRank
    ? calculateRegionalReward(Number(regionalRank))
    : 0;

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
      color: 'white',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div className="container-premium">
        {/* Header with Logo */}
        <div className="glass-header relative overflow-hidden">
          {/* Local Logo */}
          <div className="absolute top-6 left-6 w-16 h-16">
            <div 
              className="w-full h-full bg-gradient-to-br from-orange-400 to-blue-600 rounded-full items-center justify-center text-2xl font-bold text-white hidden"
              style={{ display: 'none' }}
            >
              S
            </div>
          </div>

          {/* Header Content */}
          <h1 className="text-4xl font-black mb-4 pl-20" style={{
            background: 'linear-gradient(135deg, #fb923c 0%, #f97316 25%, #ea580c 50%, #3b82f6 75%, #1d4ed8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 30px rgba(251, 146, 60, 0.4)'
          }}>
            Sonic Yaps Reward Calculator
          </h1>
          <p className="text-lg opacity-90 pl-20">
            Estimated $S token rewards based on Leaderboard ranking
          </p>
        </div>

        <div className="grid-premium grid-2-cols">
          {/* Global Leaderboard */}
          <div className="glass-card">
            <h2 className="text-2xl font-bold mb-6 text-white/95"> Global Leaderboard</h2>
            <div className="mb-6">
              <label className="block font-semibold mb-2 text-white/85" htmlFor="globalRank">
                Ranks (1-1000)
              </label>
              <input
                type="number"
                id="globalRank"
                className="premium-input"
                placeholder="Enter a rank to check"
                min="1"
                max="1000"
                value={globalRank}
                onChange={(e) => setGlobalRank(e.target.value)}
              />
            </div>
            <div className="reward-display">
              <div className="reward-amount">{formatNumber(globalReward)} S</div>
              <div className="reward-label">
                {globalRank
                  ? `Rank #${globalRank} Global Reward`
                  : "Enter rank 1-1000"}
              </div>
            </div>
          </div>

          {/* Regional Leaderboards */}
          <div className="glass-card">
            <h2 className="text-2xl font-bold mb-6 text-white/95"> Regional Leaderboards</h2>
            <div className="mb-6">
              <label className="block font-semibold mb-2 text-white/85" htmlFor="region">
                Select Region
              </label>
              <select
                id="region"
                className="premium-select"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">Choose region...</option>
                <option value="korean">Korean Yappers</option>
                <option value="mandarin">Mandarin Yappers</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block font-semibold mb-2 text-white/85" htmlFor="regionalRank">
                Ranks (1-100)
              </label>
              <input
                type="number"
                id="regionalRank"
                className="premium-input"
                placeholder="Enter a rank to check"
                min="1"
                max="100"
                value={regionalRank}
                onChange={(e) => setRegionalRank(e.target.value)}
              />
            </div>
            <div className="reward-display">
              <div className="reward-amount">
                {formatNumber(regionalReward)} S
              </div>
              <div className="reward-label">
                {region && regionalRank
                  ? `Rank #${regionalRank} ${
                      region === "korean" ? "Korean" : "Mandarin"
                    } Reward`
                  : "Select region & enter rank"}
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="glass-card mt-10">
          <h2 className="text-2xl font-bold mb-6 text-white/95">Round 1 Distribution Overview</h2>
          <p className="mb-6 opacity-90">
            Total allocation of 2,500,000 S tokens distributed across global and
            regional leaderboards. Rewards are heavily weighted towards top
            performers to recognize quality contributions.
          </p>

          <div className="grid-premium grid-auto-fit">
            <div className="stat-card">
              <div className="stat-number">1,800,272</div>
              <div className="stat-label">Global Pool ($S tokens)</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">1,000</div>
              <div className="stat-label">Global Eligible</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">349,864</div>
              <div className="stat-label">Regional Pool Each</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">48.9%</div>
              <div className="stat-label">Top 100 Share</div>
            </div>
          </div>

          <div className="alert-warning mt-6">
            <strong>⚠️ Disclaimer:</strong> These are estimates based on the
            distribution structure made public. Actual rewards may vary slightly. Sonic Labs
            team members are excluded from rewards.
          </div>
        </div>

        <div className="text-center mt-10 p-6 opacity-70 text-sm border-t border-white/10">
          <p>
            Built for the Sonic community 💚 |{" "}<a 
              href="https://x.com/auriosweb3" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold hover:text-gray-300 transition-colors"
              style={{ color: '#94c182' }}
            >
              auriosweb3
            </a> | Data
            based on Round 1 snapshot (Sept 18, 00:00 UTC)
          </p>
        </div>
      </div>

      <style jsx>{`
        /* No animations needed */
      `}</style>
    </div>
  );
}
