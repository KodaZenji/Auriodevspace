const { sleep, createBrowser, createContext } = require('../utils');

async function scrapeHelios(maxPages = 12) {
  // Try fetch first
  try {
    console.log('[Helios] Trying direct fetch...');
    const allUsers = [];
    const pageSize = 50;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `https://helios.ai/api/leaderboards/079b81b1-3e62-4f27-9ad1-0de7eb9e370e/all?page=${pageNum}&pageSize=${pageSize}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (pageNum === 1) {
          console.log('[Helios] Direct fetch failed, trying Playwright...');
          return await scrapeHeliosWithPlaywright(maxPages);
        }
        break;
      }

      const json = await response.json();
      const usersOnPage = json.currentLeaderboard || json.data || json.entries || [];
      
      if (usersOnPage.length === 0) break;

      allUsers.push(...usersOnPage);
      console.log(`[Helios] ✅ Page ${pageNum}: ${usersOnPage.length} (total: ${allUsers.length})`);

      if (usersOnPage.length < pageSize) break;
      await sleep(2000 + Math.random() * 1000);
    }

    console.log(`[Helios] ✅ Complete: ${allUsers.length}`);
    return allUsers.length > 0 ? allUsers : null;
  } catch (e) {
    console.log('[Helios] Fetch failed, trying Playwright...');
    return await scrapeHeliosWithPlaywright(maxPages);
  }
}

async function scrapeHeliosWithPlaywright(maxPages) {
  let browser;
  try {
    const useProxy = !!process.env.SCRAPER_API_KEY;
    browser = await createBrowser(useProxy);
    const context = await createContext(browser);
    const page = await context.newPage();
    
    const allUsers = [];
    const pageSize = 50;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `https://helios.ai/api/leaderboards/079b81b1-3e62-4f27-9ad1-0de7eb9e370e/all?page=${pageNum}&pageSize=${pageSize}`;

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
      console.log(`[Helios/Playwright] ✅ Page ${pageNum}: ${usersOnPage.length} (total: ${allUsers.length})`);

      if (usersOnPage.length < pageSize) break;
      await sleep(3000 + Math.random() * 2000);
    }

    await browser.close();
    console.log(`[Helios/Playwright] ✅ Complete: ${allUsers.length}`);
    return allUsers.length > 0 ? allUsers : null;
  } catch (e) {
    if (browser) await browser.close();
    console.error('[Helios/Playwright] ❌', e.message);
    return null;
  }
}

module.exports = { scrapeHelios };
