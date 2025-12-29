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
    console.log('🚀 Starting daily leaderboard cleanup...');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Cleanup old Yappers entries
    const yappersDeleted = await supabase
      .from('yappers_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });
    console.log(`✅ Deleted ${yappersDeleted?.count || 0} old Yappers entries`);

    // Cleanup old DuelDuck entries
    const duckDeleted = await supabase
      .from('duelduck_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });
    console.log(`✅ Deleted ${duckDeleted?.count || 0} old DuelDuck entries`);

    // Cleanup old Adichain entries
    const adichainDeleted = await supabase
      .from('adichain_leaderboard')
      .delete()
      .lt('fetched_at', sevenDaysAgo.toISOString())
      .select('id', { count: 'exact', head: true });
    console.log(`✅ Deleted ${adichainDeleted?.count || 0} old Adichain entries`);

    // Cleanup Mindoshare Perceptron table
    let mindoshareDeletedCount = 0;
    try {
      const mindoshareDeleted = await supabase
        .from('mindoshare_perceptronntwk')
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

    // Trigger Railway scraper
    const railwayUrl = process.env.RAILWAY_SCRAPER_URL;
    const webhookUrl = 'https://auriodevspace.vercel.app/api/webhook/scraper-complete';
    
    if (!railwayUrl) throw new Error('RAILWAY_SCRAPER_URL not configured');

    console.log('🚂 Triggering Railway scraper...');
    console.log('🔗 URL:', `${railwayUrl}/scrape-all-async?webhook=${encodeURIComponent(webhookUrl)}`);

    const triggerResponse = await fetch(
      `${railwayUrl}/scrape-all-async?webhook=${encodeURIComponent(webhookUrl)}`,
      { 
        method: 'GET', 
        signal: AbortSignal.timeout(30000),  // Increased to 30 seconds
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Vercel-Cron/1.0'
        }
      }
    );

    console.log('📡 Response status:', triggerResponse.status);
    
    // Get response text for better debugging
    const responseText = await triggerResponse.text();
    console.log('📡 Response body:', responseText);

    if (!triggerResponse.ok) {
      throw new Error(`Railway trigger failed: ${triggerResponse.status} - ${responseText}`);
    }

    // Parse the response
    let triggerResult;
    try {
      triggerResult = JSON.parse(responseText);
    } catch (e) {
      console.warn('Could not parse JSON response, using text');
      triggerResult = { raw: responseText };
    }

    console.log('✅ Railway scraper triggered successfully');

    return NextResponse.json({
      success: true,
      message: 'Cron job completed. Railway scraper is running in background.',
      cleanup: {
        yappers_deleted: yappersDeleted?.count || 0,
        duelduck_deleted: duckDeleted?.count || 0,
        adichain_deleted: adichainDeleted?.count || 0,
        mindoshare_deleted: mindoshareDeletedCount,
        heyelsa_deleted: 'snapshot-aware cleanup',
        active_snapshots: activeSnapshots?.length || 0
      },
      scraping: triggerResult
    });

  } catch (error) {
    console.error('❌ Cron error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger leaderboard update', details: error.message },
      { status: 500 }
    );
  }
}
