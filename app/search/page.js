"use client";

import React, { useState } from "react";
import { Search, SearchIcon, RefreshCw, Users, Trophy, Calendar } from "lucide-react";

const SearchPage = () => {
    const [username, setUsername] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("goat"); // goat, duck
    const [goatTimeFilter, setGoatTimeFilter] = useState("7d"); // 7d, 30d, leaderboard
    const [duckTimeFilter, setDuckTimeFilter] = useState("7d"); // 7d, 30d, leaderboard
    const [duckDuelData, setDuckDuelData] = useState(null);

    const handleSearch = async () => {
        if (!username.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // First, try to get data from our existing search API
            const response = await fetch(`/api/search/${username}`);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            setSearchResult(data);

            // If we have a result, also fetch Duck Duel data
            if (data.username) {
                const duckData = await fetchDuckDuelData(data.username);
                setDuckDuelData(duckData);
            }
        } catch (err) {
            setError(err.message);
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Duck Duel API data
    const fetchDuckDuelData = async (username) => {
        try {
            // First get the full leaderboard
            const response = await fetch(
                `https://api.duelduck.com/mention-challenge/leaderboard?opts.pagination.page_size=25&opts.pagination.page_num=1&opts.order.order_by=total_score&opts.order.order_type=desc&challenge_id=131938ae-0b07-4ac5-8b67-4c1d3cbbee5e`
            );

            if (!response.ok) {
                throw new Error(`Duck Duel API error: ${response.status}`);
            }

            const data = await response.json();

            // Find user in the leaderboard
            const user = data.data?.leaderboard?.find(entry =>
                entry.user?.username?.toLowerCase() === username.toLowerCase()
            );

            return user ? { found: true, data: user } : { found: false, data: null };
        } catch (error) {
            console.error("Duck Duel API error:", error);
            return { found: false, error: error.message };
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <header className="w-full px-4 sm:px-6 lg:px-8 py-4 bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            User Rank Search
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Section */}
                <div className="mb-12">
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 sm:p-8">
                        <h2 className="text-2xl font-bold text-center mb-6 text-white">
                            Search User Rankings
                        </h2>

                        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <SearchIcon
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"
                                    />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter username..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <SearchIcon className="w-5 h-5" />
                                            Search
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {error && (
                            <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-200 text-center">
                                Error: {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                {searchResult && (
                    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 sm:p-8">
                        {/* User Info */}
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {searchResult.username}
                            </h3>
                            <p className="text-slate-300">
                                Showing rankings for <span className="font-semibold text-blue-400">@{searchResult.username}</span>
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 mb-6 justify-center">
                            <button
                                onClick={() => setActiveTab("goat")}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "goat"
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                                    }`}
                            >
                                <Trophy className="w-4 h-4 inline mr-2" />
                                Goat Rankfinder
                            </button>
                            <button
                                onClick={() => setActiveTab("duck")}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "duck"
                                    ? "bg-purple-600 text-white shadow-lg"
                                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                                    }`}
                            >
                                <Users className="w-4 h-4 inline mr-2" />
                                Duck Duel
                            </button>
                        </div>

                        {/* Time Filters */}
                        {(activeTab === "goat" || activeTab === "duck") && (
                            <div className="flex flex-wrap gap-2 mb-6 justify-center">
                                {["7d", "30d", "leaderboard"].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => {
                                            if (activeTab === "goat") {
                                                setGoatTimeFilter(filter);
                                            } else {
                                                setDuckTimeFilter(filter);
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            (activeTab === "goat" && filter === goatTimeFilter) || 
                                            (activeTab === "duck" && filter === duckTimeFilter)
                                            ? (activeTab === "goat" ? "bg-blue-600 text-white shadow-lg" : "bg-purple-600 text-white shadow-lg")
                                            : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                                        }`}
                                    >
                                        {filter === "7d" && <Calendar className="w-4 h-4 inline mr-2" />}
                                        {filter === "30d" && <Calendar className="w-4 h-4 inline mr-2" />}
                                        {filter === "leaderboard" && <Trophy className="w-4 h-4 inline mr-2" />}
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Results Content */}
                        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                            {loading ? (
                                <div className="text-center py-12">
                                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
                                    <p className="text-slate-400">Loading {activeTab} data...</p>
                                </div>
                            ) : activeTab === "goat" ? (
                                <div>
                                    <h4 className="text-xl font-bold mb-4 text-blue-400">Goat Rankfinder</h4>
                                    {searchResult.wallchain?.found ? (
                                        <div className="space-y-4">
                                            <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        {searchResult.wallchain.data.imageUrl && (
                                                            <img
                                                                src={searchResult.wallchain.data.imageUrl}
                                                                alt={searchResult.wallchain.data.username}
                                                                className="w-12 h-12 rounded-full border-2 border-blue-400/30 object-cover"
                                                            />
                                                        )}
                                                        <div>
                                                            <h5 className="font-semibold text-white">
                                                                {searchResult.wallchain.data.name || searchResult.wallchain.data.username}
                                                            </h5>
                                                            <p className="text-slate-400">@{searchResult.wallchain.data.username}</p>
                                                        </div>
                                                    </div>
                                                    <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                                                        Rank #{searchResult.wallchain.data.position}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                    <div className="bg-slate-700/30 rounded-lg p-3">
                                                        <div className="text-2xl font-bold text-blue-400">
                                                            {searchResult.wallchain.data.score?.toFixed(2) || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-slate-400">Score</div>
                                                    </div>
                                                    <div className="bg-slate-700/30 rounded-lg p-3">
                                                        <div className="text-2xl font-bold text-purple-400">
                                                            {searchResult.wallchain.data.scorePercentile?.toFixed(2) || 'N/A'}%
                                                        </div>
                                                        <div className="text-sm text-slate-400">Percentile</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-400">
                                            No Goat Rankfinder data found for this user
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <h4 className="text-xl font-bold mb-4 text-purple-400">Duck Duel</h4>
                                    {duckDuelData ? (
                                        duckDuelData.found ? (
                                            <div className="space-y-4">
                                                <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            {duckDuelData.data.user?.profile_image_url && (
                                                                <img
                                                                    src={duckDuelData.data.user.profile_image_url}
                                                                    alt={duckDuelData.data.user.username}
                                                                    className="w-12 h-12 rounded-full border-2 border-purple-400/30 object-cover"
                                                                />
                                                            )}
                                                            <div>
                                                                <h5 className="font-semibold text-white">
                                                                    {duckDuelData.data.user?.display_name || duckDuelData.data.user?.username}
                                                                </h5>
                                                                <p className="text-slate-400">@{duckDuelData.data.user?.username}</p>
                                                            </div>
                                                        </div>
                                                        <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                                                            Rank #{duckDuelData.data.rank}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                        <div className="bg-slate-700/30 rounded-lg p-3">
                                                            <div className="text-xl font-bold text-purple-400">
                                                                {duckDuelData.data.total_score?.toLocaleString() || '0'}
                                                            </div>
                                                            <div className="text-sm text-slate-400">Total Score</div>
                                                        </div>
                                                        <div className="bg-slate-700/30 rounded-lg p-3">
                                                            <div className="text-xl font-bold text-green-400">
                                                                {duckDuelData.data.wins || '0'}
                                                            </div>
                                                            <div className="text-sm text-slate-400">Wins</div>
                                                        </div>
                                                        <div className="bg-slate-700/30 rounded-lg p-3">
                                                            <div className="text-xl font-bold text-red-400">
                                                                {duckDuelData.data.losses || '0'}
                                                            </div>
                                                            <div className="text-sm text-slate-400">Losses</div>
                                                        </div>
                                                        <div className="bg-slate-700/30 rounded-lg p-3">
                                                            <div className="text-xl font-bold text-blue-400">
                                                                {duckDuelData.data.win_rate ? `${(duckDuelData.data.win_rate * 100).toFixed(1)}%` : '0%'}
                                                            </div>
                                                            <div className="text-sm text-slate-400">Win Rate</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-slate-400">
                                                User not found in Duck Duel leaderboard
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center py-8 text-slate-400">
                                            {duckDuelData?.error ? `Error: ${duckDuelData.error}` : 'Searching Duck Duel data...'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!searchResult && !loading && (
                    <div className="text-center py-16">
                        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 max-w-2xl mx-auto">
                            <SearchIcon className="w-16 h-16 text-slate-500 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-4">Search for User Rankings</h3>
                            <p className="text-slate-400 mb-6">
                                Enter a username above to see their rankings on Goat Rankfinder and Duck Duel
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div className="bg-slate-700/30 border border-slate-600 rounded-xl p-6">
                                    <Trophy className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                                    <h4 className="font-semibold text-white mb-2">Goat Rankfinder</h4>
                                    <p className="text-slate-400 text-sm">
                                        Check user's mindshare and activity metrics with 7-day, 30-day, and leaderboard views
                                    </p>
                                </div>
                                <div className="bg-slate-700/30 border border-slate-600 rounded-xl p-6">
                                    <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                                    <h4 className="font-semibold text-white mb-2">Duck Duel</h4>
                                    <p className="text-slate-400 text-sm">
                                        View user's Duck Duel performance with real-time leaderboard integration
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SearchPage;