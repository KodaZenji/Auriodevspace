// Complete Unified Leaderboard Scraper with Mindoshare
const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;

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

// ============= DUELDUCK (With Proxy Support) =============
async function scrapeDuelDuck(maxPages = 10) {
  let browser;
  
  try {
    console.log('[DuelDuck] Starting with pagination...');
    
    const useProxy = !!process.env.SCRAPER_API_KEY;
    console.log(`[DuelDuck] Proxy: ${useProxy ? 'ENABLED' : 'DISABLED'}`);
    
    browser = await chromium.launch({
      headless: true,
      proxy: useProxy ? {
        server: process.env.PROXY_SERVER || 'http://proxy.scraperapi.com:8001',
        username: process.env.PROXY_USERNAME || 'scraperapi',
        password: process.env.SCRAPER_API_KEY
      } : undefined,
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
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });

    const page = await context.newPage();
    const allLeaders = [];
    const pageSize = 100;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`[DuelDuck] Page ${pageNum}/${maxPages}...`);

      const url = `https://api.duelduck.com/mention-challenge/leaderboard?opts.pagination.page_size=${pageSize}&opts.pagination.page_num=${pageNum}&opts.order.order_by=total_score&opts.order.order_type=desc&challenge_id=131938ae-0b07-4ac5-8b67-4c1d3cbbee5e`;

      try {
        const response = await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        if (response.status() === 429) {
          console.warn(`[DuelDuck] ⚠️ Rate limit on page ${pageNum}, waiting 30s...`);
          await sleep(30000);
          pageNum--;
          continue;
        }

        if (!response.ok()) {
          console.error(`[DuelDuck] Failed: ${response.status()}`);
          break;
        }

        const bodyText = await page.evaluate(() => document.body.textContent);
        const json = JSON.parse(bodyText);

        if (!json.leaders || json.leaders.length === 0) {
          console.log(`[DuelDuck] No more data at page ${pageNum}`);
          break;
        }

        allLeaders.push(...json.leaders);
        console.log(`[DuelDuck] ✅ Page ${pageNum}: ${json.leaders.length} leaders (total: ${allLeaders.length})`);

        if (json.leaders.length < pageSize) {
          console.log(`[DuelDuck] Reached end of data`);
          break;
        }

        await sleep(3000 + Math.random() * 2000);
        
      } catch (err) {
        console.error(`[DuelDuck] Error on page ${pageNum}:`, err.message);
        break;
      }
    }

    await browser.close();
    console.log(`[DuelDuck] ✅ Complete: ${allLeaders.length} total leaders`);
    return allLeaders;

  } catch (e) {
    if (browser) await browser.close();
    console.error('[DuelDuck] ❌', e.message);
    return null;
  }
}

