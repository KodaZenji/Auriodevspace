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

    // Cleanup old DataHaven entries
    let datahavenDeletedCount = 0;
    try {
      const datahavenDeleted = await supabase
        .from('datahaven_leaderboard')
        .delete()
        .lt('fetched_at', sevenDaysAgo.toISOString())
        .select('id', { count: 'exact', head: true });
      datahavenDeletedCount = datahavenDeleted?.count || 0;
      console.log(`✅ Deleted ${datahavenDeletedCount} old DataHaven entries`);
    } catch (err) {
      console.log('⚠️ DataHaven table cleanup skipped:', err.message);
    }

    // Cleanup Mindoshare entries
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
      console.log('⚠️ Mindoshare table cleanup skipped:', err.message);
    }

    // Cleanup Space entries
    let spaceDeletedCount = 0;
    try {
      const spaceDeleted = await supabase
        .from('space_leaderboard')
        .delete()
        .lt('fetched_at', sevenDaysAgo.toISOString())
        .select('id', { count: 'exact', head: true });
      spaceDeletedCount = spaceDeleted?.count || 0;
      console.log(`✅ Deleted ${spaceDeletedCount} old Space entries`);
    } catch (err) {
      console.log('⚠️ Space table cleanup skipped:', err.message);
    }

    // Cleanup Helios entries
    let heliosDeletedCount = 0;
    try {
      const heliosDeleted = await supabase
        .from('helios_leaderboard')
        .delete()
        .lt('fetched_at', sevenDaysAgo.toISOString())
        .select('id', { count: 'exact', head: true });
      heliosDeletedCount = heliosDeleted?.count || 0;
      console.log(`✅ Deleted ${heliosDeletedCount} old Helios entries`);
    } catch (err) {
      console.log('⚠️ Helios table cleanup skipped:', err.message);
    }

    // Cleanup C8ntinuum entries
    let c8ntinuumDeletedCount = 0;
    try {
      const c8ntinuumDeleted = await supabase
        .from('c8ntinuum_leaderboard')
        .delete()
        .lt('fetched_at', sevenDaysAgo.toISOString())
        .select('id', { count: 'exact', head: true });
      c8ntinuumDeletedCount = c8ntinuumDeleted?.count || 0;
      console.log(`✅ Deleted ${c8ntinuumDeletedCount} old C8ntinuum entries`);
    } catch (err) {
      console.log('⚠️ C8ntinuum table cleanup skipped:', err.message);
    }

    // Cleanup DeepnodeAI entries
    let deepnodeaiDeletedCount = 0;
    try {
      const deepnodeaiDeleted = await supabase
        .from('deepnodeai_leaderboard')
        .delete()
        .lt('fetched_at', sevenDaysAgo.toISOString())
        .select('id', { count: 'exact', head: true });
      deepnodeaiDeletedCount = deepnodeaiDeleted?.count || 0;
      console.log(`✅ Deleted ${deepnodeaiDeletedCount} old DeepnodeAI entries`);
    } catch (err) {
      console.log('⚠️ DeepnodeAI table cleanup skipped:', err.message);
    }

    // Beyond cleanup (snapshot-aware)
    const { data: activeBeyondSnapshots } = await supabase
      .from('leaderboard_cache')
      .select('snapshot_id')
      .eq('cache_type', 'beyond');
    const activeBeyondCount = activeBeyondSnapshots?.filter(s => s.snapshot_id).length || 0;
    console.log(`📋 Active Beyond snapshots: ${activeBeyondCount}`);
    console.log('✅ Beyond cleanup skipped (snapshot-aware)');

    // HeyElsa cleanup (snapshot-aware)
    const { data: activeSnapshots } = await supabase
      .from('leaderboard_cache')
      .select('snapshot_id')
      .eq('cache_type', 'heyelsa');
    const activeCount = activeSnapshots?.filter(s => s.snapshot_id).length || 0;
    console.log(`📋 Active HeyElsa snapshots: ${activeCount}`);
    console.log('✅ HeyElsa cleanup skipped (snapshot-aware)');

    // CodeXero cleanup (snapshot-aware)
    const { data: activeCodexeroSnapshots } = await supabase
      .from('leaderboard_cache')
      .select('snapshot_id')
      .eq('cache_type', 'codexero');
    const activeCodexeroCount = activeCodexeroSnapshots?.filter(s => s.snapshot_id).length || 0;
    console.log(`📋 Active CodeXero snapshots: ${activeCodexeroCount}`);
    console.log('✅ CodeXero cleanup skipped (snapshot-aware)');

    console.log('✅ Cleanup completed');

    // Trigger Railway scraper
    const railwayUrl = process.env.RAILWAY_SCRAPER_URL;
    const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://auriodevspace.vercel.app'}/api/webhook/scraper-complete`;
    
    if (!railwayUrl) {
      throw new Error('RAILWAY_SCRAPER_URL not configured');
    }

    console.log('🚂 Triggering Railway scraper...');
    console.log(`📥 Webhook callback: ${webhookUrl}`);

    const triggerUrl = `${railwayUrl}/scrape-all-async?webhook=${encodeURIComponent(webhookUrl)}`;
    console.log(`🔗 Trigger URL: ${triggerUrl}`);

    const triggerResponse = await fetch(triggerUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Vercel-Cron/1.0'
      }
    });

    console.log('📡 Response status:', triggerResponse.status);
    
    const responseText = await triggerResponse.text();
    console.log('📡 Response preview:', responseText.substring(0, 200));

    if (!triggerResponse.ok) {
      throw new Error(`Railway trigger failed: ${triggerResponse.status} - ${responseText}`);
    }

    let triggerResult;
    try {
      triggerResult = JSON.parse(responseText);
    } catch (e) {
      console.warn('Could not parse JSON response');
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
        datahaven_deleted: datahavenDeletedCount,
        mindoshare_perceptronntwk_deleted: mindoshareDeletedCount,
        space_deleted: spaceDeletedCount,
        helios_deleted: heliosDeletedCount,
        c8ntinuum_deleted: c8ntinuumDeletedCount,
        deepnodeai_deleted: deepnodeaiDeletedCount,
        beyond_deleted: 'snapshot-aware cleanup',
        heyelsa_deleted: 'snapshot-aware cleanup',
        codexero_deleted: 'snapshot-aware cleanup',
        active_beyond_snapshots: activeBeyondSnapshots?.length || 0,
        active_heyelsa_snapshots: activeSnapshots?.length || 0,
        active_codexero_snapshots: activeCodexeroSnapshots?.length || 0
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
}      .select('snapshot_id')
      .eq('cache_type', 'beyond');
    const activeBeyondCount = activeBeyondSnapshots?.filter(s => s.snapshot_id).length || 0;
    console.log(`📋 Active Beyond snapshots: ${activeBeyondCount}`);
    console.log('✅ Beyond cleanup skipped (snapshot-aware)');

    // HeyElsa cleanup (snapshot-aware)
    const { data: activeSnapshots } = await supabase
      .from('leaderboard_cache')
      .select('snapshot_id')
      .eq('cache_type', 'heyelsa');
    const activeCount = activeSnapshots?.filter(s => s.snapshot_id).length || 0;
    console.log(`📋 Active HeyElsa snapshots: ${activeCount}`);
    console.log('✅ HeyElsa cleanup skipped (table is fresh)');

    // CodeXero cleanup (snapshot-aware)
    const { data: activeCodexeroSnapshots } = await supabase
      .from('leaderboard_cache')
      .select('snapshot_id')
      .eq('cache_type', 'codexero');
    const activeCodexeroCount = activeCodexeroSnapshots?.filter(s => s.snapshot_id).length || 0;
    console.log(`📋 Active CodeXero snapshots: ${activeCodexeroCount}`);
    console.log('✅ CodeXero cleanup skipped (snapshot-aware)');

    console.log('✅ Cleanup completed');

    // Trigger Railway scraper
    const railwayUrl = process.env.RAILWAY_SCRAPER_URL;
    const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://auriodevspace.vercel.app'}/api/webhook/scraper-complete`;
    
    if (!railwayUrl) {
      throw new Error('RAILWAY_SCRAPER_URL not configured');
    }

    console.log('🚂 Triggering Railway scraper...');
    console.log(`📥 Webhook callback: ${webhookUrl}`);

    const triggerUrl = `${railwayUrl}/scrape-all-async?webhook=${encodeURIComponent(webhookUrl)}`;
    console.log(`🔗 Trigger URL: ${triggerUrl}`);

    const triggerResponse = await fetch(triggerUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Vercel-Cron/1.0'
      }
    });

    console.log('📡 Response status:', triggerResponse.status);
    
    const responseText = await triggerResponse.text();
    console.log('📡 Response preview:', responseText.substring(0, 200));

    if (!triggerResponse.ok) {
      throw new Error(`Railway trigger failed: ${triggerResponse.status} - ${responseText}`);
    }

    let triggerResult;
    try {
      triggerResult = JSON.parse(responseText);
    } catch (e) {
      console.warn('Could not parse JSON response');
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
        datahaven_deleted: datahavenDeletedCount,
        mindoshare_perceptronntwk_deleted: mindoshareDeletedCount,
        space_deleted: spaceDeletedCount,
        helios_deleted: heliosDeletedCount,
        c8ntinuum_deleted: c8ntinuumDeletedCount,
        deepnodeai_deleted: deepnodeaiDeletedCount,
        beyond_deleted: 'snapshot-aware cleanup',
        heyelsa_deleted: 'snapshot-aware cleanup',
        codexero_deleted: 'snapshot-aware cleanup',
        active_beyond_snapshots: activeBeyondSnapshots?.length || 0,
        active_heyelsa_snapshots: activeSnapshots?.length || 0,
        active_codexero_snapshots: activeCodexeroSnapshots?.length || 0
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

