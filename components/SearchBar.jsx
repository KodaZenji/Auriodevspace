import { Search, RefreshCw } from 'lucide-react';

export default function SearchBar({ 
  searchUser, 
  onSearchChange, 
  onSearch, 
  loading 
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Enter X username..."
            value={searchUser}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>
        <button
          onClick={onSearch}
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
  );
}
