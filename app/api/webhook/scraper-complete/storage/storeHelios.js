import { supabase, getFetchedAt, updateCache } from '../utils';

export async function storeHelios(users) {
  const fetchedAt = getFetchedAt();

  const records = users.map(user => {
    const parsedRankDelta = parseInt(user.rankDelta);
    const rankdelta = isNaN(parsedRankDelta) ? 0 : parsedRankDelta;
    
    const parsedKolScore = parseInt(user.kolScore);
    const kolscore = isNaN(parsedKolScore) ? 0 : parsedKolScore;
    
    return {
      username: user.twitterUsername,
      rank: parseInt(user.rank) || 0,
      mindometric: parseFloat(user.mindoMetric) || 0,
      rankdelta,
      kolscore,
      fetched_at: fetchedAt
    };
  });

  console.log(`[Helios] Mapped sample:`, JSON.stringify(records[0]));

  const { error } = await supabase
    .from('helios_leaderboard')
    .insert(records)
    .select();

  if (error) {
    console.error('[Helios] Insert error:', error);
    throw error;
  }

  await updateCache('helios', 0, fetchedAt, records.length);
  
  console.log(`[Helios] ✅ Stored ${records.length} users`);
}
