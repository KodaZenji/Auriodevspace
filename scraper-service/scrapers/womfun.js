const { sleep, createBrowser, createContext } = require('../utils');

async function scrapeWomFun(maxPages = 15) {
  let browser;
  try {
    console.log('[WomFun] Starting...');
    
    browser = await createBrowser(false);
    const context = await createContext(browser);
    const page = await context.newPage();

    // Visit the exact campaign page first to get session and proper context
    const campaignPageUrl = 'https://campaigns.wom.fun/campaign/e0d90c13-01d9-4fe2-82e1-65c9739a5283';
    await page.goto(campaignPageUrl, { waitUntil: 'networkidle' });

    console.log('[WomFun] Loaded campaign page:', campaignPageUrl);

    const allUsers = [];
    const limit = 50;
    let offset = 0;

    const campaignId = 'e0d90c13-01d9-44e2-82e1-65c9739a5283';

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`[WomFun] Fetching page ${pageNum} (offset: ${offset})...`);

      try {
        // Fetch leaderboard from inside the browser to preserve cookies/tokens
        const json = await page.evaluate(async ({ campaignId, limit, offset }) => {
          const url = `https://wom-api-v2.onrender.com/campaigns/${campaignId}/leaderboard?limit=${limit}&offset=${offset}`;
          
          const res = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': '*/*',
              'Origin': 'https://campaigns.wom.fun',
              'Referer': 'https://campaigns.wom.fun/',
            },
            credentials: 'include' // important to send session cookies
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

        if (json.total && offset + limit >= json.total) {
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
