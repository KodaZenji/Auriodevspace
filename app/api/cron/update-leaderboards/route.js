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
    console.log('🚀 Starting daily leaderboard update...');
    
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
    
    // 🚂 TRIGGER RAILWAY SCRAPER (Fire and Forget)
    const railwayUrl = process.env.RAILWAY_SCRAPER_URL;
    const webhookUrl = 'https://auriodevspace.vercel.app/api/webhook/scraper-complete';
    
    if (!railwayUrl) {
      throw new Error('RAILWAY_SCRAPER_URL not configured');
    }

    console.log(`🚂 Triggering Railway scraper...`);
    console.log(`📥 Webhook callback: ${webhookUrl}`);
    
    // Trigger Railway scraping (async, doesn't wait)
    const triggerResponse = await fetch(
      `${railwayUrl}/scrape-all-async?webhook=${encodeURIComponent(webhookUrl)}`,
      {
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 second timeout just for triggering
      }
    );

    if (!triggerResponse.ok) {
      throw new Error(`Railway trigger failed: ${triggerResponse.status}`);
    }

    const triggerResult = await triggerResponse.json();
    console.log('✅ Railway scraping triggered successfully');

    return NextResponse.json({
      success: true,
      message: 'Cron job completed. Railway is scraping in background.',
      cleanup: {
        yappers_deleted: yappersDeleted || 0,
        duelduck_deleted: duckDeleted || 0,
        adichain_deleted: adichainDeleted || 0,
        heyelsa_deleted: heyelsaDeleted || 0
      },
      scraping: triggerResult,
      note: 'Data will be stored via webhook when scraping completes (~10-15 minutes)'
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
