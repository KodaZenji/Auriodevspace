// UserCard.jsx - Individual User Display Component
import React from "react";
import Avatar from "./Avatar";


const UserCard = React.memo(({ user, showFullStats = false }) => {
 

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-yellow-600 p-6 rounded-lg transition-all hover:bg-gray-800">
      {/* User Header */}
      <div className="flex items-center gap-3 mb-3">
        <a
          href={`https://x.com/${user.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
        >
          {/* Avatar component handles its own loading */}
          <Avatar username={user.username} />
        </a>
        
        <span className="font-bold text-yellow-400 text-lg bg-yellow-400/10 px-3 py-1 rounded-full">
          #{user.rank}
        </span>
        
        <a
          href={`https://x.com/${user.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-white hover:text-yellow-200 transition-colors"
        >
          {user.username}
        </a>
      </div>
      
      {/* Mindshare Display */}
      <div className="bg-yellow-400/10 rounded-lg p-3 mb-3">
        <div className="text-center">
          <div className="text-xl font-bold text-yellow-300">
            {Number(user.mindshare).toFixed(2)}%
          </div>
          <div className="text-sm text-gray-400">Mindshare</div>
        </div>
      </div>

      {/* Conditional Stats - Only show if requested */}
      {showFullStats && (
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
      )}
    </div>
  );
});

export default UserCard;
