const { sleep, createBrowser, createContext } = require('../utils');

async function scrapeDuelDuck(maxPages = 10) {
  let browser;
  try {
    console.log('[DuelDuck] Starting...');
    
    const useProxy = !!process.env.SCRAPER_API_KEY;
    browser = await createBrowser(useProxy);
    const context = await createContext(browser);
    const page = await context.newPage();
    
    const allLeaders = [];
    const pageSize = 100;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `https://api.duelduck.com/mention-challenge/leaderboard?opts.pagination.page_size=${pageSize}&opts.pagination.page_num=${pageNum}&opts.order.order_by=total_score%2Cid&opts.order.order_type=desc&challenge_id=e010872c-6470-4018-8518-0bfc35d8ea45`;

      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      if (response.status() === 429) {
        console.warn(`[DuelDuck] ⚠️ Rate limit, waiting...`);
        await sleep(30000);
        pageNum--;
        continue;
      }

      if (!response.ok()) break;

      const json = JSON.parse(await page.evaluate(() => document.body.textContent));
      if (!json.leaders || json.leaders.length === 0) break;

      allLeaders.push(...json.leaders);
      console.log(`[DuelDuck] ✅ Page ${pageNum}: ${json.leaders.length} (total: ${allLeaders.length})`);

      if (json.leaders.length < pageSize) break;
      await sleep(3000 + Math.random() * 2000);
    }

    await browser.close();
    console.log(`[DuelDuck] ✅ Complete: ${allLeaders.length}`);
    return allLeaders;
  } catch (e) {
    if (browser) await browser.close();
    console.error('[DuelDuck] ❌', e.message);
    return null;
  }
}

module.exports = { scrapeDuelDuck };