// ============= ADICHAIN =============
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
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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

        if (response.status() === 429) {
          console.warn(`[Adichain] ⚠️ Rate limit on page ${pageNum}, waiting 30s...`);
          await sleep(30000);
          pageNum--;
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

// ============= HEYELSA =============
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
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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

        if (response.status() === 429) {
          console.warn(`[HeyElsa ${period}] ⚠️ Rate limit, waiting 30s...`);
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

        let usersOnPage = [];
        if (data.data && Array.isArray(data.data)) {
          usersOnPage = data.data;
        } else if (data.entries && Array.isArray(data.entries)) {
          usersOnPage = data.entries;
        } else if (Array.isArray(data)) {
          usersOnPage = data;
        }

        if (usersOnPage.length === 0) {
          console.log(`[HeyElsa ${period}] No more data at page ${currentPage}`);
          break;
        }

        allUsers.push(...usersOnPage);
        console.log(`[HeyElsa ${period}] ✅ Page ${currentPage}: ${usersOnPage.length} users (total: ${allUsers.length})`);

        if (usersOnPage.length < pageSize) {
          console.log(`[HeyElsa ${period}] Reached end of data`);
          break;
        }

        currentPage++;
        await sleep(3000 + Math.random() * 2000);

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

// ============= MINDOSHARE (PERCEPTRON) - UPDATED =============
async function scrapeMindoshare(maxPages = 12) {
  let browser;
  
  try {
    console.log('[Mindoshare] Starting direct fetch from MindoShare API...');
    
    const allUsers = [];
    const pageSize = 50;
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`[Mindoshare] Fetching page ${pageNum}/${maxPages}...`);
      
      const url = `https://mindoshare.ai/api/leaderboards/92e433f6-9bc6-4e53-800c-15b23b88c05b/all?page=${pageNum}&pageSize=${pageSize}`;
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://mindoshare.ai/'
          }
        });
        
        if (!response.ok) {
          console.log(`[Mindoshare] HTTP ${response.status} at page ${pageNum}`);
          
          // If direct fetch fails on first page, try Playwright
          if (pageNum === 1) {
            console.log('[Mindoshare] Switching to Playwright with proxy...');
            return await scrapeMindosharePlaywright(maxPages);
          }
          break;
        }
        
        const json = await response.json();
        
        // Handle different possible response structures
        let usersOnPage = [];
        if (json.data && Array.isArray(json.data)) {
          usersOnPage = json.data;
        } else if (json.entries && Array.isArray(json.entries)) {
          usersOnPage = json.entries;
        } else if (Array.isArray(json)) {
          usersOnPage = json;
        }
        
        if (usersOnPage.length === 0) {
          console.log(`[Mindoshare] No more data at page ${pageNum}`);
          break;
        }
        
        allUsers.push(...usersOnPage);
        console.log(`[Mindoshare] ✅ Page ${pageNum}: ${usersOnPage.length} users (total: ${allUsers.length})`);
        
        if (usersOnPage.length < pageSize) {
          console.log('[Mindoshare] Reached end of data');
          break;
        }
        
        await sleep(2000 + Math.random() * 1000);
        
      } catch (err) {
        console.error(`[Mindoshare] Error on page ${pageNum}:`, err.message);
        
        if (pageNum === 1) {
          console.log('[Mindoshare] Switching to Playwright with proxy...');
          return await scrapeMindosharePlaywright(maxPages);
        }
        break;
      }
    }
    
    console.log(`[Mindoshare] ✅ Complete: ${allUsers.length} total users`);
    return allUsers.length > 0 ? allUsers : null;
    
  } catch (e) {
    console.error('[Mindoshare] ❌', e.message);
    return null;
  }
}

// Playwright fallback for Mindoshare
async function scrapeMindosharePlaywright(maxPages = 12) {
  let browser;
  
  try {
    console.log('[Mindoshare/Playwright] Starting...');
    
    const useProxy = !!process.env.SCRAPER_API_KEY;
    console.log(`[Mindoshare/Playwright] Proxy: ${useProxy ? 'ENABLED' : 'DISABLED'}`);
    
    browser = await chromium.launch({
      headless: true,
      proxy: useProxy ? {
        server: process.env.PROXY_SERVER || 'http://proxy.scraperapi.com:8001',
        username: process.env.PROXY_USERNAME || 'scraperapi',
        password: process.env.SCRAPER_API_KEY
      } : undefined,
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
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      locale: 'en-US'
    });

    const page = await context.newPage();
    const allUsers = [];
    const pageSize = 50;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`[Mindoshare/Playwright] Page ${pageNum}/${maxPages}...`);

      const url = `https://mindoshare.ai/api/leaderboards/92e433f6-9bc6-4e53-800c-15b23b88c05b/all?page=${pageNum}&pageSize=${pageSize}`;

      try {
        const response = await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        if (response.status() === 429) {
          console.warn(`[Mindoshare/Playwright] ⚠️ Rate limit, waiting 30s...`);
          await sleep(30000);
          pageNum--;
          continue;
        }

        if (!response.ok()) {
          console.error(`[Mindoshare/Playwright] Failed: ${response.status()}`);
          break;
        }

        const bodyText = await page.evaluate(() => document.body.textContent);
        const json = JSON.parse(bodyText);

        let usersOnPage = [];
        if (json.data && Array.isArray(json.data)) {
          usersOnPage = json.data;
        } else if (json.entries && Array.isArray(json.entries)) {
          usersOnPage = json.entries;
        } else if (Array.isArray(json)) {
          usersOnPage = json;
        }

        if (usersOnPage.length === 0) {
          console.log(`[Mindoshare/Playwright] No more data at page ${pageNum}`);
          break;
        }

        allUsers.push(...usersOnPage);
        console.log(`[Mindoshare/Playwright] ✅ Page ${pageNum}: ${usersOnPage.length} users (total: ${allUsers.length})`);

        if (usersOnPage.length < pageSize) {
          console.log(`[Mindoshare/Playwright] Reached end of data`);
          break;
        }

        await sleep(3000 + Math.random() * 2000);
        
      } catch (err) {
        console.error(`[Mindoshare/Playwright] Error on page ${pageNum}:`, err.message);
        break;
      }
    }

    await browser.close();
    console.log(`[Mindoshare/Playwright] ✅ Complete: ${allUsers.length} total users`);
    return allUsers.length > 0 ? allUsers : null;

  } catch (e) {
    if (browser) await browser.close();
    console.error('[Mindoshare/Playwright] ❌', e.message);
    return null;
  }
}

