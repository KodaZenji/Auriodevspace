import { supabase, getFetchedAt, updateCache } from '../utils';
const TIMEFILTER_TO_DAYS = {
  '7D': 7,
  'ALL': 0
};

export async function storeYapsFandom(users, timeFilter) {
  const fetchedAt = getFetchedAt();
  const days = TIMEFILTER_TO_DAYS[timeFilter];

  const records = users.map(user => ({
    rank: parseInt(user.rank) || 0,
    name: user.name,
    username: user.username,
    avatar_url: user.avatarUrl,
    total_yaps: parseInt(user.totalYaps) || 0,
    earned_yaps: parseInt(user.earnedYaps) || 0,
    kernel_yaps: parseInt(user.kernelYaps) || 0,
    snarfollowers: parseInt(user.snarfollowers) || 0,
    followers: parseInt(user.followers) || 0,
    mindshare: parseFloat(user.mindshare) || 0,
    evm_address: user.evmAddress,
    time_filter: timeFilter,
    days: days,
    fetched_at: fetchedAt
  }));

  console.log(`[YapsFandom] Mapped sample:`, JSON.stringify(records[0]));

  const { error } = await supabase
    .from('yapsfandom_leaderboard')
    .insert(records)
    .select();

  if (error) {
    console.error('[YapsFandom] Insert error:', error);
    throw error;
  }

  await updateCache('yapsfandom', days, fetchedAt, records.length);
  
  console.log(`[YapsFandom] ✅ Stored ${records.length} users for ${timeFilter}`);
}
