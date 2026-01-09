
import { supabase, getFetchedAt, updateCache } from '../utils';

export async function storeWomFun(users) {
  const fetchedAt = getFetchedAt();

  const { error } = await supabase
    .from('womfun_leaderboard')
    .insert(users.map(u => ({
      rank: u.rank,
      twitter_username: u.twitter_username,
      twitter_profile_image_url: u.twitter_profile_image_url,
      wallet_address: u.wallet_address,
      poi_score: u.poi_score,
      mindshare_score: u.mindshare_score,
      reputation: u.reputation || 0,
      fetched_at: fetchedAt
    })));

  if (error) throw error;

  await updateCache('womfun', 0, fetchedAt, users.length);
  
  console.log(`[WomFun] ✅ Stored ${users.length} users`);
}
