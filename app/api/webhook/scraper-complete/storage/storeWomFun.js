import { supabase, getFetchedAt, updateCache } from '../utils';

export async function storeWomFun(users) {
  if (!users || users.length === 0) {
    console.log('[WomFun] No users to store');
    return;
  }

  console.log(`[WomFun] Preparing to store ${users.length} users`);
  console.log('[WomFun] Sample user:', JSON.stringify(users[0], null, 2));

  const fetchedAt = getFetchedAt();

  // Map the users with proper error handling
  const mappedUsers = users.map((u, index) => {
    try {
      return {
        rank: u.rank || index + 1,
        twitter_username: u.twitter_username || null,
        twitter_profile_image_url: u.twitter_profile_image_url || null,
        wallet_address: u.wallet_address || null,
        poi_score: u.poi_score !== undefined ? parseFloat(u.poi_score) : null,
        mindshare_score: u.mindshare_score !== undefined ? parseFloat(u.mindshare_score) : null,
        reputation: u.reputation !== undefined ? parseInt(u.reputation) : 0,
        fetched_at: fetchedAt
      };
    } catch (err) {
      console.error(`[WomFun] Error mapping user at index ${index}:`, err.message);
      console.error('[WomFun] Problematic user:', JSON.stringify(u, null, 2));
      return null;
    }
  }).filter(Boolean); // Remove any null entries

  if (mappedUsers.length === 0) {
    console.error('[WomFun] No valid users after mapping');
    return;
  }

  console.log(`[WomFun] Inserting ${mappedUsers.length} mapped users`);

  const { data, error } = await supabase
    .from('womfun_leaderboard')
    .insert(mappedUsers)
    .select();

  if (error) {
    console.error('[WomFun] Database error:', error.message);
    console.error('[WomFun] Error details:', JSON.stringify(error, null, 2));
    console.error('[WomFun] Sample of data being inserted:', JSON.stringify(mappedUsers[0], null, 2));
    throw error;
  }

  await updateCache('womfun', 0, fetchedAt, mappedUsers.length);
  
  console.log(`[WomFun] ✅ Stored ${mappedUsers.length} users`);
}
