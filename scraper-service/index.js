// Enhanced Leaderboard Scraper with Webhook Callback
const express = require('express');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3001;

// Helper function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============= YAPPERS =============
async function scrapeYappers(days) {
  try {
    console.log(`[Yappers ${days}d] Starting...`);
    const res = await fetch(
      `https://yappers-api.goat.network/leaderboard?days=${days}&limit=1000`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    console.log(`[Yappers ${days}d] ✅ ${json.yappers?.length || 0} users`);
    return json.yappers || [];
  } catch (e) {
    console.error(`[Yappers ${days}d] ❌`, e.message);
    return null;
  }
}

// ============= DUELDUCK =============
async function scrapeDuelDuck() {
  try {
    console.log('[DuelDuck] Starting...');
    const res = await fetch(
      'https://api.duelduck.com/mention-challenge/leaderboard?opts.pagination.page_size=1000&opts.pagination.page_num=1&opts.order.order_by=total_score&opts.order.order_type=desc&challenge_id=131938ae-0b07-4ac5-8b67-4c1d3cbbee5e',
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    console.log(`[DuelDuck] ✅ ${json.leaders?.length || 0} users`);
    return json.leaders || [];
  } catch (e) {
    console.error('[DuelDuck] ❌', e.message);
    return null;
  }
}

// ============= ADICHAIN (Playwright) =============
async function scrapeAdichain(maxPages = 15) {
  let browser;

  try {
    console.log('[Adichain] Starting scrape...');

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();
    const allUsers = [];
    const limit = 100;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`[Adichain] Page ${pageNum}/${maxPages}...`);

      const url = `https://www.xeet.ai/api/topics/adi/tournament?page=${pageNum}&limit=${limit}&timeframe=all&tournamentId=3396f69f-70c1-4703-9b01-47b147e095ef`;

      try {
        const response = await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // Handle rate limiting with exponential backoff
        if (response.status() === 429) {
          console.warn(`[Adichain] ⚠️ Rate limit hit on page ${pageNum}, waiting 30s...`);
          await sleep(30000); // Wait 30 seconds
          pageNum--; // Retry same page
          continue;
        }

        if (!response.ok()) {
          console.error(`[Adichain] Failed: ${response.status()}`);
          break;
        }

        const bodyText = await page.evaluate(() => document.body.textContent);
        const json = JSON.parse(bodyText);

        if (!json.data || json.data.length === 0) {
          console.log(`[Adichain] No more data at page ${pageNum}`);
          break;
        }

        allUsers.push(...json.data);
        console.log(`[Adichain] ✅ Page ${pageNum}: ${json.data.length} users (total: ${allUsers.length})`);

        // Longer delay for Adichain (5-8 seconds to avoid 429)
        await sleep(5000 + Math.random() * 3000);
      } catch (err) {
        console.error(`[Adichain] Error on page ${pageNum}:`, err.message);
        break;
      }
    }

    await browser.close();
    console.log(`[Adichain] ✅ Complete: ${allUsers.length} users`);
    return allUsers;

  } catch (error) {
    if (browser) await browser.close();
    console.error('[Adichain] ❌', error);
    return null;
  }
}

