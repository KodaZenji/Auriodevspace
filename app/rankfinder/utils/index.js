
// ============================================

export const CONSTANTS = {
  TOTAL_ALLOCATION: 1000000000,
  ALLOCATION_PERCENT: 0.007,
  YAPPERS_SHARE: 2/3,
  CAMPAIGN_MONTHS: 9,
  API_URL: "https://yappers-api.goat.network/leaderboard",
  BATCH_SIZE: 100 // Users to load per batch
};

// Calculated constants
export const MONTHLY_POOL_FULL = (
  CONSTANTS.TOTAL_ALLOCATION * 
  CONSTANTS.ALLOCATION_PERCENT
) / CONSTANTS.CAMPAIGN_MONTHS;

export const MONTHLY_POOL_SHARED = (
  CONSTANTS.TOTAL_ALLOCATION * 
  CONSTANTS.ALLOCATION_PERCENT * 
  CONSTANTS.YAPPERS_SHARE
) / CONSTANTS.CAMPAIGN_MONTHS;

// ============================================
// NUMBER FORMATTING
// ============================================

/**
 * Formats large numbers for display
 * @param {number} num - Number to format
 * @returns {string} Formatted string (e.g., "1.2M", "450K")
 * 
 * Examples:
 * formatNumber(1500000) => "1.5M"
 * formatNumber(45000) => "45.0K"
 * formatNumber(500) => "500"
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};


export const calculateUserRewards = (user) => {
  if (!user || !user.mindshare) {
    return { 
      estimatedShare: 0, 
      monthlyRewardFull: 0,
      monthlyRewardShared: 0 
    };
  }
  
  const userMindshare = user.mindshare; // e.g., 5.0 (which is 5%)
  const estimatedShare = userMindshare / 100; // 0.05
  
  const monthlyRewardFull = MONTHLY_POOL_FULL * estimatedShare;
  const monthlyRewardShared = MONTHLY_POOL_SHARED * estimatedShare;
  
  return {
    estimatedShare: (estimatedShare * 100).toFixed(4), // "5.0000%"
    monthlyRewardFull: Math.round(monthlyRewardFull), // Integer tokens
    monthlyRewardShared: Math.round(monthlyRewardShared) // Integer tokens
  };
};

// ============================================
// AVATAR UTILITIES
// ============================================

/**
 * Generates avatar URL for a Twitter username
 * @param {string} username - Twitter handle (without @)
 * @returns {string} Avatar URL
 * 
 * Uses unavatar.io service which:
 * - Automatically gets Twitter profile pictures
 * - Has built-in caching
 * - Falls back to initials if no image
 */
export const getProfilePicUrl = (username) => {
  return `https://unavatar.io/twitter/${username}`;
};

/**
 * Generates fallback avatar URL
 * @param {string} username - Username for initials
 * @param {number} size - Size in pixels
 * @returns {string} Fallback avatar URL
 */
export const getFallbackAvatar = (username, size = 96) => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${username}&size=${size}&backgroundColor=1f2937`;
};

// ============================================
// DATA TRANSFORMATION
// ============================================

/**
 * Transforms API response to consistent user object
 * @param {Object} rawUser - Raw user data from API
 * @param {number} index - Position in array (for fallback rank)
 * @returns {Object} Normalized user object
 * 
 * WHY THIS IS IMPORTANT:
 * API might change field names, but our app always gets
 * consistent data structure. One place to handle variations.
 */
export const transformUser = (rawUser, index) => {
  return {
    id: rawUser?.id || rawUser?.userId || rawUser?.user_id || index,
    username: rawUser?.username || rawUser?.name || rawUser?.handle || `User${index + 1}`,
    mindshare: Number((rawUser?.score ?? 0) * 100),
    tweets: rawUser?.tweet_counts ?? rawUser?.tweet_count ?? 0,
    likes: rawUser?.total_likes ?? rawUser?.likes ?? 0,
    impressions: rawUser?.total_impressions ?? rawUser?.impressions ?? 0,
    score: rawUser?.score ?? rawUser?.points ?? 0,
    rank: rawUser?.rank || index + 1,
  };
};

/**
 * Extracts user array from various API response formats
 * @param {Object|Array} data - API response
 * @returns {Array} Array of user objects
 * 
 * Handles multiple API formats:
 * - Direct array: [user1, user2, ...]
 * - Nested: { users: [...] }
 * - Nested: { data: [...] }
 * - Other keys: { results: [...] }
 */
export const extractUsersArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data && typeof data === 'object') {
    // Try common property names
    const commonKeys = ['users', 'data', 'leaderboard', 'rankings', 'results', 'items'];
    
    for (const key of commonKeys) {
      if (data[key] && Array.isArray(data[key])) {
        return data[key];
      }
    }
    
    // Try any array property
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value) && value.length > 0) {
        return value;
      }
    }
  }
  
  return []; // Empty array if nothing found
};

// ============================================
// SEARCH/FILTER UTILITIES
// ============================================

/**
 * Filters users by search query
 * @param {Array} users - Array of user objects
 * @param {string} query - Search query
 * @returns {Array} Filtered users
 */
export const filterUsers = (users, query) => {
  if (!query || query.trim() === '') {
    return users;
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  return users.filter(user => 
    user.username.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Sorts users by rank
 * @param {Array} users - Array of user objects
 * @returns {Array} Sorted users
 */
export const sortByRank = (users) => {
  return [...users].sort((a, b) => a.rank - b.rank);
};

export const splitIntoBatches = (array, batchSize) => {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
};

/**
 * Delays execution (for batch processing)
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};



export default {
  CONSTANTS,
  MONTHLY_POOL_FULL,
  MONTHLY_POOL_SHARED,
  formatNumber,
  calculateUserRewards,
  getProfilePicUrl,
  getFallbackAvatar,
  transformUser,
  extractUsersArray,
  filterUsers,
  sortByRank,
  splitIntoBatches,
  delay
};
