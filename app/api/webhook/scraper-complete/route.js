import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PERIOD_TO_DAYS } from './config';

// Import all storage handlers
import { storeDuelDuck } from './storage/storeDuelDuck';
import { storeHeyElsa } from './storage/storeHeyElsa';
import { storeBeyond } from './storage/storeBeyond';
import { storeCodeXero } from './storage/storeCodeXero';
import { storeMindoshare } from './storage/storeMindoshare';
import { storeHelios } from './storage/storeHelios';
import { storeSpace } from './storage/storeSpace';
import { storeDeepnodeai } from './storage/storeDeepnodeai';
import { storeC8ntinuum } from './storage/storeC8ntinuum';
import { storeWomFun } from './storage/storeWomFun';
import { storeYapsFandom } from './storage/storeYapsFandom';



export async function POST(request) {
  // Auth check
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if this is a chunked request
    const chunkType = request.headers.get('x-chunk-type');
    const chunkIndex = request.headers.get('x-chunk-index');
    const chunkTotal = request.headers.get('x-chunk-total');

    if (chunkType) {
      console.log(`📥 Received chunk ${chunkIndex}/${chunkTotal}: ${chunkType}`);
    } else {
      console.log('📥 Received scraping results from Railway');
    }
    
    const scrapedData = await request.json();

    // Handle error notifications
    if (!scrapedData.success && chunkType === 'error') {
      console.error('❌ Railway scraping failed:', scrapedData.error);
      return NextResponse.json({
        success: true,
        message: 'Error notification received'
      });
    }

    if (!scrapedData.success) {
      throw new Error(scrapedData.error || 'Scraping failed');
    }

    const results = {
      duelduck: null,
      heyelsa: {},
      beyond: {},
      codexero: {},
      mindoshare: null,
      helios: null,
      space: null,
      deepnodeai: null,
      c8ntinuum: null,
      womfun: null,
      yapsfandom: {},
      timestamp: new Date().toISOString()
    };

    // Process based on chunk type or process all if not chunked
    if (chunkType === 'duelduck' || !chunkType) {
      await processDuelDuck(scrapedData, results);
    }
    
    if (chunkType === 'heyelsa' || !chunkType) {
      await processHeyElsa(scrapedData, results);
    }
    
    if (chunkType === 'beyond' || !chunkType) {
      await processBeyond(scrapedData, results);
    }
    
    if (chunkType === 'codexero' || !chunkType) {  
      await processCodeXero(scrapedData, results);
    }
    
    if (chunkType === 'mindoshare' || !chunkType) {
      await processMindoshare(scrapedData, results);
    }
    
    if (chunkType === 'helios' || !chunkType) {
      await processHelios(scrapedData, results);
    }
    
    if (chunkType === 'space' || !chunkType) {
      await processSpace(scrapedData, results);
    }
    
    if (chunkType === 'deepnodeai' || !chunkType) {
      await processDeepnodeai(scrapedData, results);
    }
    
    if (chunkType === 'c8ntinuum' || !chunkType) {
      await processC8ntinuum(scrapedData, results);
    }

    if (chunkType === 'womfun' || !chunkType) {
      await processWomFun(scrapedData, results);
    }
    if (chunkType === 'yapsfandom' || !chunkType) {
  await processYapsFandom(scrapedData, results);
    }


    if (chunkType) {
      console.log(`✅ Chunk ${chunkIndex}/${chunkTotal} stored: ${chunkType}`);
    } else {
      console.log('✅ All data stored successfully');
    }

    return NextResponse.json({
      success: true,
      message: chunkType ? `Chunk ${chunkType} stored successfully` : 'Data stored successfully',
      chunkType,
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

async function processDuelDuck(scrapedData, results) {
  if (!scrapedData.results?.duelduck?.data) return;

  try {
    await storeDuelDuck(scrapedData.results.duelduck.data);
    results.duelduck = { success: true, count: scrapedData.results.duelduck.count };
    console.log(`✅ Stored ${scrapedData.results.duelduck.count} DuelDuck entries`);
  } catch (error) {
    console.error('❌ DuelDuck error:', error.message);
    results.duelduck = { success: false, error: error.message };
  }
}

async function processHeyElsa(scrapedData, results) {
  if (!scrapedData.results?.heyelsa) return;

  for (const [period, heyelsaData] of Object.entries(scrapedData.results.heyelsa)) {
    if (heyelsaData.data?.length) {
      try {
        const snapshotId = crypto.randomUUID();
        const days = PERIOD_TO_DAYS[period];

        await storeHeyElsa(heyelsaData.data, period, days, snapshotId);
        results.heyelsa[period] = { success: true, count: heyelsaData.count };
        console.log(`✅ Stored ${heyelsaData.count} HeyElsa (${period})`);
      } catch (error) {
        console.error(`❌ HeyElsa ${period} error:`, error.message);
        results.heyelsa[period] = { success: false, error: error.message };
      }
    }
  }
}

async function processBeyond(scrapedData, results) {
  if (!scrapedData.results?.beyond) return;

  for (const [period, beyondData] of Object.entries(scrapedData.results.beyond)) {
    if (beyondData.data?.length) {
      try {
        const snapshotId = crypto.randomUUID();
        const days = PERIOD_TO_DAYS[period];

        await storeBeyond(beyondData.data, period, days, snapshotId);
        results.beyond[period] = { success: true, count: beyondData.count };
        console.log(`✅ Stored ${beyondData.count} Beyond (${period})`);
      } catch (error) {
        console.error(`❌ Beyond ${period} error:`, error.message);
        results.beyond[period] = { success: false, error: error.message };
      }
    }
  }
}

async function processCodeXero(scrapedData, results) {
  if (!scrapedData.results?.codexero) return;

  for (const [period, codexeroData] of Object.entries(scrapedData.results.codexero)) {
    if (codexeroData.data?.length) {
      try {
        const snapshotId = crypto.randomUUID();
        const days = PERIOD_TO_DAYS[period];

        await storeCodeXero(codexeroData.data, period, days, snapshotId);
        results.codexero[period] = { success: true, count: codexeroData.count };
        console.log(`✅ Stored ${codexeroData.count} CodeXero (${period})`);
      } catch (error) {
        console.error(`❌ CodeXero ${period} error:`, error.message);
        results.codexero[period] = { success: false, error: error.message };
      }
    }
  }
}

async function processMindoshare(scrapedData, results) {
  if (!scrapedData.results?.mindoshare?.data) return;

  try {
    await storeMindoshare(scrapedData.results.mindoshare.data);
    results.mindoshare = { success: true, count: scrapedData.results.mindoshare.count };
    console.log(`✅ Stored ${scrapedData.results.mindoshare.count} Mindoshare entries`);
  } catch (error) {
    console.error('❌ Mindoshare error:', error.message);
    results.mindoshare = { success: false, error: error.message };
  }
}

async function processHelios(scrapedData, results) {
  if (!scrapedData.results?.helios?.data) return;

  try {
    await storeHelios(scrapedData.results.helios.data);
    results.helios = { success: true, count: scrapedData.results.helios.count };
    console.log(`✅ Stored ${scrapedData.results.helios.count} Helios entries`);
  } catch (error) {
    console.error('❌ Helios error:', error.message);
    results.helios = { success: false, error: error.message };
  }
}

async function processSpace(scrapedData, results) {
  if (!scrapedData.results?.space?.data) return;

  try {
    await storeSpace(scrapedData.results.space.data);
    results.space = { success: true, count: scrapedData.results.space.count };
    console.log(`✅ Stored ${scrapedData.results.space.count} Space entries`);
  } catch (error) {
    console.error('❌ Space error:', error.message);
    results.space = { success: false, error: error.message };
  }
}

async function processDeepnodeai(scrapedData, results) {
  if (!scrapedData.results?.deepnodeai?.data) return;

  try {
    await storeDeepnodeai(scrapedData.results.deepnodeai.data);
    results.deepnodeai = { success: true, count: scrapedData.results.deepnodeai.count };
    console.log(`✅ Stored ${scrapedData.results.deepnodeai.count} DeepnodeAI entries`);
  } catch (error) {
    console.error('❌ DeepnodeAI error:', error.message);
    results.deepnodeai = { success: false, error: error.message };
  }
}

async function processC8ntinuum(scrapedData, results) {
  if (!scrapedData.results?.c8ntinuum?.data) return;

  try {
    await storeC8ntinuum(scrapedData.results.c8ntinuum.data);
    results.c8ntinuum = { success: true, count: scrapedData.results.c8ntinuum.count };
    console.log(`✅ Stored ${scrapedData.results.c8ntinuum.count} C8ntinuum entries`);
  } catch (error) {
    console.error('❌ C8ntinuum error:', error.message);
    results.c8ntinuum = { success: false, error: error.message };
  }
}

async function processWomFun(scrapedData, results) {
  if (!scrapedData.results?.womfun?.data) return;

  try {
    await storeWomFun(scrapedData.results.womfun.data);
    results.womfun = { success: true, count: scrapedData.results.womfun.count };
    console.log(`✅ Stored ${scrapedData.results.womfun.count} WomFun entries`);
  } catch (error) {
    console.error('❌ WomFun error:', error.message);
    results.womfun = { success: false, error: error.message };
  }
}
async function processYapsFandom(scrapedData, results) {
  if (!scrapedData.results?.yapsfandom) return;

  for (const [timeFilter, yapsfandomData] of Object.entries(scrapedData.results.yapsfandom)) {
    if (yapsfandomData.data?.length) {
      try {
        await storeYapsFandom(yapsfandomData.data, timeFilter);
        results.yapsfandom[timeFilter] = { success: true, count: yapsfandomData.count };
        console.log(`✅ Stored ${yapsfandomData.count} YapsFandom (${timeFilter})`);
      } catch (error) {
        console.error(`❌ YapsFandom ${timeFilter} error:`, error.message);
        results.yapsfandom[timeFilter] = { success: false, error: error.message };
      }
    }
  }
}

