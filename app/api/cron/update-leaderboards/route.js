import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutes

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch with proper browser headers
async function fetchAdichainPage(page, limit = 100, maxRetries = 3) {
  const url = `https://www.xeet.ai/api/topics/adi/tournament?page=${page}&limit=${limit}&timeframe=all&tournamentId=3396f69f-70c1-4703-9b01-47b147e095ef`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://www.xeet.ai/',
          'Origin': 'https://www.xeet.ai',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
        },
        cache: 'no-store'
      });
      
      if (res.status === 429) {
        console.warn(`⚠️ 429 on page ${page}, attempt ${attempt + 1}/${maxRetries}`);
        
        if (attempt === maxRetries - 1) {
          console.error(`❌ Page ${page} failed - rate limited`);
          return null;
        }
        
        // Exponential backoff: 10s, 20s, 40s
        const backoffMs = Math.pow(2, attempt) * 10000;
        console.log(`Waiting ${backoffMs/1000}s before retry...`);
        await delay(backoffMs);
        continue;
      }
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API returned success: false');
      }
      
      return data;
      
    } catch (err) {
      console.error(`Error on page ${page}, attempt ${attempt + 1}:`, err.message);
      
      if (attempt === maxRetries - 1) {
        console.error(`❌ Page ${page} failed after ${maxRetries} attempts`);
        return null;
      }
      
      await delay(3000);
    }
  }
  
  return null;
}

// Fetch exactly 15 pages with 100 items each = 1500 users max
async function fetchAdichainData() {
  const allUsers = [];
  const PAGES_TO_FETCH = 15;
  const LIMIT = 100;
  let successfulPages = 0;
  let failedPages = 0;

  console.log(`📊 Fetching ${PAGES_TO_FETCH} pages with ${LIMIT} items each...`);

  for (let page = 1; page <= PAGES_TO_FETCH; page++) {
    console.log(`Fetching Adichain page ${page}/${PAGES_TO_FETCH}...`);
    
    const data = await fetchAdichainPage(page, LIMIT, 3);
    
    if (!data || !data.data) {
      failedPages++;
      console.warn(`⚠️ Page ${page} failed (${failedPages} total failures)`);
      
      // If too many failures, stop early
      if (failedPages >= 5) {
        console.error(`❌ Stopping: ${failedPages} pages failed`);
        break;
      }
      
      // Wait longer after a failure
      await delay(5000);
      continue;
    }
    
    successfulPages++;
    const pageUsers = data.data || [];
    allUsers.push(...pageUsers);
    
    console.log(`✅ Page ${page}: ${pageUsers.length} users (total: ${allUsers.length})`);
    
    // Don't delay after the last page
    if (page < PAGES_TO_FETCH) {
      // Random delay between 1.5-3 seconds to avoid rate limits
      const delayMs = 1500 + Math.random() * 1500;
      await delay(delayMs);
    }
  }

  console.log(`✅ Fetched ${allUsers.length} users from ${successfulPages} pages (${failedPages} failures)`);
  return allUsers;
}

async function storeAdichainData(users) {
  if (users.length === 0) {
    console.log('⚠️ No users to store');
    return;
  }

  const fetchedAt = new Date().toISOString();

  // Delete old data first
  const { error: deleteError } = await supabase
    .from('adichain_leaderboard')
    .delete()
    .neq('adichain_id', ''); // Delete all

  if (deleteError) {
    console.error('Error deleting old data:', deleteError);
  } else {
    console.log('🗑️ Cleared old Adichain data');
  }

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

  // Insert in batches of 500 to avoid timeout
  const batchSize = 500;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('adichain_leaderboard').insert(batch);
    
    if (error) {
      console.error(`Error inserting batch ${i}-${i + batch.length}:`, error);
      throw error;
    }
    
    console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)`);
  }

  // Update cache
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
    console.error('Error updating cache:', cacheError);
  }

  console.log(`✅ Stored ${records.length} Adichain records`);
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    console.log('🚀 Starting Adichain leaderboard sync...');
    
    const adichainData = await fetchAdichainData();
    
    if (adichainData.length > 0) {
      await storeAdichainData(adichainData);
    } else {
      console.warn('⚠️ No Adichain data fetched');
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    return NextResponse.json({
      success: true,
      message: 'Adichain leaderboard updated',
      count: adichainData.length,
      duration_seconds: duration,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('❌ Failed to update Adichain leaderboard:', err);
    return NextResponse.json({ 
      error: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}
