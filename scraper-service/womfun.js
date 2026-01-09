const { sleep, createBrowser, createContext } = require('../utils');

async function scrapeWomFun(maxPages = 15) {
  let browser;
  try {
    console.log('[WomFun] Starting...');
    
    browser = await createBrowser(false);
    const context = await createContext(browser);
    const page = await context.newPage();
    
    const allUsers = [];
    const limit = 50;
    let offset = 0;

    // Campaign ID from the API URL you showed me
    const campaignId = 'e0d90c13-01d9-44e2-82e1-65c9739a5283';

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `https://wom-api-v2.onrender.com/campaigns/${campaignId}/leaderboard?limit=${limit}&offset=${offset}`;

      console.log(`[WomFun] Fetching page ${pageNum} (offset: ${offset})...`);

      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

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

      const json = JSON.parse(await page.evaluate(() => document.body.textContent));
      
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
      
      // Random delay to be respectful
      await sleep(3000 + Math.random() * 2000);
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
