const { sleep } = require('../utils');

async function scrapeWomFun(maxPages = 15) {
  try {
    console.log('[WomFun] Starting...');

    const campaignId = 'e0d90c13-01d9-4fe2-82e1-65c9739a5283';
    const allUsers = [];
    let offset = 0;
    const limit = 35; // Based on your screenshot

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`[WomFun] Fetching page ${pageNum} (offset: ${offset})...`);

      // The CORRECT API endpoint from your Network tab
      const apiUrl = `https://wom-api-v2.onrender.com/campaigns/${campaignId}/leaderboard?limit=${limit}&offset=${offset}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://campaigns.wom.fun',
          'Referer': 'https://campaigns.wom.fun/',
          'Sec-Ch-Ua': '"Chromium";v="130", "Not?A_Brand";v="99", "Google Chrome";v="130"',
          'Sec-Ch-Ua-Mobile': '?1',
          'Sec-Ch-Ua-Platform': '"Android"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'
        }
      });

      if (!response.ok) {
        console.error(`[WomFun] API error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('[WomFun] Error response:', errorText);
        break;
      }

      const data = await response.json();
      console.log('[WomFun] Response structure:', Object.keys(data));
      
      // Based on Image 2, the response has a "leaderboard" array
      let users = [];
      if (data.success && Array.isArray(data.leaderboard)) {
        users = data.leaderboard;
      } else if (Array.isArray(data.leaderboard)) {
        users = data.leaderboard;
      } else if (Array.isArray(data)) {
        users = data;
      }

      if (users.length === 0) {
        console.log('[WomFun] No more users found, stopping.');
        break;
      }

      allUsers.push(...users);
      console.log(`[WomFun] ✅ Page ${pageNum}: ${users.length} users (total: ${allUsers.length})`);

      // Check if we've reached the end
      if (users.length < limit) {
        console.log('[WomFun] Received fewer users than limit, stopping.');
        break;
      }

      offset += limit;
      await sleep(1500 + Math.random() * 1000); // 1.5-2.5 second delay
    }

    console.log(`[WomFun] ✅ Complete: ${allUsers.length} users scraped`);
    return {
      success: true,
      leaderboard: allUsers,
      total: allUsers.length,
      offset: 0
    };

  } catch (e) {
    console.error('[WomFun] ❌ Error:', e.message);
    console.error(e.stack);
    return {
      success: false,
      leaderboard: [],
      total: 0,
      offset: 0
    };
  }
}

module.exports = { scrapeWomFun };
