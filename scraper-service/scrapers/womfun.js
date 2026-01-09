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

      const apiUrl = `https://campaigns.wom.fun/api/campaigns/${campaignId}/leaderboard?offset=${offset}&limit=${limit}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Accept-Language': 'en-US,en;q=0.9',
          'Authorization': 'ey.3hb5GoJPLF1NfeIdRrBcCf6&pXVCIaimgZH6LilJb4JyTWLdJM0F5iZzIWc.TBEaFs8fRdFuHT3JMKgjHIcm1SYIAhMXIDZiYpl65UEl9-ey.JhwYoIQUJptWIhaxWhGHI4EnMTz2cmFwbH8xS3dSTbDh61hFdQLNqImCcm8kNcbxp5nCq_HrFwWJROajM2NsbW3dMMFSNCIalmzcyy6In6yak2CSLmiIvanxWrPqwvN2t-zCHTyAbDzbUCJhdTn9biObdj9HmK4NGMMzZGTvN1wo5IzIm1u4cZIdBiFrzUHzxZnYXJQ.M9LaMYSoLg-csQF-.sThySf9nFiuqhvoTYNN0YIobbSwml.NpG9_0YwarSZCYnzlMX6IguuJsTLPpAKl0_eBulpJxlqnCzZK',
          'Origin': 'https://campaigns.wom.fun',
          'Referer': `https://campaigns.wom.fun/campaign/${campaignId}`,
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Ch-Ua': '"Chromium";v="130", "Not?A_Brand";v="99", "Google Chrome";v="130"',
          'Sec-Ch-Ua-Mobile': '?1',
          'Sec-Ch-Ua-Platform': '"Android"'
        }
      });

      if (!response.ok) {
        console.error(`[WomFun] API error: ${response.status} ${response.statusText}`);
        break;
      }

      const data = await response.json();
      console.log('[WomFun] Response:', JSON.stringify(data).substring(0, 200) + '...');
      
      // Handle different response structures
      let users = [];
      if (Array.isArray(data)) {
        users = data;
      } else if (data.leaderboard && Array.isArray(data.leaderboard)) {
        users = data.leaderboard;
      } else if (data.data && data.data.leaderboard) {
        users = data.data.leaderboard;
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
      await sleep(1000 + Math.random() * 1000);
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
