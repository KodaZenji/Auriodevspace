const { sleep, createBrowser, createContext } = require('../utils');

async function scrapeBeyond(period, maxPages = 20) {
  let browser;
  try {
    console.log(`[Beyond ${period}] Starting...`);
    
    browser = await createBrowser(false);
    const context = await createContext(browser);
    const page = await context.newPage();
    
    const allUsers = [];
    const pageSize = 50;
    let consecutiveErrors = 0;

    for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
      const url = `https://api.wallchain.xyz/voices/companies/beyond/leaderboard?page=${currentPage}&pageSize=${pageSize}&orderBy=position&ascending=false&period=${period}`;

      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      if (response.status() === 429) {
        console.warn(`[Beyond ${period}] ⚠️ Rate limit, waiting...`);
        await sleep(30000);
        continue;
      }

      if (!response.ok()) {
        consecutiveErrors++;
        console.error(`[Beyond ${period}] Failed: ${response.status()}`);
        if (consecutiveErrors >= 3) break;
        await sleep(5000);
        continue;
      }

      consecutiveErrors = 0;
      const data = JSON.parse(await page.evaluate(() => document.body.textContent));
      
      const usersOnPage = data.data || data.entries || (Array.isArray(data) ? data : []);
      if (usersOnPage.length === 0) {
        console.log(`[Beyond ${period}] No more data at page ${currentPage}`);
        break;
      }

      allUsers.push(...usersOnPage);
      console.log(`[Beyond ${period}] ✅ Page ${currentPage}: ${usersOnPage.length} (total: ${allUsers.length})`);

      if (usersOnPage.length < pageSize) {
        console.log(`[Beyond ${period}] Reached end of data`);
        break;
      }
      
      await sleep(3000 + Math.random() * 2000);
    }

    await browser.close();
    console.log(`[Beyond ${period}] ✅ Complete: ${allUsers.length}`);
    return allUsers.length > 0 ? allUsers : null;
  } catch (e) {
    if (browser) await browser.close();
    console.error(`[Beyond ${period}] ❌`, e.message);
    return null;
  }
}

module.exports = { scrapeBeyond };
