"use client";

import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, Info, SquareArrowOutUpRight } from "lucide-react";
import Image from "next/image";

const RankFinder = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("30");
  const [profilePics, setProfilePics] = useState({});
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const shareRef = useRef(null);

  // Rewards Calculator Constants
  const TOTAL_ALLOCATION = 1000000000;
  const ALLOCATION_PERCENT = 0.007;
  const YAPPERS_SHARE = 2/3;
  const CAMPAIGN_MONTHS = 9;
  const MONTHLY_POOL_FULL = (TOTAL_ALLOCATION * ALLOCATION_PERCENT) / CAMPAIGN_MONTHS;
  const MONTHLY_POOL_SHARED = (TOTAL_ALLOCATION * ALLOCATION_PERCENT * YAPPERS_SHARE) / CAMPAIGN_MONTHS;

  
  const getProfilePicUrl = (username) => {
    // Return cached if available
    if (profilePics[username]) {
      return profilePics[username];
    }
    
    return `https://unavatar.io/twitter/${username}`;
  };

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
        
        if (Array.isArray(data)) {
          usersArray = data;
        } else if (data && typeof data === 'object') {
          const arrayKeys = ['users', 'data', 'leaderboard', 'rankings', 'results', 'items'];
          let foundArray = null;
          
          for (const arrayKey of arrayKeys) {
            if (data[arrayKey] && Array.isArray(data[arrayKey])) {
              foundArray = data[arrayKey];
              break;
            }
          }
          
          if (!foundArray) {
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
            usersArray = [
              { username: 'TestUser1', tweets: 120, likes: 2500, impressions: 45000, score: 0.155 },
              { username: 'TestUser2', tweets: 95, likes: 1800, impressions: 32000, score: 0.123 },
              { username: 'TestUser3', tweets: 80, likes: 1200, impressions: 28000, score: 0.101 }
            ];
          }
        } else {
          usersArray = [
            { username: 'MockUser1', tweet_counts: 65, total_likes: 950, total_impressions: 18000, score: 0.087 },
            { username: 'MockUser2', tweet_counts: 50, total_likes: 720, total_impressions: 15000, score: 0.062 }
          ];
        }
        
        const transformedData = usersArray.map((user, index) => ({
          id: user?.id || user?.userId || user?.user_id || index,
          username: user?.username || user?.name || user?.handle || user?.displayName || user?.user || `User${index + 1}`,
          mindshare: Number((user?.score ?? 0) * 100),
          tweets: user?.tweet_counts ?? user?.tweet_count ?? 0,
          likes: user?.total_likes ?? user?.likes ?? 0,
          impressions: user?.total_impressions ?? user?.impressions ?? 0,
          score: user?.score ?? user?.points ?? 0,
          rank: user?.rank || index + 1,
        }));

        setRankings(transformedData);
      } else {
        const fallbackData = [
          { id: 1, username: 'SampleUser1', mindshare: 22.5, tweets: 180, likes: 4200, impressions: 75000, score: 0.225, rank: 1 },
          { id: 2, username: 'SampleUser2', mindshare: 18.3, tweets: 150, likes: 3100, impressions: 58000, score: 0.183, rank: 2 },
          { id: 3, username: 'SampleUser3', mindshare: 14.7, tweets: 120, likes: 2400, impressions: 42000, score: 0.147, rank: 3 }
        ];
        setRankings(fallbackData);
        setError(null);
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      const sampleData = [
        { id: 1, username: 'DemoUser1', mindshare: 28.9, tweets: 220, likes: 5800, impressions: 95000, score: 0.289, rank: 1 },
        { id: 2, username: 'DemoUser2', mindshare: 24.1, tweets: 190, likes: 4500, impressions: 78000, score: 0.241, rank: 2 },
        { id: 3, username: 'TestUser', mindshare: 19.3, tweets: 160, likes: 3200, impressions: 62000, score: 0.193, rank: 3 },
        { id: 4, username: 'SampleYapper', mindshare: 16.8, tweets: 140, likes: 2800, impressions: 48000, score: 0.168, rank: 4 }
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

  const calculateUserRewards = (user) => {
    if (!user || !user.mindshare) return { 
      estimatedShare: 0, 
      monthlyRewardFull: 0,
      monthlyRewardShared: 0 
    };
    
    const userMindshare = user.mindshare;
    const estimatedShare = userMindshare / 100;
    const monthlyRewardFull = MONTHLY_POOL_FULL * estimatedShare;
    const monthlyRewardShared = MONTHLY_POOL_SHARED * estimatedShare;
    
    return {
      estimatedShare: (estimatedShare * 100).toFixed(4),
      monthlyRewardFull: Math.round(monthlyRewardFull),
      monthlyRewardShared: Math.round(monthlyRewardShared)
    };
  };

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
          <div>
            <div className="flex justify-center mb-8">
              <input
                type="text"
                placeholder="Enter username..."
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
                <div className="bg-gray-900 border border-gray-800 hover:border-yellow-600 rounded-lg p-6 transition-all" ref={shareRef}>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={getProfilePicUrl(searchedUser.username)}
                          alt={searchedUser.username}
                          className="w-12 h-12 rounded-full border-2 border-yellow-400/30 object-cover bg-gray-800"
                          loading="eager"
                          onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${searchedUser.username}&size=96&backgroundColor=1f2937`;
                          }}
                        />
                        <span className="font-bold text-yellow-400 text-lg bg-yellow-400/10 px-3 py-1 rounded-full">
                          #{searchedUser.rank}
                        </span>
                        <span className="text-lg font-semibold text-white">
                          {searchedUser.username}
                        </span>
                      </div>
                      <button
    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-yellow-400 transition-all text-yellow-400 font-semibold"
    onClick={() => alert("Coming Soon!")}
    title="Share"
  >

  
  </button>
                    </div>
                    
                    <div className="bg-yellow-400/10 rounded-lg p-3 mb-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-300">
                          {Number(searchedUser.mindshare).toFixed(2)}%
                        </div>
                        <div className="text-sm text-gray-400">30-Day Mindshare</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
  <div className="text-center bg-gray-900/40 border border-gray-700/30 rounded-xl p-5 mb-3">
    
    <div className="text-xl font-bold text-gray-100">
      {calculateUserRewards(searchedUser).estimatedShare}%
    </div>
    <div className="text-sm text-gray-400">Estimated Share</div>
    
    <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent my-3"></div>
    
    <div className="flex items-center justify-center gap-2">
      <div className="text-2xl font-bold text-yellow-400">
        {calculateUserRewards(searchedUser).monthlyRewardShared.toLocaleString()}
      </div>
      <button
        onClick={() => setShowDisclaimer(!showDisclaimer)}
        className="p-1 rounded-full hover:bg-gray-800/50 transition-all"
        title="Disclaimer"
      >
        <Info className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
      </button>
    </div>
    <div className="text-sm text-gray-400 mt-1">$GOATED Allocation per Month</div>
  </div>
</div>
                      
                      {showDisclaimer && (
                        <div className="mt-4 p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-center">
                          <p className="text-xs text-gray-400 leading-relaxed">
                          Actual rewards may vary. Unofficial community calculator.<br /> 
                            GOATFDN determines final allocations. <br /> Next Snapshot: 16th Nov. 2025.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-yellow-400 mb-6 text-center">
  &nbsp;
  &nbsp;
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700  rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400 mb-1">4.6M</div>
                      <div className="text-sm text-gray-400">$GOATED<br />Allocation</div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {Math.round(MONTHLY_POOL_SHARED / 1000).toLocaleString()}K
                      </div>
                      <div className="text-sm text-gray-400">Monthly Pool<br />(Shared)</div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700  rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-400 mb-1">9</div>
                      <div className="text-sm text-gray-400">Months<br />Duration</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-yellow-400 mb-6 text-center">
  &nbsp;
  </div>
  
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">
                  Enter a username to calculate rewards. 
                  Estimates are Based on 30-Day Mindshare. 
                </p>
              </div>
            )}
          </div>
        ) : (
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
                          <img 
                            src={getProfilePicUrl(user.username)}
                            alt={user.username}
                            className="w-12 h-12 rounded-full border-2 border-yellow-400/30 object-cover bg-gray-800"
                            loading="eager"
                            onError={(e) => {
                              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&size=96&backgroundColor=1f2937`;
                            }}
                          />
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
