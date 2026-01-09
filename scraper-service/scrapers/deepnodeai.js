const { sleep, createBrowser, createContext } = require('../utils');

async function scrapeDeepnodeai(maxPages = 12) {
  // Try fetch first
  try {
    console.log('[DeepNodeAI] Trying direct fetch...');
    const allUsers = [];
    const pageSize = 50;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `https://mindoshare.ai/api/leaderboards/f5035d30-73d5-48a4-a3e4-abd5be6c30ec/all?page=${pageNum}&pageSize=${pageSize}`;
      
      console.log(`[DeepNodeAI] Fetching page ${pageNum}...`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://mindoshare.ai/',
          'Origin': 'https://mindoshare.ai'
        }
      });

      console.log(`[DeepNodeAI] Response status: ${response.status}`);

      if (!response.ok) {
        if (response.status === 429) {
          console.log('[DeepNodeAI] Rate limited, waiting 30s...');
          await sleep(30000);
          pageNum--;
          continue;
        }
        if (pageNum === 1) {
          console.log('[DeepNodeAI] Direct fetch failed, trying Playwright...');
          return await scrapeDeepnodeaiWithPlaywright(maxPages);
        }
        console.log(`[DeepNodeAI] Stopping at page ${pageNum} due to error`);
        break;
      }

      const text = await response.text();
      console.log(`[DeepNodeAI] Response preview: ${text.substring(0, 200)}`);
      
      let json;
      try {
        json = JSON.parse(text);
      } catch (parseError) {
        console.error('[DeepNodeAI] JSON parse error:', parseError.message);
        if (pageNum === 1) {
          return await scrapeDeepnodeaiWithPlaywright(maxPages);
        }
        break;
      }

      // Try multiple possible response structures
      const usersOnPage = json.currentLeaderboard || 
                          json.data?.currentLeaderboard || 
                          json.data?.entries ||
                          json.data || 
                          json.entries || 
                          (Array.isArray(json) ? json : []);
      
      console.log(`[DeepNodeAI] Found ${usersOnPage.length} users on page ${pageNum}`);
      
      if (usersOnPage.length === 0) {
        console.log('[DeepNodeAI] No more users, stopping');
        break;
      }

      allUsers.push(...usersOnPage);
      console.log(`[DeepNodeAI] ✅ Page ${pageNum}: ${usersOnPage.length} (total: ${allUsers.length})`);

      if (usersOnPage.length < pageSize) {
        console.log('[DeepNodeAI] Last page reached');
        break;
      }
      
      await sleep(2000 + Math.random() * 1000);
    }

    console.log(`[DeepNodeAI] ✅ Complete: ${allUsers.length} users`);
    return allUsers.length > 0 ? allUsers : null;
  } catch (e) {
    console.error('[DeepNodeAI] Fetch error:', e.message);
    console.log('[DeepNodeAI] Trying Playwright...');
    return await scrapeDeepnodeaiWithPlaywright(maxPages);
  }
}

async function scrapeDeepnodeaiWithPlaywright(maxPages) {
  let browser;
  try {
    console.log('[DeepNodeAI] Starting Playwright scraper...');
    const useProxy = !!process.env.SCRAPER_API_KEY;
    browser = await createBrowser(useProxy);
    const context = await createContext(browser);
    const page = await context.newPage();
    
    const allUsers = [];
    const pageSize = 50;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `https://mindoshare.ai/api/leaderboards/f5035d30-73d5-48a4-a3e4-abd5be6c30ec/all?page=${pageNum}&pageSize=${pageSize}`;

      console.log(`[DeepNodeAI/Playwright] Navigating to page ${pageNum}...`);
      
      const response = await page.goto(url, { 
        waitUntil: 'networkidle', 
        timeout: 30000 
      }).catch(async (error) => {
        console.log(`[DeepNodeAI/Playwright] Navigation error: ${error.message}`);
        return null;
      });

      if (!response) {
        console.log('[DeepNodeAI/Playwright] No response, stopping');
        break;
      }

      if (response.status() === 429) {
        console.log('[DeepNodeAI/Playwright] Rate limited, waiting 30s...');
        await sleep(30000);
        pageNum--;
        continue;
      }

      if (!response.ok()) {
        console.log(`[DeepNodeAI/Playwright] Bad response: ${response.status()}`);
        break;
      }

      const bodyText = await page.evaluate(() => document.body.textContent).catch(() => null);
      
      if (!bodyText) {
        console.log('[DeepNodeAI/Playwright] Could not get body text');
        break;
      }

      let json;
      try {
        json = JSON.parse(bodyText);
      } catch (parseError) {
        console.error('[DeepNodeAI/Playwright] Parse error:', parseError.message);
        console.log('[DeepNodeAI/Playwright] Body preview:', bodyText.substring(0, 200));
        break;
      }

      const usersOnPage = json.currentLeaderboard || 
                          json.data?.currentLeaderboard || 
                          json.data?.entries ||
                          json.data || 
                          json.entries || 
                          (Array.isArray(json) ? json : []);

      if (usersOnPage.length === 0) {
        console.log('[DeepNodeAI/Playwright] No more users');
        break;
      }

      allUsers.push(...usersOnPage);
      console.log(`[DeepNodeAI/Playwright] ✅ Page ${pageNum}: ${usersOnPage.length} (total: ${allUsers.length})`);

      if (usersOnPage.length < pageSize) break;
      await sleep(3000 + Math.random() * 2000);
    }

    await browser.close();
    console.log(`[DeepNodeAI/Playwright] ✅ Complete: ${allUsers.length} users`);
    return allUsers.length > 0 ? allUsers : null;
  } catch (e) {
    if (browser) await browser.close();
    console.error('[DeepNodeAI/Playwright] ❌ Fatal error:', e.message);
    console.error(e.stack);
    return null;
  }
}

module.exports = { scrapeDeepnodeai };
