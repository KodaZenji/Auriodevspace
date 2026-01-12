"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import UserCard from "./components/UserCard";
import RewardsDisplay from "./components/RewardsDisplay";
import useRankLeaderboard from "./hooks/useRankLeaderboard";

const RankFinder = () => {
  // ============================================
  // CUSTOM HOOK - All data fetching logic moved here! ✨
  // ============================================
  const {
    rankings,
    loading,
    loadProgress,
    error,
    fetchRankings,
    filterRankings,
    totalUsers,
  } = useRankLeaderboard();

  // UI State
  const [searchUser, setSearchUser] = useState("");
  const [activeTab, setActiveTab] = useState("30");
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab !== "rewards") {
      fetchRankings(activeTab);
    }
  }, [activeTab, fetchRankings]);

  // Filter based on search
  const filteredRankings = filterRankings(searchUser);
  const searchedUser = searchUser ? filteredRankings[0] : null;

  // ============================================
  // RENDER - Much cleaner now! 🎉
  // ============================================
  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500" />
          <span>Goat Network</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
        Yappers Rank Checker
      </h1>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        {["7", "30", "rewards"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === tab
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                : "bg-gray-900 text-gray-300 hover:bg-gray-800"
            }`}
          >
            {tab === "rewards" ? "Rewards" : `${tab} Days`}
          </button>
        ))}
      </div>

      {/* Search & Refresh (for leaderboard tabs) */}
      {activeTab !== "rewards" && (
        <>
          <div className="flex justify-center mb-6">
            <input
              type="text"
              placeholder="Search username..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="px-4 py-3 w-full max-w-md rounded-lg bg-gray-900 border-2 border-gray-700 focus:border-yellow-400 outline-none text-white"
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

          {/* Progress Bar */}
          {loading && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Loading...</span>
                  <span className="text-sm text-yellow-400">{Math.round(loadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="max-w-4xl mx-auto mb-4">
          <p className="text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
            {error}
          </p>
        </div>
      )}

      {/* Content Area */}
      <div className="max-w-6xl mx-auto">
        {activeTab === "rewards" ? (
          <div>
            <div className="flex justify-center mb-8">
              <input
                type="text"
                placeholder="Enter username..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="px-4 py-3 w-full max-w-md rounded-lg bg-gray-900 border-2 border-gray-700 focus:border-yellow-400 outline-none text-white"
              />
            </div>

            {searchedUser ? (
              <RewardsDisplay 
                user={searchedUser}
                showDisclaimer={showDisclaimer}
                setShowDisclaimer={setShowDisclaimer}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">
                  Enter a username to calculate rewards based on 30-Day Mindshare.
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {searchUser ? (
              filteredRankings.length > 0 ? (
                <div className="space-y-4">
                  {filteredRankings.slice(0, 20).map((user) => (
                    <UserCard key={user.id} user={user} showFullStats={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No users found for "{searchUser}"</p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">
                  Search for a username above to see detailed metrics
                </p>
                {totalUsers > 0 && (
                  <p className="text-gray-500 text-sm mt-2">
                    {totalUsers} users loaded
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
