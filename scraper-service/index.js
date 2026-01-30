const express = require('express');
const config = require('./config');
const { sleep } = require('./utils');

// Import all scrapers
const { scrapeDuelDuck } = require('./scrapers/duelduck');
const { scrapeHeyElsa } = require('./scrapers/heyelsa');
const { scrapeMindoshare } = require('./scrapers/mindoshare');
const { scrapeHelios } = require('./scrapers/helios');
const { scrapeBeyond } = require('./scrapers/beyond');
const { scrapeCodeXero } = require('./scrapers/codexero');
const { scrapeC8ntinuum } = require('./scrapers/c8ntinuum');
const { scrapeDeepnodeai } = require('./scrapers/deepnodeai');
const { scrapeSpace } = require('./scrapers/space');
const { scrapeWomFun } = require('./scrapers/womfun');
const { scrapeYapsFandom } = require('./scrapers/yapsfandom');


const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;

// ===================================
// Main scraping orchestrator
// ===================================
async function performScraping() {
  const results = {
  duelduck: null,
  heyelsa: {},
  beyond: {},
  codexero: {},
  mindoshare: null,
  space: null,
  helios: null,
  c8ntinuum: null,
  deepnodeai: null,
  womfun: null,
  yapsfandom: {}  
};

  // DuelDuck
  console.log('\n--- Starting DuelDuck ---');
  results.duelduck = await scrapeDuelDuck(config.duelduck.maxPages);
  await sleep(config.duelduck.delay);

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
  
  // CodeXero
  for (const period of config.codexero.periods) {
    console.log(`\n--- Starting CodeXero ${period} ---`);
    results.codexero[period] = await scrapeCodeXero(period, config.codexero.maxPages);
    
    if (period !== '30d') {
      await sleep(config.codexero.periodDelay);
    }
  }

  // Mindoshare
  console.log('\n--- Starting Mindoshare ---');
  results.mindoshare = await scrapeMindoshare(
    config.mindoshare.maxPages
  );
  await sleep(config.mindoshare.delay || 5000);

  // Space
  console.log('\n--- Starting Space ---');
  results.space = await scrapeSpace(
    config.space?.maxPages || 12
  );
  await sleep(config.space?.delay || 5000);

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

  // WomFun
  console.log('\n--- Starting WomFun ---');
  results.womfun = await scrapeWomFun(config.womfun.maxPages);
  await sleep(config.womfun.delay || 5000);

  // DeepNodeAI
  console.log('\n--- Starting DeepNodeAI ---');
  results.deepnodeai = await scrapeDeepnodeai(
    config.deepnodeai.maxPages
  );

  for (const timeFilter of config.yapsfandom.timeFilters) {
  console.log(`\n--- Starting YapsFandom ${timeFilter} ---`);
  results.yapsfandom[timeFilter] = await scrapeYapsFandom(
    timeFilter,
    config.yapsfandom.maxPages
  );
  
  if (timeFilter !== 'ALL') {
    await sleep(config.yapsfandom.periodDelay);
  }
}
  return results;
}

