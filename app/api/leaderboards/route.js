import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '7');
  const elsaPeriod = searchParams.get('elsaPeriod') || '7d';

  try {
    // Get the latest fetch timestamp for yappers
    const { data: yappersCache, error: yappersCacheError } = await supabase
      .from('leaderboard_cache')
      .select('last_updated')
      .eq('cache_type', 'yappers')
      .eq('days', days)
      .single();

    if (yappersCacheError) {
      console.error('Yappers cache error:', yappersCacheError);
    }

    // Get the latest fetch timestamp for duelduck (days = 0)
    const { data: duelDuckCache, error: duelDuckCacheError } = await supabase
      .from('leaderboard_cache')
      .select('last_updated')
      .eq('cache_type', 'duelduck')
      .eq('days', 0)
      .single();

    if (duelDuckCacheError) {
      console.error('DuelDuck cache error:', duelDuckCacheError);
    }

    // Get the latest fetch timestamp for adichain (days = 0)
    const { data: adichainCache, error: adichainCacheError } = await supabase
      .from('leaderboard_cache')
      .select('last_updated')
      .eq('cache_type', 'adichain')
      .eq('days', 0)
      .single();

    if (adichainCacheError) {
      console.error('Adichain cache error:', adichainCacheError);
    }

    // Map elsaPeriod to days for cache lookup
    const elsaPeriodMap = {
      'epoch-2': 0,
      '7d': 7,
      '30d': 30
    };

    // Get the latest fetch timestamp for heyelsa based on selected period
    const { data: heyelsaCache, error: heyelsaCacheError } = await supabase
      .from('leaderboard_cache')
      .select('last_updated')
      .eq('cache_type', 'heyelsa')
      .eq('days', elsaPeriodMap[elsaPeriod] || 7)
      .single();

    if (heyelsaCacheError) {
      console.error('HeyElsa cache error:', heyelsaCacheError);
    }

    if (!yappersCache || !duelDuckCache || !adichainCache) {
      return NextResponse.json(
        { 
          error: 'No cached data available. Please wait for the cron job to run, or trigger it manually.',
          yappersCache: !!yappersCache,
          duelDuckCache: !!duelDuckCache,
          adichainCache: !!adichainCache,
          heyelsaCache: !!heyelsaCache
        },
        { status: 404 }
      );
    }

    // Fetch Yappers data
    const { data: yappersData, error: yappersError } = await supabase
      .from('yappers_leaderboard')
      .select('*')
      .eq('days', days)
      .eq('fetched_at', yappersCache.last_updated)
      .order('rank', { ascending: true });

    if (yappersError) {
      console.error('Error fetching Yappers data:', yappersError);
      throw yappersError;
    }

    // Fetch DuelDuck data
    const { data: duelDuckData, error: duelDuckError } = await supabase
      .from('duelduck_leaderboard')
      .select('*')
      .eq('fetched_at', duelDuckCache.last_updated)
      .order('total_score', { ascending: false });

    if (duelDuckError) {
      console.error('Error fetching DuelDuck data:', duelDuckError);
      throw duelDuckError;
    }

    // Fetch Adichain data
    const { data: adichainData, error: adichainError } = await supabase
      .from('adichain_leaderboard')
      .select('*')
      .eq('fetched_at', adichainCache.last_updated)
      .order('rank_total', { ascending: true });

    if (adichainError) {
      console.error('Error fetching Adichain data:', adichainError);
      throw adichainError;
    }

    // Fetch HeyElsa data for the selected period
    let heyelsaData = [];
    if (heyelsaCache) {
      const { data: heyelsaResult, error: heyelsaError } = await supabase
        .from('heyelsa_leaderboard')
        .select('*')
        .eq('fetched_at', heyelsaCache.last_updated)
        .eq('days', elsaPeriodMap[elsaPeriod] || 7)  // ← CHANGED: Use days instead of period
        .order('position', { ascending: true });

      if (heyelsaError) {
        console.error('Error fetching HeyElsa data:', heyelsaError);
      } else {
        heyelsaData = heyelsaResult || [];
      }
    }

    return NextResponse.json({
      success: true,
      days,
      elsaPeriod,
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
        count: heyelsaData?.length || 0
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
