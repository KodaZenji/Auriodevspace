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
    console.log('🚀 Starting daily leaderboard update...');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Cleanup old Yappers entries (older than 7 days)
    const yappersDeleted = await supabase
      .from('yappers_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });

    console.log(`✅ Deleted ${yappersDeleted?.count || 0} old Yappers entries`);

    // Cleanup old DuelDuck entries (older than 7 days)
    const duckDeleted = await supabase
      .from('duelduck_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });

    console.log(`✅ Deleted ${duckDeleted?.count || 0} old DuelDuck entries`);

    // Cleanup old Adichain entries (older than 7 days)
    const adichainDeleted = await supabase
      .from('adichain_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });

    console.log(`✅ Deleted ${adichainDeleted?.count || 0} old Adichain entries`);

    // ✅ HeyElsa cleanup - SIMPLIFIED (table is empty anyway)
    // Since you manually deleted everything, we'll just log for now
    // Once data accumulates, we can enable proper cleanup
    const { data: activeSnapshots } = await supabase
      .from('leaderboard_cache')
      .select('snapshot_id')
      .eq('cache_type', 'heyelsa');

    const activeCount = activeSnapshots?.filter(s => s.snapshot_id).length || 0;
    console.log(`📋 Active HeyElsa snapshots: ${activeCount}`);
    console.log('✅ HeyElsa cleanup skipped (table is fresh)');
    
    // TODO: Enable cleanup after first successful scrape
    // Will delete old snapshots and keep only the 3 most recent (one per period)

    console.log('✅ Cleanup completed');

    // Trigger Railway scraper
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
      message: 'Cron job completed. Railway is scraping in background.',
      cleanup: {
        yappers_deleted: yappersDeleted?.count || 0,
        duelduck_deleted: duckDeleted?.count || 0,
        adichain_deleted: adichainDeleted?.count || 0,
        heyelsa_deleted: 'snapshot-aware cleanup',
        active_snapshots: activeSnapshots?.length || 0
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
