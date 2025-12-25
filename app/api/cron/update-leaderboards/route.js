import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Period mapping for cache
const periodMap: Record<string, number> = {
  'epoch-2': 0,
  '7d': 7,
  '30d': 30
};

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🚀 Starting daily leaderboard update...');

    // 🧹 CLEANUP OLD DATA (Yappers / DuelDuck / Adichain)
    console.log('Cleaning up old data...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const yappersDeleted = await supabase
      .from('yappers_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });

    const duckDeleted = await supabase
      .from('duelduck_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });

    const adichainDeleted = await supabase
      .from('adichain_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });

    // ✅ HeyElsa: do NOT delete blindly, cleanup is cache-aware
    // Only delete rows NOT referenced in leaderboard_cache
    const { error: heyElsaCleanupError } = await supabase
      .from('heyelsa_leaderboard')
      .delete()
      .not('fetched_at', 'in', supabase
        .from('leaderboard_cache')
        .select('last_updated')
        .eq('cache_type', 'heyelsa')
      );
    if (heyElsaCleanupError) console.error('Error cleaning HeyElsa leaderboard:', heyElsaCleanupError);

    console.log(`✅ Cleanup done`);

    // 🚂 Trigger Railway scraper (async)
    const railwayUrl = process.env.RAILWAY_SCRAPER_URL;
    const webhookUrl = 'https://auriodevspace.vercel.app/api/webhook/scraper-complete';

    if (!railwayUrl) throw new Error('RAILWAY_SCRAPER_URL not configured');

    console.log(`🚂 Triggering Railway scraper...`);
    console.log(`📥 Webhook callback: ${webhookUrl}`);

    const triggerResponse = await fetch(
      `${railwayUrl}/scrape-all-async?webhook=${encodeURIComponent(webhookUrl)}`,
      {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!triggerResponse.ok) throw new Error(`Railway trigger failed: ${triggerResponse.status}`);

    const triggerResult = await triggerResponse.json();
    console.log('✅ Railway scraping triggered successfully');

    return NextResponse.json({
      success: true,
      message: 'Cron job completed. Railway is scraping in background.',
      cleanup: {
        yappers_deleted: yappersDeleted?.count || 0,
        duelduck_deleted: duckDeleted?.count || 0,
        adichain_deleted: adichainDeleted?.count || 0,
        heyelsa_deleted: 0 // cache-aware cleanup, can't count reliably
      },
      scraping: triggerResult,
      note: 'Data will be stored via webhook when scraping completes (~10-15 minutes)'
    });

  } catch (error) {
    console.error('❌ Cron error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger leaderboard update', details: error.message },
      { status: 500 }
    );
  }
}
