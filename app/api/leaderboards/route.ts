// ========================================
// FILE: app/api/leaderboards/route.ts
// Handles separate periods for Elsa/Beyond vs CodeXero
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
  const elsaPeriod = searchParams.get('elsaPeriod') || '7d';
  const codexeroPeriod = searchParams.get('codexeroPeriod') || 'epoch-1';
  
  const elsaDays = PERIOD_TO_DAYS[elsaPeriod];
  const codexeroDays = PERIOD_TO_DAYS[codexeroPeriod];
  
  if (!elsaDays || !codexeroDays) {
    return NextResponse.json(
      { error: `Invalid period parameter` },
      { status: 400 }
    );
  }

  try {
    // Fetch all leaderboards in parallel
    const [
      duelduck,
      heyelsa,
      mindoshare,
      space,
      helios,
      c8ntinuum,
      deepnodeai,
      womfun,
      beyond,
      codexero
    ] = await Promise.all([
      fetchLeaderboard('duelduck'),
      fetchLeaderboard('heyelsa', elsaDays),
      fetchLeaderboard('mindoshare'),
      fetchLeaderboard('space'),
      fetchLeaderboard('helios'),
      fetchLeaderboard('c8ntinuum'),
      fetchLeaderboard('deepnodeai'),
      fetchLeaderboard('womfun'),
      fetchLeaderboard('beyond', elsaDays),
      fetchLeaderboard('codexero', codexeroDays)
    ]);

    return NextResponse.json({
      success: true,
      elsaPeriod,
      elsaDays,
      codexeroPeriod,
      codexeroDays,
      duelduck: duelduck || { data: [], last_updated: null, count: 0 },
      heyelsa: heyelsa || { data: [], last_updated: null, snapshot_id: null, count: 0, days: elsaDays },
      mindoshare: mindoshare || { data: [], last_updated: null, count: 0 },
      space: space || { data: [], last_updated: null, count: 0 },
      helios: helios || { data: [], last_updated: null, count: 0 },
      c8ntinuum: c8ntinuum || { data: [], last_updated: null, count: 0 },
      deepnodeai: deepnodeai || { data: [], last_updated: null, count: 0 },
      womfun: womfun || { data: [], last_updated: null, count: 0 },
      beyond: beyond || { data: [], last_updated: null, snapshot_id: null, count: 0, days: elsaDays },
      codexero: codexero || { data: [], last_updated: null, snapshot_id: null, count: 0, days: codexeroDays }
    });
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboards', details: error.message },
      { status: 500 }
    );
  }
}
