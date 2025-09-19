

import React, { useState, useEffect } from 'react';
import {
  calculateGlobalReward,
  calculateRegionalReward,
  formatNumber,
  getRegionDisplayName,
  validateRank,
  distributionStats
} from './sonicCalculator.js';

interface RewardDisplayProps {
  amount: number;
  label: string;
}

const RewardDisplay: React.FC<RewardDisplayProps> = ({ amount, label }) => (
  <div className="reward-display">
    <div className="reward-amount">{formatNumber(amount)} S</div>
    <div className="reward-label">{label}</div>
  </div>
);

interface StatCardProps {
  number: string | number;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ number, label }) => (
  <div className="stat-card">
    <div className="stat-number">{typeof number === 'number' ? formatNumber(number) : number}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const SonicYapperCalculator: React.FC = () => {
  const [globalRank, setGlobalRank] = useState<string>('');
  const [regionalRank, setRegionalRank] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [globalReward, setGlobalReward] = useState<number>(0);
  const [regionalReward, setRegionalReward] = useState<number>(0);

  // Update global reward when rank changes
  useEffect(() => {
    const rank = parseInt(globalRank);
    if (validateRank(rank, 'global')) {
      setGlobalReward(calculateGlobalReward(rank));
    } else {
      setGlobalReward(0);
    }
  }, [globalRank]);

  // Update regional reward when rank or region changes
  useEffect(() => {
    const rank = parseInt(regionalRank);
    if (selectedRegion && validateRank(rank, 'regional')) {
      setRegionalReward(calculateRegionalReward(rank));
    } else {
      setRegionalReward(0);
    }
  }, [regionalRank, selectedRegion]);

  const getGlobalRewardLabel = () => {
    const rank = parseInt(globalRank);
    if (validateRank(rank, 'global')) {
      return `Rank #${rank} Global Reward`;
    }
    return 'Enter rank 1-1000';
  };

  const getRegionalRewardLabel = () => {
    const rank = parseInt(regionalRank);
    if (selectedRegion && validateRank(rank, 'regional')) {
      return `Rank #${rank} ${getRegionDisplayName(selectedRegion)} Reward`;
    }
    return 'Select region & enter rank';
  };

  return (
    <div className="sonic-yaps-reward-calculator">
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .sonic-yaps-reward-calculator {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
          min-height: 100vh;
          color: white;
          padding: 0;
          margin: 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          padding: 40px 20px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 165, 0, 0.3);
          box-shadow: 0 0 30px rgba(255, 165, 0, 0.1);
        }

        .header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #ffa500, #ff8c00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 20px rgba(255, 165, 0, 0.3);
        }

        .header p {
          font-size: 1.1rem;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
        }

        .calculator-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .calculator-grid {
            grid-template-columns: 1fr;
          }
        }

        .calculator-card {
          background: rgba(0, 0, 0, 0.6);
          border-radius: 16px;
          padding: 30px;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 165, 0, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .calculator-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(255, 165, 0, 0.2);
          border-color: rgba(255, 165, 0, 0.4);
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: rgba(255, 255, 255, 0.95);
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.85);
        }

        .input-field {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid rgba(255, 165, 0, 0.3);
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.4);
          color: white;
          font-size: 1rem;
          transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
        }

        .input-field:focus {
          outline: none;
          border-color: #00ff88;
          background: rgba(0, 0, 0, 0.6);
          box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
        }

        .input-field::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .select-field {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid rgba(255, 165, 0, 0.3);
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.4);
          color: white;
          font-size: 1rem;
          cursor: pointer;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .select-field:focus {
          outline: none;
          border-color: #00ff88;
          box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
        }

        .select-field option {
          background: #1a1a1a;
          color: white;
        }

        .reward-display {
    background: rgba(0, 0, 0, 0.6); /* dark translucent background */
    border-radius: 20px;
    padding: 20px;
    text-align: center;
    margin-top: 20px;
    border: 2px solid rgba(255, 165, 0, 0.4); /* subtle orange border */
    box-shadow: 0 0 20px rgba(255, 165, 0, 0.15); /* faint orange glow */
     }

        .reward-amount {
    font-size: 2.5rem;
    font-weight: 800;
    color: white;
    text-shadow: 0 0 10px rgba(255, 165, 0, 0.6);
    }

        .reward-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
          margin-top: 5px;
        }

        .info-section {
          background: rgba(0, 0, 0, 0.4);
          border-radius: 16px;
          padding: 30px;
          margin-top: 40px;
          border: 2px solid rgba(255, 165, 0, 0.2);
        }

        .info-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: rgba(255, 255, 255, 0.95);
        }

        .distribution-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .stat-card {
          background: rgba(0, 0, 0, 0.6);
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          border: 1px solid rgba(255, 165, 0, 0.2);
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-top: 4px;
        }

        .warning {
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 8px;
          padding: 16px;
          margin-top: 20px;
          color: #ffc107;
        }

        .footer {
          text-align: center;
          margin-top: 40px;
          padding: 20px;
          opacity: 0.7;
          font-size: 0.9rem;
          border-top: 1px solid rgba(255, 165, 0, 0.1);
        }

        .signature-accent {
          color: #00ff88;
          font-weight: 600;
        }
      `}</style>

      <div className="container">
        <div className="header">
          <h1> Sonic x Kaito Rewards calculator</h1>
          <p>Estimate your S token rewards based on your leaderboard ranking in Round 1 of the Sonic Yapper campaign</p>
        </div>

        <div className="calculator-grid">
          <div className="calculator-card">
            <h2 className="card-title">🌐 Global Leaderboard</h2>
            <div className="input-group">
              <label className="input-label" htmlFor="globalRank">Your Ranking (1-1000)</label>
              <input 
                type="number" 
                id="globalRank" 
                className="input-field" 
                placeholder="Enter your rank" 
                min="1" 
                max="1000"
                value={globalRank}
                onChange={(e) => setGlobalRank(e.target.value)}
              />
            </div>
            <RewardDisplay 
              amount={globalReward} 
              label={getGlobalRewardLabel()} 
            />
          </div>

          <div className="calculator-card">
            <h2 className="card-title">🌏 Regional Leaderboards</h2>
            <div className="input-group">
              <label className="input-label" htmlFor="region">Select Region</label>
              <select 
                id="region" 
                className="select-field"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <option value="">Choose region...</option>
                <option value="korean">Korean Yappers</option>
                <option value="mandarin">Mandarin Yappers</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="regionalRank">Your Ranking (1-100)</label>
              <input 
                type="number" 
                id="regionalRank" 
                className="input-field" 
                placeholder="Enter your rank" 
                min="1" 
                max="100"
                value={regionalRank}
                onChange={(e) => setRegionalRank(e.target.value)}
              />
            </div>
            <RewardDisplay 
              amount={regionalReward} 
              label={getRegionalRewardLabel()} 
            />
          </div>
        </div>

        <div className="info-section">
          <h2 className="info-title">📊 Round 1 Distribution Overview</h2>
          <p style={{ marginBottom: '20px', opacity: 0.9 }}>
            Total allocation of 2,500,000 S tokens distributed across global and regional leaderboards. 
            Rewards are heavily weighted towards top performers to recognize quality contributions.
          </p>
          
          <div className="distribution-stats">
            <StatCard number={distributionStats.globalPool} label="Global Pool (S tokens)" />
            <StatCard number={distributionStats.globalEligible} label="Global Eligible" />
            <StatCard number={distributionStats.regionalPoolEach} label="Regional Pool Each" />
            <StatCard number={`${distributionStats.topHundredShare}%`} label="Top 100 Share" />
          </div>

          <div className="warning">
            <strong>⚠️ Disclaimer:</strong> These are estimates based on the distribution structure. Actual rewards may vary slightly. Sonic Labs team members are excluded from rewards.
          </div>
        </div>

        <div className="footer">
          <p>Built for the Sonic community 💙 | <span className="signature-accent">Community Calculator</span> | Data based on Round 1 snapshot (Sept 18, 00:00 UTC)</p>
        </div>
      </div>
    </div>
  );
};

export default SonicYapperCalculator;