// ============= HEYELSA (Playwright with correct data structure) =============
async function scrapeHeyElsa(period, maxPages = 20) {
  let browser;

  try {
    console.log(`[HeyElsa ${period}] Starting scrape...`);

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();
    const allUsers = [];
    let currentPage = 1;
    const pageSize = 50;
    let consecutiveErrors = 0;

    while (currentPage <= maxPages) {
      console.log(`[HeyElsa ${period}] Page ${currentPage}...`);

      const url = `https://api.wallchain.xyz/voices/companies/heyelsa/leaderboard?page=${currentPage}&pageSize=${pageSize}&orderBy=position&ascending=false&period=${period}`;

      try {
        const response = await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // Handle rate limiting
        if (response.status() === 429) {
          console.warn(`[HeyElsa ${period}] ⚠️ Rate limit hit on page ${currentPage}, waiting 30s...`);
          await sleep(30000);
          continue;
        }

        if (!response.ok()) {
          consecutiveErrors++;
          console.error(`[HeyElsa ${period}] Failed: ${response.status()}`);

          if (consecutiveErrors >= 3) {
            console.error(`[HeyElsa ${period}] ❌ Too many errors, stopping`);
            break;
          }

          await sleep(5000);
          continue;
        }

        consecutiveErrors = 0;

        const bodyText = await page.evaluate(() => document.body.textContent);
        const data = JSON.parse(bodyText);

        // Handle HeyElsa API response structure based on the API format you provided
        let usersOnPage = [];

        // The HeyElsa API might return data in different structures
        // Based on your example, it could be a single object or an array
        if (data.data && Array.isArray(data.data)) {
          // If the API returns data in a 'data' array
          usersOnPage = data.data;
        } else if (data.entries && Array.isArray(data.entries)) {
          // If the API returns data in an 'entries' array
          usersOnPage = data.entries;
        } else if (data.leaderboard && Array.isArray(data.leaderboard)) {
          // If the API returns data in a 'leaderboard' array
          usersOnPage = data.leaderboard;
        } else if (data.items && Array.isArray(data.items)) {
          // If the API returns data in an 'items' array
          usersOnPage = data.items;
        } else if (Array.isArray(data)) {
          // If the API returns a direct array
          usersOnPage = data;
        } else {
          // If it's a single user object (not an array), wrap it in an array
          // This handles the case where the API returns a single object with xInfo
          if (data.xInfo && typeof data.xInfo === 'object') {
            usersOnPage = [data];
            console.log(`[HeyElsa ${period}] Single user object detected, wrapping in array`);
          } else {
            console.log(`[HeyElsa ${period}] Unexpected data structure:`, Object.keys(data));
            console.log(`[HeyElsa ${period}] Data sample:`, JSON.stringify(data, null, 2).substring(0, 500));
            break;
          }
        }

        if (usersOnPage.length === 0) {
          console.log(`[HeyElsa ${period}] No more data at page ${currentPage}`);
          break;
        }

        allUsers.push(...usersOnPage);
        console.log(`[HeyElsa ${period}] ✅ Page ${currentPage}: ${usersOnPage.length} users (total: ${allUsers.length})`);

        // Check if we've reached the end of available data
        // If we got fewer results than the page size, we've reached the end
        if (usersOnPage.length < pageSize) {
          console.log(`[HeyElsa ${period}] Reached end of data at page ${currentPage}`);
          break;
        }

        currentPage++;

        // Delay between pages (3-5 seconds random)
        const delay = 3000 + Math.random() * 2000;
        await sleep(delay);

      } catch (err) {
        consecutiveErrors++;
        console.error(`[HeyElsa ${period}] Error on page ${currentPage}:`, err.message);

        if (consecutiveErrors >= 3) {
          console.error(`[HeyElsa ${period}] ❌ Too many consecutive errors`);
          break;
        }

        await sleep(5000);
      }
    }

    await browser.close();
    console.log(`[HeyElsa ${period}] ✅ Complete: ${allUsers.length} users`);
    return allUsers.length > 0 ? allUsers : null;

  } catch (error) {
    if (browser) await browser.close();
    console.error(`[HeyElsa ${period}] ❌`, error);
    return null;
  }
}

// ============= API ENDPOINTS =============

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'unified-leaderboard-scraper' });
});

