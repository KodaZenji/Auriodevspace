import { ChevronDown } from 'lucide-react';

export default function LeaderboardCard({ 
  platform, 
  data, 
  platformName, 
  timeSwitch, 
  currentValue, 
  onValueChange, 
  options, 
  showAvatar, 
  username,
  isExpanded,
  onToggle,
  onTimeChange
}) {
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const renderMetrics = () => {
    switch(platform) {
      case 'goat':
        return (
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
        );
      case 'duck':
        return (
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
        );
      case 'adi':
        return (
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
        );
      case 'perceptron':
        return (
          <>
            <div className="text-center bg-slate-800/50 rounded-lg p-2">
              <div className="text-gray-400 text-xs mb-1">Rank Change</div>
              <div className="text-white font-bold">{data.rankdelta}</div>
            </div>
            <div className="text-center bg-slate-800/50 rounded-lg p-2">
              <div className="text-gray-400 text-xs mb-1"></div>
              <div className="text-white font-bold"></div>
            </div>
            <div className="text-center bg-slate-800/50 rounded-lg p-2">
              <div className="text-gray-400 text-xs mb-1">KOL Score</div>
              <div className="text-white font-bold">{data.kolscore}</div>
            </div>
          </>
        );
      case 'elsa':
        return (
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
        );
      default:
        return null;
    }
  };

  const renderPrimaryMetric = () => {
    switch(platform) {
      case 'goat':
        return (
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
        );
      case 'duck':
        return (
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
        );
      case 'adi':
        return (
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
        );
      case 'perceptron':
        return (
          <div className="text-right">
            <div className="text-xs text-gray-400">MindoMetric</div>
            <div className="font-bold text-lg" style={{
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {data.mindometric}%
            </div>
          </div>
        );
      case 'elsa':
        return (
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
        );
      default:
        return null;
    }
  };

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
                  onTimeChange(platform, option.value);
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
          {renderPrimaryMetric()}
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white transition-colors ml-2"
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-700 bg-slate-900/50 px-3 py-3">
          <div className="grid grid-cols-3 gap-3">
            {renderMetrics()}
          </div>
        </div>
      )}
    </div>
  );
}
