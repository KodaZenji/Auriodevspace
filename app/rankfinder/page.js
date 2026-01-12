"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import Image from "next/image";
import Avatar from "./components/Avatar";
import UserCard from "./components/UserCard";
import RewardsDisplay from "./components/RewardsDisplay";
import useRankLeaderboard from "./hooks/useRankLeaderboard";


const RankFinder = () => {
  // ============================================
  // CUSTOM HOOK - All data fetching logic! ✨
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

  // ============================================
  // UI STATE
  // ============================================
  const [searchUser, setSearchUser] = useState("");
  const [activeTab, setActiveTab] = useState("30");
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // ============================================
  // EFFECTS
  // ============================================
  
  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab !== "rewards") {
      fetchRankings(activeTab);
    }
  }, [activeTab, fetchRankings]);

  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  // Filter rankings based on search
  const filteredRankings = filterRankings(searchUser);
  const searchedUser = searchUser ? filteredRankings[0] : null;

  // ============================================
  // RENDER
  // ============================================
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
      {/* Header */}
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

      {/* Title */}
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

      {/* Tab Navigation */}
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

      {/* Search & Refresh Controls (for leaderboard tabs) */}
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

          {/* Progress Bar - Shows batch loading progress */}
          {loading && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Loading leaderboard...</span>
                  <span className="text-sm text-yellow-400 font-semibold">
                    {Math.round(loadProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full transition-all duration-300 ease-out"
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

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto">
        {activeTab === "rewards" ? (
          // ============================================
          // REWARDS TAB
          // ============================================
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
          // ============================================
          // LEADERBOARD TAB
          // ============================================
          <>
            {searchUser ? (
              // Search results
              filteredRankings.length > 0 ? (
                <div className="space-y-4">
                  {filteredRankings.slice(0, 20).map((user) => (
                    <UserCard 
                      key={user.id} 
                      user={user} 
                      showFullStats={true} 
                    />
                  ))}
                </div>
              ) : (
                // No results found
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
              // Empty state with example
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">
                  {totalUsers > 0 
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
