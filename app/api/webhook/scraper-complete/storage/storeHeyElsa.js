import { supabase, getFetchedAt, updateCache } from '../utils';

export async function storeHeyElsa(users, period, days, snapshotId) {
  const fetchedAt = getFetchedAt();

  const records = users.map(user => ({
    username: user.xInfo?.username,
    x_info: user.xInfo,
    mindshare_percentage: user.mindsharePercentage,
    relative_mindshare: user.relativeMindshare,
    app_use_multiplier: user.appUseMultiplier,
    position: user.position,
    position_change: user.positionChange === 'new' ? null : user.positionChange,
    days,
    snapshot_id: snapshotId,
    fetched_at: fetchedAt
  }));

  const { error } = await supabase
    .from('heyelsa_leaderboard')
    .insert(records)
    .select();

  if (error) throw error;

  await updateCache('heyelsa', days, fetchedAt, records.length, snapshotId);
  
  console.log(`[HeyElsa] ✅ Stored ${records.length} users for ${days}d - Snapshot: ${snapshotId}`);
  return snapshotId;
}
