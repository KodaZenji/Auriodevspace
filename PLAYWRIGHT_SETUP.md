# Playwright Setup for Stealth Scraping

This project includes Playwright configuration for stealth web scraping with IP rotation, delays, and parallel processing.

## Features Implemented

1. **Stealth Browser Configuration**:
   - Random user agent rotation
   - Viewport size variation
   - Detection evasion techniques
   - Human-like behavior simulation

2. **IP Rotation**:
   - Proxy support for IP rotation
   - Random proxy selection from configured list

3. **Delays**:
   - Random delays between requests (5-10 seconds by default)
   - Exponential backoff for retries

4. **Parallel Scraping**:
   - Concurrency control with p-limit
   - Configurable number of concurrent requests
   - Error handling and retries

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

Due to network restrictions, you may need to install browsers manually:

```bash
# If direct installation fails, try with different network or proxy
npx playwright install chromium

# Or install with specific proxy settings
HTTPS_PROXY=http://your-proxy:port npx playwright install chromium
```

### 3. Configure Proxies (Optional)

To enable IP rotation, update the proxy list in `utils/playwright-stealth.js`:

```javascript
const proxyList = [
  {
    server: 'http://proxy-server:port',
    username: 'your-username',
    password: 'your-password'
  },
  // Add more proxies as needed
];
```

### 4. Configuration

Adjust the configuration in `utils/parallel-scraper.js`:

```javascript
const scraperConfig = {
  concurrency: 5,        // Number of concurrent scrapers
  maxRetries: 3,         // Number of retries for failed requests
  minDelay: 5000,        // 5 seconds minimum delay
  maxDelay: 10000,       // 10 seconds maximum delay
  timeout: 30000,        // 30 seconds timeout for each request
};
```

## Usage Examples

### 1. Run the Example Scraper

```bash
npm run scrape:example
```

This will run the example that demonstrates:
- Basic parallel scraping
- Scraping with custom selectors
- Application-specific scraping

### 2. Run Playwright Tests

```bash
npm run test:e2e
```

### 3. Parallel Scraping in Your Code

```javascript
const { parallelScrape } = require('./utils/parallel-scraper');

const urls = [
  'https://example.com',
  'https://httpbin.org/headers',
  // Add more URLs
];

const results = await parallelScrape(urls, 3); // 3 concurrent scrapers
```

### 4. Scraping with Selectors

```javascript
const { scrapeWithSelectors } = require('./utils/parallel-scraper');

const result = await scrapeWithSelectors(
  'https://example.com',
  {
    'h1': 'text',           // Get text content of h1
    'p.description': 'text', // Get text content of p with class description
    'img.logo': {           // Get attribute of img with class logo
      type: 'attribute', 
      attribute: 'src'
    }
  }
);
```

## Troubleshooting

### Playwright Installation Issues

If you encounter issues installing Playwright browsers:

1. **Network Issues**: Try using a different network or VPN
2. **Corporate Firewall**: Contact your network administrator
3. **Manual Installation**: Download browsers manually from Playwright's CDN

### Proxy Configuration

For proxy authentication, ensure your proxy server details are correct in the configuration.

### Stealth Detection

If websites still detect automation, you can enhance the stealth configuration in `utils/playwright-stealth.js` by adding more browser fingerprint variations.

## Files Structure

- `utils/playwright-stealth.js` - Stealth browser configuration
- `utils/parallel-scraper.js` - Parallel scraping implementation
- `examples/parallel-scraping-example.js` - Usage examples
- `tests/example.spec.js` - Playwright test examples
- `playwright.config.js` - Playwright configuration