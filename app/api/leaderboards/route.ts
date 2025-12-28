import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ✅ Convert period strings to days
const PERIOD_TO_DAYS = {
  'epoch-2': 2,
  '7d': 7,
  '30d': 30
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '7');
  const elsaPeriod = searchParams.get('elsaPeriod') || '7d';
  
  // ✅ Convert elsaPeriod to days for query
  const elsaDays = PERIOD_TO_DAYS[elsaPeriod];
  
  if (!elsaDays) {
    return NextResponse.json(
      { error: `Invalid elsaPeriod: ${elsaPeriod}. Must be one of: epoch-2, 7d, 30d` },
      { status: 400 }
    );
  }

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

    // Get the latest fetch timestamp for duelduck
    const { data: duelDuckCache, error: duelDuckCacheError } = await supabase
      .from('leaderboard_cache')
      .select('last_updated')
      .eq('cache_type', 'duelduck')
      .eq('days', 0)
      .single();

    if (duelDuckCacheError) {
      console.error('DuelDuck cache error:', duelDuckCacheError);
    }

    // Get the latest fetch timestamp for adichain
    const { data: adichainCache, error: adichainCacheError } = await supabase
      .from('leaderboard_cache')
      .select('last_updated')
      .eq('cache_type', 'adichain')
      .eq('days', 0)
      .single();

    if (adichainCacheError) {
      console.error('Adichain cache error:', adichainCacheError);
    }

    // ✅ Get HeyElsa cache using days instead of period mapping
    const { data: heyelsaCache, error: heyelsaCacheError } = await supabase
      .from('leaderboard_cache')
      .select('last_updated, snapshot_id')
      .eq('cache_type', 'heyelsa')
      .eq('days', elsaDays)  // ✅ Query by days directly
      .single();

    if (heyelsaCacheError) {
      console.error('HeyElsa cache error:', heyelsaCacheError);
    }

    if (!yappersCache || !duelDuckCache || !adichainCache) {
      return NextResponse.json(
        { 
          error: 'No cached data available. Please wait for the cron job to run.',
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

    // ✅ Fetch HeyElsa data using days (like yappers)
    let heyelsaData = [];
    if (heyelsaCache) {
      // Try fetching by snapshot_id first (most reliable)
      if (heyelsaCache.snapshot_id) {
        const { data: heyelsaResult, error: heyelsaError } = await supabase
          .from('heyelsa_leaderboard')
          .select('*')
          .eq('snapshot_id', heyelsaCache.snapshot_id)
          .eq('days', elsaDays)  // ✅ Query by days
          .order('position', { ascending: true });

        if (heyelsaError) {
          console.error('Error fetching HeyElsa data by snapshot_id:', heyelsaError);
        } else {
          heyelsaData = heyelsaResult || [];
        }
      }
      
      // Fallback to fetched_at if snapshot_id query failed
      if (heyelsaData.length === 0) {
        const { data: heyelsaResult, error: heyelsaError } = await supabase
          .from('heyelsa_leaderboard')
          .select('*')
          .eq('fetched_at', heyelsaCache.last_updated)
          .eq('days', elsaDays)  // ✅ Query by days
          .order('position', { ascending: true });

        if (heyelsaError) {
          console.error('Error fetching HeyElsa data by fetched_at:', heyelsaError);
        } else {
          heyelsaData = heyelsaResult || [];
        }
      }
    }

    return NextResponse.json({
      success: true,
      days,
      elsaPeriod,
      elsaDays,  // ✅ Include converted days for transparency
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
        days: elsaDays  // ✅ Include days for debugging
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
