/**
 * Configuration file for the Darknet Scraper
 */

module.exports = {
  // Tor connection settings
  tor: {
    host: "127.0.0.1",
    port: 9050,
    timeout: 60000, // 60 seconds
  },

  // HTTP request settings
  request: {
    timeout: 60000,
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
    },
  },

  // Output directories
  output: {
    baseDir: "./output",
    dataDir: "./output/data",
    reportsDir: "./output/reports",
    screenshotsDir: "./output/screenshots",
  },

  // PII detection patterns
  pii: {
    patterns: {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /\b(\+?\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
      bitcoinAddress: /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g,
      ethereumAddress: /\b0x[a-fA-F0-9]{40}\b/g,
    },
  },

  // Scraping settings
  scraping: {
    maxPosts: 1000,
    maxPages: 10,
    delayBetweenRequests: 2000, // 2 seconds
    enableDeduplication: true,
    saveRawHtml: true,
    saveJson: true,
    generateReport: true,
  },

  // Target URLs
  targets: {
    darknet: [
      "http://darknet2efyjfa6vs6rbipf4pw5birq3wzlda43hmp2mrgt3py23qhad.onion/threads/discounts-on-avia-hotels-from-serggik00.3499/",
    ],
  },
};
