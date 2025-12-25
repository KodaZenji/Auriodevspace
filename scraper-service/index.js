// Unified Leaderboard Scraper Service for Railway
// Handles: HeyElsa (Playwright), Adichain (Playwright), Yappers & DuelDuck (direct fetch)

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
    console.log(`Fetching Yappers ${days}d...`);
    const res = await fetch(
      `https://yappers-api.goat.network/leaderboard?days=${days}&limit=1000`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    console.log(`✅ Yappers ${days}d: ${json.yappers?.length || 0} users`);
    return json.yappers || [];
  } catch (e) {
    console.error('Yappers error:', e);
    return null;
  }
}

// ============= DUELDUCK =============
async function scrapeDuelDuck() {
  try {
    console.log('Fetching DuelDuck...');
    const res = await fetch(
      'https://api.duelduck.com/mention-challenge/leaderboard?opts.pagination.page_size=1000&opts.pagination.page_num=1&opts.order.order_by=total_score&opts.order.order_type=desc&challenge_id=131938ae-0b07-4ac5-8b67-4c1d3cbbee5e',
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    console.log(`✅ DuelDuck: ${json.leaders?.length || 0} users`);
    return json.leaders || [];
  } catch (e) {
    console.error('DuelDuck error:', e);
    return null;
  }
}

// ============= ADICHAIN (Playwright) =============
async function scrapeAdichain(maxPages = 15) {
  let browser;
  
  try {
    console.log('Starting Adichain scrape...');
    
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
      ],
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    const page = await context.newPage();
    const allUsers = [];
    const limit = 100;

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`Adichain page ${pageNum}/${maxPages}...`);

      const url = `https://www.xeet.ai/api/topics/adi/tournament?page=${pageNum}&limit=${limit}&timeframe=all&tournamentId=3396f69f-70c1-4703-9b01-47b147e095ef`;

      try {
        const response = await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });

        if (!response.ok()) {
          console.error(`Failed: ${response.status()}`);
          break;
        }

        const bodyText = await page.evaluate(() => document.body.textContent);
        const json = JSON.parse(bodyText);

        if (!json.data || json.data.length === 0) {
          console.log(`No more data at page ${pageNum}`);
          break;
        }

        allUsers.push(...json.data);
        console.log(`✅ Page ${pageNum}: ${json.data.length} users (total: ${allUsers.length})`);

        await sleep(3000);
      } catch (err) {
        console.error(`Error on page ${pageNum}:`, err.message);
        break;
      }
    }

    await browser.close();
    console.log(`✅ Adichain complete: ${allUsers.length} users`);
    return allUsers;

  } catch (error) {
    if (browser) await browser.close();
    console.error('Adichain error:', error);
    return null;
  }
}

// ============= HEYELSA (Playwright with retry logic) =============
async function scrapeHeyElsa(period, maxPages = 20) {
  let browser;
  let retries = 0;
  const MAX_RETRIES = 3;
  
  try {
    console.log(`Starting HeyElsa scrape for ${period}...`);
    
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
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
      console.log(`HeyElsa ${period} page ${currentPage}...`);

      const url = `https://api.wallchain.xyz/voices/companies/heyelsa/leaderboard?page=${currentPage}&pageSize=${pageSize}&orderBy=position&ascending=false&period=${period}`;

      try {
        const response = await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });

        // Handle rate limiting
        if (response.status() === 429) {
          console.warn(`⚠️ Rate limit hit on page ${currentPage}, waiting 30s...`);
          await sleep(30000); // Wait 30 seconds
          continue; // Retry same page
        }

        if (!response.ok()) {
          consecutiveErrors++;
          console.error(`Failed: ${response.status()}`);
          
          if (consecutiveErrors >= 3) {
            console.error(`❌ Too many errors, stopping at page ${currentPage}`);
            break;
          }
          
          await sleep(5000); // Wait 5s before next attempt
          continue;
        }

        // Reset error counter on success
        consecutiveErrors = 0;

        const bodyText = await page.evaluate(() => document.body.textContent);
        const data = JSON.parse(bodyText);

        if (!data.entries || data.entries.length === 0) {
          console.log(`No more data at page ${currentPage}`);
          break;
        }

        allUsers.push(...data.entries);
        console.log(`✅ Page ${currentPage}: ${data.entries.length} users (total: ${allUsers.length})`);

        if (currentPage >= data.totalPages || data.entries.length < pageSize) {
          break;
        }

        currentPage++;
        
        // Longer delay to avoid rate limits (3-5 seconds random)
        const delay = 3000 + Math.random() * 2000;
        await sleep(delay);
        
      } catch (err) {
        consecutiveErrors++;
        console.error(`Error on page ${currentPage}:`, err.message);
        
        if (consecutiveErrors >= 3) {
          console.error(`❌ Too many consecutive errors, stopping`);
          break;
        }
        
        await sleep(5000);
      }
    }

    await browser.close();
    console.log(`✅ HeyElsa ${period} complete: ${allUsers.length} users`);
    return allUsers.length > 0 ? allUsers : null;

  } catch (error) {
    if (browser) await browser.close();
    console.error('HeyElsa error:', error);
    return null;
  }
}

// ============= API ENDPOINTS =============

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'unified-leaderboard-scraper' });
});

// Scrape ALL leaderboards at once
app.get('/scrape-all', async (req, res) => {
  console.log('\n=== SCRAPING ALL LEADERBOARDS ===\n');
  
  try {
    const results = {
      yappers: {},
      duelduck: null,
      adichain: null,
      heyelsa: {}
    };

    // Yappers (7d & 30d) - Fast and safe
    for (const days of [7, 30]) {
      results.yappers[days] = await scrapeYappers(days);
      await sleep(2000);
    }

    // DuelDuck - Fast and safe
    results.duelduck = await scrapeDuelDuck();
    await sleep(3000);

    // Adichain - Takes ~2-3 minutes
    results.adichain = await scrapeAdichain(15);
    await sleep(5000); // Longer break before HeyElsa

    // HeyElsa (all periods) - Takes ~5-8 minutes total
    // Add longer delays between periods to avoid rate limits
    for (const period of ['epoch-2', '7d', '30d']) {
      console.log(`\n--- Starting ${period} period ---`);
      results.heyelsa[period] = await scrapeHeyElsa(period, 20);
      
      // Wait 10 seconds between different periods
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
