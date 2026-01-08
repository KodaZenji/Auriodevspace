// ========================================
// FILE: app/api/leaderboards/helpers.js
// Reusable helper functions for leaderboard fetching
// ========================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ========================================
// CACHE FETCHERS
// ========================================

/**
 * Fetch cache entry for time-based leaderboards
 */
export async function getTimeBasedCache(cacheType, days = 0) {
  const { data, error } = await supabase
    .from('leaderboard_cache')
    .select('last_updated')
    .eq('cache_type', cacheType)
    .eq('days', days)
    .single();

  if (error) console.warn(`Cache not found for ${cacheType}:`, error.message);
  return data;
}

/**
 * Fetch cache entry for snapshot-based leaderboards
 */
export async function getSnapshotBasedCache(cacheType, days) {
  const { data, error } = await supabase
    .from('leaderboard_cache')
    .select('last_updated, snapshot_id')
    .eq('cache_type', cacheType)
    .eq('days', days)
    .single();

  if (error) console.warn(`Cache not found for ${cacheType}:`, error.message);
  return data;
}

// ========================================
// LEADERBOARD FETCHERS
// ========================================

/**
 * Fetch time-based leaderboard data
 */
export async function fetchTimeBasedLeaderboard({
  tableName,
  fetchedAt,
  days = null,
  orderBy = 'rank',
  ascending = true
}) {
  let query = supabase
    .from(tableName)
    .select('*')
    .eq('fetched_at', fetchedAt);

  if (days !== null) {
    query = query.eq('days', days);
  }

  const { data, error } = await query.order(orderBy, { ascending });

  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return null;
  }

  return data;
}

/**
 * Fetch snapshot-based leaderboard data with JSONB transformation
 */
export async function fetchSnapshotBasedLeaderboard({
  tableName,
  snapshotId,
  days,
  transformer = null
}) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('snapshot_id', snapshotId)
    .eq('days', days)
    .order('position', { ascending: true });

  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return null;
  }

  if (transformer && data) {
    return data.map(transformer);
  }

  return data;
}

// ========================================
// DATA TRANSFORMERS
// ========================================

/**
 * Transform HeyElsa/Beyond/CodeXero row with x_info JSONB unpacking
 */
export function transformSnapshotRow(row) {
  return {
    id: row.id,
    username: row.username,
    name: row.x_info?.name,
    image_url: row.x_info?.imageUrl,
    rank: row.x_info?.rank,
    score: row.x_info?.score,
    score_percentile: row.x_info?.scorePercentile,
    score_quantile: row.x_info?.scoreQuantile,
    mindshare_percentage: row.mindshare_percentage,
    relative_mindshare: row.relative_mindshare,
    app_use_multiplier: row.app_use_multiplier,
    position: row.position,
    position_change: row.position_change,
    days: row.days
  };
}

// ========================================
// LEADERBOARD CONFIGURATIONS
// ========================================

/**
 * Configuration for all leaderboards
 */
export const LEADERBOARD_CONFIGS = {
  // Time-based leaderboards (use fetched_at)
  yappers: {
    type: 'time-based',
    tableName: 'yappers_leaderboard',
    cacheType: 'yappers',
    usesDays: true,
    orderBy: 'rank',
    ascending: true
  },
  duelduck: {
    type: 'time-based',
    tableName: 'duelduck_leaderboard',
    cacheType: 'duelduck',
    usesDays: false,
    orderBy: 'total_score',
    ascending: false
  },
  adichain: {
    type: 'time-based',
    tableName: 'adichain_leaderboard',
    cacheType: 'adichain',
    usesDays: false,
    orderBy: 'rank_total',
    ascending: true
  },
  datahaven: {
    type: 'time-based',
    tableName: 'datahaven_leaderboard',
    cacheType: 'datahaven',
    usesDays: false,
    orderBy: 'rank_total',
    ascending: true
  },
  mindoshare: {
    type: 'time-based',
    tableName: 'mindoshare_perceptronntwk',
    cacheType: 'PerceptronNTWK',
    usesDays: false,
    orderBy: 'rank',
    ascending: true
  },
  space: {
    type: 'time-based',
    tableName: 'space_leaderboard',
    cacheType: 'space',
    usesDays: false,
    orderBy: 'rank',
    ascending: true
  },
  helios: {
    type: 'time-based',
    tableName: 'helios_leaderboard',
    cacheType: 'helios',
    usesDays: false,
    orderBy: 'rank',
    ascending: true
  },
  c8ntinuum: {
    type: 'time-based',
    tableName: 'c8ntinuum_leaderboard',
    cacheType: 'c8ntinuum',
    usesDays: false,
    orderBy: 'rank',
    ascending: true
  },
  deepnodeai: {
    type: 'time-based',
    tableName: 'deepnodeai_leaderboard',
    cacheType: 'deepnodeai',
    usesDays: false,
    orderBy: 'rank',
    ascending: true
  },

  // Snapshot-based leaderboards (use snapshot_id)
  heyelsa: {
    type: 'snapshot-based',
    tableName: 'heyelsa_leaderboard',
    cacheType: 'heyelsa',
    usesDays: true,
    transformer: transformSnapshotRow
  },
  beyond: {
    type: 'snapshot-based',
    tableName: 'beyond_leaderboard',
    cacheType: 'beyond',
    usesDays: true,
    transformer: transformSnapshotRow
  },
  codexero: {
    type: 'snapshot-based',
    tableName: 'codexero_leaderboard',
    cacheType: 'codexero',
    usesDays: true,
    transformer: transformSnapshotRow
  }
};

// ========================================
// UNIFIED FETCH FUNCTION
// ========================================

/**
 * Fetch a leaderboard based on its configuration
 */
export async function fetchLeaderboard(leaderboardKey, days = 0) {
  const config = LEADERBOARD_CONFIGS[leaderboardKey];
  
  if (!config) {
    console.error(`Unknown leaderboard: ${leaderboardKey}`);
    return null;
  }

  try {
    if (config.type === 'time-based') {
      const cache = await getTimeBasedCache(
        config.cacheType, 
        config.usesDays ? days : 0
      );
      
      if (!cache) return null;

      const data = await fetchTimeBasedLeaderboard({
        tableName: config.tableName,
        fetchedAt: cache.last_updated,
        days: config.usesDays ? days : null,
        orderBy: config.orderBy,
        ascending: config.ascending
      });

      return {
        data: data || [],
        last_updated: cache.last_updated,
        count: data?.length || 0
      };

    } else if (config.type === 'snapshot-based') {
      const cache = await getSnapshotBasedCache(config.cacheType, days);
      
      if (!cache) return null;

      const data = await fetchSnapshotBasedLeaderboard({
        tableName: config.tableName,
        snapshotId: cache.snapshot_id,
        days,
        transformer: config.transformer
      });

      return {
        data: data || [],
        last_updated: cache.last_updated,
        snapshot_id: cache.snapshot_id,
        count: data?.length || 0,
        days
      };
    }
  } catch (error) {
    console.error(`Error fetching ${leaderboardKey}:`, error);
    return null;
  }
}
