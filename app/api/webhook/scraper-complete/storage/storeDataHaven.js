import { supabase, getFetchedAt, updateCache } from '../utils';

export async function storeDataHaven(users) {
  const fetchedAt = getFetchedAt();

  const { error } = await supabase
    .from('datahaven_leaderboard')
    .insert(users.map(u => ({
      datahaven_id: u.id,
      tournament_id: u.tournamentId,
      user_id: u.userId,
      twitter_id: u.twitterId,
      handle: u.handle,
      name: u.name,
      avatar_url: u.avatarUrl,
      signal_points: u.signalPoints,
      noise_points: u.noisePoints,
      bonus_points: u.bonusPoints,
      pending_points: u.pendingPoints,
      total_points: u.totalPoints,
      multiplier: u.multiplier,
      mindshare_pct: u.mindsharePct,
      rank_signal: u.rankSignal,
      rank_noise: u.rankNoise,
      rank_total: u.rankTotal,
      rank_change: u.rankChange,
      fetched_at: fetchedAt
    })));

  if (error) throw error;

  await updateCache('datahaven', 0, fetchedAt, users.length);
  
  console.log(`[DataHaven] ✅ Stored ${users.length} users`);
}
