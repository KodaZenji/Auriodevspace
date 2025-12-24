import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '7');

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

    if (!yappersCache || !duelDuckCache || !adichainCache) {
      return NextResponse.json(
        { 
          error: 'No cached data available. Please wait for the cron job to run, or trigger it manually.',
          yappersCache: !!yappersCache,
          duelDuckCache: !!duelDuckCache,
          adichainCache: !!adichainCache
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

    return NextResponse.json({
      success: true,
      days,
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
