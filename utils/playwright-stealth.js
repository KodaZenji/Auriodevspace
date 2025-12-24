const { chromium } = require('playwright');

// Stealth configuration for Playwright
const stealthConfig = {
    // User agent rotation
    userAgents: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ],

    // Viewport sizes for rotation
    viewports: [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 1536, height: 864 }
    ],

    // Delays configuration
    minDelay: 3000, // 3 seconds minimum
    maxDelay: 7000, // 7 seconds maximum
};

// Function to get random user agent
const getRandomUserAgent = () => {
    return stealthConfig.userAgents[Math.floor(Math.random() * stealthConfig.userAgents.length)];
};

// Function to get random viewport
const getRandomViewport = () => {
    return stealthConfig.viewports[Math.floor(Math.random() * stealthConfig.viewports.length)];
};

// Function to add stealth to browser context
const addStealthToContext = async (context) => {
    // Override webkit, navigator, and plugins to avoid detection
    await context.addInitScript(() => {
        // Remove webdriver property
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });

        // Add plugins to mimic real browser
        Object.defineProperty(navigator, 'plugins', {
            get: () => {
                return {
                    length: 3,
                    0: { filename: 'internal-pdf-viewer' },
                    1: { filename: 'adsfkjh' },
                    2: { filename: 'internal-nacl-plugin' },
                    refresh: () => { },
                };
            },
        });

        // Add languages
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en', 'de'],
        });

        // Add Chrome property
        Object.defineProperty(navigator, 'chrome', {
            get: () => {
                return {
                    runtime: true,
                };
            },
        });

        // Remove headless markers
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
    });
};

// Function to get a stealthy browser context
const getStealthContext = async (browser, proxy = null) => {
    const viewport = getRandomViewport();
    const userAgent = getRandomUserAgent();

    const contextOptions = {
        viewport: { width: viewport.width, height: viewport.height },
        userAgent: userAgent,
        bypassCSP: true, // Bypass Content Security Policy
        ignoreHTTPSErrors: true, // Ignore HTTPS errors
    };

    // Add proxy if provided
    if (proxy) {
        contextOptions.proxy = proxy;
    }

    const context = await browser.newContext(contextOptions);
    await addStealthToContext(context);

    return context;
};

// Function to add delay with randomization
const addRandomDelay = async (minDelay = stealthConfig.minDelay, maxDelay = stealthConfig.maxDelay) => {
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    return new Promise(resolve => setTimeout(resolve, delay));
};

// Function to simulate human-like behavior
const simulateHumanBehavior = async (page) => {
    // Random mouse movements
    await page.mouse.move(
        Math.floor(Math.random() * 800) + 100,
        Math.floor(Math.random() * 600) + 100
    );

    // Random scrolling
    await page.evaluate(() => {
        window.scrollBy(0, Math.floor(Math.random() * 500) + 100);
    });

    // Random typing simulation
    const randomText = Math.random().toString(36).substring(2, 10);
    await page.keyboard.type(randomText, { delay: Math.floor(Math.random() * 100) + 50 });

    // Clear the random text
    for (let i = 0; i < randomText.length; i++) {
        await page.keyboard.press('Backspace');
    }
};

module.exports = {
    getStealthContext,
    addRandomDelay,
    simulateHumanBehavior,
    stealthConfig
};