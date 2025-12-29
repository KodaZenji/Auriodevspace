import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🚀 Starting daily leaderboard cleanup...');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Cleanup Yappers, DuelDuck, Adichain
    const yappersDeleted = await supabase.from('yappers_leaderboard')
      .delete().lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });

    const duckDeleted = await supabase.from('duelduck_leaderboard')
      .delete().lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });

    const adichainDeleted = await supabase.from('adichain_leaderboard')
      .delete().lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });

    // Cleanup Mindoshare Perceptron table
    let mindoshareDeletedCount = 0;
    try {
      const mindoshareDeleted = await supabase.from('mindoshare_perceptronntwk')
        .delete().lt('fetched_at', sevenDaysAgo.toISOString())
        .select('id', { count: 'exact', head: true });
      mindoshareDeletedCount = mindoshareDeleted?.count || 0;
    } catch (err) {
      console.log('⚠️ Mindoshare table does not exist yet, skipping cleanup');
    }

    console.log(`✅ Cleanup done: Yappers(${yappersDeleted?.count || 0}), DuelDuck(${duckDeleted?.count || 0}), Adichain(${adichainDeleted?.count || 0}), Mindoshare(${mindoshareDeletedCount})`);

    // Trigger Railway scraper
    const railwayUrl = process.env.RAILWAY_SCRAPER_URL;
    if (!railwayUrl) throw new Error('RAILWAY_SCRAPER_URL not configured');

    console.log('🚂 Triggering Railway scraper...');
    const triggerResponse = await fetch(`${railwayUrl}/scrape-all-async`, { method: 'GET', signal: AbortSignal.timeout(10000) });
    if (!triggerResponse.ok) throw new Error(`Railway trigger failed: ${triggerResponse.status}`);

    const triggerResult = await triggerResponse.json();
    console.log('✅ Railway scraper triggered successfully');

    return NextResponse.json({
      success: true,
      cleanup: {
        yappers_deleted: yappersDeleted?.count || 0,
        duelduck_deleted: duckDeleted?.count || 0,
        adichain_deleted: adichainDeleted?.count || 0,
        mindoshare_deleted: mindoshareDeletedCount
      },
      scraping: triggerResult
    });

  } catch (error) {
    console.error('❌ Cron error:', error);
    return NextResponse.json({ error: 'Failed to trigger leaderboard update', details: error.message }, { status: 500 });
  }
}
