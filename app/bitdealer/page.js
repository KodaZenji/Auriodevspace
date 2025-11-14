"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, TrendingUp, Award, Info, Share2, ExternalLink, AlertCircle } from "lucide-react";
import Image from "next/image";

const BitdealerRewardChecker = () => {
  const [rankings7d, setRankings7d] = useState([]);
  const [rankings30d, setRankings30d] = useState([]);
  const [rankings3m, setRankings3m] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("search");
  const [activeDuration, setActiveDuration] = useState("30d");
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const shareRef = useRef(null);

  const [isPressed, setIsPressed] = useState(false);


  // Reward Constants
  const TOTAL_YAPPERS_POOL = 5500000; // 0.55% of 1B supply
  const LISTING_PRICE = 0.035;

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/leaderboard");
      const data = await response.json();

      console.log("API Response:", data);

      // Set all three duration datasets
      setRankings7d(Array.isArray(data.data?.["7d"]) ? data.data["7d"] : []);
      setRankings30d(Array.isArray(data.data?.["30d"]) ? data.data["30d"] : []);
      setRankings3m(Array.isArray(data.data?.["3m"]) ? data.data["3m"] : []);

      console.log("Rankings loaded:", {
        "7d": data.data?.["7d"]?.length || 0,
        "30d": data.data?.["30d"]?.length || 0,
        "3m": data.data?.["3m"]?.length || 0
      });
    } catch (error) {
      console.error("Error fetching rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  // Get current rankings based on selected duration
  const getCurrentRankings = () => {
    switch (activeDuration) {
      case "7d":
        return rankings7d;
      case "30d":
        return rankings30d;
      case "3m":
        return rankings3m;
      default:
        return rankings30d;
    }
  };

  const currentRankings = getCurrentRankings();

  const findUser = (username) => {
    const query = username.toLowerCase().replace('@', '').trim();
    return currentRankings.find(u => u.username?.toLowerCase().trim() === query);
  };

  const calculateRewards = (mindshare) => {
    if (!mindshare || mindshare === 0) return { tokens: 0, usd: 0 };
    const tokens = (mindshare / 100) * TOTAL_YAPPERS_POOL;
    const usd = tokens * LISTING_PRICE;
    return { tokens: Math.round(tokens), usd: usd.toFixed(2) };
  };

  const searchedUser = searchQuery ? findUser(searchQuery) : null;
  const rewards = searchedUser ? calculateRewards(searchedUser.mindshare) : null;

  const durationLabels = {
    "7d": "7 Days",
    "30d": "30 Days",
    "3m": "3 Months"
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      {/* Header */}
      <div className="max-w-4xl w-full mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <img
              src="/bitdealer-logo.png"
              alt="Bitdealer Logo"
              className="w-12 h-12 rounded-xl"
            />
            <p className="text-sm text-gray-500">Bitdealer</p>
          </div>
        </div>
        <div className="flex justify-center">
          <p
            className="text-3xl font-bold bg-gradient-to-r from-[#3a0010] via-[#7a001d] to-[#e60026] 
               bg-clip-text text-transparent outline-red"
          >
            Yapper Stats
          </p>
        </div>


        <div style={{ marginBottom: '2rem' }}>&nbsp;</div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10">
          <button
            onClick={() => setActiveView("search")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${activeView === "search"
              ? "bg-gradient-to-r from-maroon-600 to-red-500 text-white border border-red-500"
              : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
              }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Search
          </button>
          <button
            onClick={() => setActiveView("leaderboard")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${activeView === "leaderboard"
              ? "bg-gradient-to-r from-maroon-500 to-red-500 text-white border border-red-500"
              : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
              }`}
          >
            < div className="w-4 h-4 inline mr-2" />
            Top 100
          </button>
          <button
            onClick={() => setActiveView("rewards")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${activeView === "rewards"
              ? "bg-gradient-to-r from-maroon-500 to-red-500 text-white border border-red-500"
              : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
              }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Rewards
          </button>
        </div>

        {/* Duration Selector */}
        <div className="flex gap-2 mb-10">
          {["7d", "30d", "3m"].map((duration) => (
            <button
              key={duration}
              onClick={() => setActiveDuration(duration)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeDuration === duration
                ? "bg-gradient-to-r from-black-500 to-purple-500 text-white border border-purple-500"
                : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
                }`}
            >
              {durationLabels[duration]}
            </button>
          ))}
        </div>

        {/* Search Input */}
        {(activeView === "search" || activeView === "rewards") && (
          <div className="relative mb-10">
            <div className="text-center top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Enter username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all"
            />
          </div>
        )}

        {/* Data Status */}
        {!loading && currentRankings.length > 0 && (
          <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-800/30 rounded-xl p-4 mb-8">
            <div className="text-sm text-gray-500">
              <p className="text-gray-600">
                • Loaded: {currentRankings.length} users ({durationLabels[activeDuration]} data)<br />
                {searchQuery && searchedUser && (
                  <>• Found: Rank #{searchedUser.rank}</>
                )}
                {searchQuery && !searchedUser && (
                  <>• "{searchQuery}" not found in top 100</>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading rankings...</p>
          </div>
        ) : activeView === "leaderboard" ? (
          <div className="space-y-3">
            <h2 className="text-xl font-sm text mb-4 bg-gray-900 border border-gray-800">&nbsp;</h2>
            {currentRankings.map((user) => (
              <div
                key={user.id}
                className="
    bg-gradient-to-br from-gray-900 to-gray-950 
    border border-gray-800 
    hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20
    active:border-purple-400 active:shadow-lg active:shadow-purple-500/20
    rounded-xl p-4 transition-all duration-300 cursor-pointer
    active:scale-[0.98]
  "
                onClick={() => {
                  setSearchQuery(user.username);
                  setActiveView("search");
                }}
              >

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-800/10 rounded-full group-hover:bg-purple-600/20 transition-colors">

                      <span className="text-gray-400 font-bold text-sm group-hover:text-purple-400 transition-colors">#{user.rank}</span>
                    </div>
                    <img
                      src={`https://unavatar.io/twitter/${user.username}`}
                      alt={user.username}
                      className="w-10 h-10 rounded-full border border-gray-700 group-hover:border-purple-500 transition-colors"
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`;
                      }}
                    />
                    <div>
                      <div className="font-semibold text-gray-400 group-hover:text-purple-200 transition-colors">{user.username}</div>
                      <div className="text-xs text-gray-500">{user.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-400">{user.mindshare.toFixed(2)}%</div>
                    <div className="text-xs text-gray-500">Mindshare</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeView === "search" && searchQuery && searchedUser ? (
          <div className="space-y-6">
            {/* User Profile */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6">
              <a
                href={`https://x.com/${searchedUser.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 mb-6 hover:opacity-90 transition"
              >
                <img
                  src={`https://unavatar.io/twitter/${searchedUser.username}`}
                  alt={searchedUser.username}
                  className="w-16 h-16 rounded-full border-2 border-red-600/30"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${searchedUser.username}`;
                  }}
                />

                <div>
                  <h2 className="text-xl font-bold text-gray-400 hover:text-white transition">
                    {searchedUser.username}
                  </h2>
                  <p className="text-sm text-gray-400">Rank #{searchedUser.rank}</p>
                </div>
              </a>

              {/* Mindshare Display */}
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-800/30 rounded-xl p-6 mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">
                    {durationLabels[activeDuration]} Mindshare
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                    {searchedUser.mindshare.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>




            {/* Rewards Calculation */}
            {rewards && (
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-800/30 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-300">Estimated Rewards</h3>
                  <button
                    onClick={() => setShowDisclaimer(!showDisclaimer)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>

                {showDisclaimer && (

                  <div className="mt-8 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6">
                    <div className="space-y-3 text-sm text-gray-400">
                      <p>• <span className="text-emerald-500">0.55%</span> of total supply (5.5M BIT) allocated to top 500 yappers</p>
                      <p>• <span className="text-purple-400">Listing price:</span> $0.035 per BIT</p>
                      <p>• <span className="text-blue-400">LB ranking source:</span> Gomtu API (7-day, 30-day, 3-month top 100 rolling)</p>
                      <p>• Estimates based on current mindshare percentage</p>
                      <p>• Onchain activity not tracked</p>
                      <p>• Bitdealer team and Kaito determines final allocations</p>
                    </div>
                  </div>



                )}

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">{durationLabels[activeDuration]} Mindshare</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                      {searchedUser.mindshare.toFixed(2)}%
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">BIT Tokens</div>
                    <div className="text-2xl font-bold text-white">
                      {rewards.tokens.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Value at Listing ($0.035)</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      ${rewards.usd}
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-2">Potential at 5x ($0.175)</div>
                    <div className="text-xl font-bold text-purple-400">
                      ${(rewards.usd * 5).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeView === "search" && searchQuery && !searchedUser ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              "@{searchQuery}" was not found in the top 100 yappers for {durationLabels[activeDuration].toLowerCase()}.
            </p>
            <p className="text-sm text-gray-500">
              Make sure the username is correct and check the Top 100 tab to see ranked users.
            </p>
          </div>
        ) : activeView === "rewards" && searchQuery && searchedUser ? (
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-8" ref={shareRef}>
            <div className="text-center mb-8">
              <img
                src={`https://unavatar.io/twitter/${searchedUser.username}`}
                alt={searchedUser.username}
                className="w-20 h-20 rounded-full border-4 border-emerald-500/20 mx-auto mb-4"
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${searchedUser.username}`;
                }}
              />
              <h2 className="text-2xl font-bold text-gray-400 mb-1">{searchedUser.username}</h2>
              <p className="text-gray-400">Rank #{searchedUser.rank} • {durationLabels[activeDuration]} Mindshare</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-800/30 rounded-xl p-6 mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-rose-600 via-red-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  {rewards?.tokens.toLocaleString() || '—'}
                </div>
                <div className="text-sm text-gray-400 mb-4">$BIT</div>
                <div className="text-2xl font-bold text-emerald-300 mb-1">
                  ${rewards?.usd || '—'}
                </div>
                <div className="text-xs text-gray-500">At Listing Price</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-emerald-400">{searchedUser.mindshare.toFixed(2)}%</div>
                <div className="text-xs text-gray-500">{durationLabels[activeDuration]} Mindshare</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-blue-400">5.5M</div>
                <div className="text-xs text-gray-500">Total Pool</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`My estimated Bitdealer kaito yapper airdrop: ${rewards?.tokens.toLocaleString()} BIT ($${rewards?.usd}) 🎮\n\nCheck yours 👇\nhttps://auriodevspace.vercel.app/bitdealer`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                <Share2 className="w-6 h-6" />
                Share on X
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {activeView === "search"
                ? "Enter a username to view their mindshare stats"
                : "Enter a username to calculate rewards"}
            </p>
          </div>
        )}
        <div style={{ marginBottom: '2rem' }}>&nbsp;</div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm italic mt-12">
          <p>
            Made By {' '}
            <a
              href="https://x.com/auriosweb3"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#94c182',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Aurio
            </a>
          </p>
         </div>
      </div>
    </div>
  );
};

export default BitdealerRewardChecker;