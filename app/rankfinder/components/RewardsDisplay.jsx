// components/RewardsDisplay.jsx - Rewards Calculator Display
import React from "react";
import { Info } from "lucide-react";
import Avatar from "./Avatar";

// Rewards Calculator Constants
const TOTAL_ALLOCATION = 1000000000;
const ALLOCATION_PERCENT = 0.007;
const YAPPERS_SHARE = 2/3;
const CAMPAIGN_MONTHS = 9;
const MONTHLY_POOL_FULL = (TOTAL_ALLOCATION * ALLOCATION_PERCENT) / CAMPAIGN_MONTHS;
const MONTHLY_POOL_SHARED = (TOTAL_ALLOCATION * ALLOCATION_PERCENT * YAPPERS_SHARE) / CAMPAIGN_MONTHS;

/**
 * Calculate user rewards based on mindshare
 */
const calculateUserRewards = (user) => {
  if (!user || !user.mindshare) {
    return { 
      estimatedShare: 0, 
      monthlyRewardFull: 0,
      monthlyRewardShared: 0 
    };
  }
  
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

/**
 * RewardsDisplay Component
 * Displays user's estimated rewards based on their mindshare
 */
const RewardsDisplay = ({ user, showDisclaimer, setShowDisclaimer }) => {
  const rewards = calculateUserRewards(user);
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 border border-gray-800 hover:border-yellow-600 rounded-lg p-6 transition-all">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <a
                href={`https://x.com/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                title={`View @${user.username} on X`}
              >
                <Avatar username={user.username} size={48} />
              </a>
              <span className="font-bold text-yellow-400 text-lg bg-yellow-400/10 px-3 py-1 rounded-full">
                #{user.rank}
              </span>
              <a
                href={`https://x.com/${user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative text-lg font-semibold text-white hover:text-yellow-200 transition-colors"
                title={`View @${user.username} on X`}
              >
                {user.username}
              </a>
            </div>
          </div>
          
          <div className="bg-yellow-400/10 rounded-lg p-3 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {Number(user.mindshare).toFixed(2)}%
              </div>
              <div className="text-sm text-gray-400">30-Day Mindshare</div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-center bg-gray-900/40 border border-gray-700/30 rounded-xl p-5 mb-3">
            <div className="text-l font-bold text-gray-300">
              {rewards.estimatedShare}%
            </div>
            <div className="text-sm text-gray-500">Estimated Share</div>
            
            <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent my-3"></div>
            
            <div className="flex items-center justify-center gap-2">
              <div className="text-3xl font-bold text-yellow-300">
                {rewards.monthlyRewardShared.toLocaleString()}
              </div>
              <button
                onClick={() => setShowDisclaimer(!showDisclaimer)}
                className="p-1 rounded-full hover:bg-gray-800/50 transition-all"
                title="Disclaimer"
              >
                <Info className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
              </button>
            </div>
            <div className="text-sm text-gray-500 mt-1">$GOATED Allocation per Month</div>
            
            {showDisclaimer && (
              <div className="mt-4 p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-center">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Actual rewards may vary. Unofficial community calculator.<br /> 
                  GOATFDN determines final allocations. <br /> Next Snapshot: 16th Jan. 2026.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-yellow-400 mb-6 text-center">
          &nbsp;
        </h3>
        
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">3.11M</div>
            <div className="text-sm text-gray-500">$GOATED<br />Allocation</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {Math.round(MONTHLY_POOL_SHARED / 1000).toLocaleString()}K
            </div>
            <div className="text-sm text-gray-500">Monthly Pool<br />(Shared)</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400 mb-1">6</div>
            <div className="text-sm text-gray-500">Months<br />Duration</div>
          </div>
        </div>
        
        <div className="text-xl font-bold text-yellow-400 mb-6 text-center">
          &nbsp;
        </div>
      </div>
    </div>
  );
};

export default RewardsDisplay;
