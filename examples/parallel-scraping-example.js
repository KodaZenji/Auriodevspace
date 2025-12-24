// Example usage of the parallel scraper with stealth features

const { parallelScrape, scrapeWithSelectors, scraperConfig } = require('../utils/parallel-scraper');

// Example URLs to scrape
const urls = [
    'https://httpbin.org/headers', // This will show our headers/user-agent
    'https://example.com',
    'https://jsonplaceholder.typicode.com/posts/1',
    'https://jsonplaceholder.typicode.com/posts/2',
    'https://jsonplaceholder.typicode.com/posts/3',
    'https://jsonplaceholder.typicode.com/posts/4',
    'https://jsonplaceholder.typicode.com/posts/5',
];

// Example with custom selectors
const urlWithSelectors = {
    url: 'https://example.com',
    selectors: {
        'h1': 'text',
        'p': 'text',
        'a': 'text'
    }
};

// Function to run scraping examples
const runScrapingExamples = async () => {
    console.log('Starting Playwright stealth scraping examples...\n');

    // Example 1: Basic parallel scraping
    console.log('1. Basic parallel scraping...');
    try {
        const results = await parallelScrape(urls, 3); // Use concurrency of 3
        console.log('Basic scraping results:', results);
    } catch (error) {
        console.error('Error in basic scraping:', error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Example 2: Scraping with custom selectors
    console.log('2. Scraping with custom selectors...');
    try {
        const result = await scrapeWithSelectors(
            urlWithSelectors.url,
            urlWithSelectors.selectors
        );
        console.log('Selector scraping result:', result);
    } catch (error) {
        console.error('Error in selector scraping:', error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Example 3: Parallel scraping with custom selectors
    console.log('3. Parallel scraping with custom selectors...');
    try {
        const selectorPromises = urls.slice(0, 3).map(url =>
            scrapeWithSelectors(url, { 'title': 'text' })
        );

        const selectorResults = await Promise.allSettled(selectorPromises);
        console.log('Parallel selector scraping results:', selectorResults);
    } catch (error) {
        console.error('Error in parallel selector scraping:', error);
    }

    console.log('\nScraping examples completed!');
};

// Function to scrape your specific application data
const scrapeApplicationData = async () => {
    console.log('\nScraping application-specific data...');

    // URLs related to your application
    const appUrls = [
        'http://localhost:3000',
        'http://localhost:3000/search',
        'http://localhost:3000/rank-nexus',
        'http://localhost:3000/api/leaderboards?days=7&username=auriosweb3',
    ];

    try {
        const results = await parallelScrape(appUrls, 2); // Lower concurrency for local app
        console.log('Application scraping results:', results);
    } catch (error) {
        console.error('Error scraping application:', error);
    }
};

// Run examples
const main = async () => {
    try {
        await runScrapingExamples();
        await scrapeApplicationData();
    } catch (error) {
        console.error('Error in main function:', error);
    }
};

// Only run if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = {
    runScrapingExamples,
    scrapeApplicationData
};