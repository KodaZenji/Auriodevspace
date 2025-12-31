const express = require('express');
const config = require('./config');
const { sleep } = require('./utils');

// Import all scrapers
const { scrapeYappers } = require('./scrapers/yappers');
const { scrapeDuelDuck } = require('./scrapers/duelduck');
const { scrapeAdichain } = require('./scrapers/adichain');
const { scrapeHeyElsa } = require('./scrapers/heyelsa');
const { scrapeMindoshare } = require('./scrapers/mindoshare');
const { scrapeHelios } = require('./scrapers/helios');
const { scrapeSpace } = require('./scrapers/space');
const { scrapeBeyond } = require('./scrapers/beyond');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;

// ===================================
// Main scraping orchestrator
// ===================================
async function performScraping() {
  const results = {
    yappers: {},
    duelduck: null,
    adichain: null,
    heyelsa: {},
    beyond: {},
    mindoshare: null,
    helios: null,
    space: null
  };

  // Yappers
  for (const days of config.yappers.periods) {
    results.yappers[days] = await scrapeYappers(days);
    await sleep(config.yappers.delay);
  }

  // DuelDuck
  results.duelduck = await scrapeDuelDuck(config.duelduck.maxPages);
  await sleep(config.duelduck.delay);

  // Adichain
  results.adichain = await scrapeAdichain(config.adichain.maxPages);
  await sleep(config.adichain.delay);

  // HeyElsa
  for (const period of config.heyelsa.periods) {
    console.log(`\n--- Starting HeyElsa ${period} ---`);
    results.heyelsa[period] = await scrapeHeyElsa(
      period,
      config.heyelsa.maxPages
    );

    if (period !== '30d') {
      await sleep(config.heyelsa.periodDelay);
    }
  }

  // Beyond
  for (const period of config.beyond.periods) {
    console.log(`\n--- Starting Beyond ${period} ---`);
    results.beyond[period] = await scrapeBeyond(
      period,
      config.beyond.maxPages
    );

    if (period !== '30d') {
      await sleep(config.beyond.periodDelay);
    }
  }

  // Mindoshare
  console.log('\n--- Starting Mindoshare ---');
  results.mindoshare = await scrapeMindoshare(
    config.mindoshare.maxPages
  );
  await sleep(config.mindoshare.delay || 5000);

  // Helios
  console.log('\n--- Starting Helios ---');
  results.helios = await scrapeHelios(
    config.helios.maxPages
  );
  await sleep(config.helios.delay || 5000);

  // Space (mirrors Helios)
  console.log('\n--- Starting Space ---');
  results.space = await scrapeSpace(
    config.space.maxPages
  );

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
      beyond: {
        'epoch-2': { count: results.beyond['epoch-2']?.length || 0, data: results.beyond['epoch-2'] },
        '7d': { count: results.beyond['7d']?.length || 0, data: results.beyond['7d'] },
        '30d': { count: results.beyond['30d']?.length || 0, data: results.beyond['30d'] }
      },
      mindoshare: { count: results.mindoshare?.length || 0, data: results.mindoshare },
      helios: { count: results.helios?.length || 0, data: results.helios },
      space: { count: results.space?.length || 0, data: results.space }
    }
  };
}

// ===================================
// API Routes
// ===================================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'leaderboard-scraper' });
});

// Main endpoint
app.post('/scrape', async (req, res) => {
  const webhookUrl = req.body?.webhook || process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(400).json({ success: false, error: 'webhook required' });
  }

  res.json({
    success: true,
    message: 'Scraping started',
    estimatedTime: '10-15 minutes'
  });

  (async () => {
    console.log('\n=== 🚀 SCRAPING STARTED ===\n');

    try {
      const results = await performScraping();

      console.log('\n=== ✅ SCRAPING COMPLETE, CALLING WEBHOOK ===\n');

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEBHOOK_SECRET || 'default-secret'}`
        },
        body: JSON.stringify(results)
      });

      console.log('✅ Webhook called successfully');
    } catch (error) {
      console.error('❌ Scraping error:', error);
    }
  })();
});

// ===================================
// Individual scraper endpoints
// ===================================

app.get('/scrape/yappers', async (req, res) => {
  const days = parseInt(req.query.days || '7', 10);
  const data = await scrapeYappers(days);
  res.json({ success: true, days, count: data?.length || 0, data });
});

app.get('/scrape/duelduck', async (req, res) => {
  const data = await scrapeDuelDuck(config.duelduck.maxPages);
  res.json({ success: true, count: data?.length || 0, data });
});

app.get('/scrape/adichain', async (req, res) => {
  const data = await scrapeAdichain(config.adichain.maxPages);
  res.json({ success: true, count: data?.length || 0, data });
});

app.get('/scrape/heyelsa', async (req, res) => {
  const period = req.query.period || '7d';
  const data = await scrapeHeyElsa(period, config.heyelsa.maxPages);
  res.json({ success: true, period, count: data?.length || 0, data });
});

app.get('/scrape/beyond', async (req, res) => {
  const period = req.query.period || '7d';
  const data = await scrapeBeyond(period, config.beyond.maxPages);
  res.json({ success: true, period, count: data?.length || 0, data });
});

app.get('/scrape/mindoshare', async (req, res) => {
  const data = await scrapeMindoshare(config.mindoshare.maxPages);
  res.json({ success: true, count: data?.length || 0, data });
});

app.get('/scrape/helios', async (req, res) => {
  const data = await scrapeHelios(config.helios.maxPages);
  res.json({ success: true, count: data?.length || 0, data });
});

app.get('/scrape/space', async (req, res) => {
  const data = await scrapeSpace(config.space.maxPages);
  res.json({ success: true, count: data?.length || 0, data });
});

app.listen(PORT, () => {
  console.log(`🚀 Leaderboard Scraper running on port ${PORT}`);
});
