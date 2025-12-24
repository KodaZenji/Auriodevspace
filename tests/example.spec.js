const { test, expect } = require('@playwright/test');
const { getStealthContext, addRandomDelay, simulateHumanBehavior } = require('../utils/playwright-stealth');

// Example test using stealth features
test.describe('Stealth Browser Tests', () => {
    test('should navigate with stealth features', async ({ browser }) => {
        // Create a stealth context
        const context = await getStealthContext(browser);
        const page = await context.newPage();

        // Navigate to a test page
        await page.goto('https://httpbin.org/headers', { waitUntil: 'domcontentloaded' });

        // Add random delay to mimic human behavior
        await addRandomDelay(2000, 5000);

        // Simulate human behavior
        await simulateHumanBehavior(page);

        // Get the page content
        const content = await page.content();

        // Check that the page loaded successfully
        expect(content).toContain('headers');

        await context.close();
    });

    test('should scrape multiple pages in parallel', async ({ browser }) => {
        // Create multiple stealth contexts for parallel scraping
        const urls = [
            'https://httpbin.org/headers',
            'https://example.com',
            'https://jsonplaceholder.typicode.com/posts/1'
        ];

        // Create an array to hold page promises
        const pagePromises = urls.map(async (url) => {
            const context = await getStealthContext(browser);
            const page = await context.newPage();

            // Add delay before navigation
            await addRandomDelay(1000, 3000);

            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Simulate human behavior
            await simulateHumanBehavior(page);

            const title = await page.title();
            const content = await page.content();

            return { url, title, content };
        });

        // Wait for all pages to load
        const results = await Promise.all(pagePromises);

        // Verify that all pages were scraped
        expect(results).toHaveLength(urls.length);

        // Close all contexts
        // In a real implementation, you would close contexts after scraping
    });

    test('should handle API endpoints with stealth', async ({ browser }) => {
        // Test your application's API endpoints
        const context = await getStealthContext(browser);
        const page = await context.newPage();

        // Test the leaderboard API endpoint
        await page.goto('http://localhost:3000/api/leaderboards?days=7&username=auriosweb3', {
            waitUntil: 'domcontentloaded'
        });

        // Add delay and human behavior
        await addRandomDelay(2000, 4000);
        await simulateHumanBehavior(page);

        // Check if the API response is valid JSON
        const content = await page.content();
        expect(() => JSON.parse(content)).not.toThrow();

        await context.close();
    });
});

// Additional test for the rank-nexus page
test.describe('Rank Nexus Page Tests', () => {
    test('should load rank-nexus page with stealth', async ({ browser }) => {
        const context = await getStealthContext(browser);
        const page = await context.newPage();

        // Navigate to the rank-nexus page
        await page.goto('http://localhost:3000/rank-nexus', { waitUntil: 'networkidle' });

        // Add delays and human behavior
        await addRandomDelay(3000, 5000);
        await simulateHumanBehavior(page);

        // Check if the page loaded correctly
        await expect(page).toHaveTitle(/RankNexus/);

        // Check for key elements
        await expect(page.locator('text=Your Cross-Platform Leaderboard Hub')).toBeVisible();

        await context.close();
    });
});