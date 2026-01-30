import { NextResponse } from 'next/server';
import { fetchLeaderboard } from './helpers';

const PERIOD_TO_DAYS = {
  'epoch-1': 1,
  'epoch-2': 2,
  '7d': 7,
  '7D': 7,      
  '30d': 30,
  'ALL': 0      
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const elsaPeriod = searchParams.get('elsaPeriod') || '7d';
  const codexeroPeriod = searchParams.get('codexeroPeriod') || 'epoch-1';
  const yapsfandomPeriod = searchParams.get('yapsfandomPeriod') || '7D'; 
  
  const elsaDays = PERIOD_TO_DAYS[elsaPeriod];
  const codexeroDays = PERIOD_TO_DAYS[codexeroPeriod];
  const yapsfandomDays = PERIOD_TO_DAYS[yapsfandomPeriod]; 
  
  if (!elsaDays || !codexeroDays || yapsfandomDays === undefined) { 
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
      codexero,
      yapsfandom   
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
      fetchLeaderboard('codexero', codexeroDays),
      fetchLeaderboard('yapsfandom', yapsfandomDays)  
    ]);

    return NextResponse.json({
      success: true,
      elsaPeriod,
      elsaDays,
      codexeroPeriod,
      codexeroDays,
      yapsfandomPeriod,      
      yapsfandomDays,        
      duelduck: duelduck || { data: [], last_updated: null, count: 0 },
      heyelsa: heyelsa || { data: [], last_updated: null, snapshot_id: null, count: 0, days: elsaDays },
      mindoshare: mindoshare || { data: [], last_updated: null, count: 0 },
      space: space || { data: [], last_updated: null, count: 0 },
      helios: helios || { data: [], last_updated: null, count: 0 },
      c8ntinuum: c8ntinuum || { data: [], last_updated: null, count: 0 },
      deepnodeai: deepnodeai || { data: [], last_updated: null, count: 0 },
      womfun: womfun || { data: [], last_updated: null, count: 0 },
      beyond: beyond || { data: [], last_updated: null, snapshot_id: null, count: 0, days: elsaDays },
      codexero: codexero || { data: [], last_updated: null, snapshot_id: null, count: 0, days: codexeroDays },
      yapsfandom: yapsfandom || { data: [], last_updated: null, count: 0, days: yapsfandomDays }  
    });
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboards', details: error.message },
      { status: 500 }
    );
  }
}
