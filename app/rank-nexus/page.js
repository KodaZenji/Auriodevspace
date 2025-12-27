'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, ChevronDown } from 'lucide-react';

export default function RankNexus() {
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [expandedCards, setExpandedCards] = useState({ goat: false, duck: false, adi: false, elsa: false });
  const [goatDays, setGoatDays] = useState('30');
  const [elsaPeriod, setElsaPeriod] = useState('7d');
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
      const response = await fetch(`/api/leaderboards?days=${goatDays}&elsaPeriod=${elsaPeriod}`);
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
      
      const adiUser = data.adichain.data.find(
        user => user.handle.toLowerCase() === searchUser.toLowerCase().replace('@', '')
      );
      
      const elsaUser = data.heyelsa.data.find(
        user => user.username.toLowerCase() === searchUser.toLowerCase().replace('@', '')
      );
      
      if (!goatUser && !duckUser && !adiUser && !elsaUser) {
        alert(`User @${searchUser} not found on any leaderboard`);
        setResults(null);
        setLoading(false);
        return;
      }

      setResults({
        username: searchUser.replace('@', ''),
        foundOn: {
          goat: !!goatUser,
          duck: !!duckUser,
          adi: !!adiUser,
          elsa: !!elsaUser
        },
        goat: goatUser ? {
          rank: goatUser.rank,
          username: goatUser.username,
          mindshare: goatUser.mindshare * 100,
          tweets: goatUser.tweet_counts,
          likes: goatUser.total_likes,
          impressions: goatUser.total_impressions,
          score: goatUser.score
        } : null,
        duck: duckUser ? {
          rank: data.duelduck.data.indexOf(duckUser) + 1,
          x_username: duckUser.x_username,
          x_score: duckUser.x_score,
          dd_score: duckUser.dd_score,
          user_share: duckUser.user_share,
          usdc_reward: duckUser.usdc_reward,
          total_score: duckUser.total_score
        } : null,
        adi: adiUser ? {
          rank: adiUser.rank_total,
          handle: adiUser.handle,
          total_points: adiUser.total_points,
          signal_points: adiUser.signal_points,
          noise_points: adiUser.noise_points,
          rank_change: adiUser.rank_change
        } : null,
        elsa: elsaUser ? {
          rank: elsaUser.position,
          username: elsaUser.username,
          mindshare_percentage: elsaUser.mindshare_percentage,
          position_change: elsaUser.position_change,
          app_use_multiplier: elsaUser.app_use_multiplier,
          score: elsaUser.score
        } : null
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

  const LeaderboardCard = ({ platform, data, platformName, timeSwitch, currentValue, onValueChange, options, showAvatar, username }) => {
    const isExpanded = expandedCards[platform];
    
    return (
      <div 
        className="bg-slate-800 rounded-lg mb-3 overflow-hidden transition-all"
        style={{ border: '1px solid rgba(52, 211, 153, 0.5)' }}
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
          {showAvatar ? (
            <div className="flex items-center gap-3 flex-1">
              <img
                src={`https://unavatar.io/twitter/${username}`}
                alt={username}
                className="w-10 h-10 rounded-full object-cover bg-gray-800"
                style={{ border: '2px solid rgba(52, 211, 153, 0.3)' }}
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${username}&size=96&backgroundColor=1f2937`;
                }}
              />
              <div>
                <div className="text-white font-medium">{username}</div>
                <div className="text-gray-400 text-xs">Rank: {data.rank}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl font-bold" style={{
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {data.rank}
              </div>
              <div className="text-gray-400 text-sm">Rank</div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {platform === 'goat' ? (
              <div className="text-right">
                <div className="text-xs text-gray-400">Mindshare</div>
                <div className="font-bold text-lg" style={{
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {data.mindshare?.toFixed(2)}%
                </div>
              </div>
            ) : platform === 'duck' ? (
              <div className="text-right">
                <div className="text-xs text-gray-400">USDC Reward</div>
                <div className="font-bold text-lg flex items-center gap-1" style={{
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  <span className="text-blue-400">💎</span>
                  ${data.usdc_reward?.toFixed(2)}
                </div>
              </div>
            ) : platform === 'adi' ? (
              <div className="text-right">
                <div className="text-xs text-gray-400">Xeets</div>
                <div className="font-bold text-lg" style={{
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {data.total_points?.toFixed(2)}
                </div>
              </div>
            ) : (
              <div className="text-right">
                <div className="text-xs text-gray-400">Mindshare</div>
                <div className="font-bold text-lg" style={{
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {data.mindshare_percentage?.toFixed(2)}%
                </div>
              </div>
            )}
            <button
              onClick={() => toggleCard(platform)}
              className="text-gray-400 hover:text-white transition-colors ml-2"
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {isExpanded && (
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
              ) : platform === 'duck' ? (
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
                    <div className="text-gray-400 text-xs mb-1">Share</div>
                    <div className="text-white font-bold">{data.user_share}%</div>
                  </div>
                </>
              ) : platform === 'adi' ? (
                <>
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <div className="text-gray-400 text-xs mb-1">Rank Change</div>
                    <div className="text-white font-bold">{data.rank_change || 0}</div>
                  </div>
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <div className="text-gray-400 text-xs mb-1">Signal</div>
                    <div className="text-white font-bold">{formatNumber(data.signal_points)}</div>
                  </div>
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <div className="text-gray-400 text-xs mb-1">Noise</div>
                    <div className="text-white font-bold">{formatNumber(data.noise_points)}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <div className="text-gray-400 text-xs mb-1">Rank Change</div>
                    <div className="text-white font-bold">{data.position_change || 0}</div>
                  </div>
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <div className="text-gray-400 text-xs mb-1">Multiplier</div>
                    <div className="text-white font-bold">{data.app_use_multiplier?.toFixed(2)}</div>
                  </div>
                  <div className="text-center bg-slate-800/50 rounded-lg p-2">
                    <div className="text-gray-400 text-xs mb-1">X Score</div>
                    <div className="text-white font-bold">{formatNumber(data.score)}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const countFoundPlatforms = () => {
    if (!results) return 0;
    let count = 0;
    if (results.foundOn.goat) count++;
    if (results.foundOn.duck) count++;
    if (results.foundOn.adi) count++;
    if (results.foundOn.elsa) count++;
    return count;
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
            {countFoundPlatforms() >= 2 && (
              <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700 text-center">
                <img
                  src={`https://unavatar.io/twitter/${results.username}`}
                  alt={results.username}
                  className="w-16 h-16 rounded-full mx-auto mb-3 border-4"
                  style={{ borderColor: 'rgba(52, 211, 153, 0.5)' }}
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${results.username}&size=160&backgroundColor=1f2937`;
                  }}
                />
                <h2 className="text-xl font-bold text-white">{results.username}</h2>
              </div>
            )}

            {results.goat && (
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
                showAvatar={countFoundPlatforms() === 1}
                username={results.username}
              />
            )}
            
            {results.duck && (
              <LeaderboardCard 
                platform="duck" 
                data={results.duck} 
                platformName="DuelDuck"
                timeSwitch={false}
                showAvatar={countFoundPlatforms() === 1}
                username={results.username}
              />
            )}

            {results.adi && (
              <LeaderboardCard 
                platform="adi" 
                data={results.adi} 
                platformName="Adichain"
                timeSwitch={false}
                showAvatar={countFoundPlatforms() === 1}
                username={results.username}
              />
            )}

            {results.elsa && (
              <LeaderboardCard 
                platform="elsa" 
                data={results.elsa} 
                platformName="HeyElsa"
                timeSwitch={true}
                currentValue={elsaPeriod}
                onValueChange={setElsaPeriod}
                options={[
                  { value: 'epoch-2', label: 'E2' },
                  { value: '7d', label: '7d' },
                  { value: '30d', label: '30d' }
                ]}
                showAvatar={countFoundPlatforms() === 1}
                username={results.username}
              />
            )}
          </div>
        )}

        {!results && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-2">
              Search once. Check everywhere.
            </p>
            <p className="text-gray-500 text-sm">
              Enter an X username to see rankings on available platforms
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
