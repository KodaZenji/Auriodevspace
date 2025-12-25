import { supabase } from '@/lib/supabase'; // adjust path if needed
import crypto from 'crypto';

export async function storeHeyElsaData(users: any[], period: string, fetched_at: string) {
  // ✅ Generate unique snapshot per scrape
  const snapshotId = crypto.randomUUID();

  const records = users.map(user => ({
    heyelsa_id: user.xInfo?.id,
    x_id: user.xInfo?.id,
    name: user.xInfo?.name,
    username: user.xInfo?.username,
    image_url: user.xInfo?.imageUrl,
    rank: user.xInfo?.rank,
    score: user.xInfo?.score,
    score_percentile: user.xInfo?.scorePercentile,
    score_quantile: user.xInfo?.scoreQuantile,
    mindshare_percentage: user.mindsharePercentage,
    relative_mindshare: user.relativeMindshare,
    app_use_multiplier: user.appUseMultiplier,
    position: user.position,
    position_change: user.positionChange,
    period,
    fetched_at,
    snapshot_id: snapshotId
  }));

  await supabase.from('heyelsa_leaderboard').insert(records);

  const periodMap: Record<string, number> = {
    'epoch-2': 0,
    '7d': 7,
    '30d': 30
  };

  await supabase.from('leaderboard_cache').upsert({
    cache_type: 'heyelsa',
    days: periodMap[period],
    last_updated: fetched_at,
    snapshot_id: snapshotId,
    record_count: records.length
  }, {
    onConflict: 'cache_type,days'
  });

  return snapshotId; // in case you want to log it
}
