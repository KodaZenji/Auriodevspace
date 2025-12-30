async function scrapeYappers(days) {
  try {
    console.log(`[Yappers ${days}d] Starting...`);
    const res = await fetch(
      `https://yappers-api.goat.network/leaderboard?days=${days}&limit=1000`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    console.log(`[Yappers ${days}d] ✅ ${json.yappers?.length || 0} users`);
    return json.yappers || [];
  } catch (e) {
    console.error(`[Yappers ${days}d] ❌`, e.message);
    return null;
  }
}

module.exports = { scrapeYappers };