// ============= MAIN SCRAPING LOGIC =============
async function performScraping() {
  const results = {
    yappers: {},
    duelduck: null,
    adichain: null,
    heyelsa: {},
    mindoshare: null
  };

  // Yappers (7d & 30d)
  for (const days of [7, 30]) {
    results.yappers[days] = await scrapeYappers(days);
    await sleep(2000);
  }

  // DuelDuck
  results.duelduck = await scrapeDuelDuck(10);
  await sleep(3000);

  // Adichain
  results.adichain = await scrapeAdichain(15);
  await sleep(5000);

  // HeyElsa
  for (const period of ['epoch-2', '7d', '30d']) {
    console.log(`\n--- Starting ${period} period ---`);
    results.heyelsa[period] = await scrapeHeyElsa(period, 20);

    if (period !== '30d') {
      console.log('Waiting 10s before next period...');
      await sleep(10000);
    }
  }

  // Mindoshare - Updated to use 12 pages with pageSize 50
  console.log('\n--- Starting Mindoshare ---');
  results.mindoshare = await scrapeMindoshare(12);
  await sleep(3000);

  return {
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
      },
      mindoshare: { count: results.mindoshare?.length || 0, data: results.mindoshare }
    }
  };
}

// ============= API ENDPOINTS =============

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'unified-leaderboard-scraper' });
});

// GET endpoint for backward compatibility
app.get('/scrape-all-async', async (req, res) => {
  const webhookUrl = req.query.webhook || process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(400).json({
      success: false,
      error: 'webhook parameter required'
    });
  }

  res.json({
    success: true,
    message: 'Scraping started in background. Will callback when complete.',
    estimatedTime: '10-15 minutes'
  });

  (async () => {
    console.log('\n=== 🚀 BACKGROUND SCRAPING STARTED (GET) ===\n');

    try {
      const finalResults = await performScraping();
      
      console.log('\n=== ✅ SCRAPING COMPLETE, CALLING WEBHOOK ===\n');

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

// POST endpoint (new style)
app.post('/scrape', async (req, res) => {
  const webhookUrl = req.body?.webhook || process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(400).json({
      success: false,
      error: 'webhook parameter required in body'
    });
  }

  res.json({
    success: true,
    message: 'Scraping started in background. Will callback when complete.',
    estimatedTime: '10-15 minutes'
  });

  (async () => {
    console.log('\n=== 🚀 BACKGROUND SCRAPING STARTED (POST) ===\n');

    try {
      const finalResults = await performScraping();
      
      console.log('\n=== ✅ SCRAPING COMPLETE, CALLING WEBHOOK ===\n');

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

// Individual scraper endpoints
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
  const maxPages = parseInt(req.query.maxPages || '10');
  try {
    const data = await scrapeDuelDuck(maxPages);
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

app.get('/scrape/mindoshare', async (req, res) => {
  const maxPages = parseInt(req.query.maxPages || '12');
  try {
    const data = await scrapeMindoshare(maxPages);
    res.json({ success: true, count: data?.length || 0, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Unified Leaderboard Scraper running on port ${PORT}`);
});
