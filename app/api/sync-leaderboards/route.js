import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300; // 5 minutes timeout
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fetch all pages from an API
async function fetchAllPages(baseUrl, pageSize = 25) {
  const allData = [];
  let pageNum = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const url = `${baseUrl}&opts.pagination.page_size=${pageSize}&opts.pagination.page_num=${pageNum}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Failed to fetch page ${pageNum}: ${response.status}`);
        break;
      }

      const data = await response.json();
      
      // Handle DuelDuck API structure
      if (data.leaders && Array.isArray(data.leaders)) {
        allData.push(...data.leaders);
        hasMore = data.leaders.length === pageSize;
      } else {
        break;
      }

      pageNum++;
      
      // Safety limit
      if (pageNum > 100) {
        console.log('Reached page limit of 100');
        break;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching page ${pageNum}:`, error);
      break;
    }
  }

  return allData;
}

// Fetch Goat Network data
async function fetchGoatData(days) {
  try {
    const response = await fetch(
      `https://yappers-api.goat.network/leaderboard?days=${days}&limit=1000`
    );
    
    if (!response.ok) {
      throw new Error(`Goat API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data
    return Array.isArray(data) ? data.map((user, index) => ({
      username: user.username || user.handle || `User${index}`,
      rank: user.rank || index + 1,
      mindshare: user.score ? Number(user.score) * 100 : 0,
      tweets: user.tweet_counts || user.tweets || 0,
      likes: user.total_likes || user.likes || 0,
      impressions: user.total_impressions || user.impressions || 0,
      days: parseInt(days)
    })) : [];
  } catch (error) {
    console.error(`Error fetching Goat ${days}d data:`, error);
    return [];
  }
}

// Fetch DuelDuck data
async function fetchDuckData(epoch, challengeId) {
  try {
    const baseUrl = `https://api.duelduck.com/mention-challenge/leaderboard?opts.order.order_by=total_score&opts.order.order_type=desc&challenge_id=${challengeId}`;
    const leaders = await fetchAllPages(baseUrl);

    return leaders.map((leader, index) => ({
      x_username: leader.x_username,
      rank: index + 1,
      x_score: leader.x_score || 0,
      dd_score: leader.dd_score || 0,
      user_share: leader.user_share || 0,
      usdc_reward: leader.usdc_reward || 0,
      epoch: parseInt(epoch)
    }));
  } catch (error) {
    console.error('Error fetching DuelDuck data:', error);
    return [];
  }
}

export async function POST(request) {
  try {
    // Verify secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();
    const results = {
      goat_7d: 0,
      goat_30d: 0,
      duck_epoch1: 0,
      errors: []
    };

    // Fetch Goat Network 7d
    console.log('Fetching Goat Network 7d...');
    const goat7d = await fetchGoatData(7);
    if (goat7d.length > 0) {
      const { error } = await supabase
        .from('goat_leaderboard')
        .upsert(goat7d, { onConflict: 'username,days' });
      
      if (error) {
        console.error('Error upserting Goat 7d:', error);
        results.errors.push(`Goat 7d: ${error.message}`);
      } else {
        results.goat_7d = goat7d.length;
      }
    }

    // Fetch Goat Network 30d
    console.log('Fetching Goat Network 30d...');
    const goat30d = await fetchGoatData(30);
    if (goat30d.length > 0) {
      const { error } = await supabase
        .from('goat_leaderboard')
        .upsert(goat30d, { onConflict: 'username,days' });
      
      if (error) {
        console.error('Error upserting Goat 30d:', error);
        results.errors.push(`Goat 30d: ${error.message}`);
      } else {
        results.goat_30d = goat30d.length;
      }
    }

    // Fetch DuelDuck Epoch 1
    console.log('Fetching DuelDuck Epoch 1...');
    const duckEpoch1 = await fetchDuckData(1, '131938ae-0b07-4ac5-8b67-4c1d3cbbee5e');
    if (duckEpoch1.length > 0) {
      const { error } = await supabase
        .from('duck_leaderboard')
        .upsert(duckEpoch1, { onConflict: 'x_username,epoch' });
      
      if (error) {
        console.error('Error upserting DuelDuck:', error);
        results.errors.push(`DuelDuck: ${error.message}`);
      } else {
        results.duck_epoch1 = duckEpoch1.length;
      }
    }

    const duration = Date.now() - startTime;

    return Response.json({
      success: true,
      synced_at: new Date().toISOString(),
      duration_ms: duration,
      results
    });

  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
