// Enhanced Leaderboard Scraper with Webhook Callback + Mindoshare (page+limit)
const express = require('express');
const { chromium } = require('playwright');

const app = express();
const PORT = 8080;

app.use(express.json());

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============= YAPPERS =============
async function scrapeYappers(days) {
  try {
    const res = await fetch(
      `https://yappers-api.goat.network/leaderboard?days=${days}&limit=1000`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.yappers || [];
  } catch {
    return null;
  }
}

// ============= DUELDUCK =============
async function scrapeDuelDuck(maxPages = 10) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const all = [];
    const pageSize = 100;

    for (let p = 1; p <= maxPages; p++) {
      const url =
        `https://api.duelduck.com/mention-challenge/leaderboard` +
        `?opts.pagination.page_size=${pageSize}` +
        `&opts.pagination.page_num=${p}` +
        `&opts.order.order_by=total_score` +
        `&opts.order.order_type=desc` +
        `&challenge_id=131938ae-0b07-4ac5-8b67-4c1d3cbbee5e`;

      const r = await page.goto(url, { waitUntil: 'networkidle' });
      if (!r || !r.ok()) break;

      const json = JSON.parse(await page.evaluate(() => document.body.textContent));
      if (!json.leaders?.length) break;

      all.push(...json.leaders);
      if (json.leaders.length < pageSize) break;
      await sleep(3000);
    }

    await browser.close();
    return all;
  } catch {
    if (browser) await browser.close();
    return null;
  }
}

// ============= ADICHAIN =============
async function scrapeAdichain(maxPages = 15) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const all = [];

    for (let p = 1; p <= maxPages; p++) {
      const url =
        `https://www.xeet.ai/api/topics/adi/tournament` +
        `?page=${p}&limit=100&timeframe=all` +
        `&tournamentId=3396f69f-70c1-4703-9b01-47b147e095ef`;

      const r = await page.goto(url, { waitUntil: 'networkidle' });
      if (!r || !r.ok()) break;

      const json = JSON.parse(await page.evaluate(() => document.body.textContent));
      if (!json.data?.length) break;

      all.push(...json.data);
      await sleep(4000);
    }

    await browser.close();
    return all;
  } catch {
    if (browser) await browser.close();
    return null;
  }
}

// ============= HEYELSA =============
async function scrapeHeyElsa(period, maxPages = 20) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const all = [];

    for (let p = 1; p <= maxPages; p++) {
      const url =
        `https://api.wallchain.xyz/voices/companies/heyelsa/leaderboard` +
        `?page=${p}&pageSize=50&orderBy=position&ascending=false&period=${period}`;

      const r = await page.goto(url, { waitUntil: 'networkidle' });
      if (!r || !r.ok()) break;

      const json = JSON.parse(await page.evaluate(() => document.body.textContent));
      const rows = json.data || json.entries || json.items || [];
      if (!rows.length) break;

      all.push(...rows);
      await sleep(3000);
    }

    await browser.close();
    return all;
  } catch {
    if (browser) await browser.close();
    return null;
  }
}

// ============= MINDOSHARE (DIRECT) =============
async function scrapeMindoshare(maxPages = 6, limit = 50) {
  try {
    const all = [];

    for (let page = 1; page <= maxPages; page++) {
      const url =
        `https://mindoshare.ai/api/leaderboards/92e433f6-9bc6-4e53-800c-15b23b88c05b/all` +
        `?page=${page}&limit=${limit}`;

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
          'Referer': 'https://mindoshare.ai/'
        }
      });

      if (!res.ok) {
        if (page === 1) return scrapeMindosharePlaywright(maxPages, limit);
        break;
      }

      const json = await res.json();
      const rows = json.data || json.entries || json.items || [];

      if (!rows.length) break;

      all.push(...rows);
      if (rows.length < limit) break;
      await sleep(2000);
    }

    return all;
  } catch {
    return scrapeMindosharePlaywright(maxPages, limit);
  }
}

// ============= MINDOSHARE (PLAYWRIGHT FALLBACK) =============
async function scrapeMindosharePlaywright(maxPages = 12, limit = 50) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const all = [];

    for (let p = 1; p <= maxPages; p++) {
      const url =
        `https://mindoshare.ai/api/leaderboards/92e433f6-9bc6-4e53-800c-15b23b88c05b/all` +
        `?page=${p}&limit=${limit}`;

      const r = await page.goto(url, { waitUntil: 'networkidle' });
      if (!r || !r.ok()) break;

      const json = JSON.parse(await page.evaluate(() => document.body.textContent));
      const rows = json.data || json.entries || json.items || [];
      if (!rows.length) break;

      all.push(...rows);
      if (rows.length < limit) break;
      await sleep(3000);
    }

    await browser.close();
    return all;
  } catch {
    if (browser) await browser.close();
    return null;
  }
}

