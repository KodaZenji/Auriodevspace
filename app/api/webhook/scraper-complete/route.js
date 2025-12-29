import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PERIOD_TO_DAYS = {
  'epoch-2': 2,
  '7d': 7,
  '30d': 30
};

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('📥 Received scraping results from Railway');
      
    const scrapedData = await request.json();

    if (!scrapedData.success) {
      throw new Error(scrapedData.error || 'Scraping failed');
    }

    const results = {
      yappers: {},
      duelduck: null,
      adichain: null,
      heyelsa: {},
      mindoshare: null,
      timestamp: new Date().toISOString()
    };

    // Store Yappers data
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
      console.log(`[DuelDuck] Attempting to store ${scrapedData.results.duelduck.count} users...`);
      console.log(`[DuelDuck] Sample data:`, JSON.stringify(scrapedData.results.duelduck.data[0]).substring(0, 300));
      
      try {
        await storeDuelDuckData(scrapedData.results.duelduck.data);
        results.duelduck = { success: true, count: scrapedData.results.duelduck.count };
        console.log(`✅ Stored ${scrapedData.results.duelduck.count} DuelDuck users`);
      } catch (error) {
        console.error(`❌ DuelDuck storage error:`, error.message);
        results.duelduck = { success: false, error: error.message };
      }
    } else {
      console.log(`⚠️ No DuelDuck data received`);
    }

    // Store Adichain data
    if (scrapedData.results?.adichain?.data) {
      await storeAdichainData(scrapedData.results.adichain.data);
      results.adichain = { success: true, count: scrapedData.results.adichain.count };
      console.log(`✅ Stored ${scrapedData.results.adichain.count} Adichain users`);
    }

    // Store HeyElsa data
    if (scrapedData.results?.heyelsa) {
      for (const [period, heyelsaData] of Object.entries(scrapedData.results.heyelsa)) {
        if (heyelsaData.data && heyelsaData.data.length > 0) {
          const periodSnapshotId = crypto.randomUUID();
          const days = PERIOD_TO_DAYS[period];
          await storeHeyElsaData(heyelsaData.data, period, days, periodSnapshotId);
          results.heyelsa[period] = {   
            success: true,   
            count: heyelsaData.count,  
            days: days,  
            snapshot_id: periodSnapshotId  
          };
          console.log(`✅ Stored ${heyelsaData.count} HeyElsa users (${period} = ${days}d) - Snapshot: ${periodSnapshotId}`);
        }
      }
    }

    // Store Mindoshare data
    if (scrapedData.results?.mindoshare?.data) {
      console.log(`[Mindoshare] Attempting to store ${scrapedData.results.mindoshare.count} users...`);
      console.log(`[Mindoshare] Sample data:`, JSON.stringify(scrapedData.results.mindoshare.data[0]).substring(0, 300));
      
      try {
        await storeMindoshareData(scrapedData.results.mindoshare.data);
        results.mindoshare = { success: true, count: scrapedData.results.mindoshare.count };
        console.log(`✅ Stored ${scrapedData.results.mindoshare.count} Mindoshare users`);
      } catch (error) {
        console.error(`❌ Mindoshare storage error:`, error.message);
        results.mindoshare = { success: false, error: error.message };
      }
    } else {
      console.log(`⚠️ No Mindoshare data received`);
      console.log(`[Mindoshare] Debug - full results object:`, JSON.stringify(scrapedData.results?.mindoshare).substring(0, 500));
    }

    console.log('✅ All data stored successfully in Supabase');

    return NextResponse.json({
      success: true,
      message: 'Data stored successfully',
      results
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to store leaderboard data',   
        details: error.message   
      },
      { status: 500 }
    );
  }
}

/* ================= STORE FUNCTIONS ================= */

async function storeYappersData(yappers, days) {
  const fetched_at = new Date().toISOString();

  const { error } = await supabase.from('yappers_leaderboard').insert(
    yappers.map(y => ({ ...y, days, fetched_at }))
  );

  if (error) throw error;

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

  // Store data EXACTLY as the API returns it - frontend expects these fields
  const records = leaders.map((l, index) => ({
    x_username: l.x_username,           // Frontend expects x_username
    username: l.username,               // DuelDuck internal username
    total_score: l.total_score || 0,
    x_score: l.x_score || 0,           // Frontend expects x_score
    dd_score: l.dd_score || 0,         // Frontend expects dd_score
    user_share: l.user_share || 0,     // Frontend expects user_share
    usdc_reward: l.usdc_reward || 0,   // Frontend expects usdc_reward
    rank: index + 1,                    // Calculate rank from position
    fetched_at
  }));

  console.log(`[DuelDuck] Mapped sample record:`, JSON.stringify(records[0]));

  const { error } = await supabase.from('duelduck_leaderboard').insert(records);

  if (error) {
    console.error('[DuelDuck] Insert error:', error);
    throw error;
  }

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

  const { error } = await supabase.from('adichain_leaderboard').insert(
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

  if (error) throw error;

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

async function storeHeyElsaData(users, period, days, snapshotId) {
  const fetched_at = new Date().toISOString();
    
  const records = users.map(user => ({
    username: user.xInfo?.username,
    x_info: user.xInfo,
    mindshare_percentage: user.mindsharePercentage,
    relative_mindshare: user.relativeMindshare,
    app_use_multiplier: user.appUseMultiplier,
    position: user.position,
    position_change: user.positionChange === 'new' ? null : user.positionChange,
    days,
    snapshot_id: snapshotId,
    fetched_at
  }));

  const { error: insertError } = await supabase
    .from('heyelsa_leaderboard')
    .insert(records)
    .select();

  if (insertError) throw insertError;

  await supabase.from('leaderboard_cache').upsert(
    {
      cache_type: 'heyelsa',
      days,
      last_updated: fetched_at,
      snapshot_id: snapshotId,
      record_count: records.length
    },
    { onConflict: 'cache_type,days' }
  );

  return snapshotId;
}

// Store Mindoshare/PerceptronNTWK data
async function storeMindoshareData(users) {
  const fetched_at = new Date().toISOString();

  // Frontend expects lowercase field names: mindometric, rank_delta, kol_score
  const records = users.map((user) => ({
    username: user.twitterUsername,        // API: twitterUsername -> DB: username
    rank: user.rank,                       // API: rank -> DB: rank
    mindometric: user.mindoMetric,         // API: mindoMetric -> DB: mindometric (lowercase!)
    rankdelta: user.rankDelta || 0,        // API: rankDelta -> DB: rankdelta (lowercase!)
    kolscore: user.kolScore || 0,          // API: kolScore -> DB: kolscore (lowercase!)
    fetched_at
  }));

  console.log(`[Mindoshare] Mapped sample record:`, JSON.stringify(records[0]));

  const { error: insertError } = await supabase
    .from('mindoshare_perceptronntwk')
    .insert(records)
    .select();

  if (insertError) {
    console.error('[Mindoshare] Insert error:', insertError);
    throw insertError;
  }

  await supabase.from('leaderboard_cache').upsert(
    {
      cache_type: 'PerceptronNTWK',
      days: 0,
      last_updated: fetched_at,
      record_count: records.length
    },
    { onConflict: 'cache_type,days' }
  );
}
