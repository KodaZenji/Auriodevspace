import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PERIOD_TO_DAYS } from './config';

// Import all storage handlers
import { storeYappers } from './storage/storeYappers';
import { storeDuelDuck } from './storage/storeDuelDuck';
import { storeAdichain } from './storage/storeAdichain';
import { storeHeyElsa } from './storage/storeHeyElsa';
import { storeBeyond } from './storage/storeBeyond';
import { storeMindoshare } from './storage/storeMindoshare';
import { storeHelios } from './storage/storeHelios';
import { storeSpace } from './storage/storeSpace';
import { storeDeepnodeai } from './storage/storeDeepnodeai';
import { storeC8ntinuum } from './storage/storeC8ntinuum';

export async function POST(request) {
  // Auth check
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('📥 Received scraping results from Railway');
    
    const scrapedData = await request.json();

    if (!scrapedData.success) {
      throw new Error(scrapedData.error || 'Scraping failed');
    }

    const results = {
      yappers: {},
      duelduck: null,
      adichain: null,
      heyelsa: {},
      beyond: {},
      mindoshare: null,
      helios: null,
      space: null,
      deepnodeai: null,
      c8ntinuum: null,

      timestamp: new Date().toISOString()
    };

    // Process all leaderboards
    await processYappers(scrapedData, results);
    await processDuelDuck(scrapedData, results);
    await processAdichain(scrapedData, results);
    await processHeyElsa(scrapedData, results);
    await processBeyond(scrapedData, results);
    await processMindoshare(scrapedData, results);
    await processHelios(scrapedData, results);
    await processSpace(scrapedData, results);
    await processDeepnodeai(scrapedData, results);
    await processC8ntinuum(scrapedData, results);

    console.log('✅ All data stored successfully');

    return NextResponse.json({
      success: true,
      message: 'Data stored successfully',
      results
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to store leaderboard data',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// ===================================
// Processing Functions
// ===================================

async function processYappers(scrapedData, results) {
  if (!scrapedData.results?.yappers) return;

  for (const [days, yappersData] of Object.entries(scrapedData.results.yappers)) {
    if (yappersData.data && yappersData.data.length > 0) {
      try {
        await storeYappers(yappersData.data, parseInt(days));
        results.yappers[days] = { success: true, count: yappersData.count };
        console.log(`✅ Stored ${yappersData.count} Yappers (${days}d)`);
      } catch (error) {
        console.error(`❌ Yappers ${days}d error:`, error.message);
        results.yappers[days] = { success: false, error: error.message };
      }
    }
  }
}

async function processDuelDuck(scrapedData, results) {
  if (!scrapedData.results?.duelduck?.data) return;

  try {
    await storeDuelDuck(scrapedData.results.duelduck.data);
    results.duelduck = { success: true, count: scrapedData.results.duelduck.count };
  } catch (error) {
    results.duelduck = { success: false, error: error.message };
  }
}

async function processAdichain(scrapedData, results) {
  if (!scrapedData.results?.adichain?.data) return;

  try {
    await storeAdichain(scrapedData.results.adichain.data);
    results.adichain = { success: true, count: scrapedData.results.adichain.count };
  } catch (error) {
    results.adichain = { success: false, error: error.message };
  }
}

async function processHeyElsa(scrapedData, results) {
  if (!scrapedData.results?.heyelsa) return;

  for (const [period, heyelsaData] of Object.entries(scrapedData.results.heyelsa)) {
    if (heyelsaData.data?.length) {
      const snapshotId = crypto.randomUUID();
      const days = PERIOD_TO_DAYS[period];

      await storeHeyElsa(heyelsaData.data, period, days, snapshotId);
      results.heyelsa[period] = { success: true, count: heyelsaData.count };
    }
  }
}

async function processBeyond(scrapedData, results) {
  if (!scrapedData.results?.beyond) return;

  for (const [period, beyondData] of Object.entries(scrapedData.results.beyond)) {
    if (beyondData.data?.length) {
      const snapshotId = crypto.randomUUID();
      const days = PERIOD_TO_DAYS[period];

      await storeBeyond(beyondData.data, period, days, snapshotId);
      results.beyond[period] = { success: true, count: beyondData.count };
    }
  }
}

async function processMindoshare(scrapedData, results) {
  if (!scrapedData.results?.mindoshare?.data) return;

  try {
    await storeMindoshare(scrapedData.results.mindoshare.data);
    results.mindoshare = { success: true, count: scrapedData.results.mindoshare.count };
  } catch (error) {
    results.mindoshare = { success: false, error: error.message };
  }
}

async function processHelios(scrapedData, results) {
  if (!scrapedData.results?.helios?.data) return;

  try {
    await storeHelios(scrapedData.results.helios.data);
    results.helios = { success: true, count: scrapedData.results.helios.count };
  } catch (error) {
    results.helios = { success: false, error: error.message };
  }
}

async function processSpace(scrapedData, results) {
  if (!scrapedData.results?.space?.data) return;

  try {
    await storeSpace(scrapedData.results.space.data);
    results.space = { success: true, count: scrapedData.results.space.count };
  } catch (error) {
    results.space = { success: false, error: error.message };
  }
}

async function processDeepnodeai(scrapedData, results) {
  if (!scrapedData.results?.deepnodeai?.data) return;

  try {
    await storeDeepnodeai(scrapedData.results.deepnodeai.data);
    results.deepnodeai = { success: true, count: scrapedData.results.deepnodeai.count };
  } catch (error) {
    results.deepnodeai = { success: false, error: error.message };
  }
}

async function processC8ntinuum(scrapedData, results) {
  if (!scrapedData.results?.c8ntinuum?.data) return;

  try {
    await storeC8ntinuum(scrapedData.results.c8ntinuum.data);
    results.c8ntinuum = { success: true, count: scrapedData.results.c8ntinuum.count };
  } catch (error) {
    results.c8ntinuum = { success: false, error: error.message };
  }
}