// ============= SCRAPE ALL PROJECTS =============
async function scrapeAllProjects(webhook) {
  console.log('🔄 Starting to scrape all projects...');
  const results = {};

  try {
    // Scrape Yappers
    console.log('📊 Scraping Yappers...');
    results.yappers = await scrapeYappers(7);
    console.log(`✅ Yappers: ${results.yappers?.length || 0} entries`);

    // Scrape DuelDuck
    console.log('🦆 Scraping DuelDuck...');
    results.duelduck = await scrapeDuelDuck(10);
    console.log(`✅ DuelDuck: ${results.duelduck?.length || 0} entries`);

    // Scrape Adichain
    console.log('⛓️  Scraping Adichain...');
    results.adichain = await scrapeAdichain(15);
    console.log(`✅ Adichain: ${results.adichain?.length || 0} entries`);

    // Scrape HeyElsa
    console.log('❄️  Scraping HeyElsa...');
    results.heyelsa = await scrapeHeyElsa('7d', 20);
    console.log(`✅ HeyElsa: ${results.heyelsa?.length || 0} entries`);

    // Scrape Mindoshare
    console.log('🧠 Scraping Mindoshare...');
    results.mindoshare = await scrapeMindoshare(6, 50);
    console.log(`✅ Mindoshare: ${results.mindoshare?.length || 0} entries`);

    // Send results to webhook
    if (webhook) {
      console.log('📤 Sending results to webhook:', webhook);
      const webhookResponse = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results)
      });

      if (webhookResponse.ok) {
        console.log('✅ Webhook notification sent successfully');
      } else {
        console.error('❌ Webhook failed:', webhookResponse.status);
      }
    }

    console.log('🎉 All scraping completed!');
    return results;
  } catch (error) {
    console.error('❌ Error during scraping:', error);
    
    // Still try to send partial results to webhook
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: error.message, partial_results: results })
        });
      } catch (webhookError) {
        console.error('❌ Failed to send error to webhook:', webhookError);
      }
    }
    
    throw error;
  }
}

// ============= API ENDPOINTS =============
app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// NEW: Main scrape endpoint with webhook support
app.post('/scrape', async (req, res) => {
  try {
    const { webhook } = req.body;
    
    if (!webhook) {
      return res.status(400).json({ 
        error: 'Webhook URL is required',
        message: 'Please provide a webhook URL in the request body'
      });
    }

    // Respond immediately
    res.json({ 
      status: 'started',
      message: 'Scraping all projects in background',
      webhook
    });

    // Run scraping in background
    scrapeAllProjects(webhook).catch(err => {
      console.error('Background scraping error:', err);
    });

  } catch (error) {
    console.error('Error starting scrape:', error);
    res.status(500).json({ 
      error: 'Failed to start scraping',
      details: error.message 
    });
  }
});

// Individual project endpoints (kept for backward compatibility)
app.get('/scrape/yappers', async (req, res) => {
  const days = parseInt(req.query.days || '7');
  const data = await scrapeYappers(days);
  res.json({ count: data?.length || 0, data });
});

app.get('/scrape/duelduck', async (req, res) => {
  const pages = parseInt(req.query.maxPages || '10');
  const data = await scrapeDuelDuck(pages);
  res.json({ count: data?.length || 0, data });
});

app.get('/scrape/adichain', async (req, res) => {
  const pages = parseInt(req.query.maxPages || '15');
  const data = await scrapeAdichain(pages);
  res.json({ count: data?.length || 0, data });
});

app.get('/scrape/heyelsa', async (req, res) => {
  const period = req.query.period || '7d';
  const pages = parseInt(req.query.maxPages || '20');
  const data = await scrapeHeyElsa(period, pages);
  res.json({ count: data?.length || 0, data });
});

app.get('/scrape/mindoshare', async (req, res) => {
  const pages = parseInt(req.query.maxPages || '6');
  const limit = parseInt(req.query.limit || '50');
  const data = await scrapeMindoshare(pages, limit);
  res.json({ count: data?.length || 0, data });
});

app.listen(PORT, () => {
  console.log(`🚀 Unified Leaderboard Scraper running on ${PORT}`);
});
