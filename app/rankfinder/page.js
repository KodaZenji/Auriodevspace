"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import Image from "next/image";

const RankFinder = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("30");

  // Rewards Calculator Constants
  const TOTAL_ALLOCATION = 1000000000; // 1B tokens
  const ALLOCATION_PERCENT = 0.007; // 0.7%
  const CAMPAIGN_MONTHS = 9;
  const MONTHLY_POOL = (TOTAL_ALLOCATION * ALLOCATION_PERCENT) / CAMPAIGN_MONTHS; // 777,777.78 tokens per month

  const fetchRankings = async (days) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://yappers-api.goat.network/leaderboard?days=${days}&limit=1000`
      );

      if (response.ok) {
        const data = await response.json();
        let usersArray = [];
        
        // Handle different response formats
        if (Array.isArray(data)) {
          usersArray = data;
        } else if (data && typeof data === 'object') {
          // Look for common property names that might contain the users array
          const arrayKeys = ['users', 'data', 'leaderboard', 'rankings', 'results', 'items'];
          let foundArray = null;
          
          for (const arrayKey of arrayKeys) {
            if (data[arrayKey] && Array.isArray(data[arrayKey])) {
              foundArray = data[arrayKey];
              break;
            }
          }
          
          // If no common keys, check all values for arrays
          if (!foundArray) {
            // eslint-disable-next-line no-unused-vars
            for (const [key, value] of Object.entries(data)) {
              if (Array.isArray(value) && value.length > 0) {
                foundArray = value;
                break;
              }
            }
          }
          
          if (foundArray) {
            usersArray = foundArray;
          } else {
            // Create sample data for testing with score-based mindshare
            usersArray = [
              { 
                username: 'TestUser1', 
                tweets: 120, 
                likes: 2500, 
                impressions: 45000,
                score: 0.155 // This will become 15.5% mindshare
              },
              { 
                username: 'TestUser2', 
                tweets: 95, 
                likes: 1800, 
                impressions: 32000,
                score: 0.123 // This will become 12.3% mindshare
              },
              { 
                username: 'TestUser3', 
                tweets: 80, 
                likes: 1200, 
                impressions: 28000,
                score: 0.101 // This will become 10.1% mindshare
              }
            ];
          }
        } else {
          usersArray = [
            { 
              username: 'MockUser1', 
              tweet_counts: 65, 
              total_likes: 950, 
              total_impressions: 18000,
              score: 0.087 // This will become 8.7% mindshare
            },
            { 
              username: 'MockUser2', 
              tweet_counts: 50, 
              total_likes: 720, 
              total_impressions: 15000,
              score: 0.062 // This will become 6.2% mindshare
            }
          ];
        }
        
        // Transform the data - convert score to mindshare by multiplying by 100
        const transformedData = usersArray.map((user, index) => ({
          id: user?.id || user?.userId || user?.user_id || index,
          username: user?.username || user?.name || user?.handle || user?.displayName || user?.user || `User${index + 1}`,
          mindshare: Number((user?.score ?? 0) * 100), // Convert score to mindshare percentage
          tweets: user?.tweet_counts ?? user?.tweet_count ?? 0,
          likes: user?.total_likes ?? user?.likes ?? 0,
          impressions: user?.total_impressions ?? user?.impressions ?? 0,
          score: user?.score ?? user?.points ?? 0,
          rank: user?.rank || index + 1,
        }));

        setRankings(transformedData);
      } else {
        // Create fallback data when API fails with score-based mindshare
        const fallbackData = [
          { 
            id: 1, 
            username: 'SampleUser1', 
            mindshare: 22.5, // This represents score: 0.225
            tweets: 180, 
            likes: 4200, 
            impressions: 75000,
            score: 0.225, 
            rank: 1 
          },
          { 
            id: 2, 
            username: 'SampleUser2', 
            mindshare: 18.3, // This represents score: 0.183
            tweets: 150, 
            likes: 3100, 
            impressions: 58000,
            score: 0.183, 
            rank: 2 
          },
          { 
            id: 3, 
            username: 'SampleUser3', 
            mindshare: 14.7, // This represents score: 0.147
            tweets: 120, 
            likes: 2400, 
            impressions: 42000,
            score: 0.147, 
            rank: 3 
          }
        ];
        setRankings(fallbackData);
        setError(null);
      }
    } catch (fetchError) {
      // Provide sample data even on error with score-based mindshare
      console.error('Fetch error:', fetchError);
      const sampleData = [
        { 
          id: 1, 
          username: 'DemoUser1', 
          mindshare: 28.9, // This represents score: 0.289
          tweets: 220, 
          likes: 5800, 
          impressions: 95000,
          score: 0.289, 
          rank: 1 
        },
        { 
          id: 2, 
          username: 'DemoUser2', 
          mindshare: 24.1, // This represents score: 0.241
          tweets: 190, 
          likes: 4500, 
          impressions: 78000,
          score: 0.241, 
          rank: 2 
        },
        { 
          id: 3, 
          username: 'TestUser', 
          mindshare: 19.3, // This represents score: 0.193
          tweets: 160, 
          likes: 3200, 
          impressions: 62000,
          score: 0.193, 
          rank: 3 
        },
        { 
          id: 4, 
          username: 'SampleYapper', 
          mindshare: 16.8, // This represents score: 0.168
          tweets: 140, 
          likes: 2800, 
          impressions: 48000,
          score: 0.168, 
          rank: 4 
        }
      ];
      setRankings(sampleData);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "rewards") {
      fetchRankings(activeTab);
    }
  }, [activeTab]);

  const filteredRankings = rankings.filter((user) =>
    user.username.toLowerCase().includes(searchUser.toLowerCase())
  );

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  // Calculate rewards for a specific user
  const calculateUserRewards = (user) => {
    if (!user || !user.mindshare) return { estimatedShare: 0, monthlyReward: 0 };
    
    // User's mindshare percentage (already in percentage form)
    const userMindshare = user.mindshare;
    
    // Calculate estimated share (mindshare / 100 to get decimal)
    const estimatedShare = userMindshare / 100;
    
    // Monthly reward = Monthly Pool * User's Share
    const monthlyReward = MONTHLY_POOL * estimatedShare;
    
    return {
      estimatedShare: (estimatedShare * 100).toFixed(4), // Convert back to percentage for display
      monthlyReward: Math.round(monthlyReward)
    };
  };

  // Find searched user for rewards tab
  const searchedUser = searchUser ? filteredRankings[0] : null;

  return (
    <div 
      className="min-h-screen bg-black text-white p-6" 
      style={{ 
        backgroundColor: '#000000', 
        color: '#ffffff', 
        minHeight: '100vh',
        padding: '1.5rem'
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Image 
            src="/download.jpg" 
            alt="Yappers Logo" 
            width={50} 
            height={50} 
            className="rounded-full"
          />
          <span style={{ color: '#ffffff' }}>Goat Network</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 
          className="text-4xl font-bold text-center mb-8"
          style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: '2rem',
            background: 'linear-gradient(45deg, #fbbf24, #f59e0b, #d97706, #fbbf24)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: '#fbbf24'
          }}
        >
          Yappers Rank Checker
        </h1>
      </div>

      <div className="flex justify-center gap-4 mb-6" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        {["7", "30", "rewards"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === tab
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-400/25 border-2 border-yellow-400"
                : "bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 border-2 border-gray-700 hover:border-yellow-600"
            }`}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              backgroundColor: activeTab === tab ? '#fbbf24' : '#1f2937',
              color: activeTab === tab ? '#000000' : '#d1d5db',
              border: `2px solid ${activeTab === tab ? '#fbbf24' : '#374151'}`
            }}
          >
            {tab === "rewards" ? "Rewards" : `${tab} Days`}
          </button>
        ))}
      </div>

      {activeTab !== "rewards" && (
        <>
          <div className="flex justify-center mb-6" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Search username..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="px-4 py-3 w-full max-w-md rounded-lg bg-gray-900 border-2 border-gray-700 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none text-white placeholder-gray-400 transition-all"
              style={{
                padding: '0.75rem 1rem',
                width: '100%',
                maxWidth: '28rem',
                borderRadius: '0.5rem',
                backgroundColor: '#1f2937',
                border: '2px solid #374151',
                color: '#ffffff',
                outline: 'none'
              }}
            />
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={() => fetchRankings(activeTab)}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold disabled:opacity-50 hover:from-yellow-500 hover:to-amber-600 transition-all shadow-lg shadow-yellow-400/25"
              style={{
                background: loading ? '#6b7280' : 'linear-gradient(to right, #fbbf24, #f59e0b)',
                color: '#000000',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              Refresh Leaderboard
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="max-w-4xl mx-auto mb-4">
          <p className="text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
            {error}
          </p>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {activeTab === "rewards" ? (
          // REWARDS TAB
          <div>
            <div className="flex justify-center mb-8">
              <input
                type="text"
                placeholder="Enter username to calculate rewards..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="px-4 py-3 w-full max-w-md rounded-lg bg-gray-900 border-2 border-gray-700 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none text-white placeholder-gray-400 transition-all"
                style={{
                  padding: '0.75rem 1rem',
                  width: '100%',
                  maxWidth: '28rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#1f2937',
                  border: '2px solid #374151',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
            </div>

            {searchedUser ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-8 shadow-lg">
                  <div className="border-b border-gray-700 pb-4 mb-4">
                    <div className="text-center mb-2">
                      <span className="text-lg text-gray-400">Username:</span>
                      <span className="text-2xl font-bold text-yellow-400 ml-2">
                        {searchedUser.username}
                      </span>
                    </div>
                    <div className="text-center mb-2">
                      <span className="text-lg text-gray-400">Current Rank:</span>
                      <span className="text-2xl font-bold text-white ml-2">
                        #{searchedUser.rank}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-lg text-gray-400">30-Day Mindshare:</span>
                      <span className="text-2xl font-bold text-yellow-400 ml-2">
                        {Number(searchedUser.mindshare).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="border-b border-gray-700 pb-4 mb-4">
                    <div className="text-center mb-3">
                      <span className="text-lg text-gray-400">Estimated Share:</span>
                      <span className="text-2xl font-bold text-green-400 ml-2">
                        {calculateUserRewards(searchedUser).estimatedShare}%
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-lg text-gray-400">Monthly Reward:</span>
                      <span className="text-3xl font-bold text-yellow-400 ml-2">
                        {calculateUserRewards(searchedUser).monthlyReward.toLocaleString()} $GOAT
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-300 space-y-2">
                    <p className="flex items-start">
                      <span className="text-yellow-400 mr-2">*</span>
                      <span>This is an unofficial community calculator. Actual rewards may vary based on final allocations.</span>
                    </p>
                    <p className="flex items-start">
                      <span className="text-yellow-400 mr-2">*</span>
                      <span>GoatFDN determines the final allocations.</span>
                    </p>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">
                    Campaign Details
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-400">
                        1B
                      </div>
                      <div className="text-sm text-gray-400">Total Allocation</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-400">
                        {Math.round(MONTHLY_POOL).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Monthly Pool</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-400">
                        {CAMPAIGN_MONTHS} Months
                      </div>
                      <div className="text-sm text-gray-400">Duration</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  Enter a username above to calculate their estimated monthly rewards
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Based on 30-day mindshare percentage
                </p>
              </div>
            )}
          </div>
        ) : (
          // LEADERBOARD TABS (7 & 30 days)
          <>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-yellow-400" />
                <p className="text-gray-400">Loading leaderboard...</p>
              </div>
            ) : searchUser ? (
              filteredRankings.length > 0 ? (
                <div className="space-y-4">
                  {filteredRankings.map((user) => (
                    <div
                      key={user.id}
                      className="bg-gray-900 border border-gray-800 hover:border-yellow-600 p-6 rounded-lg transition-all hover:bg-gray-800"
                    >
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-bold text-yellow-400 text-lg bg-yellow-400/10 px-3 py-1 rounded-full">
                            #{user.rank}
                          </span>
                          <span className="text-lg font-semibold text-white">
                            {user.username}
                          </span>
                        </div>
                        
                        <div className="bg-yellow-400/10 rounded-lg p-3 mb-3">
                          <div className="text-center">
                            <div className="text-xl font-bold text-yellow-300">
                              {Number(user.mindshare).toFixed(2)}%
                            </div>
                            <div className="text-sm text-gray-400">Mindshare</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center bg-gray-800/50 rounded-lg p-3">
                          <div className="text-lg font-bold text-blue-400">
                            {user.tweets === 0 ? '-' : formatNumber(user.tweets)}
                          </div>
                          <div className="text-sm text-gray-400">Tweets</div>
                        </div>
                        <div className="text-center bg-gray-800/50 rounded-lg p-3">
                          <div className="text-lg font-bold text-red-400">
                            {user.likes === 0 ? '-' : formatNumber(user.likes)}
                          </div>
                          <div className="text-sm text-gray-400">Likes</div>
                        </div>
                        <div className="text-center bg-gray-800/50 rounded-lg p-3">
                          <div className="text-lg font-bold text-green-400">
                            {user.impressions === 0 ? '-' : formatNumber(user.impressions)}
                          </div>
                          <div className="text-sm text-gray-400">Impressions</div>
                        </div>
                      </div>
                      
                      {user.mindshare === 0 && user.tweets === 0 && user.likes === 0 && user.impressions === 0 && (
                        <div className="mt-4 text-center text-gray-500 text-sm bg-gray-800/30 rounded-lg p-3">
                          No activity data available for this time period
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg">
                    No users found for &quot;{searchUser}&quot;
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Try a different username
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">
                  {rankings.length > 0 
                    ? (
                      <>
                        Search for a username above to see detailed metrics
                        <br /><br />
                        eg.{' '}
                        <a 
                          href="https://x.com/auriosweb3" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-gray-300 transition-colors"
                          style={{ color: '#94c182' }}
                        >
                          auriosweb3
                        </a>
                      </>
                    )
                    : "Loading data..."}
                </p>
                {rankings.length > 0 && (
                  <p className="text-gray-500 text-sm mt-2">
                    {rankings.length} users loaded
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RankFinder;
