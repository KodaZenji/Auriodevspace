import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to scrape Mindoshare directly
async function scrapeMindoshare() {
  try {
    console.log('[Mindoshare] Starting direct fetch...');
    const allData = [];
    const maxPages = 6;
    const limit = 50;

    for (let page = 1; page <= maxPages; page++) {
      console.log(`[Mindoshare] Fetching page ${page}/${maxPages}...`);
      
      const url = `https://mindoshare.ai/api/leaderboards/92e433f6-9bc6-4e53-800c-15b23b88c05b/all?page=${page}&limit=${limit}`;
      
      const response = await fetch(url, { 
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        console.error(`[Mindoshare] Page ${page} failed: ${response.status}`);
        break;
      }

      const data = await response.json();
      
      let pageData = [];
      if (Array.isArray(data)) {
        pageData = data;
      } else if (data.data && Array.isArray(data.data)) {
        pageData = data.data;
      } else if (data.currentLeaderboard && Array.isArray(data.currentLeaderboard)) {
        pageData = data.currentLeaderboard;
      }

      if (pageData.length === 0) {
        console.log(`[Mindoshare] No more data at page ${page}`);
        break;
      }

      allData.push(...pageData);
      console.log(`[Mindoshare] ✅ Page ${page}: ${pageData.length} users (total: ${allData.length})`);

      if (pageData.length < limit) {
        console.log(`[Mindoshare] Reached end of data`);
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`[Mindoshare] ✅ Complete: ${allData.length} total users`);
    return allData;

  } catch (error) {
    console.error('[Mindoshare] ❌ Error:', error);
    return null;
  }
}

// Helper function to save Mindoshare data
async function saveMindoshareData(data) {
  if (!data || data.length === 0) {
    console.log('[Mindoshare] No data to save');
    return { saved: 0 };
  }

  const fetchedAt = new Date().toISOString();

  const records = data.map(item => ({
    user_id: item.userId || item.id || item.twitterId,
    author_twitter_id: item.authorTwitterId,
    twitter_id: item.twitterId,
    twitter_display_name: item.twitterDisplayName,
    twitter_username: item.twitterUsername,
    twitter_avatar_url: item.twitterAvatarUrl,
    mindo_metric: item.mindoMetric || 0,
    rank: item.rank != null ? item.rank : 0,
    rank_delta: item.rankDelta != null ? item.rankDelta : 0,
    kol_score: item.kolScore,
    fetched_at: fetchedAt
  }));

  const { error: insertError } = await supabase
    .from('mindoshare_leaderboard')
    .insert(records);

  if (insertError) {
    console.error('[Mindoshare] Insert error:', insertError);
    throw insertError;
  }

  const { error: cacheError } = await supabase
    .from('leaderboard_cache')
    .upsert({
      cache_type: 'PerceptronNTWK',
      days: 0,
      last_updated: fetchedAt
    }, {
      onConflict: 'cache_type,days'
    });

  if (cacheError) {
    console.error('[PerceptronNTWK] Cache error:', cacheError);
  }

  console.log(`[Mindoshare] ✅ Saved ${records.length} records`);
  return { saved: records.length };
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🚀 Starting daily leaderboard update...');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Cleanup old entries
    const yappersDeleted = await supabase
      .from('yappers_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });
    console.log(`✅ Deleted ${yappersDeleted?.count || 0} old Yappers entries`);

    const duckDeleted = await supabase
      .from('duelduck_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });
    console.log(`✅ Deleted ${duckDeleted?.count || 0} old DuelDuck entries`);

    const adichainDeleted = await supabase
      .from('adichain_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });
    console.log(`✅ Deleted ${adichainDeleted?.count || 0} old Adichain entries`);

    // Cleanup Mindoshare leaderboard table if it exists
    let mindoshareDeletedCount = 0;
    try {
      const mindoshareDeleted = await supabase
        .from('mindoshare_leaderboard')
        .delete()
        .lt('fetched_at', sevenDaysAgo.toISOString())
        .select('id', { count: 'exact', head: true });
      mindoshareDeletedCount = mindoshareDeleted?.count || 0;
      console.log(`✅ Deleted ${mindoshareDeletedCount} old Mindoshare entries`);
    } catch (err) {
      console.log('⚠️ Mindoshare table does not exist yet, skipping cleanup');
    }

    // HeyElsa cleanup (snapshot-aware)
    const { data: activeSnapshots } = await supabase
      .from('leaderboard_cache')
      .select('snapshot_id')
      .eq('cache_type', 'heyelsa');
    const activeCount = activeSnapshots?.filter(s => s.snapshot_id).length || 0;
    console.log(`📋 Active HeyElsa snapshots: ${activeCount}`);
    console.log('✅ HeyElsa cleanup skipped (table is fresh)');

    console.log('✅ Cleanup completed');

    // ======= FETCH MINDOSHARE DIRECTLY =======
    console.log('🧠 Fetching Mindoshare data directly...');
    const mindoshareData = await scrapeMindoshare();
    let mindoshareResult = { saved: 0 };
    
    if (mindoshareData) {
      mindoshareResult = await saveMindoshareData(mindoshareData);
      console.log('✅ Mindoshare data saved to Supabase');
    } else {
      console.log('⚠️ Mindoshare fetch failed, continuing with Railway scraper');
    }

    // ======= TRIGGER RAILWAY SCRAPER =======
    const railwayUrl = process.env.RAILWAY_SCRAPER_URL;
    const webhookUrl = 'https://auriodevspace.vercel.app/api/webhook/scraper-complete';
    
    if (!railwayUrl) {
      throw new Error('RAILWAY_SCRAPER_URL not configured');
    }

    console.log('🚂 Triggering Railway scraper...');

    const triggerResponse = await fetch(
      `${railwayUrl}/scrape-all-async?webhook=${encodeURIComponent(webhookUrl)}`,
      { 
        method: 'GET', 
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!triggerResponse.ok) {
      throw new Error(`Railway trigger failed: ${triggerResponse.status}`);
    }

    const triggerResult = await triggerResponse.json();
    console.log('✅ Railway scraper triggered successfully');

    return NextResponse.json({
      success: true,
      message: 'Cron job completed. Mindoshare fetched directly. Railway is scraping in background.',
      cleanup: {
        yappers_deleted: yappersDeleted?.count || 0,
        duelduck_deleted: duckDeleted?.count || 0,
        adichain_deleted: adichainDeleted?.count || 0,
        mindoshare_deleted: mindoshareDeletedCount,
        heyelsa_deleted: 'snapshot-aware cleanup',
        active_snapshots: activeSnapshots?.length || 0
      },
      mindoshare: {
        fetched: mindoshareData?.length || 0,
        saved: mindoshareResult.saved
      },
      scraping: triggerResult
    });

  } catch (error) {
    console.error('❌ Cron error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to trigger leaderboard update', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
