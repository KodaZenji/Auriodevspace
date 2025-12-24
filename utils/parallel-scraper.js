const pLimit = require('p-limit');
const { chromium } = require('playwright');
const { getStealthContext, addRandomDelay, simulateHumanBehavior } = require('./playwright-stealth');

// Configuration for parallel scraping
const scraperConfig = {
    concurrency: 5, // Number of concurrent scrapers
    maxRetries: 3, // Number of retries for failed requests
    minDelay: 5000, // 5 seconds minimum delay
    maxDelay: 10000, // 10 seconds maximum delay
    timeout: 30000, // 30 seconds timeout for each request
};

// Proxy list for IP rotation (replace with your actual proxy list)
const proxyList = [
    // Example proxy format - replace with actual proxies
    // {
    //   server: 'http://proxy-server:port',
    //   username: 'username',
    //   password: 'password'
    // }
];

// Function to get a random proxy
const getRandomProxy = () => {
    if (proxyList.length === 0) return null;
    return proxyList[Math.floor(Math.random() * proxyList.length)];
};

// Function to scrape a single URL
const scrapeUrl = async (url, options = {}) => {
    let browser;
    let context;
    let page;

    const retries = options.retries || scraperConfig.maxRetries;
    const currentRetry = options.currentRetry || 0;

    try {
        // Launch browser
        browser = await chromium.launch({
            headless: true, // Set to false for debugging
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-web-security',
            ],
        });

        // Create stealth context
        const proxy = getRandomProxy();
        context = await getStealthContext(browser, proxy);

        // Create new page
        page = await context.newPage();

        // Set timeout
        page.setDefaultTimeout(scraperConfig.timeout);

        // Add delay before navigating
        await addRandomDelay(scraperConfig.minDelay, scraperConfig.maxDelay);

        // Navigate to URL
        console.log(`Navigating to ${url} (Attempt: ${currentRetry + 1}/${retries})`);
        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Check if request was successful
        if (response.status() >= 400) {
            throw new Error(`HTTP Error: ${response.status()}`);
        }

        // Simulate human behavior
        await simulateHumanBehavior(page);

        // Add delay after navigation
        await addRandomDelay(scraperConfig.minDelay, scraperConfig.maxDelay);

        // Perform scraping based on your needs
        const data = {
            url: url,
            title: await page.title(),
            content: await page.content(),
            timestamp: new Date().toISOString(),
            userAgent: await page.evaluate(() => navigator.userAgent),
        };

        console.log(`Successfully scraped ${url}`);
        return data;

    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);

        // Retry if we haven't exceeded max retries
        if (currentRetry < retries - 1) {
            console.log(`Retrying ${url} (${currentRetry + 1}/${retries - 1})`);
            await addRandomDelay(scraperConfig.minDelay * 2, scraperConfig.maxDelay * 2); // Exponential backoff
            return await scrapeUrl(url, { retries, currentRetry: currentRetry + 1 });
        } else {
            throw new Error(`Failed to scrape ${url} after ${retries} attempts: ${error.message}`);
        }
    } finally {
        // Clean up resources
        if (page) {
            await page.close();
        }
        if (context) {
            await context.close();
        }
        if (browser) {
            await browser.close();
        }
    }
};

// Function to perform parallel scraping
const parallelScrape = async (urls, concurrency = scraperConfig.concurrency) => {
    // Create a limited function with specified concurrency
    const limit = pLimit(concurrency);

    console.log(`Starting parallel scraping of ${urls.length} URLs with concurrency ${concurrency}`);

    // Create promises for all scraping tasks
    const scrapingPromises = urls.map(url =>
        limit(() => scrapeUrl(url))
    );

    try {
        // Execute all scraping tasks in parallel
        const results = await Promise.allSettled(scrapingPromises);

        // Separate successful and failed results
        const successfulResults = [];
        const failedResults = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                successfulResults.push({
                    url: urls[index],
                    data: result.value,
                    success: true
                });
            } else {
                failedResults.push({
                    url: urls[index],
                    error: result.reason.message,
                    success: false
                });
            }
        });

        console.log(`Scraping completed: ${successfulResults.length} successful, ${failedResults.length} failed`);

        return {
            successful: successfulResults,
            failed: failedResults,
            total: urls.length,
        };
    } catch (error) {
        console.error('Error during parallel scraping:', error);
        throw error;
    }
};

// Function to scrape with custom selectors
const scrapeWithSelectors = async (url, selectors, options = {}) => {
    let browser;
    let context;
    let page;

    const retries = options.retries || scraperConfig.maxRetries;
    const currentRetry = options.currentRetry || 0;

    try {
        // Launch browser
        browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-web-security',
            ],
        });

        // Create stealth context
        const proxy = getRandomProxy();
        context = await getStealthContext(browser, proxy);

        // Create new page
        page = await context.newPage();

        // Set timeout
        page.setDefaultTimeout(scraperConfig.timeout);

        // Add delay before navigating
        await addRandomDelay(scraperConfig.minDelay, scraperConfig.maxDelay);

        // Navigate to URL
        console.log(`Navigating to ${url} (Attempt: ${currentRetry + 1}/${retries})`);
        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Check if request was successful
        if (response.status() >= 400) {
            throw new Error(`HTTP Error: ${response.status()}`);
        }

        // Simulate human behavior
        await simulateHumanBehavior(page);

        // Wait for selectors to be available
        for (const selector of Object.keys(selectors)) {
            await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
        }

        // Extract data based on selectors
        const extractedData = {};
        for (const [selector, property] of Object.entries(selectors)) {
            if (property === 'text') {
                extractedData[selector] = await page.textContent(selector);
            } else if (property === 'innerHTML') {
                extractedData[selector] = await page.innerHTML(selector);
            } else if (property === 'outerHTML') {
                extractedData[selector] = await page.outerHTML(selector);
            } else if (property === 'attribute') {
                // For attributes, you need to specify which attribute
                // Example: { 'img.logo': { type: 'attribute', attribute: 'src' } }
                if (typeof property === 'object' && property.type === 'attribute') {
                    extractedData[selector] = await page.getAttribute(selector, property.attribute);
                }
            } else {
                // Default to text content
                extractedData[selector] = await page.textContent(selector);
            }
        }

        // Add delay after scraping
        await addRandomDelay(scraperConfig.minDelay, scraperConfig.maxDelay);

        const result = {
            url: url,
            data: extractedData,
            timestamp: new Date().toISOString(),
            userAgent: await page.evaluate(() => navigator.userAgent),
        };

        console.log(`Successfully scraped ${url} with selectors`);
        return result;

    } catch (error) {
        console.error(`Error scraping ${url} with selectors:`, error.message);

        // Retry if we haven't exceeded max retries
        if (currentRetry < retries - 1) {
            console.log(`Retrying ${url} (${currentRetry + 1}/${retries - 1})`);
            await addRandomDelay(scraperConfig.minDelay * 2, scraperConfig.maxDelay * 2); // Exponential backoff
            return await scrapeWithSelectors(url, selectors, { retries, currentRetry: currentRetry + 1 });
        } else {
            throw new Error(`Failed to scrape ${url} after ${retries} attempts: ${error.message}`);
        }
    } finally {
        // Clean up resources
        if (page) {
            await page.close();
        }
        if (context) {
            await context.close();
        }
        if (browser) {
            await browser.close();
        }
    }
};

module.exports = {
    parallelScrape,
    scrapeUrl,
    scrapeWithSelectors,
    scraperConfig
};