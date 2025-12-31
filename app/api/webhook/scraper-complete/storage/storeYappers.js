import { supabase, getFetchedAt, updateCache } from '../utils';

export async function storeYappers(yappers, days) {
  const fetchedAt = getFetchedAt();

  const { error } = await supabase
    .from('yappers_leaderboard')
    .insert(yappers.map(y => ({ ...y, days, fetched_at: fetchedAt })));

  if (error) throw error;

  await updateCache('yappers', days, fetchedAt, yappers.length);
  
  console.log(`[Yappers] ✅ Stored ${yappers.length} users for ${days}d`);
}
