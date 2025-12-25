import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  // Security: Check cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🚀 Starting leaderboard update via Railway...');
    
    // 🧹 CLEANUP OLD DATA (keep last 7 days)
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

    console.log(`✅ Cleanup: Deleted ${yappersDeleted || 0} Yappers, ${duckDeleted || 0} DuelDuck, ${adichainDeleted || 0} Adichain, ${heyelsaDeleted || 0} HeyElsa`);
    
    // Call your Railway scraper (scrapes everything at once)
    const railwayUrl = process.env.RAILWAY_SCRAPER_URL;
    
    if (!railwayUrl) {
      throw new Error('RAILWAY_SCRAPER_URL not configured');
    }

    console.log(`Calling Railway: ${railwayUrl}/scrape-all`);
    
    const response = await fetch(`${railwayUrl}/scrape-all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Important: Vercel has 60s timeout, but Railway keeps running
      signal: AbortSignal.timeout(55000), // 55 seconds max wait
    });

    if (!response.ok) {
      throw new Error(`Railway responded with ${response.status}`);
    }

    const scrapedData = await response.json();
    console.log('✅ Railway scraping complete:', scrapedData);

    // Now store all the data in Supabase
    const results = {
      yappers: {},
      duelduck: null,
      adichain: null,
      heyelsa: {},
      cleanup: {
        yappers_deleted: yappersDeleted || 0,
        duelduck_deleted: duckDeleted || 0,
        adichain_deleted: adichainDeleted || 0,
        heyelsa_deleted: heyelsaDeleted || 0
      },
      timestamp: new Date().toISOString()
    };

    // Store Yappers data (7d and 30d)
    if (scrapedData.results?.yappers) {
      for (const [days, yappersData] of Object.entries(scrapedData.results.yappers)) {
        if (yappersData.data && yappersData.data.length > 0) {
          await storeYappersData(yappersData.data, parseInt(days));
          results.yappers[days] = { success: true, count: yappersData.count };
          console.log(`✅ Stored ${yappersData.count} Yappers (${days}d)`);
        }
      }
    }

    // Store DuelDuck data
    if (scrapedData.results?.duelduck?.data) {
      await storeDuelDuckData(scrapedData.results.duelduck.data);
      results.duelduck = { success: true, count: scrapedData.results.duelduck.count };
      console.log(`✅ Stored ${scrapedData.results.duelduck.count} DuelDuck users`);
    }

    // Store Adichain data
    if (scrapedData.results?.adichain?.data) {
      await storeAdichainData(scrapedData.results.adichain.data);
      results.adichain = { success: true, count: scrapedData.results.adichain.count };
      console.log(`✅ Stored ${scrapedData.results.adichain.count} Adichain users`);
    }

    // Store HeyElsa data (epoch-2, 7d, 30d)
    if (scrapedData.results?.heyelsa) {
      for (const [period, heyelsaData] of Object.entries(scrapedData.results.heyelsa)) {
        if (heyelsaData.data && heyelsaData.data.length > 0) {
          await storeHeyElsaData(heyelsaData.data, period);
          results.heyelsa[period] = { success: true, count: heyelsaData.count };
          console.log(`✅ Stored ${heyelsaData.count} HeyElsa users (${period})`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Leaderboards updated successfully via Railway',
      results
    });

  } catch (error) {
    console.error('❌ Cron error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update leaderboards', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/* ================= STORE FUNCTIONS ================= */

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

  await supabase.from('heyelsa_leaderboard').insert(records);

  const periodMap = {
    'epoch-2': 0,
    '7d': 7,
    '30d': 30
  };

  await supabase.from('leaderboard_cache').upsert({
    cache_type: 'heyelsa',
    days: periodMap[period],
    last_updated: fetched_at,
    record_count: records.length
  }, {
    onConflict: 'cache_type,days'
  });
}
