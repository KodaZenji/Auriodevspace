const { sleep, createBrowser, createContext } = require('../utils');

async function scrapeWomFun(maxPages = 15) {
  let browser;
  try {
    console.log('[WomFun] Starting...');

    browser = await createBrowser(false);
    const context = await createContext(browser);
    const page = await context.newPage();

    // Visit the exact campaign page
    const campaignPageUrl = 'https://campaigns.wom.fun/campaign/e0d90c13-01d9-4fe2-82e1-65c9739a5283';
    await page.goto(campaignPageUrl, { waitUntil: 'networkidle' });
    console.log('[WomFun] Loaded campaign page');

    const leaderboard = [];

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`[WomFun] Scraping page ${pageNum}...`);

      await page.waitForSelector('.leaderboard-row', { timeout: 10000 }).catch(() => {
        console.log('[WomFun] No leaderboard rows found, stopping.');
        return;
      });

      const usersOnPage = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.leaderboard-row')).map(row => ({
          rank: row.querySelector('.rank')?.innerText?.trim() || null,
          twitter_username: row.querySelector('.username')?.innerText?.trim() || null,
          twitter_profile_image_url: row.querySelector('img.profile-image')?.src || null,
          wallet_address: row.querySelector('.wallet')?.innerText?.trim() || null,
          poi_score: row.querySelector('.poi-score')?.innerText?.trim() || null,
          mindshare_score: row.querySelector('.mindshare-score')?.innerText?.trim() || null,
          reputation: row.querySelector('.reputation')?.innerText?.trim() || null,
        }));
      });

      if (!usersOnPage || usersOnPage.length === 0) {
        console.log('[WomFun] No more users found, stopping.');
        break;
      }

      leaderboard.push(...usersOnPage);
      console.log(`[WomFun] ✅ Page ${pageNum}: ${usersOnPage.length} users (total: ${leaderboard.length})`);

      const nextButton = await page.$('.pagination-next');
      if (nextButton) {
        await nextButton.click();
        await sleep(3000 + Math.random() * 2000);
      } else {
        console.log('[WomFun] No next page button found, stopping.');
        break;
      }
    }

    await browser.close();
    console.log(`[WomFun] ✅ Complete: ${leaderboard.length} users`);
    return {
      success: true,
      leaderboard
    };

  } catch (e) {
    if (browser) await browser.close();
    console.error('[WomFun] ❌', e.message);
    return {
      success: false,
      leaderboard: []
    };
  }
}

module.exports = { scrapeWomFun };
