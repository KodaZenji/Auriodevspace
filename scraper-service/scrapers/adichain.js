const { sleep, createBrowser, createContext } = require('../utils');

async function scrapeAdichain(maxPages = 15) {
  let browser;
  try {
    console.log('[Adichain] Starting...');
    
    browser = await createBrowser(false);
    const context = await createContext(browser);
    const page = await context.newPage();
    
    const allUsers = [];
    const limit = 100;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `https://www.xeet.ai/api/topics/adi/tournament?page=${pageNum}&limit=${limit}&timeframe=all&tournamentId=1c1288ec-0220-42a4-afa5-c5053c00ec8e`;

      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      if (response.status() === 429) {
        await sleep(30000);
        pageNum--;
        continue;
      }

      if (!response.ok()) break;

      const json = JSON.parse(await page.evaluate(() => document.body.textContent));
      if (!json.data || json.data.length === 0) break;

      allUsers.push(...json.data);
      console.log(`[Adichain] ✅ Page ${pageNum}: ${json.data.length} (total: ${allUsers.length})`);

      await sleep(5000 + Math.random() * 3000);
    }

    await browser.close();
    console.log(`[Adichain] ✅ Complete: ${allUsers.length}`);
    return allUsers;
  } catch (e) {
    if (browser) await browser.close();
    console.error('[Adichain] ❌', e.message);
    return null;
  }
}

module.exports = { scrapeAdichain };
