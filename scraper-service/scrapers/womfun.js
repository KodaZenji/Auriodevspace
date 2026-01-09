// ============================================
// scraper-service/scrapers/womfun.js
// ============================================
const { sleep, createBrowser, createContext } = require('../utils');

async function scrapeWomFun(maxPages = 15) {
  let browser;
  try {
    console.log('[WomFun] Starting...');
    
    browser = await createBrowser(false);
    const context = await createContext(browser);
    const page = await context.newPage();
    
    // Set headers to mimic real browser from campaigns.wom.fun
    await page.setExtraHTTPHeaders({
      'authority': 'wom-api-v2.onrender.com',
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.9',
      'origin': 'https://campaigns.wom.fun',
      'referer': 'https://campaigns.wom.fun/',
      'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'
    });
    
    const allUsers = [];
    const limit = 50;
    let offset = 0;

    // Campaign ID from the API URL
    const campaignId = 'e0d90c13-01d9-44e2-82e1-65c9739a5283';

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `https://wom-api-v2.onrender.com/campaigns/${campaignId}/leaderboard?limit=${limit}&offset=${offset}`;

      console.log(`[WomFun] Fetching page ${pageNum} (offset: ${offset})...`);

      try {
        const response = await page.goto(url, { 
          waitUntil: 'networkidle', 
          timeout: 30000 
        });

        // Handle rate limiting
        if (response.status() === 429) {
          console.log('[WomFun] Rate limited, waiting 30s...');
          await sleep(30000);
          pageNum--;
          continue;
        }

        if (!response.ok()) {
          console.log(`[WomFun] Failed with status ${response.status()}`);
          break;
        }

        const bodyText = await page.evaluate(() => document.body.textContent);
        const json = JSON.parse(bodyText);
        
        if (!json.success || !json.leaderboard || json.leaderboard.length === 0) {
          console.log('[WomFun] No more data');
          break;
        }

        // Transform the data to match your leaderboard format
        const transformedData = json.leaderboard.map(user => ({
          rank: user.rank,
          twitter_username: user.twitter_username,
          twitter_profile_image_url: user.twitter_profile_image_url,
          wallet_address: user.wallet_address,
          poi_score: user.poi_score,
          mindshare_score: user.mindshare_score,
          reputation: user.reputation
        }));

        allUsers.push(...transformedData);
        console.log(`[WomFun] ✅ Page ${pageNum}: ${transformedData.length} users (total: ${allUsers.length}/${json.total})`);

        // Check if we've reached the end
        if (offset + limit >= json.total) {
          console.log('[WomFun] Reached end of data');
          break;
        }

        offset += limit;
        
        // Random delay between 3-5 seconds
        await sleep(3000 + Math.random() * 2000);
      } catch (err) {
        console.error(`[WomFun] Error on page ${pageNum}:`, err.message);
        break;
      }
    }

    await browser.close();
    console.log(`[WomFun] ✅ Complete: ${allUsers.length} users`);
    return allUsers;
  } catch (e) {
    if (browser) await browser.close();
    console.error('[WomFun] ❌', e.message);
    return null;
  }
}

module.exports = { scrapeWomFun };
