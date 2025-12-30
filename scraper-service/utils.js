const { chromium } = require('playwright');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createBrowser(useProxy = false) {
  return await chromium.launch({
    headless: true,
    proxy: useProxy && process.env.SCRAPER_API_KEY ? {
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
}

function createContext(browser) {
  return browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York'
  });
}

module.exports = { sleep, createBrowser, createContext };
