const { sleep, createBrowser, createContext } = require('../utils');

async function scrapeWomFun(maxPages = 15) {
  let browser;
  try {
    console.log('[WomFun] Starting...');
    
    browser = await createBrowser(false);
    const context = await createContext(browser);
    const page = await context.newPage();

    // Visit the site first to get correct browser context
    await page.goto('https://campaigns.wom.fun', { waitUntil: 'networkidle' });

    const allUsers = [];
    const limit = 50;
    let offset = 0;

    const campaignId = 'e0d90c13-01d9-44e2-82e1-65c9739a5283';

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`[WomFun] Fetching page ${pageNum} (offset: ${offset})...`);
      
      try {
        const json = await page.evaluate(async ({ campaignId, limit, offset }) => {
          const url = `https://wom-api-v2.onrender.com/campaigns/${campaignId}/leaderboard?limit=${limit}&offset=${offset}`;

          const res = await fetch(url, {
            method: "GET",
            headers: {
              "Accept": "*/*",
              "Origin": "https://campaigns.wom.fun",
              "Referer": "https://campaigns.wom.fun/",
            },
            credentials: "include"
          });

          try {
            return await res.json();
          } catch (err) {
            return null;
          }
        }, { campaignId, limit, offset });

        if (!json || !json.success || !json.leaderboard || json.leaderboard.length === 0) {
          console.log('[WomFun] No more data or failed JSON');
          break;
        }

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
        console.log(`[WomFun] ✅ Page ${pageNum}: ${transformedData.length} users (total: ${allUsers.length})`);

        // Stop if complete
        if (json.total && offset + limit >= json.total) {
          console.log('[WomFun] Reached end of data');
          break;
        }

        offset += limit;

        // Delay to avoid spam
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
