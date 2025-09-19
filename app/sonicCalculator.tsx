"use client";

import React, { useState, useEffect } from 'react';

const SonicCalculator: React.FC = () => {
  const [globalRank, setGlobalRank] = useState<string>('');
  const [regionalRank, setRegionalRank] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [globalReward, setGlobalReward] = useState<number>(0);
  const [regionalReward, setRegionalReward] = useState<number>(0);

  // Global distribution data
  const globalPoolSize = 1800272;
  const regionalPoolSize = 349864;

  // Calculate global reward based on rank
  const calculateGlobalReward = (rank: number): number => {
    if (rank < 1 || rank > 1000) return 0;
    
    const rank1Reward = Math.round(globalPoolSize * 0.0277); // 49,868
    
    if (rank === 1) return rank1Reward;
    if (rank === 1000) return 50;
    
    const powerLawExponent = 0.8;
    const rawReward = rank1Reward * Math.pow(rank, -powerLawExponent);
    
    let scaledReward: number;
    
    if (rank <= 100) {
      scaledReward = rawReward * 0.9;
    } else if (rank <= 500) {
      const middleDecay = 0.5 + (0.4 * Math.pow((501 - rank) / 400, 0.5));
      scaledReward = rawReward * middleDecay;
    } else {
      const bottomProgress = (rank - 500) / 500;
      const startReward = rank1Reward * Math.pow(500, -powerLawExponent) * 0.3;
      scaledReward = startReward * Math.pow(1 - bottomProgress, 2) + 50;
    }
    
    return Math.max(50, Math.round(scaledReward));
  };

  // Calculate regional reward based on rank
  const calculateRegionalReward = (rank: number): number => {
    if (rank < 1 || rank > 100) return 0;
    
    const topReward = regionalPoolSize * 0.0491;
    const decayRate = 0.9512;
    
    return Math.round(topReward * Math.pow(decayRate, rank - 1));
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Update global reward when rank changes
  useEffect(() => {
    const rank = parseInt(globalRank);
    if (rank && rank >= 1 && rank <= 1000) {
      setGlobalReward(calculateGlobalReward(rank));
    } else {
      setGlobalReward(0);
    }
  }, [globalRank]);

  // Update regional reward when rank or region changes
  useEffect(() => {
    const rank = parseInt(regionalRank);
    if (selectedRegion && rank && rank >= 1 && rank <= 100) {
      setRegionalReward(calculateRegionalReward(rank));
    } else {
      setRegionalReward(0);
    }
  }, [regionalRank, selectedRegion]);

  const getGlobalRewardLabel = (): string => {
    const rank = parseInt(globalRank);
    if (rank && rank >= 1 && rank <= 1000) {
      return `Rank #${rank} Global Reward`;
    }
    return 'Enter rank 1-1000';
  };

  const getRegionalRewardLabel = (): string => {
    const rank = parseInt(regionalRank);
    if (selectedRegion && rank && rank >= 1 && rank <= 100) {
      const regionName = selectedRegion === 'korean' ? 'Korean' : 'Mandarin';
      return `Rank #${rank} ${regionName} Reward`;
    }
    return 'Select region & enter rank';
  };

  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
      minHeight: '100vh',
      color: 'white',
      margin: 0,
      padding: 0
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          padding: '40px 20px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 165, 0, 0.3)',
          boxShadow: '0 0 30px rgba(255, 165, 0, 0.1)'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #ffa500, #ff8c00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 20px rgba(255, 165, 0, 0.3)'
          }}>
            Test 
          </h1>
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Estimate your S token rewards based on your leaderboard ranking in Round 1 of the Sonic Yapper campaign
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr',
          gap: '30px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '16px',
            padding: '30px',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 165, 0, 0.2)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'rgba(255, 255, 255, 0.95)'
            }}>
              🌐 Global Leaderboard
            </h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.85)'
              }}>
                Your Ranking (1-1000)
              </label>
              <input
                type="number"
                value={globalRank}
                onChange={(e) => setGlobalRank(e.target.value)}
                placeholder="Enter your rank"
                min="1"
                max="1000"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid rgba(255, 165, 0, 0.3)',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: 'white',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00ff88';
                  e.target.style.background = 'rgba(0, 0, 0, 0.6)';
                  e.target.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 165, 0, 0.3)';
                  e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #ffa500, #ff8c00)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              marginTop: '20px',
              boxShadow: '0 10px 30px rgba(255, 165, 0, 0.3)',
              border: '1px solid rgba(0, 255, 136, 0.2)'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                {formatNumber(globalReward)} S
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginTop: '5px'
              }}>
                {getGlobalRewardLabel()}
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '16px',
            padding: '30px',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 165, 0, 0.2)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'rgba(255, 255, 255, 0.95)'
            }}>
              🌏 Regional Leaderboards
            </h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.85)'
              }}>
                Select Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid rgba(255, 165, 0, 0.3)',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00ff88';
                  e.target.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 165, 0, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Choose region...</option>
                <option value="korean" style={{ background: '#1a1a1a', color: 'white' }}>Korean Yappers</option>
                <option value="mandarin" style={{ background: '#1a1a1a', color: 'white' }}>Mandarin Yappers</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: '8px',
                color: 'rgba(255, 255, 255, 0.85)'
              }}>
                Your Ranking (1-100)
              </label>
              <input
                type="number"
                value={regionalRank}
                onChange={(e) => setRegionalRank(e.target.value)}
                placeholder="Enter your rank"
                min="1"
                max="100"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid rgba(255, 165, 0, 0.3)',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: 'white',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00ff88';
                  e.target.style.background = 'rgba(0, 0, 0, 0.6)';
                  e.target.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 165, 0, 0.3)';
                  e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #ffa500, #ff8c00)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              marginTop: '20px',
              boxShadow: '0 10px 30px rgba(255, 165, 0, 0.3)',
              border: '1px solid rgba(0, 255, 136, 0.2)'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                {formatNumber(regionalReward)} S
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginTop: '5px'
              }}>
                {getRegionalRewardLabel()}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '16px',
          padding: '30px',
          marginTop: '40px',
          border: '2px solid rgba(255, 165, 0, 0.2)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '20px',
            color: 'rgba(255, 255, 255, 0.95)'
          }}>
            📊 Round 1 Distribution Overview
          </h2>
          <p style={{ marginBottom: '20px', opacity: 0.9 }}>
            Total allocation of 2,500,000 S tokens distributed across global and regional leaderboards. 
            Rewards are heavily weighted towards top performers to recognize quality contributions.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid rgba(255, 165, 0, 0.2)'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                1,800,272
              </div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.8,
                marginTop: '4px'
              }}>
                Global Pool (S tokens)
              </div>
            </div>
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid rgba(255, 165, 0, 0.2)'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                1,000
              </div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.8,
                marginTop: '4px'
              }}>
                Global Eligible
              </div>
            </div>
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid rgba(255, 165, 0, 0.2)'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                349,864
              </div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.8,
                marginTop: '4px'
              }}>
                Regional Pool Each
              </div>
            </div>
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              border: '1px solid rgba(255, 165, 0, 0.2)'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                48.9%
              </div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.8,
                marginTop: '4px'
              }}>
                Top 100 Share
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '20px',
            color: '#ffc107'
          }}>
            <strong>⚠️ Disclaimer:</strong> These are estimates based on the distribution structure. Actual rewards may vary slightly. Sonic Labs team members are excluded from rewards.
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          padding: '20px',
          opacity: 0.7,
          fontSize: '0.9rem',
          borderTop: '1px solid rgba(255, 165, 0, 0.1)'
        }}>
          <p>
            Built for the Sonic community 💙 | <span style={{ color: '#00ff88', fontWeight: '600' }}>Community Calculator</span> | Data based on Round 1 snapshot (Sept 18, 00:00 UTC)
          </p>
        </div>
      </div>
    </div>
  );
};

export default SonicCalculator;
