import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ========================================
// CACHE HELPERS
// ========================================

async function getTimeBasedCache(cacheType: string, days: number) {
  const { data, error } = await supabase
    .from('leaderboard_cache')
    .select('*')
    .eq('cache_type', cacheType)
    .eq('days', days)
    .single();

  if (error) {
    console.error(`Cache fetch error for ${cacheType}:`, error);
    return null;
  }

  return data;
}

async function getSnapshotBasedCache(cacheType: string, days: number) {
  const { data, error } = await supabase
    .from('leaderboard_cache')
    .select('*')
    .eq('cache_type', cacheType)
    .eq('days', days)
    .single();

  if (error) {
    console.error(`Cache fetch error for ${cacheType}:`, error);
    return null;
  }

  return data;
}

// ========================================
// FETCH HELPERS
// ========================================

async function fetchTimeBasedLeaderboard({ tableName, fetchedAt, days, orderBy = 'rank', ascending = true }) {
  let query = supabase
    .from(tableName)
    .select('*')
    .eq('fetched_at', fetchedAt);

  if (days !== null) {
    query = query.eq('days', days);
  }

  query = query.order(orderBy, { ascending });

  const { data, error } = await query;

  if (error) {
    console.error(`Fetch error for ${tableName}:`, error);
    return null;
  }

  return data;
}

async function fetchSnapshotBasedLeaderboard({ tableName, snapshotId, days, transformer }) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('snapshot_id', snapshotId)
    .eq('days', days)
    .order('position', { ascending: true });

  if (error) {
    console.error(`Fetch error for ${tableName}:`, error);
    return null;
  }

  return data ? data.map(transformer) : null;
}

// ========================================
// TRANSFORMERS
// ========================================

function transformSnapshotRow(row: any) {
  return {
    username: row.username,
    position: row.position,
    position_change: row.position_change,
    mindshare_percentage: row.mindshare_percentage,
    relative_mindshare: row.relative_mindshare,
    app_use_multiplier: row.app_use_multiplier,
    x_info: row.x_info
  };
}

// ========================================
// LEADERBOARD CONFIGURATIONS
// ========================================

const LEADERBOARD_CONFIGS = {
  duelduck: {
    type: 'time-based',
    tableName: 'duelduck_leaderboard',
    cacheType: 'duelduck',
    usesDays: false,
    orderBy: 'rank',
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
  womfun: {
    type: 'time-based',
    tableName: 'womfun_leaderboard',
    cacheType: 'womfun',
    usesDays: false,
    orderBy: 'rank',
    ascending: true
  },
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

export async function fetchLeaderboard(leaderboardKey: string, days: number = 0) {
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
