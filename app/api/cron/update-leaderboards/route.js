import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ⏱ helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = {
      yappers: {},
      duelduck: null,
      adichain: null,
      cleanup: {},
      timestamp: new Date().toISOString()
    };

    // 🧹 Cleanup (keep last 7 days)
    console.log('Cleaning up old data...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: yappersDeleted } = await supabase
      .from('yappers_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });

    const { count: duckDeleted } = await supabase
      .from('duelduck_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });

    const { count: adichainDeleted } = await supabase
      .from('adichain_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });

    results.cleanup = {
      yappers_deleted: yappersDeleted || 0,
      duelduck_deleted: duckDeleted || 0,
      adichain_deleted: adichainDeleted || 0
    };

    console.log(
      `✅ Cleanup: Deleted ${yappersDeleted || 0} Yappers, ${duckDeleted || 0} DuelDuck, ${adichainDeleted || 0} Adichain`
    );

    // 🔹 Yappers (7 & 30 days)
    for (const days of [7, 30]) {
      console.log(`Fetching Yappers data for ${days} days...`);
      const data = await fetchYappersData(days);
      if (data) {
        await storeYappersData(data, days);
        results.yappers[days] = { success: true, count: data.length };
      }
    }

    // 🔹 DuelDuck
    console.log('Fetching DuelDuck data...');
    const duelDuckData = await fetchDuelDuckData();
    if (duelDuckData) {
      await storeDuelDuckData(duelDuckData);
      results.duelduck = { success: true, count: duelDuckData.length };
    }

    // 🔹 Adichain (FIXED)
    console.log('Fetching Adichain data...');
    const adichainData = await fetchAdichainData();
    if (adichainData) {
      await storeAdichainData(adichainData);
      results.adichain = { success: true, count: adichainData.length };
    }

    return NextResponse.json({
      success: true,
      message: 'Leaderboards updated successfully',
      results
    });

  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json(
      { error: 'Failed to update leaderboards', details: error.message },
      { status: 500 }
    );
  }
}

/* ================= FETCHERS ================= */

async function fetchYappersData(days) {
  try {
    const res = await fetch(
      `https://yappers-api.goat.network/leaderboard?days=${days}&limit=1000`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(res.status);
    const json = await res.json();
    return json.yappers || [];
  } catch (e) {
    console.error('Yappers fetch error:', e);
    return null;
  }
}

async function fetchDuelDuckData() {
  try {
    const res = await fetch(
      'https://api.duelduck.com/mention-challenge/leaderboard?opts.pagination.page_size=1000&opts.pagination.page_num=1&opts.order.order_by=total_score&opts.order.order_type=desc&challenge_id=131938ae-0b07-4ac5-8b67-4c1d3cbbee5e',
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(res.status);
    const json = await res.json();
    return json.leaders || [];
  } catch (e) {
    console.error('DuelDuck fetch error:', e);
    return null;
  }
}

/* ✅ FIXED ADICHAIN FETCH */
async function fetchAdichainData() {
  try {
    const allUsers = [];
    const TOTAL_PAGES = 25;
    const LIMIT = 50;
    const DELAY_MS = 2500;

    for (let page = 1; page <= TOTAL_PAGES; page++) {
      console.log(`Fetching Adichain page ${page}...`);

      const res = await fetch(
        `https://www.xeet.ai/api/topics/adi/tournament?page=${page}&limit=${LIMIT}&timeframe=all&tournamentId=3396f69f-70c1-4703-9b01-47b147e095ef`,
        {
          cache: 'no-store',
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        }
      );

      if (res.status === 429) {
        console.warn(`429 on page ${page}, backing off...`);
        await sleep(DELAY_MS * 2);
        page--;
        continue;
      }

      if (!res.ok) throw new Error(res.status);

      const json = await res.json();
      const rows = json?.data ?? [];

      if (rows.length === 0) break;

      allUsers.push(...rows);
      await sleep(DELAY_MS);
    }

    console.log(`✅ Fetched ${allUsers.length} Adichain users`);
    return allUsers;

  } catch (e) {
    console.error('Adichain fetch error:', e);
    return null;
  }
}

/* ================= STORES ================= */

async function storeYappersData(yappers, days) {
  const fetched_at = new Date().toISOString();

  await supabase.from('yappers_leaderboard').insert(
    yappers.map(y => ({ ...y, days, fetched_at }))
  );

  await supabase.from('leaderboard_cache').upsert(
    {
      cache_type: 'yappers',
      days,
      last_updated: fetched_at,
      record_count: yappers.length
    },
    { onConflict: 'cache_type,days' }
  );
}

async function storeDuelDuckData(leaders) {
  const fetched_at = new Date().toISOString();

  await supabase.from('duelduck_leaderboard').insert(
    leaders.map(l => ({ ...l, fetched_at }))
  );

  await supabase.from('leaderboard_cache').upsert(
    {
      cache_type: 'duelduck',
      days: 0,
      last_updated: fetched_at,
      record_count: leaders.length
    },
    { onConflict: 'cache_type,days' }
  );
}

async function storeAdichainData(users) {
  const fetched_at = new Date().toISOString();

  await supabase.from('adichain_leaderboard').insert(
    users.map(u => ({
      adichain_id: u.id,
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
      fetched_at
    }))
  );

  await supabase.from('leaderboard_cache').upsert(
    {
      cache_type: 'adichain',
      days: 0,
      last_updated: fetched_at,
      record_count: users.length
    },
    { onConflict: 'cache_type,days' }
  );
}
