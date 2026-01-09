// ========================================
// FILE: app/api/leaderboards/route.ts
// Handles separate periods for Elsa/Beyond vs CodeXero + DataHaven
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
      yappers,
      duelduck,
      adichain,
      datahaven,
      heyelsa,
      mindoshare,
      space,
      helios,
      c8ntinuum,
      deepnodeai,
      womfun,      // ← ADD THIS
      beyond,
      codexero
    ] = await Promise.all([
      fetchLeaderboard('yappers', days),
      fetchLeaderboard('duelduck'),
      fetchLeaderboard('adichain'),
      fetchLeaderboard('datahaven'),
      fetchLeaderboard('heyelsa', elsaDays),
      fetchLeaderboard('mindoshare'),
      fetchLeaderboard('space'),
      fetchLeaderboard('helios'),
      fetchLeaderboard('c8ntinuum'),
      fetchLeaderboard('deepnodeai'),
      fetchLeaderboard('womfun'),    // ← ADD THIS
      fetchLeaderboard('beyond', elsaDays),
      fetchLeaderboard('codexero', codexeroDays)
    ]);

    return NextResponse.json({
      success: true,
      days,
      elsaPeriod,
      elsaDays,
      codexeroPeriod,
      codexeroDays,
      yappers: yappers || { data: [], last_updated: null, count: 0 },
      duelduck: duelduck || { data: [], last_updated: null, count: 0 },
      adichain: adichain || { data: [], last_updated: null, count: 0 },
      datahaven: datahaven || { data: [], last_updated: null, count: 0 },
      heyelsa: heyelsa || { data: [], last_updated: null, snapshot_id: null, count: 0, days: elsaDays },
      mindoshare: mindoshare || { data: [], last_updated: null, count: 0 },
      space: space || { data: [], last_updated: null, count: 0 },
      helios: helios || { data: [], last_updated: null, count: 0 },
      c8ntinuum: c8ntinuum || { data: [], last_updated: null, count: 0 },
      deepnodeai: deepnodeai || { data: [], last_updated: null, count: 0 },
      womfun: womfun || { data: [], last_updated: null, count: 0 },  // ← ADD THIS
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
