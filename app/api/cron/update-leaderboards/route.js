import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

    // Clean up old data first (keep only last 7 days of data)
    console.log('Cleaning up old data...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { error: cleanupYappersError, count: yappersDeleted } = await supabase
      .from('yappers_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });
    
    const { error: cleanupDuckError, count: duckDeleted } = await supabase
      .from('duelduck_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });
    
    const { error: cleanupAdichainError, count: adichainDeleted } = await supabase
      .from('adichain_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });
    
    results.cleanup = {
      yappers_deleted: yappersDeleted || 0,
      duelduck_deleted: duckDeleted || 0,
      adichain_deleted: adichainDeleted || 0
    };
    
    console.log(`✅ Cleanup: Deleted ${yappersDeleted || 0} old Yappers, ${duckDeleted || 0} old DuelDuck, ${adichainDeleted || 0} old Adichain records`);

    // Fetch and store Yappers data for 7 and 30 days only
    for (const days of [7, 30]) {
      console.log(`Fetching Yappers data for ${days} days...`);
      const yappersData = await fetchYappersData(days);
      if (yappersData) {
        await storeYappersData(yappersData, days);
        results.yappers[days] = {
          success: true,
          count: yappersData.length
        };
      } else {
        results.yappers[days] = {
          success: false,
          error: 'Failed to fetch'
        };
      }
    }

    // Fetch and store DuelDuck data
    console.log('Fetching DuelDuck data...');
    const duelDuckData = await fetchDuelDuckData();
    if (duelDuckData) {
      await storeDuelDuckData(duelDuckData);
      results.duelduck = {
        success: true,
        count: duelDuckData.length
      };
    } else {
      results.duelduck = {
        success: false,
        error: 'Failed to fetch'
      };
    }

    // Fetch and store Adichain data
    console.log('Fetching Adichain data...');
    const adichainData = await fetchAdichainData();
    if (adichainData) {
      await storeAdichainData(adichainData);
      results.adichain = {
        success: true,
        count: adichainData.length
      };
    } else {
      results.adichain = {
        success: false,
        error: 'Failed to fetch'
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Leaderboards updated successfully',
      results
    });
  } catch (error) {
    console.error('Error updating leaderboards:', error);
    return NextResponse.json(
      { error: 'Failed to update leaderboards', details: error.message },
      { status: 500 }
    );
  }
}

async function fetchYappersData(days) {
  try {
    const response = await fetch(
      `https://yappers-api.goat.network/leaderboard?days=${days}&limit=1000`,
      { cache: 'no-store' }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.yappers || [];
  } catch (error) {
    console.error(`Error fetching Yappers data for ${days} days:`, error);
    return null;
  }
}

async function fetchDuelDuckData() {
  try {
    const response = await fetch(
      'https://api.duelduck.com/mention-challenge/leaderboard?opts.pagination.page_size=1000&opts.pagination.page_num=1&opts.order.order_by=total_score&opts.order.order_type=desc&challenge_id=131938ae-0b07-4ac5-8b67-4c1d3cbbee5e',
      { cache: 'no-store' }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.leaders || [];
  } catch (error) {
    console.error('Error fetching DuelDuck data:', error);
    return null;
  }
}

async function storeYappersData(yappers, days) {
  const fetchedAt = new Date().toISOString();
  
  const records = yappers.map(yapper => ({
    username: yapper.username,
    rank: yapper.rank,
    score: yapper.score,
    adjust_score: yapper.adjust_score,
    raw_community_score: yapper.raw_community_score,
    mindshare: yapper.mindshare,
    tweet_counts: yapper.tweet_counts,
    total_impressions: yapper.total_impressions,
    total_likes: yapper.total_likes,
    days: days,
    fetched_at: fetchedAt
  }));

  const { error } = await supabase
    .from('yappers_leaderboard')
    .insert(records);

  if (error) {
    console.error('Error storing Yappers data:', error);
    throw error;
  }

  // Update cache metadata
  const { error: cacheError } = await supabase
    .from('leaderboard_cache')
    .upsert({
      cache_type: 'yappers',
      days: days,
      last_updated: fetchedAt,
      record_count: records.length
    }, {
      onConflict: 'cache_type,days'
    });

  if (cacheError) {
    console.error('Error updating Yappers cache:', cacheError);
  }

  console.log(`✅ Stored ${records.length} Yappers records for ${days} days`);
}

async function storeDuelDuckData(leaders) {
  const fetchedAt = new Date().toISOString();
  
  const records = leaders.map(leader => ({
    user_id: leader.user_id,
    x_id: leader.x_id,
    x_username: leader.x_username,
    username: leader.username,
    x_score: leader.x_score,
    total_score: leader.total_score,
    dd_score: leader.dd_score,
    user_share: leader.user_share,
    usdc_reward: leader.usdc_reward,
    is_claimed: leader.is_claimed,
    is_banned: leader.is_banned,
    fetched_at: fetchedAt
  }));

  const { error } = await supabase
    .from('duelduck_leaderboard')
    .insert(records);

  if (error) {
    console.error('Error storing DuelDuck data:', error);
    throw error;
  }

  // Update cache metadata - use days: 0 for duelduck (represents "epoch" or "all")
  const { error: cacheError } = await supabase
    .from('leaderboard_cache')
    .upsert({
      cache_type: 'duelduck',
      days: 0,
      last_updated: fetchedAt,
      record_count: records.length
    }, {
      onConflict: 'cache_type,days'
    });

  if (cacheError) {
    console.error('Error updating DuelDuck cache:', cacheError);
  }

  console.log(`✅ Stored ${records.length} DuelDuck records`);
}

async function fetchAdichainData() {
  try {
    let allUsers = [];
    let page = 1;
    let hasMore = true;
    const limit = 50;

    while (hasMore) {
      console.log(`Fetching Adichain page ${page}...`);
      
      const response = await fetch(
        `https://www.xeet.ai/api/topics/adi/tournament?page=${page}&limit=${limit}&timeframe=all&tournamentId=3396f69f-70c1-4703-9b01-47b147e095ef`,
        { cache: 'no-store' }
      );
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (!data.success || !data.data || data.data.length === 0) {
        hasMore = false;
        break;
      }
      
      allUsers = allUsers.concat(data.data);
      
      // Check if there are more pages
      if (data.data.length < limit) {
        hasMore = false; // Last page
      } else {
        page++;
      }
    }
    
    console.log(`✅ Fetched total of ${allUsers.length} Adichain users across ${page} pages`);
    return allUsers;
    
  } catch (error) {
    console.error('Error fetching Adichain data:', error);
    return null;
  }
}

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

  const { error } = await supabase
    .from('adichain_leaderboard')
    .insert(records);

  if (error) {
    console.error('Error storing Adichain data:', error);
    throw error;
  }

  // Update cache metadata - use days: 0 for adichain
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

  if (cacheError) {
    console.error('Error updating Adichain cache:', cacheError);
  }

  console.log(`✅ Stored ${records.length} Adichain records`);
}
