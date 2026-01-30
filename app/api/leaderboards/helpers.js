import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ========================================
// CACHE RETRIEVAL FUNCTIONS
// ========================================

async function getTimeBasedCache(cacheType, days) {
  const { data, error } = await supabase
    .from('leaderboard_cache')
    .select('*')
    .eq('cache_type', cacheType)
    .eq('days', days)
    .order('last_updated', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error(`Cache lookup error for ${cacheType}:`, error);
    return null;
  }

  return data;
}

async function getSnapshotBasedCache(cacheType, days) {
  const { data, error } = await supabase
    .from('leaderboard_cache')
    .select('*')
    .eq('cache_type', cacheType)
    .eq('days', days)
    .order('last_updated', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error(`Cache lookup error for ${cacheType}:`, error);
    return null;
  }

  return data;
}

// ========================================
// DATA FETCH FUNCTIONS
// ========================================

async function fetchTimeBasedLeaderboard({ tableName, fetchedAt, days, orderBy, ascending }) {
  let query = supabase
    .from(tableName)
    .select('*')
    .eq('fetched_at', fetchedAt);

  if (days !== null) {
    query = query.eq('days', days);
  }

  query = query.order(orderBy || 'rank', { ascending: ascending ?? true });

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching from ${tableName}:`, error);
    return null;
  }

  return data;
}

async function fetchSnapshotBasedLeaderboard({ tableName, snapshotId, days, transformer }) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('snapshot_id', snapshotId)
    .order('rank', { ascending: true });

  if (error) {
    console.error(`Error fetching from ${tableName}:`, error);
    return null;
  }

  return transformer ? data.map(row => transformer(row, days)) : data;
}

// ========================================
// TRANSFORMERS
// ========================================

function transformSnapshotRow(row, days) {
  return {
    rank: row.rank,
    username: row.username,
    total_xp: row.total_xp,
    level: row.level,
    avatar_url: row.avatar_url,
    days
  };
}

// ========================================
// LEADERBOARD CONFIGURATIONS
// ========================================

const LEADERBOARD_CONFIGS = {
  goatranchecker: {
    type: 'time-based',
    tableName: 'goatranchecker_leaderboard',
    cacheType: 'goatranchecker',
    usesDays: true,
    orderBy: 'rank',
    ascending: true
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
  },
  yapsfandom: {
    type: 'time-based',
    tableName: 'yapsfandom_leaderboard',
    cacheType: 'yapsfandom',
    usesDays: true,
    orderBy: 'rank',
    ascending: true
  }
};

// ========================================
// UNIFIED FETCH FUNCTION
// ========================================

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
