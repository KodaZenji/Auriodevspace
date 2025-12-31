import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export function getFetchedAt() {
  return new Date().toISOString();
}

export async function updateCache(cacheType, days, fetchedAt, recordCount, snapshotId = null) {
  const cacheData = {
    cache_type: cacheType,
    days,
    last_updated: fetchedAt,
    record_count: recordCount
  };

  if (snapshotId) {
    cacheData.snapshot_id = snapshotId;
  }

  const { error } = await supabase
    .from('leaderboard_cache')
    .upsert(cacheData, { onConflict: 'cache_type,days' });

  if (error) {
    console.error(`[${cacheType}] Cache error:`, error);
    throw error;
  }
}
