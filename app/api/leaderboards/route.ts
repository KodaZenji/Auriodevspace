import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const PERIOD_TO_DAYS = {
  'epoch-2': 2,
  '7d': 7,
  '30d': 30
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '7');
  const elsaPeriod = searchParams.get('elsaPeriod') || '7d';
  const elsaDays = PERIOD_TO_DAYS[elsaPeriod];
  
  if (!elsaDays) {
    return NextResponse.json(
      { error: `Invalid elsaPeriod: ${elsaPeriod}` },
      { status: 400 }
    );
  }

  try {
    // Get cache entries
    const { data: yappersCache } = await supabase
      .from('leaderboard_cache')
      .select('last_updated')
      .eq('cache_type', 'yappers')
      .eq('days', days)
      .single();

    const { data: duelDuckCache } = await supabase
      .from('leaderboard_cache')
      .select('last_updated')
      .eq('cache_type', 'duelduck')
      .eq('days', 0)
      .single();

    const { data: adichainCache } = await supabase
      .from('leaderboard_cache')
      .select('last_updated')
      .eq('cache_type', 'adichain')
      .eq('days', 0)
      .single();

    const { data: heyelsaCache } = await supabase
      .from('leaderboard_cache')
      .select('last_updated, snapshot_id')
      .eq('cache_type', 'heyelsa')
      .eq('days', elsaDays)
      .single();

    if (!yappersCache || !duelDuckCache || !adichainCache) {
      return NextResponse.json(
        { error: 'No cached data available' },
        { status: 404 }
      );
    }

    // Fetch Yappers
    const { data: yappersData } = await supabase
      .from('yappers_leaderboard')
      .select('*')
      .eq('days', days)
      .eq('fetched_at', yappersCache.last_updated)
      .order('rank', { ascending: true });

    // Fetch DuelDuck
    const { data: duelDuckData } = await supabase
      .from('duelduck_leaderboard')
      .select('*')
      .eq('fetched_at', duelDuckCache.last_updated)
      .order('total_score', { ascending: false });

    // Fetch Adichain
    const { data: adichainData } = await supabase
      .from('adichain_leaderboard')
      .select('*')
      .eq('fetched_at', adichainCache.last_updated)
      .order('rank_total', { ascending: true });

    // ✅ Fetch HeyElsa with JSONB data
    let heyelsaData = [];
    if (heyelsaCache) {
      const { data: heyelsaResult } = await supabase
        .from('heyelsa_leaderboard')
        .select('*')
        .eq('snapshot_id', heyelsaCache.snapshot_id)
        .eq('days', elsaDays)
        .order('position', { ascending: true });

      // ✅ Transform JSONB back to flat structure for frontend
      heyelsaData = heyelsaResult?.map(row => ({
        id: row.id,
        username: row.username,
        
        // Extract from x_info JSONB
        name: row.x_info?.name,
        image_url: row.x_info?.imageUrl,
        rank: row.x_info?.rank,
        score: row.x_info?.score,
        score_percentile: row.x_info?.scorePercentile,
        score_quantile: row.x_info?.scoreQuantile,
        
        // Top-level fields
        mindshare_percentage: row.mindshare_percentage,
        relative_mindshare: row.relative_mindshare,
        app_use_multiplier: row.app_use_multiplier,
        position: row.position,
        position_change: row.position_change,
        
        days: row.days
      })) || [];
    }

    return NextResponse.json({
      success: true,
      days,
      elsaPeriod,
      elsaDays,
      yappers: {
        data: yappersData || [],
        last_updated: yappersCache.last_updated,
        count: yappersData?.length || 0
      },
      duelduck: {
        data: duelDuckData || [],
        last_updated: duelDuckCache.last_updated,
        count: duelDuckData?.length || 0
      },
      adichain: {
        data: adichainData || [],
        last_updated: adichainCache.last_updated,
        count: adichainData?.length || 0
      },
      heyelsa: {
        data: heyelsaData,
        last_updated: heyelsaCache?.last_updated || null,
        snapshot_id: heyelsaCache?.snapshot_id || null,
        count: heyelsaData?.length || 0,
        days: elsaDays
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboards', details: error.message },
      { status: 500 }
    );
  }
}
