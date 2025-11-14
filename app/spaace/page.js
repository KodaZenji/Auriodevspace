// app/page.js
'use client';

import { useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [tokenStatus, setTokenStatus] = useState(null);

  // Check token status on mount
  useState(() => {
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => setTokenStatus(data))
      .catch(err => console.error('Failed to get token status:', err));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username or X handle');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch(`/api/search/${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              🏆 Onchain Rank Checker
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              Check your ranks on Spaace.io & Wallchain
            </p>
            {results?.burnerWallet && (
              <p className="text-xs text-gray-500">
                🔥 Powered by burner wallet: {results.burnerWallet.slice(0, 6)}...{results.burnerWallet.slice(-4)}
              </p>
            )}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-3 text-gray-800">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username, X handle, or wallet address..."
                className="flex-1 px-6 py-4 border-2 border-gray-400 rounded-xl text-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-8">
              ❌ {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Searching across platforms...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
            </div>
          )}

          {/* Results */}
          {results && !loading && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Spaace.io Card */}
              <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 transition hover:shadow-lg hover:-translate-y-1 ${
                results.spaace.found ? 'border-green-300' : results.spaace.needsAuth ? 'border-yellow-300' : 'border-red-200 opacity-60'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">🎮</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Spaace.io</h3>
                    {results.spaace.totalUsers > 0 && (
                      <p className="text-xs text-gray-500">{results.spaace.totalUsers.toLocaleString()} users scanned</p>
                    )}
                  </div>
                </div>

                {results.spaace.needsAuth ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">🔐</div>
                    <p className="text-yellow-700 font-semibold mb-4">
                      Authentication Required
                    </p>
                    <div className="text-sm text-gray-600 text-left bg-white p-4 rounded-lg">
                      <p className="font-semibold mb-2">Setup Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Connect burner wallet to Spaace.io</li>
                        <li>Open DevTools → Network → Find graphql</li>
                        <li>Copy Authorization header</li>
                        <li>Add to .env.local as SPAACE_AUTH_TOKEN</li>
                        <li>Restart server</li>
                      </ol>
                    </div>
                  </div>
                ) : results.spaace.found ? (
                  <>
                    <div className="bg-white rounded-xl p-6 mb-4 text-center">
                      <div className="text-xs uppercase font-semibold text-gray-500 mb-2">Rank</div>
                      <div className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        #{results.spaace.data?.rank?.rank || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        {results.spaace.data?.user?.name || username}
                      </div>
                      {results.spaace.data?.user?.status && (
                        <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {results.spaace.data.user.status}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 font-semibold mb-1">POINTS</div>
                        <div className="text-2xl font-bold text-gray-800">
                          {(results.spaace.data?.points || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 font-semibold mb-1">QUESTS</div>
                        <div className="text-2xl font-bold text-gray-800">
                          {results.spaace.data?.questCompleted || 0}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 font-semibold mb-1">BOOST</div>
                        <div className="text-2xl font-bold text-gray-800">
                          {results.spaace.data?.boostMultiplier || '1.0'}x
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 font-semibold mb-1">ADDRESS</div>
                        <div className="text-sm font-mono text-gray-800">
                          {results.spaace.data?.userAddress ? 
                            `${results.spaace.data.userAddress.slice(0, 6)}...${results.spaace.data.userAddress.slice(-4)}` : 
                            'N/A'}
                        </div>
                      </div>
                    </div>

                    {results.spaace.data?.user?.imageUrl && (
                      <div className="mt-4 flex justify-center">
                        <img 
                          src={results.spaace.data.user.imageUrl} 
                          alt="Profile" 
                          className="w-16 h-16 rounded-full border-2 border-purple-200"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">😔</div>
                    <p className="text-red-600 font-semibold mb-2">
                      User not found on Spaace.io
                    </p>
                    <p className="text-sm text-gray-500">
                      Searched {results.spaace.totalUsers?.toLocaleString() || 0} users
                    </p>
                  </div>
                )}
              </div>

           {/* Wallchain Card */}
<div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 transition hover:shadow-lg hover:-translate-y-1 ${
  results.wallchain.found ? 'border-green-300' : 'border-red-200 opacity-60'
}`}>
  <div className="flex items-center gap-3 mb-6">
    <span className="text-4xl">⛓️</span>
    <div>
      <h3 className="text-2xl font-bold text-gray-800">Wallchain</h3>
      {results.wallchain.totalUsers > 0 && (
        <p className="text-xs text-gray-500">{results.wallchain.totalUsers.toLocaleString()} users scanned</p>
      )}
    </div>
  </div>

  {results.wallchain.found ? (
    <>
      <div className="bg-white rounded-xl p-6 mb-4 text-center">
        <div className="text-xs uppercase font-semibold text-gray-500 mb-2">Rank</div>
        <div className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          #{results.wallchain.data?.rank || 'N/A'}
        </div>
        <div className="text-sm text-gray-600 mt-2">
          {results.wallchain.data?.username || results.wallchain.data?.name || username}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-xs text-gray-500 font-semibold mb-1">SCORE</div>
          <div className="text-2xl font-bold text-gray-800">
            {results.wallchain.data?.score?.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-xs text-gray-500 font-semibold mb-1">POSITION</div>
          <div className="text-2xl font-bold text-gray-800">
            {results.wallchain.data?.position || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-xs text-gray-500 font-semibold mb-1">MINDSHARE %</div>
          <div className="text-2xl font-bold text-gray-800">
            {(results.wallchain.data?.mindsharePercentage * 100)?.toFixed(2) || 0}%
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-xs text-gray-500 font-semibold mb-1">POSITION CHANGE</div>
          <div className="text-2xl font-bold text-gray-800">
            {results.wallchain.data?.positionChange || 0}
          </div>
        </div>
      </div>

      {results.wallchain.data?.imageUrl && (
        <div className="mt-4 flex justify-center">
          <img 
            src={results.wallchain.data.imageUrl} 
            alt={results.wallchain.data.username || 'Profile'} 
            className="w-16 h-16 rounded-full border-2 border-purple-200"
          />
        </div>
      )}
    </>
  ) : (
    <div className="text-center py-8">
      <div className="text-5xl mb-4">😔</div>
      <p className="text-red-600 font-semibold mb-2">
        User not found on Wallchain
      </p>
      <p className="text-sm text-gray-500">
        Searched {results.wallchain.totalUsers?.toLocaleString() || 0} users across multiple epochs
      </p>
    </div>
  )}
</div>

            </div>
          )}

          {/* Empty State */}
          {!results && !loading && !error && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-7xl mb-4">🔍</div>
              <p className="text-lg mb-2">Search for any username</p>
              <p className="text-sm text-gray-500 mb-4">
                Works with X handles, usernames, or wallet addresses
              </p>
              <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-gray-600">Wallchain: Live</span>
                <span className="mx-2">•</span>
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="text-gray-600">Spaace.io: Needs Auth</span>
              </div>
            </div>
          )}

          {/* Info Footer */}
          <div className="mt-8 pt-6 border-t border-gray-400">
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">
                🔥 Built with burner wallet authentication • 🔒 Your credentials stay private
              </p>
              <p className="text-xs">
                Data refreshed in real-time • Searches across all epochs and pages
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}