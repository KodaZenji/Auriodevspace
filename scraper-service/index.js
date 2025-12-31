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
const { scrapeBeyond } = require('./scrapers/beyond');
const { scrapeC8ntinuum } = require('./scrapers/c8ntinuum');
const { scrapeDeepnodeai } = require('./scrapers/deepnodeai');

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
    c8ntinuum: null,
    deepnodeai: null
  };

  // Yappers
  for (const days of config.yappers.periods) {
    console.log(`\n--- Starting Yappers ${days}d ---`);
    results.yappers[days] = await scrapeYappers(days);
    await sleep(config.yappers.delay);
  }

  // DuelDuck
  console.log('\n--- Starting DuelDuck ---');
  results.duelduck = await scrapeDuelDuck(config.duelduck.maxPages);
  await sleep(config.duelduck.delay);

  // Adichain
  console.log('\n--- Starting Adichain ---');
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

  // C8ntinuum
  console.log('\n--- Starting C8ntinuum ---');
  results.c8ntinuum = await scrapeC8ntinuum(
    config.c8ntinuum.maxPages
  );
  await sleep(config.c8ntinuum.delay || 5000);

  // DeepNodeAI
  console.log('\n--- Starting DeepNodeAI ---');
  results.deepnodeai = await scrapeDeepnodeai(
    config.deepnodeai.maxPages
  );

  return {
    success: true,
    results: {
      yappers: {
        '7': {
          count: results.yappers[7]?.length || 0,
          data: results.yappers[7]
        },
        '30': {
          count: results.yappers[30]?.length || 0,
          data: results.yappers[30]
        }
      },
      duelduck: {
        count: results.duelduck?.length || 0,
        data: results.duelduck
      },
      adichain: {
        count: results.adichain?.length || 0,
        data: results.adichain
      },
      heyelsa: {
        'epoch-2': {
          count: results.heyelsa['epoch-2']?.length || 0,
          data: results.heyelsa['epoch-2']
        },
        '7d': {
          count: results.heyelsa['7d']?.length || 0,
          data: results.heyelsa['7d']
        },
        '30d': {
          count: results.heyelsa['30d']?.length || 0,
          data: results.heyelsa['30d']
        }
      },
      beyond: {
        'epoch-2': {
          count: results.beyond['epoch-2']?.length || 0,
          data: results.beyond['epoch-2']
        },
        '7d': {
          count: results.beyond['7d']?.length || 0,
          data: results.beyond['7d']
        },
        '30d': {
          count: results.beyond['30d']?.length || 0,
          data: results.beyond['30d']
        }
      },
      mindoshare: {
        count: results.mindoshare?.length || 0,
        data: results.mindoshare
      },
      helios: {
        count: results.helios?.length || 0,
        data: results.helios
      },
      c8ntinuum: {
        count: results.c8ntinuum?.length || 0,
        data: results.c8ntinuum
      },
      deepnodeai: {
        count: results.deepnodeai?.length || 0,
        data: results.deepnodeai
      }
    }
  };
}

// ===================================
// Background job runner with webhook
// ===================================
async function runScrapingJob(webhookUrl) {
  console.log('\n=== 🚀 BACKGROUND SCRAPING STARTED ===');
  console.log(`📞 Webhook: ${webhookUrl}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  
  try {
    const results = await performScraping();
    
    console.log('\n=== ✅ SCRAPING COMPLETE, CALLING WEBHOOK ===\n');

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEBHOOK_SECRET || 'default-secret'}`
      },
      body: JSON.stringify(results)
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      throw new Error(`Webhook failed: ${webhookResponse.status} - ${errorText}`);
    }

    console.log('✅ Webhook called successfully');
    console.log(`⏰ Completed: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('❌ Job failed:', error.message);

    // Try to notify webhook about failure
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEBHOOK_SECRET || 'default-secret'}`
        },
        body: JSON.stringify({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        })
      });
      console.log('📨 Error notification sent to webhook');
    } catch (webhookError) {
      console.error('❌ Failed to notify webhook:', webhookError.message);
    }
  }
}

// ===================================
// API Routes
// ===================================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'leaderboard-scraper',
    timestamp: new Date().toISOString()
  });
});

// GET endpoint for cron job - responds immediately, runs in background
app.get('/scrape-all-async', (req, res) => {
  const webhookUrl = req.query.webhook || process.env.WEBHOOK_URL;

  console.log('\n🔔 Received async scrape request');
  console.log(`📞 Webhook: ${webhookUrl}`);

  if (!webhookUrl) {
    return res.status(400).json({
      success: false,
      error: 'webhook parameter required',
      usage: '/scrape-all-async?webhook=YOUR_WEBHOOK_URL'
    });
  }

  // Respond IMMEDIATELY (before Vercel 30s timeout)
  res.status(202).json({
    success: true,
    status: 'accepted',
    message: 'Scraping job started in background',
    estimatedTime: '10-15 minutes',
    webhook: webhookUrl,
    timestamp: new Date().toISOString()
  });

  // Start the job in background - Railway keeps it running
  setImmediate(() => {
    runScrapingJob(webhookUrl);
  });
});

// POST endpoint (backward compatibility)
app.post('/scrape', (req, res) => {
  const webhookUrl = req.body?.webhook || process.env.WEBHOOK_URL;

  console.log('\n🔔 Received scrape request (POST)');
  console.log(`📞 Webhook: ${webhookUrl}`);

  if (!webhookUrl) {
    return res.status(400).json({
      success: false,
      error: 'webhook required'
    });
  }

  res.status(202).json({
    success: true,
    status: 'accepted',
    message: 'Scraping started',
    estimatedTime: '10-15 minutes',
    timestamp: new Date().toISOString()
  });

  setImmediate(() => {
    runScrapingJob(webhookUrl);
  });
});

// ===================================
// Individual scraper endpoints (testing)
// ===================================

app.get('/scrape/mindoshare', async (req, res) => {
  try {
    const data = await scrapeMindoshare(config.mindoshare.maxPages);
    res.json({ success: true, count: data?.length || 0, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/scrape/helios', async (req, res) => {
  try {
    const data = await scrapeHelios(config.helios.maxPages);
    res.json({ success: true, count: data?.length || 0, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/scrape/c8ntinuum', async (req, res) => {
  try {
    const data = await scrapeC8ntinuum(config.c8ntinuum.maxPages);
    res.json({ success: true, count: data?.length || 0, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/scrape/deepnodeai', async (req, res) => {
  try {
    const data = await scrapeDeepnodeai(config.deepnodeai.maxPages);
    res.json({ success: true, count: data?.length || 0, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Leaderboard Scraper running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 Async Scrape: GET /scrape-all-async?webhook=URL`);
});
