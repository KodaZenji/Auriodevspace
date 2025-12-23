import React, { useState } from 'react';
import { Search, RefreshCw, ChevronDown } from 'lucide-react';

const RankNexus = () => {
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [expandedCards, setExpandedCards] = useState({ goat: false, duck: false });
  const [goatDays, setGoatDays] = useState('30');
  const [duckEpoch, setDuckEpoch] = useState('1');

  // Mock data - replace with actual API calls
  const mockGoatData = {
    '7': [
      { rank: 1, username: "wjf110", mindshare: 2.45, tweets: 42, likes: 980, impressions: 17500 },
      { rank: 2, username: "egyptk6", mindshare: 1.89, tweets: 35, likes: 725, impressions: 13500 },
      { rank: 3, username: "Counselor_Ayo", mindshare: 1.65, tweets: 28, likes: 560, impressions: 9800 }
    ],
    '30': [
      { rank: 1, username: "wjf110", mindshare: 2.67, tweets: 180, likes: 4200, impressions: 75000 },
      { rank: 2, username: "egyptk6", mindshare: 2.03, tweets: 150, likes: 3100, impressions: 58000 },
      { rank: 3, username: "Counselor_Ayo", mindshare: 1.86, tweets: 120, likes: 2400, impressions: 42000 }
    ]
  };

  const mockDuckData = {
    '1': [
      { rank: 1, x_username: "wjf110", x_score: 11193, dd_score: 0, user_share: 2.67, usdc_reward: 267.24 },
      { rank: 2, x_username: "egyptk6", x_score: 8500, dd_score: 0, user_share: 2.03, usdc_reward: 168.2 },
      { rank: 3, x_username: "Counselor_Ayo", x_score: 7800, dd_score: 0, user_share: 1.86, usdc_reward: 163.67 }
    ]
  };

  const handleSearch = async () => {
    if (!searchUser.trim()) return;
    
    setLoading(true);
    
    setTimeout(() => {
      const goatUser = mockGoatData[goatDays].find(
        user => user.username.toLowerCase() === searchUser.toLowerCase()
      );
      const duckUser = mockDuckData[duckEpoch].find(
        user => user.x_username.toLowerCase() === searchUser.toLowerCase()
      );
      
      setResults({
        goat: goatUser || { notFound: true },
        duck: duckUser || { notFound: true }
      });
      setLoading(false);
    }, 1000);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const toggleCard = (platform) => {
    setExpandedCards(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const LeaderboardCard = ({ platform, data, platformName, timeSwitch, currentValue, onValueChange, options }) => {
    const isExpanded = expandedCards[platform];
    const isFound = !data?.notFound;
    
    return (
      <div 
        className="bg-slate-800 rounded-lg border mb-3 overflow-hidden transition-all"
        style={{
          border: isFound ? '1px solid rgba(52, 211, 153, 0.5)' : '1px solid rgb(51, 65, 85)'
        }}
      >
        {/* Card Header with Platform Name and Time Switch */}
        <div className="px-3 pt-2 pb-1 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="font-semibold text-xs" style={{
            background: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {platformName}
          </h3>
          {timeSwitch && (
            <div className="flex gap-1">
              {options.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onValueChange(option.value);
                    if (results) {
                      const userData = platform === 'goat' 
                        ? mockGoatData[option.value].find(
                            user => user.username.toLowerCase() === searchUser.toLowerCase()
                          )
                        : mockDuckData[option.value].find(
                            user => user.x_username.toLowerCase() === searchUser.toLowerCase()
                          );
                      setResults({ 
                        ...results, 
                        [platform]: userData || { notFound: true } 
                      });
                    }
                  }}
                  className="px-2 py-0.5 rounded text-xs font-medium transition-all"
                  style={{
                    background: currentValue === option.value 
                      ? 'linear-gradient(135deg, #10b981, #34d399)' 
                      : 'transparent',
                    color: currentValue === option.value ? '#000000' : '#6b7280',
                    border: currentValue === option.value ? 'none' : '1px solid #374151'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 flex items-center justify-between">
          {/* Left: Rank and Username */}
          <div className="flex items-center gap-3 flex-1">
            {isFound ? (
              <>
                <div className="text-xl font-bold text-gray-400 w-6">
                  {data.rank}
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={`https://unavatar.io/twitter/${data.username || data.x_username}`}
                    alt={data.username || data.x_username}
                    className="w-8 h-8 rounded-full object-cover bg-gray-800"
                    style={{ border: '2px solid rgba(52, 211, 153, 0.3)' }}
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${data.username || data.x_username}&size=96&backgroundColor=1f2937`;
                    }}
                  />
                  <span className="text-white font-medium">@{data.username || data.x_username}</span>
                </div>
              </>
            ) : (
              <span className="text-gray-400 font-medium text-sm">Not Found</span>
            )}
          </div>

          {/* Right: Score and Expand */}
          {isFound && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {platform === 'goat' ? (
                  <span className="font-bold text-lg" style={{
                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {data.mindshare.toFixed(2)}%
                  </span>
                ) : (
                  <>
                    <span className="text-blue-400">💎</span>
                    <span className="font-bold text-lg" style={{
                      background: 'linear-gradient(135deg, #10b981, #34d399)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      ${data.usdc_reward.toFixed(2)}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => toggleCard(platform)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && isFound && (
          <div className="border-t border-slate-700 bg-slate-900/50 px-3 py-3">
            <div className="grid grid-cols-3 gap-3">
              {platform === 'goat' ? (
                <>
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <div className="text-gray-400 text-xs mb-1">Tweets</div>
                    <div className="text-white font-bold">{formatNumber(data.tweets)}</div>
                  </div>
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <div className="text-gray-400 text-xs mb-1">Likes</div>
                    <div className="text-white font-bold">{formatNumber(data.likes)}</div>
                  </div>
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <div className="text-gray-400 text-xs mb-1">Impressions</div>
                    <div className="text-white font-bold">{formatNumber(data.impressions)}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <div className="text-gray-400 text-xs mb-1">X Score</div>
                    <div className="text-white font-bold">{data.x_score.toLocaleString()}</div>
                  </div>
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <div className="text-gray-400 text-xs mb-1">DD Score</div>
                    <div className="text-white font-bold">{data.dd_score}</div>
                  </div>
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <div className="text-gray-400 text-xs mb-1">Your Share</div>
                    <div className="text-white font-bold">{data.user_share}%</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            RankNexus
          </h1>
          <p className="text-gray-400">Your Cross-Platform Leaderboard Hub</p>
        </div>

        {/* Search Box */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter X username..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                background: loading ? '#6b7280' : 'linear-gradient(135deg, #10b981, #34d399)',
                color: '#000000'
              }}
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="animate-fade-in">
            <h2 className="text-white font-semibold mb-3 px-2">Search Results</h2>
            <LeaderboardCard 
              platform="goat" 
              data={results.goat} 
              platformName="Goat Network"
              timeSwitch={true}
              currentValue={goatDays}
              onValueChange={setGoatDays}
              options={[
                { value: '7', label: '7d' },
                { value: '30', label: '30d' }
              ]}
            />
            <LeaderboardCard 
              platform="duck" 
              data={results.duck} 
              platformName="DuelDuck"
              timeSwitch={true}
              currentValue={duckEpoch}
              onValueChange={setDuckEpoch}
              options={[
                { value: '1', label: 'Epoch I' }
              ]}
            />
          </div>
        )}

        {/* Initial State */}
        {!results && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-400 text-lg mb-2">
              Search once. Check everywhere.
            </p>
            <p className="text-gray-500 text-sm">
              Enter an X username to see rankings on both platforms
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm pb-8">
          <p>Data syncs every 8 hours • Next update in 04h:38m</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RankNexus;
