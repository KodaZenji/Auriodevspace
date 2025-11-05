"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { RefreshCw, Info, SquareArrowOutUpRight } from "lucide-react";

const RankFinder = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("30");
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const shareRef = useRef(null); 
  const shareButtonRef = useRef(null);

  // Rewards Calculator Constants
  const TOTAL_ALLOCATION = 1000000000;
  const ALLOCATION_PERCENT = 0.007;
  const YAPPERS_SHARE = 2/3;
  const CAMPAIGN_MONTHS = 9;
  const MONTHLY_POOL_FULL = (TOTAL_ALLOCATION * ALLOCATION_PERCENT) / CAMPAIGN_MONTHS;
  const MONTHLY_POOL_SHARED = (TOTAL_ALLOCATION * ALLOCATION_PERCENT * YAPPERS_SHARE) / CAMPAIGN_MONTHS;

  // Optimized image share with better browser compatibility
  const handleShareImage = useCallback(async () => {
    if (!shareRef.current || !searchedUser) return;
    
    setCapturing(true);

    try {
      // Dynamic import with error handling
      const htmlToImage = await import("html-to-image");
      const toPng = htmlToImage.toPng;

      // Hide elements
      if (shareButtonRef.current) {
        shareButtonRef.current.style.visibility = "hidden";
      }
      const infoButtons = shareRef.current.querySelectorAll("[data-info-button]");
      infoButtons.forEach((btn) => (btn.style.display = "none"));
      setShowDisclaimer(false);

      // Wait for DOM to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Capture with optimized settings
      const dataUrl = await toPng(shareRef.current, {
        cacheBust: true,
        backgroundColor: "#111827",
        pixelRatio: window.devicePixelRatio || 2,
        quality: 0.95,
      });

      // Convert to blob for better compatibility
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      const timestamp = Date.now();
      const filename = `goat-network-${searchedUser.username}-${timestamp}.png`;

      // Try modern Web Share API first (works on mobile)
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], filename, { type: 'image/png' });
          await navigator.share({
            files: [file],
            title: 'My Goat Network Ranking',
            text: `🔥 My Goat Network Reward: #${searchedUser.rank} (${Number(searchedUser.mindshare).toFixed(2)}% Mindshare)`
          });
          return; // Exit if share was successful
        } catch (shareError) {
          console.log('Web Share failed, falling back to download');
        }
      }

      // Fallback: Download using blob URL (better browser compatibility)
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      downloadLink.style.display = "none";
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
      }, 100);

      // Open Twitter after a short delay
      setTimeout(() => {
        const tweetText = `🔥 My Goat Network Reward this Month: #${searchedUser.rank} (${Number(
          searchedUser.mindshare
        ).toFixed(2)}% Mindshare)\nCheck yours 👉 https://auriodevspace.vercel.app/rankfinder`;

        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }, 500);

    } catch (error) {
      console.error("Error capturing image:", error);
      alert("Failed to capture image. Please try again or use a different browser.");
    } finally {
      // Restore hidden elements
      if (shareButtonRef.current) {
        shareButtonRef.current.style.visibility = "visible";
      }
      const infoButtons = shareRef.current?.querySelectorAll("[data-info-button]");
      infoButtons?.forEach((btn) => (btn.style.display = "inline-flex"));
      setCapturing(false);
    }
  }, [searchedUser]);

  // Optimized profile pic URL with proper fallback
  const getProfilePicUrl = useCallback((username) => {
    return `https://unavatar.io/twitter/${username}`;
  }, []);

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
          
          usersArray = foundArray || [];
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
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      setError('Failed to load rankings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "rewards") {
      fetchRankings(activeTab);
    }
  }, [activeTab]);

  // Memoized filtered rankings for performance
  const filteredRankings = useMemo(() => 
    rankings.filter((user) =>
      user.username.toLowerCase().includes(searchUser.toLowerCase())
    ),
    [rankings, searchUser]
  );

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const calculateUserRewards = useCallback((user) => {
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
  }, [MONTHLY_POOL_FULL, MONTHLY_POOL_SHARED]);

  const searchedUser = useMemo(() => 
    searchUser ? filteredRankings[0] : null,
    [searchUser, filteredRankings]
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <img 
            src="/download.jpg" 
            alt="Yappers Logo" 
            width={50} 
            height={50} 
            className="rounded-full"
            loading="eager"
          />
          <span>Goat Network</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 
          className="text-4xl font-bold mb-8"
          style={{ 
            background: 'linear-gradient(45deg, #fbbf24, #f59e0b, #d97706, #fbbf24)',
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Yappers Rank Checker
        </h1>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        {["7", "30", "rewards"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === tab
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-2 border-yellow-400"
                : "bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-yellow-400 border-2 border-gray-700"
            }`}
          >
            {tab === "rewards" ? "Rewards" : `${tab} Days`}
          </button>
        ))}
      </div>

      {activeTab !== "rewards" && (
        <>
          <div className="flex justify-center mb-6">
            <input
              type="text"
              placeholder="Search username..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="px-4 py-3 w-full max-w-md rounded-lg bg-gray-900 border-2 border-gray-700 focus:border-yellow-400 outline-none text-white placeholder-gray-400"
            />
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={() => fetchRankings(activeTab)}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
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
                className="px-4 py-3 w-full max-w-md rounded-lg bg-gray-900 border-2 border-gray-700 focus:border-yellow-400 outline-none text-white placeholder-gray-400"
              />
            </div>

            {searchedUser ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-gray-900 border border-gray-800 hover:border-yellow-600 rounded-lg p-6 transition-all" ref={shareRef}>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://x.com/${searchedUser.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={getProfilePicUrl(searchedUser.username)}
                            alt={searchedUser.username}
                            className="w-12 h-12 rounded-full border-2 border-yellow-400/30 object-cover bg-gray-800"
                            loading="eager"
                            onError={(e) => {
                              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${searchedUser.username}&size=96&backgroundColor=1f2937`;
                            }}
                          />
                        </a>
                        <span className="font-bold text-yellow-400 text-lg bg-yellow-400/10 px-3 py-1 rounded-full">
                          #{searchedUser.rank}
                        </span>
                        <a
                          href={`https://x.com/${searchedUser.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-white hover:text-yellow-200"
                        >
                          {searchedUser.username}
                        </a>
                      </div>
                      <button
                        ref={shareButtonRef}
                        onClick={handleShareImage}
                        disabled={capturing}
                        title="Share on X"
                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-yellow-400 transition-all text-yellow-400 disabled:opacity-50"
                      >
                        <SquareArrowOutUpRight className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="bg-yellow-400/10 rounded-lg p-3 mb-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">
                          {Number(searchedUser.mindshare).toFixed(2)}%
                        </div>
                        <div className="text-sm text-gray-400">30-Day Mindshare</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-center bg-gray-900/40 border border-gray-700/30 rounded-xl p-5 mb-3">
                      <div className="text-lg font-bold text-gray-300">
                        {calculateUserRewards(searchedUser).estimatedShare}%
                      </div>
                      <div className="text-sm text-gray-500">Estimated Share</div>
                      
                      <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent my-3"></div>
                      
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-3xl font-bold text-yellow-300">
                          {calculateUserRewards(searchedUser).monthlyRewardShared.toLocaleString()}
                        </div>
                        <button
                          data-info-button
                          onClick={() => setShowDisclaimer(!showDisclaimer)}
                          className="p-1 rounded-full hover:bg-gray-800/50"
                        >
                          <Info className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">$GOATED Allocation per Month</div>
                      
                      {showDisclaimer && (
                        <div className="mt-4 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                          <p className="text-xs text-gray-400 leading-relaxed">
                            Actual rewards may vary. Unofficial community calculator.<br /> 
                            GOATFDN determines final allocations. <br /> Next Snapshot: 16th Nov. 2025.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400">4.6M</div>
                      <div className="text-sm text-gray-500">$GOATED<br />Allocation</div>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">
                        {Math.round(MONTHLY_POOL_SHARED / 1000).toLocaleString()}K
                      </div>
                      <div className="text-sm text-gray-500">Monthly Pool<br />(Shared)</div>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-400">9</div>
                      <div className="text-sm text-gray-500">Months<br />Duration</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">
                  Enter a username to calculate rewards. 
                  Estimates are based on 30-Day Mindshare. 
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
                      className="bg-gray-900 border border-gray-800 hover:border-yellow-600 p-6 rounded-lg transition-all"
                    >
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <a
                            href={`https://x.com/${user.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-80"
                          >
                            <img
                              src={getProfilePicUrl(user.username)}
                              alt={user.username}
                              className="w-12 h-12 rounded-full border-2 border-yellow-400/30 object-cover bg-gray-800"
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&size=96&backgroundColor=1f2937`;
                              }}
                            />
                          </a>
                          <span className="font-bold text-yellow-400 text-lg bg-yellow-400/10 px-3 py-1 rounded-full">
                            #{user.rank}
                          </span>
                          <a
                            href={`https://x.com/${user.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-white hover:text-yellow-200"
                          >
                            {user.username}
                          </a>
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg">
                    No users found for &quot;{searchUser}&quot;
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">
                  {rankings.length > 0 ? (
                    <>
                      Search for a username above to see detailed metrics
                      <br /><br />
                      eg.{' '}
                      <a 
                        href="https://x.com/auriosweb3" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300"
                      >
                        auriosweb3
                      </a>
                    </>
                  ) : "Loading data..."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RankFinder;
