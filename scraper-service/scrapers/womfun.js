const { sleep } = require('../utils');

async function scrapeWomFun(maxPages = 15) {
  try {
    console.log('[WomFun] Starting...');

    const campaignId = 'e0d90c13-01d9-4fe2-82e1-65c9739a5283';
    const allUsers = [];
    let offset = 0;
    const limit = 50;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`[WomFun] Fetching page ${pageNum} (offset: ${offset})...`);

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
        
        // If first page fails, return what we have
        if (pageNum === 1) {
          console.error('[WomFun] First page failed, aborting');
          return null;
        }
        break;
      }

      const data = await response.json();
      console.log('[WomFun] Response keys:', Object.keys(data));
      
      // Handle response structure - API returns { success, leaderboard, total, offset }
      let users = [];
      if (data.success && Array.isArray(data.leaderboard)) {
        users = data.leaderboard;
      } else if (Array.isArray(data.leaderboard)) {
        users = data.leaderboard;
      } else if (Array.isArray(data)) {
        users = data;
      }
      
      console.log(`[WomFun] API returned ${users.length} users (total: ${data.total || 'unknown'})`)

      if (users.length === 0) {
        console.log('[WomFun] No more users found, stopping.');
        break;
      }

      // Data is already in the correct format from the API
      // Fields: rank, twitter_username, twitter_profile_image_url, wallet_address, poi_score, mindshare_score, reputation
      allUsers.push(...users);
      console.log(`[WomFun] ✅ Page ${pageNum}: ${users.length} users (total: ${allUsers.length})`);

      // Log a sample user for debugging
      if (pageNum === 1 && users.length > 0) {
        console.log('[WomFun] Sample user:', JSON.stringify(users[0], null, 2));
      }

      // Check if we've reached the end
      if (users.length < limit) {
        console.log('[WomFun] Received fewer users than limit, stopping.');
        break;
      }

      offset += limit;
      await sleep(1500 + Math.random() * 1000);
    }

    console.log(`[WomFun] ✅ Complete: ${allUsers.length} users scraped`);
    return allUsers.length > 0 ? allUsers : null;

  } catch (e) {
    console.error('[WomFun] ❌ Error:', e.message);
    console.error(e.stack);
    return null;
  }
}

module.exports = { scrapeWomFun };
