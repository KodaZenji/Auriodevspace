import { ChevronDown, AlertCircle } from 'lucide-react';

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
  onTimeChange,
  notFoundInPeriod = false
}) {
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const renderMetrics = () => {
    switch(platform) {
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
      case 'perceptron':
      case 'space':
      case 'helios':
      case 'c8ntinuum':
      case 'deepnodeai':
        return (
          <>
            <div className="text-center bg-slate-800/50 rounded-lg p-2">
              <div className="text-gray-400 text-xs mb-1">Rank Change</div>
              <div className="text-white font-bold">{data.rankdelta || 0}</div>
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
      case 'womfun':
        return (
          <>
            <div className="text-center bg-slate-800/50 rounded-lg p-2">
              <div className="text-gray-400 text-xs mb-1">POI Score</div>
              <div className="text-white font-bold">{data.poi_score?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="text-center bg-slate-800/50 rounded-lg p-2">
              <div className="text-gray-400 text-xs mb-1">Mindshare Score</div>
              <div className="text-white font-bold">{data.mindshare_score?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="text-center bg-slate-800/50 rounded-lg p-2">
              <div className="text-gray-400 text-xs mb-1">Reputation</div>
              <div className="text-white font-bold">{data.reputation || 0}</div>
            </div>
          </>
        );
      case 'elsa':
      case 'beyond':
      case 'codexero': 
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
      case 'duck':
        return (
          <div className="text-right">
            <div className="text-xs text-gray-400">USDC Reward</div>
            <div className="font-bold text-lg" style={{
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ${data.usdc_reward?.toFixed(2)}
            </div>
          </div>
        );
      case 'perceptron':
      case 'space':
      case 'helios':
      case 'c8ntinuum':
      case 'deepnodeai':
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
      case 'womfun':
        return (
          <div className="text-right">
            <div className="text-xs text-gray-400">Mindshare</div>
            <div className="font-bold text-lg" style={{
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {((data.mindshare_score || 0) / 100).toFixed(2)}%
            </div>
          </div>
        );
      case 'elsa':
      case 'beyond':
      case 'codexero':
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

  // If user not found in this period, show error state
  if (notFoundInPeriod) {
    return (
      <div 
        className="bg-slate-800 rounded-lg mb-3 overflow-hidden transition-all"
        style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}
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

        <div className="p-4 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <div className="text-white font-medium mb-1">
              @{username} not found
            </div>
            <div className="text-gray-400 text-sm">
              User not ranked in this period
            </div>
            {timeSwitch && (
              <div className="text-gray-500 text-xs mt-2">
                Try selecting a different time period above
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
