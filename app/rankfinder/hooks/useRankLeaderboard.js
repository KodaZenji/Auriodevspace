// hooks/useRankLeaderboard.js - Custom Hook for Leaderboard Data

import { useState, useCallback, useEffect } from 'react';


// Constants
const CONSTANTS = {
  API_URL: "https://yappers-api.goat.network/leaderboard",
  BATCH_SIZE: 100, // Users per batch
  BATCH_DELAY: 50, // Milliseconds between batches
  MAX_RETRIES: 3, // Number of retry attempts on failure
};

/**
 * Utility: Delay execution
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Utility: Extract users array from various API response formats
 */
const extractUsersArray = (data) => {
  if (Array.isArray(data)) return data;
  
  if (data && typeof data === 'object') {
    const commonKeys = ['users', 'data', 'leaderboard', 'rankings', 'results', 'items'];
    
    for (const key of commonKeys) {
      if (data[key] && Array.isArray(data[key])) {
        return data[key];
      }
    }
    
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value) && value.length > 0) {
        return value;
      }
    }
  }
  
  return [];
};

/**
 * Utility: Transform raw user data to consistent format
 */
const transformUser = (user, index) => {
  return {
    id: user?.id || user?.userId || user?.user_id || index,
    username: user?.username || user?.name || user?.handle || `User${index + 1}`,
    mindshare: Number((user?.score ?? 0) * 100),
    tweets: user?.tweet_counts ?? user?.tweet_count ?? 0,
    likes: user?.total_likes ?? user?.likes ?? 0,
    impressions: user?.total_impressions ?? user?.impressions ?? 0,
    score: user?.score ?? user?.points ?? 0,
    rank: user?.rank || index + 1,
  };
};

const useRankLeaderboard = (options = {}) => {
  const {
    batchSize = CONSTANTS.BATCH_SIZE,
    batchDelay = CONSTANTS.BATCH_DELAY,
    autoFetch = false,
    defaultDays = 30,
  } = options;

  // State management
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Fetch leaderboard data with optimized batch loading
   * 
   * HOW BATCH LOADING WORKS:
   * 1. Fetch all data from API (800ms)
   * 2. Split into batches of 100 users
   * 3. Update state progressively (10 batches × 50ms = 500ms)
   * 4. UI updates after each batch (stays responsive)
   * 
   * @param {number} days - Number of days for leaderboard (7, 30, etc.)
   * @param {Object} fetchOptions - Additional fetch options
   */
  const fetchRankings = useCallback(async (days, fetchOptions = {}) => {
    setLoading(true);
    setError(null);
    setLoadProgress(0);

    try {
      // Make API request
      const response = await fetch(
        `${CONSTANTS.API_URL}?days=${days}&limit=1000`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
          ...fetchOptions,
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      // Parse response
      const data = await response.json();
      const usersArray = extractUsersArray(data);
      
      if (usersArray.length === 0) {
        throw new Error('No users found in response');
      }

      // Transform data to consistent format
      const transformedData = usersArray.map(transformUser);

      // ============================================
      // BATCH LOADING ALGORITHM
      // ============================================
      const totalBatches = Math.ceil(transformedData.length / batchSize);
      let loadedData = [];
      
      for (let i = 0; i < totalBatches; i++) {
        // Calculate batch boundaries
        const startIdx = i * batchSize;
        const endIdx = Math.min(startIdx + batchSize, transformedData.length);
        
        // Extract current batch
        const batch = transformedData.slice(startIdx, endIdx);
        
        // Accumulate loaded data
        loadedData = [...loadedData, ...batch];
        
        // Update state (triggers re-render with current batch)
        setRankings([...loadedData]);
        
        // Update progress percentage
        const progress = ((i + 1) / totalBatches) * 100;
        setLoadProgress(progress);
        
        // Yield control to browser (prevents UI blocking)
        // This allows:
        // - React to render the current batch
        // - Browser to process user interactions
        // - Progress bar to update smoothly
        if (i < totalBatches - 1) { // Don't delay after last batch
          await delay(batchDelay);
        }
      }

      // Reset retry count on success
      setRetryCount(0);
      
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      
      // Retry logic
      if (retryCount < CONSTANTS.MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setError(`Failed to load. Retrying (${retryCount + 1}/${CONSTANTS.MAX_RETRIES})...`);
        
        // Exponential backoff: 1s, 2s, 4s
        await delay(1000 * Math.pow(2, retryCount));
        
        // Retry the fetch
        return fetchRankings(days, fetchOptions);
      } else {
        setError(err.message || 'Failed to load leaderboard. Please try again.');
      }
      
    } finally {
      setLoading(false);
      setLoadProgress(100);
    }
  }, [batchSize, batchDelay, retryCount]);

  /**
   * Refresh current leaderboard
   */
  const refresh = useCallback((days) => {
    setRankings([]); // Clear current data
    return fetchRankings(days);
  }, [fetchRankings]);

  /**
   * Clear all data and reset state
   */
  const clear = useCallback(() => {
    setRankings([]);
    setError(null);
    setLoadProgress(0);
    setRetryCount(0);
  }, []);

  /**
   * Filter rankings by search query
   */
  const filterRankings = useCallback((query) => {
    if (!query || query.trim() === '') {
      return rankings;
    }
    
    const lowerQuery = query.toLowerCase().trim();
    return rankings.filter(user => 
      user.username.toLowerCase().includes(lowerQuery)
    );
  }, [rankings]);

  /**
   * Get user by rank
   */
  const getUserByRank = useCallback((rank) => {
    return rankings.find(user => user.rank === rank);
  }, [rankings]);

  /**
   * Get user by username
   */
  const getUserByUsername = useCallback((username) => {
    return rankings.find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    );
  }, [rankings]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchRankings(defaultDays);
    }
  }, [autoFetch, defaultDays, fetchRankings]);

  // Return hook API
  return {
    // Data
    rankings,
    
    // Loading state
    loading,
    loadProgress,
    
    // Error state
    error,
    retryCount,
    
    // Methods
    fetchRankings,
    refresh,
    clear,
    
    // Helper methods
    filterRankings,
    getUserByRank,
    getUserByUsername,
    
    // Computed values
    totalUsers: rankings.length,
    isLoaded: rankings.length > 0 && !loading,
  };
};

export default useRankLeaderboard;
