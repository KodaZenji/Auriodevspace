import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Convert period strings to days
const PERIOD_TO_DAYS: Record<string, number> = {
  'epoch-2': 2,
  '7d': 7,
  '30d': 30
};

export async function storeHeyElsaData(users: any[], period: string, snapshotId: string) {
  const fetched_at = new Date().toISOString();
  const days = PERIOD_TO_DAYS[period];
  
  if (!days) {
    throw new Error(`Invalid period: ${period}. Must be one of: epoch-2, 7d, 30d`);
  }

  console.log(`[HeyElsa] Storing ${users.length} users for period "${period}" (${days} days) - Snapshot: ${snapshotId}`);

  // ✅ MUCH SIMPLER: Store xInfo as JSONB, extract only what we need
  const records = users.map(user => ({
    // Extract username for indexing
    username: user.xInfo?.username,
    
    // Store entire xInfo as JSONB
    x_info: user.xInfo,
    
    // HeyElsa-specific metrics (top-level)
    mindshare_percentage: user.mindsharePercentage,
    relative_mindshare: user.relativeMindshare,
    app_use_multiplier: user.appUseMultiplier,
    position: user.position,
    position_change: user.positionChange,
    
    // Time tracking
    days: days,
    
    // Snapshot and timestamps
    snapshot_id: snapshotId,
    fetched_at: fetched_at
  }));

  // Insert with detailed logging
  console.log(`[HeyElsa] Attempting to insert ${records.length} records...`);
  console.log(`[HeyElsa] Sample record:`, JSON.stringify(records[0], null, 2));
  
  const { data: insertedData, error: insertError } = await supabase
    .from('heyelsa_leaderboard')
    .insert(records)
    .select();

  if (insertError) {
    console.error('[HeyElsa] ❌ Insert error:', JSON.stringify(insertError, null, 2));
    throw insertError;
  }
  
  console.log(`[HeyElsa] ✅ Successfully inserted ${insertedData?.length || 0} records`);

  // Update cache
  const { error: cacheError } = await supabase
    .from('leaderboard_cache')
    .upsert({
      cache_type: 'heyelsa',
      days: days,
      last_updated: fetched_at,
      snapshot_id: snapshotId,
      record_count: records.length
    }, {
      onConflict: 'cache_type,days'
    });

  if (cacheError) {
    console.error('[HeyElsa] Cache error:', cacheError);
    throw cacheError;
  }

  console.log(`[HeyElsa] ✅ Stored ${records.length} users for ${days}d`);
  return snapshotId;
}
