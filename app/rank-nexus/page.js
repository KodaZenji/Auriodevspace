'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, ChevronDown } from 'lucide-react';

export default function RankNexus() {
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [expandedCards, setExpandedCards] = useState({ goat: false, duck: false });
  const [goatDays, setGoatDays] = useState('7');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextUpdateIn, setNextUpdateIn] = useState('');

  useEffect(() => {
    if (lastUpdated) {
      const interval = setInterval(() => {
        const now = new Date();
        const lastUpdate = new Date(lastUpdated);
        const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
        const hoursUntilNext = 24 - (hoursSinceUpdate % 24);
        const minutesUntilNext = Math.floor((hoursUntilNext % 1) * 60);
        setNextUpdateIn(`${Math.floor(hoursUntilNext)}h:${minutesUntilNext.toString().padStart(2, '0')}m`);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [lastUpdated]);

  const handleSearch = async () => {
    if (!searchUser.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/leaderboards?days=${goatDays}`);
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }
      
      setLastUpdated(data.yappers.last_updated);
      
      const goatUser = data.yappers.data.find(
        user => user.username.toLowerCase() === searchUser.toLowerCase().replace('@', '')
      );
      
      const duckUser = data.duelduck.data.find(
        user => user.x_username.toLowerCase() === searchUser.toLowerCase().replace('@', '')
      );
      
      setResults({
        goat: goatUser ? {
          rank: goatUser.rank,
          username: goatUser.username,
          mindshare: goatUser.mindshare * 100,
          tweets: goatUser.tweet_counts,
          likes: goatUser.total_likes,
          impressions: goatUser.total_impressions,
          score: goatUser.score
        } : { notFound: true },
        duck: duckUser ? {
          rank: data.duelduck.data.indexOf(duckUser) + 1,
          x_username: duckUser.x_username,
          x_score: duckUser.x_score,
          dd_score: duckUser.dd_score,
          user_share: duckUser.user_share,
          usdc_reward: duckUser.usdc_reward,
          total_score: duckUser.total_score
        } : { notFound: true }
      });
    } catch (error) {
      console.error('Error searching:', error);
      alert('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
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
        className="bg-slate-800 rounded-lg mb-3 overflow-hidden transition-all"
        style={{
          border: isFound ? '1px solid rgba(52, 211, 153, 0.5)' : '1px solid rgb(51, 65, 85)'
        }}
      >
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
                    if (searchUser.trim()) {
                      handleSearch();
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
                    {data.mindshare?.toFixed(2)}%
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
                      ${data.usdc_reward?.toFixed(2)}
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
                    <div className="text-white font-bold">{data.x_score?.toLocaleString()}</div>
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
                { value: '1', label: '1d' },
                { value: '7', label: '7d' },
                { value: '30', label: '30d' }
              ]}
            />
            <LeaderboardCard 
              platform="duck" 
              data={results.duck} 
              platformName="DuelDuck"
              timeSwitch={false}
            />
          </div>
        )}

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

        <div className="mt-8 text-center text-gray-500 text-sm pb-8">
          <p>
            {nextUpdateIn 
              ? `Data syncs daily at 8 AM UTC • Next update in ${nextUpdateIn}`
              : 'Data syncs daily at 8 AM UTC'}
          </p>
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
      `}</style>
    </div>
  );
}
