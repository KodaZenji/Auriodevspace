const { sleep, createBrowser, createContext } = require('../utils');

async function scrapeDeepnodeai(maxPages = 12) {
  // Try fetch first
  try {
    console.log('[DeepNodeAI] Trying direct fetch...');
    const allUsers = [];
    const pageSize = 50;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `https://mindoshare.ai/api/leaderboards/f5035d30-73d5-48a4-a3e4-abd5be6c30ec/all?page=${pageNum}&pageSize=${pageSize}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (pageNum === 1) {
          console.log('[DeepNodeAI] Direct fetch failed, trying Playwright...');
          return await scrapeDeepnodeaiWithPlaywright(maxPages);
        }
        break;
      }

      const json = await response.json();
      const usersOnPage = json.currentLeaderboard || json.data || json.entries || [];
      
      if (usersOnPage.length === 0) break;

      allUsers.push(...usersOnPage);
      console.log(`[DeepNodeAI] ✅ Page ${pageNum}: ${usersOnPage.length} (total: ${allUsers.length})`);

      if (usersOnPage.length < pageSize) break;
      await sleep(2000 + Math.random() * 1000);
    }

    console.log(`[DeepNodeAI] ✅ Complete: ${allUsers.length}`);
    return allUsers.length > 0 ? allUsers : null;
  } catch (e) {
    console.log('[DeepNodeAI] Fetch failed, trying Playwright...');
    return await scrapeDeepnodeaiWithPlaywright(maxPages);
  }
}

async function scrapeDeepnodeaiWithPlaywright(maxPages) {
  let browser;
  try {
    const useProxy = !!process.env.SCRAPER_API_KEY;
    browser = await createBrowser(useProxy);
    const context = await createContext(browser);
    const page = await context.newPage();
    
    const allUsers = [];
    const pageSize = 50;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `https://mindoshare.ai/api/leaderboards/f5035d30-73d5-48a4-a3e4-abd5be6c30ec/all?page=${pageNum}&pageSize=${pageSize}`;

      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      if (response.status() === 429) {
        await sleep(30000);
        pageNum--;
        continue;
      }

      if (!response.ok()) break;

      const json = JSON.parse(await page.evaluate(() => document.body.textContent));
      const usersOnPage = json.currentLeaderboard || json.data || json.entries || [];

      if (usersOnPage.length === 0) break;

      allUsers.push(...usersOnPage);
      console.log(`[DeepNodeAI/Playwright] ✅ Page ${pageNum}: ${usersOnPage.length} (total: ${allUsers.length})`);

      if (usersOnPage.length < pageSize) break;
      await sleep(3000 + Math.random() * 2000);
    }

    await browser.close();
    console.log(`[DeepNodeAI/Playwright] ✅ Complete: ${allUsers.length}`);
    return allUsers.length > 0 ? allUsers : null;
  } catch (e) {
    if (browser) await browser.close();
    console.error('[DeepNodeAI/Playwright] ❌', e.message);
    return null;
  }
}

module.exports = { scrapeDeepnodeai };
