import { supabase, getFetchedAt, updateCache } from '../utils';

export async function storeDuelDuck(leaders) {
  const fetchedAt = getFetchedAt();

  const records = leaders.map((l, index) => ({
    x_username: l.x_username,
    username: l.username,
    total_score: l.total_score || 0,
    x_score: l.x_score || 0,
    dd_score: l.dd_score || 0,
    user_share: l.user_share || 0,
    usdc_reward: l.usdc_reward || 0,
    rank: index + 1,
    fetched_at: fetchedAt
  }));

  console.log(`[DuelDuck] Mapped sample:`, JSON.stringify(records[0]));

  const { error } = await supabase
    .from('duelduck_leaderboard')
    .insert(records);

  if (error) {
    console.error('[DuelDuck] Insert error:', error);
    throw error;
  }

  await updateCache('duelduck', 0, fetchedAt, leaders.length);
  
  console.log(`[DuelDuck] ✅ Stored ${leaders.length} users`);
}
