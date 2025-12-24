import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch a single page with retry/backoff
async function fetchAdichainPage(page, limit = 50, retries = 5) {
  const url = `https://www.xeet.ai/api/topics/adi/tournament?page=${page}&limit=${limit}&timeframe=all&tournamentId=3396f69f-70c1-4703-9b01-47b147e095ef`;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0', // prevent Cloudflare blocks
        },
        cache: 'no-store'
      });
      if (res.status === 429) {
        console.warn(`429 rate limit on page ${page}, backing off...`);
        await delay(5000 + Math.random() * 5000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Unknown API error');
      return data;
    } catch (err) {
      console.error(`Error fetching Adichain page ${page}:`, err.message);
      if (attempt < retries - 1) await delay(3000 + Math.random() * 2000);
      else throw err;
    }
  }
  return null;
}

// Fetch all pages safely
async function fetchAllAdichainData() {
  const allUsers = [];
  let page = 1;
  let totalPages = 1;
  const LIMIT = 50;

  while (page <= totalPages) {
    console.log(`Fetching Adichain page ${page}...`);
    const data = await fetchAdichainPage(page, LIMIT);
    if (!data) break;

    allUsers.push(...data.data);

    totalPages = data.meta.totalPages || 1;
    page++;
    await delay(500); // small delay between pages
  }

  console.log(`✅ Fetched total of ${allUsers.length} Adichain users across ${totalPages} pages`);
  return allUsers;
}

// Store in Supabase
async function storeAdichainData(users) {
  const fetchedAt = new Date().toISOString();

  const records = users.map(user => ({
    adichain_id: user.id,
    tournament_id: user.tournamentId,
    user_id: user.userId,
    twitter_id: user.twitterId,
    handle: user.handle,
    name: user.name,
    avatar_url: user.avatarUrl,
    signal_points: user.signalPoints,
    noise_points: user.noisePoints,
    bonus_points: user.bonusPoints,
    pending_points: user.pendingPoints,
    total_points: user.totalPoints,
    multiplier: user.multiplier,
    mindshare_pct: user.mindsharePct,
    rank_signal: user.rankSignal,
    rank_noise: user.rankNoise,
    rank_total: user.rankTotal,
    rank_change: user.rankChange,
    fetched_at: fetchedAt
  }));

  const { error } = await supabase.from('adichain_leaderboard').insert(records);
  if (error) throw error;

  const { error: cacheError } = await supabase
    .from('leaderboard_cache')
    .upsert({
      cache_type: 'adichain',
      days: 0,
      last_updated: fetchedAt,
      record_count: records.length
    }, {
      onConflict: 'cache_type,days'
    });

  if (cacheError) console.error('Error updating Adichain cache:', cacheError);

  console.log(`✅ Stored ${records.length} Adichain records`);
}

// Next.js API handler
export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Fetching Adichain data...');
    const adichainData = await fetchAllAdichainData();
    if (adichainData.length > 0) {
      await storeAdichainData(adichainData);
    }

    return NextResponse.json({
      success: true,
      message: 'Adichain leaderboard updated successfully',
      count: adichainData.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to update Adichain leaderboard:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
