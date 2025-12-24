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
      heyelsa: {},
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

    const { count: heyelsaDeleted } = await supabase
      .from('heyelsa_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });

    results.cleanup = {
      yappers_deleted: yappersDeleted || 0,
      duelduck_deleted: duckDeleted || 0,
      adichain_deleted: adichainDeleted || 0,
      heyelsa_deleted: heyelsaDeleted || 0
    };

    console.log(
      `✅ Cleanup: Deleted ${yappersDeleted || 0} Yappers, ${duckDeleted || 0} DuelDuck, ${adichainDeleted || 0} Adichain, ${heyelsaDeleted || 0} HeyElsa`
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

    // 🔹 Adichain (WITH SCRAPEAPI)
    console.log('Fetching Adichain data...');
    const adichainData = await fetchAdichainData();
    if (adichainData) {
      await storeAdichainData(adichainData);
      results.adichain = { success: true, count: adichainData.length };
    }

    // 🔹 HeyElsa (epoch-2, 7d, 30d)
    for (const period of ['epoch-2', '7d', '30d']) {
      console.log(`Fetching HeyElsa data for ${period}...`);
      const heyelsaData = await fetchHeyElsaData(period);
      if (heyelsaData) {
        await storeHeyElsaData(heyelsaData, period);
        results.heyelsa[period] = { success: true, count: heyelsaData.length };
      } else {
        results.heyelsa[period] = { success: false, error: 'Failed to fetch' };
      }
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

/* ✅ ADICHAIN FETCH WITH SCRAPEAPI */
async function fetchAdichainData() {
  try {
    const scraperApiKey = process.env.SCRAPER_API_KEY;
    
    if (!scraperApiKey) {
      console.error('❌ SCRAPER_API_KEY not set');
      return null;
    }

    const allUsers = [];
    const TOTAL_PAGES = 15;
    const LIMIT = 100;
    const DELAY_MS = 5000;
    let failedPages = 0;

    for (let page = 1; page <= TOTAL_PAGES; page++) {
      console.log(`Fetching Adichain page ${page}/${TOTAL_PAGES}...`);

      const targetUrl = `https://www.xeet.ai/api/topics/adi/tournament?page=${page}&limit=${LIMIT}&timeframe=all&tournamentId=3396f69f-70c1-4703-9b01-47b147e095ef`;
      const scraperApiUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(targetUrl)}`;

      try {
        const res = await fetch(scraperApiUrl, {
          method: 'GET',
          cache: 'no-store'
        });

        if (res.status === 429) {
          console.warn(`⚠️ 429 on page ${page}, backing off...`);
          await sleep(DELAY_MS * 2);
          page--;
          continue;
        }

        if (!res.ok) {
          console.error(`❌ Page ${page} failed with status ${res.status}`);
          failedPages++;
          
          if (failedPages >= 5) {
            console.error(`❌ Stopping: ${failedPages} pages failed`);
            break;
          }
          
          await sleep(10000);
          continue;
        }

        const json = await res.json();
        const rows = json?.data ?? [];

        if (rows.length === 0) {
          console.log(`ℹ️ Page ${page} returned no data, stopping`);
          break;
        }

        allUsers.push(...rows);
        console.log(`✅ Page ${page}: ${rows.length} users (total: ${allUsers.length})`);

        if (page < TOTAL_PAGES) {
          await sleep(DELAY_MS);
        }

      } catch (fetchError) {
        console.error(`❌ Error fetching page ${page}:`, fetchError.message);
        failedPages++;
        
        if (failedPages >= 5) {
          console.error(`❌ Stopping: ${failedPages} pages failed`);
          break;
        }
        
        await sleep(10000);
      }
    }

    console.log(`✅ Fetched ${allUsers.length} Adichain users (${failedPages} failures)`);
    return allUsers.length > 0 ? allUsers : null;

  } catch (e) {
    console.error('Adichain fetch error:', e);
    return null;
  }
}

async function fetchHeyElsaData(period) {
  try {
    let allUsers = [];
    let page = 1;
    const pageSize = 50;
    const maxPages = 20;

    while (page <= maxPages) {
      console.log(`Fetching HeyElsa ${period} page ${page}...`);
      
      const response = await fetch(
        `https://api.wallchain.xyz/voices/companies/heyelsa/leaderboard?page=${page}&pageSize=${pageSize}&orderBy=position&ascending=false&period=${period}`,
        { 
          cache: 'no-store',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.heyelsa.com/',
            'Origin': 'https://www.heyelsa.com',
            'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site'
          }
        }
      );
      
      if (!response.ok) {
        console.error(`HeyElsa API returned ${response.status} for ${period} page ${page}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.entries || data.entries.length === 0) {
        break;
      }
      
      allUsers = allUsers.concat(data.entries);
      
      if (page >= data.totalPages || data.entries.length < pageSize) {
        break;
      }
      
      page++;
      
      // Add a small delay between requests to avoid rate limiting
      await sleep(1000);
    }
    
    console.log(`✅ Fetched total of ${allUsers.length} HeyElsa users for ${period}`);
    return allUsers;
    
  } catch (error) {
    console.error(`Error fetching HeyElsa data for ${period}:`, error);
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

async function storeHeyElsaData(users, period) {
  const fetched_at = new Date().toISOString();
  
  const records = users.map(user => ({
    heyelsa_id: user.xInfo?.id,
    x_id: user.xInfo?.id,
    name: user.xInfo?.name,
    username: user.xInfo?.username,
    image_url: user.xInfo?.imageUrl,
    rank: user.xInfo?.rank,
    score: user.xInfo?.score,
    score_percentile: user.xInfo?.scorePercentile,
    score_quantile: user.xInfo?.scoreQuantile,
    mindshare_percentage: user.mindsharePercentage,
    relative_mindshare: user.relativeMindshare,
    app_use_multiplier: user.appUseMultiplier,
    position: user.position,
    position_change: user.positionChange,
    period: period,
    fetched_at: fetched_at
  }));

  const { error } = await supabase
    .from('heyelsa_leaderboard')
    .insert(records);

  if (error) {
    console.error(`Error storing HeyElsa data for ${period}:`, error);
    throw error;
  }

  const periodMap = {
    'epoch-2': 0,
    '7d': 7,
    '30d': 30
  };

  await supabase
    .from('leaderboard_cache')
    .upsert({
      cache_type: 'heyelsa',
      days: periodMap[period],
      last_updated: fetched_at,
      record_count: records.length
    }, {
      onConflict: 'cache_type,days'
    });

  console.log(`✅ Stored ${records.length} HeyElsa records for ${period}`);
}
