// ========================================
// FILE: app/api/leaderboards/route.ts
// Refactored to use reusable helper functions
// ========================================

import { NextResponse } from 'next/server';
import { fetchLeaderboard } from './helpers';

const PERIOD_TO_DAYS = {
  'epoch-1': 1,
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
    // Fetch all leaderboards in parallel
    const [
      yappers,
      duelduck,
      adichain,
      heyelsa,
      mindoshare,
      space,
      helios,
      c8ntinuum,
      deepnodeai,
      beyond,
      codexero
    ] = await Promise.all([
      fetchLeaderboard('yappers', days),
      fetchLeaderboard('duelduck'),
      fetchLeaderboard('adichain'),
      fetchLeaderboard('heyelsa', elsaDays),
      fetchLeaderboard('mindoshare'),
      fetchLeaderboard('space'),
      fetchLeaderboard('helios'),
      fetchLeaderboard('c8ntinuum'),
      fetchLeaderboard('deepnodeai'),
      fetchLeaderboard('beyond', elsaDays),
      fetchLeaderboard('codexero', elsaDays)
    ]);

    // Check if core leaderboards are available
    if (!yappers || !duelduck || !adichain) {
      return NextResponse.json(
        { error: 'No cached data available for core leaderboards' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      days,
      elsaPeriod,
      elsaDays,
      yappers,
      duelduck,
      adichain,
      heyelsa: heyelsa || { data: [], last_updated: null, snapshot_id: null, count: 0, days: elsaDays },
      mindoshare: mindoshare || { data: [], last_updated: null, count: 0 },
      space: space || { data: [], last_updated: null, count: 0 },
      helios: helios || { data: [], last_updated: null, count: 0 },
      c8ntinuum: c8ntinuum || { data: [], last_updated: null, count: 0 },
      deepnodeai: deepnodeai || { data: [], last_updated: null, count: 0 },
      beyond: beyond || { data: [], last_updated: null, snapshot_id: null, count: 0, days: elsaDays },
      codexero: codexero || { data: [], last_updated: null, snapshot_id: null, count: 0, days: elsaDays } // ADDED
    });
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboards', details: error.message },
      { status: 500 }
    );
  }
}