// ===================================
// Send results in chunks to avoid payload limit
// ===================================
async function sendResultsInChunks(webhookUrl, results) {
  console.log('\n=== 📦 SENDING RESULTS IN CHUNKS ===\n');
  
  const chunks = [];
  const authHeader = `Bearer ${process.env.WEBHOOK_SECRET || 'default-secret'}`;

  // Chunk 1: DuelDuck
  if (results.duelduck) {
    chunks.push({
      chunkType: 'duelduck',
      data: {
        success: true,
        results: {
          duelduck: {
            count: results.duelduck?.length || 0,
            data: results.duelduck
          }
        }
      }
    });
  }

  // Chunk 2: HeyElsa (all periods)
  if (results.heyelsa) {
    chunks.push({
      chunkType: 'heyelsa',
      data: {
        success: true,
        results: {
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
          }
        }
      }
    });
  }

  // Chunk 3: Beyond (all periods)
  if (results.beyond) {
    chunks.push({
      chunkType: 'beyond',
      data: {
        success: true,
        results: {
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
          }
        }
      }
    });
  }

  // Chunk 4: CodeXero (all periods)
  if (results.codexero) {
    chunks.push({
      chunkType: 'codexero',
      data: {
        success: true,
        results: {
          codexero: {
            'epoch-1': {
              count: results.codexero['epoch-1']?.length || 0,
              data: results.codexero['epoch-1']
            },
            '7d': {
              count: results.codexero['7d']?.length || 0,
              data: results.codexero['7d']
            },
            '30d': {
              count: results.codexero['30d']?.length || 0,
              data: results.codexero['30d']
            }
          }
        }
      }
    });
  }

  // Chunk 5: Mindoshare
  if (results.mindoshare) {
    chunks.push({
      chunkType: 'mindoshare',
      data: {
        success: true,
        results: {
          mindoshare: {
            count: results.mindoshare?.length || 0,
            data: results.mindoshare
          }
        }
      }
    });
  }

  // Chunk 6: Space
  if (results.space) {
    chunks.push({
      chunkType: 'space',
      data: {
        success: true,
        results: {
          space: {
            count: results.space?.length || 0,
            data: results.space
          }
        }
      }
    });
  }

  // Chunk 7: Helios
  if (results.helios) {
    chunks.push({
      chunkType: 'helios',
      data: {
        success: true,
        results: {
          helios: {
            count: results.helios?.length || 0,
            data: results.helios
          }
        }
      }
    });
  }

  // Chunk 8: C8ntinuum
  if (results.c8ntinuum) {
    chunks.push({
      chunkType: 'c8ntinuum',
      data: {
        success: true,
        results: {
          c8ntinuum: {
            count: results.c8ntinuum?.length || 0,
            data: results.c8ntinuum
          }
        }
      }
    });
  }

  // Chunk 9: WomFun
  if (results.womfun) {
    chunks.push({
      chunkType: 'womfun',
      data: {
        success: true,
        results: {
          womfun: {
            count: results.womfun?.length || 0,
            data: results.womfun
          }
        }
      }
    });
  }

  // Chunk 10: DeepnodeAI
  if (results.deepnodeai) {
    chunks.push({
      chunkType: 'deepnodeai',
      data: {
        success: true,
        results: {
          deepnodeai: {
            count: results.deepnodeai?.length || 0,
            data: results.deepnodeai
          }
        }
      }
    });
  }
  // chunk 11
  if (results.yapsfandom) {
  chunks.push({
    chunkType: 'yapsfandom',
    data: {
      success: true,
      results: {
        yapsfandom: {
          '7D': {
            count: results.yapsfandom['7D']?.length || 0,
            data: results.yapsfandom['7D']
          },
          'ALL': {
            count: results.yapsfandom['ALL']?.length || 0,
            data: results.yapsfandom['ALL']
          }
        }
      }
    }
  });
  }
  // Send each chunk
  const chunkResults = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`📤 Sending chunk ${i + 1}/${chunks.length}: ${chunk.chunkType}`);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'X-Chunk-Type': chunk.chunkType,
          'X-Chunk-Index': `${i + 1}`,
          'X-Chunk-Total': `${chunks.length}`
        },
        body: JSON.stringify(chunk.data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webhook chunk failed: ${response.status} - ${errorText}`);
      }

      console.log(`✅ Chunk ${i + 1}/${chunks.length} sent: ${chunk.chunkType}`);
      chunkResults.push({ chunk: chunk.chunkType, success: true });
      
      // Small delay between chunks
      if (i < chunks.length - 1) {
        await sleep(500);
      }
    } catch (error) {
      console.error(`❌ Chunk ${i + 1} failed: ${chunk.chunkType}`, error.message);
      chunkResults.push({ chunk: chunk.chunkType, success: false, error: error.message });
    }
  }

  return chunkResults;
}

// ===================================
// Background job runner with chunked webhook
// ===================================
async function runScrapingJob(webhookUrl) {
  console.log('\n=== 🚀 BACKGROUND SCRAPING STARTED ===');
  console.log(`📞 Webhook: ${webhookUrl}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  
  try {
    const results = await performScraping();
    
    console.log('\n=== ✅ SCRAPING COMPLETE, SENDING TO WEBHOOK ===\n');

    const chunkResults = await sendResultsInChunks(webhookUrl, results);
    
    const successCount = chunkResults.filter(r => r.success).length;
    const failCount = chunkResults.filter(r => !r.success).length;

    console.log(`\n✅ Webhook complete: ${successCount}/${chunkResults.length} chunks successful`);
    if (failCount > 0) {
      console.log(`⚠️  ${failCount} chunks failed`);
    }
    console.log(`⏰ Completed: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('❌ Job failed:', error.message);

    // Try to notify webhook about failure
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEBHOOK_SECRET || 'default-secret'}`,
          'X-Chunk-Type': 'error'
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
    chunkingEnabled: true,
    totalChunks: 11,
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
    chunkingEnabled: true,
    totalChunks: 10,
    timestamp: new Date().toISOString()
  });

  setImmediate(() => {
    runScrapingJob(webhookUrl);
  });
});

// ===================================
// Individual scraper endpoints (testing)
// ===================================

app.get('/scrape/codexero', async (req, res) => {
  const period = req.query.period || '7d';
  try {
    const data = await scrapeCodeXero(period, config.codexero.maxPages);
    res.json({ success: true, period, count: data?.length || 0, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/scrape/mindoshare', async (req, res) => {
  try {
    const data = await scrapeMindoshare(config.mindoshare.maxPages);
    res.json({ success: true, count: data?.length || 0, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/scrape/space', async (req, res) => {
  try {
    const data = await scrapeSpace(config.space?.maxPages || 12);
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

app.get('/scrape/womfun', async (req, res) => {
  try {
    const data = await scrapeWomFun(config.womfun.maxPages);
    res.json({ success: true, count: data?.length || 0, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/scrape/yapsfandom', async (req, res) => {
  const timeFilter = req.query.timeFilter || '7D';
  try {
    const data = await scrapeYapsFandom(timeFilter, config.yapsfandom.maxPages);
    res.json({ success: true, timeFilter, count: data?.length || 0, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Leaderboard Scraper running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 Async Scrape: GET /scrape-all-async?webhook=URL`);
  console.log(`📦 Chunking: Enabled (10 separate webhook calls)`);
});
