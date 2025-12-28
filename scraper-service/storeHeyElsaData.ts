import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Convert period strings to days (matching contract logic)
const PERIOD_TO_DAYS: Record<string, number> = {
  'epoch-2': 2,   // Period 0 = Epoch 2 = 2 days
  '7d': 7,        // Period 7 = 7 days
  '30d': 30       // Period 30 = 30 days
};

export async function storeHeyElsaData(users: any[], period: string, snapshotId: string) {
  const fetched_at = new Date().toISOString();
  
  // ✅ Convert period to days for consistent storage
  const days = PERIOD_TO_DAYS[period];
  
  if (!days) {
    throw new Error(`Invalid period: ${period}. Must be one of: epoch-2, 7d, 30d`);
  }

  console.log(`[HeyElsa] Storing ${users.length} users for period "${period}" (${days} days) - Snapshot: ${snapshotId}`);

  // ✅ Map API response to database columns
  const records = users.map(user => ({
    // User identification (from xInfo)
    x_id: user.xInfo?.id?.toString(),
    name: user.xInfo?.name,
    username: user.xInfo?.username,
    image_url: user.xInfo?.imageUrl,
    
    // X/Twitter scores (from xInfo)
    rank: user.xInfo?.rank,
    score: user.xInfo?.score,
    score_percentile: user.xInfo?.scorePercentile,
    score_quantile: user.xInfo?.scoreQuantile,
    
    // HeyElsa-specific metrics
    mindshare_percentage: user.mindsharePercentage,
    relative_mindshare: user.relativeMindshare,
    app_use_multiplier: user.appUseMultiplier,
    position: user.position,
    position_change: user.positionChange,
    
    // Time tracking (matching yappers pattern)
    days: days,                    // ✅ Store as days (2, 7, or 30)
    
    // Snapshot and timestamps
    snapshot_id: snapshotId,
    fetched_at: fetched_at
  }));

  // Insert all records
  const { error: insertError } = await supabase
    .from('heyelsa_leaderboard')
    .insert(records);

  if (insertError) {
    console.error('[HeyElsa] Insert error:', insertError);
    throw insertError;
  }

  // ✅ Store cache with days as key (like yappers)
  const { error: cacheError } = await supabase
    .from('leaderboard_cache')
    .upsert({
      cache_type: 'heyelsa',
      days: days,                  // ✅ Use days as the key (2, 7, or 30)
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
