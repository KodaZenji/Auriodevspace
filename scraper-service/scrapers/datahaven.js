const { sleep, createBrowser, createContext } = require('../utils');

async function scrapeDataHaven(maxPages = 15) {
  let browser;

  try {
    console.log('[DataHaven] Starting scrape...');

    browser = await createBrowser(false);
    const context = await createContext(browser);
    const page = await context.newPage();
    
    const allUsers = [];
    const limit = 100;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`[DataHaven] Page ${pageNum}/${maxPages}...`);

      const url = `https://www.xeet.ai/api/topics/datahaven/tournament?page=${pageNum}&limit=${limit}&timeframe=all&tournamentId=946c39cf-9dba-404f-9451-f9b6da888473`;

      try {
        const response = await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        if (response.status() === 429) {
          console.warn(`[DataHaven] ⚠️ Rate limit on page ${pageNum}, waiting 30s...`);
          await sleep(30000);
          pageNum--;
          continue;
        }

        if (!response.ok()) {
          console.error(`[DataHaven] Failed: ${response.status()}`);
          break;
        }

        const bodyText = await page.evaluate(() => document.body.textContent);
        const json = JSON.parse(bodyText);

        if (!json.data || json.data.length === 0) {
          console.log(`[DataHaven] No more data at page ${pageNum}`);
          break;
        }

        allUsers.push(...json.data);
        console.log(`[DataHaven] ✅ Page ${pageNum}: ${json.data.length} users (total: ${allUsers.length})`);

        await sleep(5000 + Math.random() * 3000);
      } catch (err) {
        console.error(`[DataHaven] Error on page ${pageNum}:`, err.message);
        break;
      }
    }

    await browser.close();
    console.log(`[DataHaven] ✅ Complete: ${allUsers.length} users`);
    return allUsers;

  } catch (error) {
    if (browser) await browser.close();
    console.error('[DataHaven] ❌', error);
    return null;
  }
}

module.exports = { scrapeDataHaven };
