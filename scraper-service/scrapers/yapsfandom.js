const { sleep, createBrowser, createContext } = require('../utils');

async function scrapeYapsFandom(timeFilter, maxPages = 15) {
  let browser;

  try {
    console.log(`[YapsFandom ${timeFilter}] Starting scrape...`);

    browser = await createBrowser(false);
    const context = await createContext(browser);
    const page = await context.newPage();
    
    const allUsers = [];
    const limit = 150;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`[YapsFandom ${timeFilter}] Page ${pageNum}/${maxPages}...`);

      const url = `https://growlops.selanetwork.io/api/public/yaps/leaderboard?projectId=fandom&timeFilter=${timeFilter}&rankLimit=${limit}&page=${pageNum}`;

      try {
        const response = await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        if (response.status() === 429) {
          console.warn(`[YapsFandom ${timeFilter}] ⚠️ Rate limit on page ${pageNum}, waiting 30s...`);
          await sleep(30000);
          pageNum--;
          continue;
        }

        if (!response.ok()) {
          console.error(`[YapsFandom ${timeFilter}] Failed: ${response.status()}`);
          break;
        }

        const bodyText = await page.evaluate(() => document.body.textContent);
        const json = JSON.parse(bodyText);

        let usersOnPage = [];
        if (Array.isArray(json)) {
          usersOnPage = json;
        } else if (json.data && Array.isArray(json.data)) {
          usersOnPage = json.data;
        } else if (json.leaderboard && Array.isArray(json.leaderboard)) {
          usersOnPage = json.leaderboard;
        }

        if (usersOnPage.length === 0) {
          console.log(`[YapsFandom ${timeFilter}] No more data at page ${pageNum}`);
          break;
        }

        allUsers.push(...usersOnPage);
        console.log(`[YapsFandom ${timeFilter}] ✅ Page ${pageNum}: ${usersOnPage.length} users (total: ${allUsers.length})`);

        if (usersOnPage.length < limit) {
          console.log(`[YapsFandom ${timeFilter}] Reached end of data`);
          break;
        }

        await sleep(5000 + Math.random() * 3000);
      } catch (err) {
        console.error(`[YapsFandom ${timeFilter}] Error on page ${pageNum}:`, err.message);
        break;
      }
    }

    await browser.close();
    console.log(`[YapsFandom ${timeFilter}] ✅ Complete: ${allUsers.length} users`);
    return allUsers.length > 0 ? allUsers : null;

  } catch (error) {
    if (browser) await browser.close();
    console.error(`[YapsFandom ${timeFilter}] ❌`, error);
    return null;
  }
}

module.exports = { scrapeYapsFandom };
