# Darknet Scraper - Data Acquisition Tool

## 📋 Test Task Overview

This project implements a complete data scraper for darknet forums with the following capabilities:

- ✅ Fetch data from .onion sites through Tor network
- ✅ Parse forum threads and extract structured data
- ✅ Detect PII (Personally Identifiable Information)
- ✅ Deduplicate data using content hashing
- ✅ Generate comprehensive reports (JSON + Markdown)
- ✅ Save raw HTML and parsed JSON data

## 🎯 Task Requirements

### Completed Features:

1. **Darknet Access**: Uses `tor-axios` to fetch data from .onion URLs through Tor
2. **Data Collection**: Scrapes forum threads including posts, users, links, and attachments
3. **Data Parsing**: Extracts structured information from HTML
4. **PII Detection**: Identifies emails, phone numbers, IP addresses, crypto addresses, etc.
5. **Deduplication**: Uses MD5 hashing to prevent duplicate data
6. **Report Generation**: Creates detailed JSON and Markdown reports with evidence

## 🚀 Quick Start

### Prerequisites

1. **Install Tor Browser** or **Tor standalone**:

   - macOS: `brew install tor`
   - Start Tor: `tor` (runs on default port 9050)

2. **Node.js** (v14 or higher)

### Installation

```bash
# Install dependencies (already installed)
npm install

# Or if needed:
npm install tor-axios
```

### Running the Scraper

```bash
# Start Tor first (in a separate terminal)
tor

# Then run the scraper
npm start
```

## 📁 Project Structure

```
darknet_scrapping/
├── scraper.js          # Main scraper implementation
├── config.js           # Configuration settings
├── utils.js            # Utility functions
├── package.json        # Dependencies and scripts
├── README_NEW.md       # This file
└── output/             # Generated output (created on first run)
    ├── data/           # Raw HTML and parsed JSON
    │   ├── raw_*.html
    │   └── parsed_*.json
    └── reports/        # Generated reports
        ├── report_*.json
        └── report_*.md
```

## 🔧 Configuration

Edit `config.js` to customize:

- Tor connection settings (host, port, timeout)
- HTTP request parameters
- PII detection patterns
- Output directories
- Scraping limits and delays

## 📊 Output Files

### 1. Raw HTML (`output/data/raw_*.html`)

- Complete HTML source from the target URL
- Evidence of successful data fetch

### 2. Parsed JSON (`output/data/parsed_*.json`)

- Structured data extracted from HTML
- Includes posts, users, links, attachments

### 3. JSON Report (`output/reports/report_*.json`)

- Comprehensive analysis
- Metadata, summary, PII analysis
- Complete thread information

### 4. Markdown Report (`output/reports/report_*.md`)

- Human-readable report
- Summary statistics
- Post previews
- Links and attachments list

## 🔍 Features in Detail

### Data Collection

- Fetches data through Tor network using SOCKS5 proxy
- Custom User-Agent and headers for stealth
- 60-second timeout for slow .onion connections
- Automatic retry mechanism

### HTML Parsing

- Extracts thread title, starter, and start date
- Parses all posts with username, date, content
- Identifies user roles/titles
- Collects all links (both clearnet and .onion)
- Finds attachments with URLs

### PII Detection

Automatically detects:

- Email addresses
- Phone numbers
- Social Security Numbers
- Credit card numbers
- IP addresses
- Passport numbers
- Bitcoin addresses
- Ethereum addresses

### Deduplication

- MD5 hash-based deduplication
- Prevents duplicate posts/data
- Tracks unique content only

### Report Generation

- Summary statistics
- PII analysis by type
- User list
- Post details with content preview
- All links and attachments
- File references for evidence

## 🎯 Target URL

The scraper is configured to scrape:

```
http://darknet2efyjfa6vs6rbipf4pw5birq3wzlda43hmp2mrgt3py23qhad.onion/threads/discounts-on-avia-hotels-from-serggik00.3499/
```

## 🛠️ Troubleshooting

### "ECONNREFUSED" Error

- Make sure Tor is running: `tor`
- Tor should be listening on port 9050

### "Connection Timeout"

- .onion sites can be slow
- Wait for 60 seconds (default timeout)
- Check if the .onion URL is still active

### "Cannot find module"

- Run: `npm install`
- Ensure `tor-axios` is installed

## 📝 Example Output

```
═══════════════════════════════════════════════════════
           DARKNET SCRAPER - STARTING
═══════════════════════════════════════════════════════

[INFO] Fetching data from: http://darknet2efyjfa6vs6rbipf4pw5birq3wzlda43hmp2mrgt3py23qhad.onion/...
[INFO] Connecting through Tor network...

[SUCCESS] Status: 200 OK
[INFO] Content length: 45678 bytes

[INFO] Parsing thread data...
[SUCCESS] Parsed 15 posts from 3 users
[INFO] Found 12 links and 2 attachments

[SUCCESS] Saved raw HTML to: /path/to/output/data/raw_1699999999.html
[SUCCESS] Saved JSON data to: /path/to/output/data/parsed_1699999999.json

[INFO] Generating comprehensive report...
[SUCCESS] Report saved to: /path/to/output/reports/report_1699999999.json
[SUCCESS] Markdown report saved to: /path/to/output/reports/report_1699999999.md

═══════════════════════════════════════════════════════
           SCRAPING COMPLETED SUCCESSFULLY
═══════════════════════════════════════════════════════

📊 FINAL REPORT SUMMARY:
─────────────────────────────────────────────────────
✓ Thread: Discounts on Avia Hotels from Serggik00
✓ Posts collected: 15
✓ Unique users: 3
✓ Links found: 12
✓ Attachments: 2
✓ Posts with PII: 5
─────────────────────────────────────────────────────
```

## 🔒 Security & Legal Notice

This tool is for **educational and authorized testing purposes only**.

- Only scrape public data you have permission to access
- Respect robots.txt and terms of service
- Do not use for illegal activities
- Handle PII responsibly and comply with data protection laws

## 📦 Dependencies

- **tor-axios** (^1.0.11): HTTP client with Tor SOCKS5 proxy support
- **Node.js built-ins**: fs, path, crypto

## 🤝 Contributing

This is a test task implementation. Feel free to extend with:

- Multi-page scraping
- Database storage
- Advanced PII detection
- Screenshot capture
- Rate limiting
- Proxy rotation

## 📄 License

MIT License - Use at your own risk
