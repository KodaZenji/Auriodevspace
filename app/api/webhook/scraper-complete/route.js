import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ Convert period strings to days (matching contract logic)
const PERIOD_TO_DAYS = {
  'epoch-2': 2,   // Period 0 = Epoch 2 = 2 days
  '7d': 7,        // Period 7 = 7 days
  '30d': 30       // Period 30 = 30 days
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

    // ✅ Store HeyElsa data with days conversion and JSONB structure
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

// ✅ HeyElsa with JSONB structure (FIXED!)
async function storeHeyElsaData(users, period, days, snapshotId) {
  const fetched_at = new Date().toISOString();
  
  console.log(`[HeyElsa] Storing ${users.length} users for ${period} (${days}d)`);
  
  // ✅ NEW: Store xInfo as JSONB instead of flattening
  const records = users.map(user => ({
    username: user.xInfo?.username,       // Extract for indexing
    x_info: user.xInfo,                   // ← Store entire xInfo as JSONB
    mindshare_percentage: user.mindsharePercentage,
    relative_mindshare: user.relativeMindshare,
    app_use_multiplier: user.appUseMultiplier,
    position: user.position,
    position_change: user.positionChange === 'new' ? null : user.positionChange,  // ✅ Handle "new"
    days: days,                           // 2, 7, or 30
    snapshot_id: snapshotId,
    fetched_at: fetched_at
  }));

  console.log(`[HeyElsa] Sample record:`, JSON.stringify(records[0], null, 2));

  // Insert with error handling
  const { data: insertedData, error: insertError } = await supabase
    .from('heyelsa_leaderboard')
    .insert(records)
    .select();

  if (insertError) {
    console.error('[HeyElsa] ❌ Insert error:', JSON.stringify(insertError, null, 2));
    throw insertError;
  }

  console.log(`[HeyElsa] ✅ Successfully inserted ${insertedData?.length || 0} records`);

  // Update cache
  const { error: cacheError } = await supabase
    .from('leaderboard_cache')
    .upsert({
      cache_type: 'heyelsa',
      days: days,
      last_updated: fetched_at,
      snapshot_id: snapshotId,
      record_count: records.length
    }, {
      onConflict: 'cache_type,days'
    });

  if (cacheError) {
    console.error('[HeyElsa] ❌ Cache error:', cacheError);
    throw cacheError;
  }

  return snapshotId;
}
