import { NextResponse } from 'next/server';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '7d';
  const maxPages = parseInt(searchParams.get('maxPages') || '2'); // Default to only 2 pages for testing

  try {
    console.log(`Testing HeyElsa fetch for period: ${period}`);
    
    let allUsers = [];
    let page = 1;
    const pageSize = 50;

    while (page <= maxPages) {
      console.log(`Fetching HeyElsa ${period} page ${page}...`);
      
      const startTime = Date.now();
      
      const response = await fetch(
        `https://api.wallchain.xyz/voices/companies/heyelsa/leaderboard?page=${page}&pageSize=${pageSize}&orderBy=position&ascending=false&period=${period}`,
        { 
          cache: 'no-store',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.heyelsa.com/',
            'Origin': 'https://www.heyelsa.com',
            'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site'
          }
        }
      );
      
      const responseTime = Date.now() - startTime;
      
      console.log(`Response status: ${response.status}, Time: ${responseTime}ms`);
      
      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: `HTTP error! status: ${response.status}`,
          page,
          period,
          responseTime,
          statusText: response.statusText
        }, { status: response.status });
      }
      
      const data = await response.json();
      
      if (!data.entries || data.entries.length === 0) {
        console.log(`No more data on page ${page}`);
        break;
      }
      
      allUsers = allUsers.concat(data.entries);
      console.log(`✅ Page ${page}: ${data.entries.length} users (total: ${allUsers.length})`);
      
      if (page >= data.totalPages || data.entries.length < pageSize) {
        break;
      }
      
      page++;
      
      // Small delay between requests
      if (page <= maxPages) {
        await sleep(1000);
      }
    }
    
    // Sample first 3 users for inspection
    const sampleUsers = allUsers.slice(0, 3).map(user => ({
      username: user.xInfo?.username,
      position: user.position,
      mindshare: user.mindsharePercentage,
      score: user.xInfo?.score
    }));

    return NextResponse.json({
      success: true,
      period,
      totalUsers: allUsers.length,
      pagesChecked: page - 1,
      sampleUsers,
      message: `Successfully fetched ${allUsers.length} HeyElsa users for ${period}`
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      period
    }, { status: 500 });
  }
}