// NEW: Async scrape endpoint with webhook callback
app.get('/scrape-all-async', async (req, res) => {
  const webhookUrl = req.query.webhook || process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(400).json({
      success: false,
      error: 'webhook parameter required'
    });
  }

  // Immediately respond to prevent timeout
  res.json({
    success: true,
    message: 'Scraping started in background. Will callback when complete.',
    estimatedTime: '10-15 minutes'
  });

  // Run scraping in background
  (async () => {
    console.log('\n=== 🚀 BACKGROUND SCRAPING STARTED ===\n');

    try {
      const results = {
        yappers: {},
        duelduck: null,
        adichain: null,
        heyelsa: {}
      };

      // Yappers (7d & 30d)
      for (const days of [7, 30]) {
        results.yappers[days] = await scrapeYappers(days);
        await sleep(2000);
      }

      // DuelDuck
      results.duelduck = await scrapeDuelDuck();
      await sleep(3000);

      // Adichain
      results.adichain = await scrapeAdichain(15);
      await sleep(5000);

      // HeyElsa (all periods with longer delays between periods)
      for (const period of ['epoch-2', '7d', '30d']) {
        console.log(`\n--- Starting ${period} period ---`);
        results.heyelsa[period] = await scrapeHeyElsa(period, 20);

        if (period !== '30d') {
          console.log('Waiting 10s before next period...');
          await sleep(10000);
        }
      }

      const finalResults = {
        success: true,
        results: {
          yappers: {
            '7': { count: results.yappers[7]?.length || 0, data: results.yappers[7] },
            '30': { count: results.yappers[30]?.length || 0, data: results.yappers[30] }
          },
          duelduck: { count: results.duelduck?.length || 0, data: results.duelduck },
          adichain: { count: results.adichain?.length || 0, data: results.adichain },
          heyelsa: {
            'epoch-2': { count: results.heyelsa['epoch-2']?.length || 0, data: results.heyelsa['epoch-2'] },
            '7d': { count: results.heyelsa['7d']?.length || 0, data: results.heyelsa['7d'] },
            '30d': { count: results.heyelsa['30d']?.length || 0, data: results.heyelsa['30d'] }
          }
        }
      };

      console.log('\n=== ✅ SCRAPING COMPLETE, CALLING WEBHOOK ===\n');

      // Call webhook with results
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEBHOOK_SECRET || 'default-secret'}`
        },
        body: JSON.stringify(finalResults)
      });

      console.log('✅ Webhook called successfully');

    } catch (error) {
      console.error('❌ Background scraping error:', error);

      // Notify webhook of failure
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.WEBHOOK_SECRET || 'default-secret'}`
          },
          body: JSON.stringify({
            success: false,
            error: error.message
          })
        });
      } catch (webhookError) {
        console.error('❌ Failed to call webhook:', webhookError);
      }
    }
  })();
});

// Keep original endpoint for direct testing
app.get('/scrape-all', async (req, res) => {
  console.log('\n=== SCRAPING ALL LEADERBOARDS ===\n');

  try {
    const results = {
      yappers: {},
      duelduck: null,
      adichain: null,
      heyelsa: {}
    };

    // Yappers (7d & 30d)
    for (const days of [7, 30]) {
      results.yappers[days] = await scrapeYappers(days);
      await sleep(2000);
    }

    // DuelDuck
    results.duelduck = await scrapeDuelDuck();
    await sleep(3000);

    // Adichain
    results.adichain = await scrapeAdichain(15);
    await sleep(5000);

    // HeyElsa (all periods)
    for (const period of ['epoch-2', '7d', '30d']) {
      console.log(`\n--- Starting ${period} period ---`);
      results.heyelsa[period] = await scrapeHeyElsa(period, 20);

      if (period !== '30d') {
        console.log('Waiting 10s before next period...');
        await sleep(10000);
      }
    }

    res.json({
      success: true,
      results: {
        yappers: {
          '7': { count: results.yappers[7]?.length || 0, data: results.yappers[7] },
          '30': { count: results.yappers[30]?.length || 0, data: results.yappers[30] }
        },
        duelduck: { count: results.duelduck?.length || 0, data: results.duelduck },
        adichain: { count: results.adichain?.length || 0, data: results.adichain },
        heyelsa: {
          'epoch-2': { count: results.heyelsa['epoch-2']?.length || 0, data: results.heyelsa['epoch-2'] },
          '7d': { count: results.heyelsa['7d']?.length || 0, data: results.heyelsa['7d'] },
          '30d': { count: results.heyelsa['30d']?.length || 0, data: results.heyelsa['30d'] }
        }
      }
    });
  } catch (error) {
    console.error('Scrape all error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============= INDIVIDUAL SCRAPER ENDPOINTS =============

app.get('/scrape/yappers', async (req, res) => {
  const days = parseInt(req.query.days || '7');
  try {
    const data = await scrapeYappers(days);
    res.json({ success: true, days, count: data?.length || 0, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/scrape/duelduck', async (req, res) => {
  try {
    const data = await scrapeDuelDuck();
    res.json({ success: true, count: data?.length || 0, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/scrape/adichain', async (req, res) => {
  const maxPages = parseInt(req.query.maxPages || '15');
  try {
    const data = await scrapeAdichain(maxPages);
    res.json({ success: true, count: data?.length || 0, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/scrape/heyelsa', async (req, res) => {
  const period = req.query.period || '7d';
  const maxPages = parseInt(req.query.maxPages || '20');
  try {
    const data = await scrapeHeyElsa(period, maxPages);
    res.json({ success: true, period, count: data?.length || 0, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Unified Leaderboard Scraper running on port ${PORT}`);
});
