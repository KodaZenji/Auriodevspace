const { sleep, createBrowser, createContext } = require('../utils');

async function scrapeHelios(maxPages = 12) {
  // Try fetch first with updated headers
  try {
    console.log('[Helios] Trying direct fetch...');
    const allUsers = [];
    const pageSize = 50;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `https://mindoshare.ai/api/leaderboards/079b81b1-3e62-4f27-9ad1-0de7eb9e370e/all?page=${pageNum}&pageSize=${pageSize}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://mindoshare.ai/projects/helios_layer1?tab=pools',
          'sec-ch-ua': '"Chromium";v="130", "Not?A_Brand";v="99", "Google Chrome";v="130"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"Android"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin'
        }
      });

      if (!response.ok) {
        if (pageNum === 1) {
          console.log(`[Helios] Direct fetch failed (${response.status}), trying Playwright...`);
          return await scrapeHeliosWithPlaywright(maxPages);
        }
        console.log(`[Helios] Stopping at page ${pageNum} (status: ${response.status})`);
        break;
      }

      const json = await response.json();
      const usersOnPage = json.currentLeaderboard || json.data || json.entries || [];
      
      if (usersOnPage.length === 0) {
        console.log(`[Helios] No more data at page ${pageNum}`);
        break;
      }

      allUsers.push(...usersOnPage);
      console.log(`[Helios] ✅ Page ${pageNum}: ${usersOnPage.length} (total: ${allUsers.length})`);

      if (usersOnPage.length < pageSize) {
        console.log(`[Helios] Last page reached (${usersOnPage.length} < ${pageSize})`);
        break;
      }
      
      await sleep(2000 + Math.random() * 1000);
    }

    if (allUsers.length === 0) {
      console.log('[Helios] No data collected, trying Playwright...');
      return await scrapeHeliosWithPlaywright(maxPages);
    }

    console.log(`[Helios] ✅ Complete: ${allUsers.length} users`);
    return allUsers;
  } catch (e) {
    console.log(`[Helios] Fetch error: ${e.message}, trying Playwright...`);
    return await scrapeHeliosWithPlaywright(maxPages);
  }
}

async function scrapeHeliosWithPlaywright(maxPages) {
  let browser;
  try {
    console.log('[Helios/Playwright] Starting browser...');
    const useProxy = !!process.env.SCRAPER_API_KEY;
    browser = await createBrowser(useProxy);
    const context = await createContext(browser);
    const page = await context.newPage();
    
    // Set extra headers to match working request
    await page.setExtraHTTPHeaders({
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://mindoshare.ai/projects/helios_layer1?tab=pools',
      'sec-ch-ua': '"Chromium";v="130", "Not?A_Brand";v="99", "Google Chrome";v="130"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin'
    });
    
    const allUsers = [];
    const pageSize = 50;
    let consecutiveErrors = 0;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const url = `https://mindoshare.ai/api/leaderboards/079b81b1-3e62-4f27-9ad1-0de7eb9e370e/all?page=${pageNum}&pageSize=${pageSize}`;

      try {
        const response = await page.goto(url, { 
          waitUntil: 'networkidle', 
          timeout: 30000 
        });

        if (response.status() === 429) {
          console.log(`[Helios/Playwright] Rate limited, waiting 30s...`);
          await sleep(30000);
          pageNum--;
          continue;
        }

        if (!response.ok()) {
          consecutiveErrors++;
          console.log(`[Helios/Playwright] Page ${pageNum} failed (${response.status()}), errors: ${consecutiveErrors}`);
          if (consecutiveErrors >= 3) {
            console.log(`[Helios/Playwright] Too many errors, stopping`);
            break;
          }
          await sleep(5000);
          continue;
        }

        consecutiveErrors = 0;
        const bodyText = await page.evaluate(() => document.body.textContent);
        const json = JSON.parse(bodyText);
        const usersOnPage = json.currentLeaderboard || json.data || json.entries || [];

        if (usersOnPage.length === 0) {
          console.log(`[Helios/Playwright] No more data at page ${pageNum}`);
          break;
        }

        allUsers.push(...usersOnPage);
        console.log(`[Helios/Playwright] ✅ Page ${pageNum}: ${usersOnPage.length} (total: ${allUsers.length})`);

        if (usersOnPage.length < pageSize) {
          console.log(`[Helios/Playwright] Last page reached`);
          break;
        }
        
        await sleep(3000 + Math.random() * 2000);
      } catch (pageError) {
        consecutiveErrors++;
        console.error(`[Helios/Playwright] Page ${pageNum} error:`, pageError.message);
        if (consecutiveErrors >= 3) break;
        await sleep(5000);
      }
    }

    await browser.close();
    
    if (allUsers.length === 0) {
      console.log(`[Helios/Playwright] ❌ No data collected`);
      return null;
    }

    console.log(`[Helios/Playwright] ✅ Complete: ${allUsers.length} users`);
    return allUsers;
  } catch (e) {
    if (browser) await browser.close();
    console.error('[Helios/Playwright] ❌', e.message);
    return null;
  }
}

module.exports = { scrapeHelios };
