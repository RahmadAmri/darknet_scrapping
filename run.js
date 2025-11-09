#!/usr/bin/env node

/**
 * Darknet Scraper Runner
 *
 * This script checks for Tor availability and runs the scraper
 */

const { exec } = require("child_process");
const DarknetScraper = require("./scraper");

async function checkTorConnection(port) {
  return new Promise((resolve) => {
    exec(`lsof -i :${port}`, (error, stdout, stderr) => {
      if (error || !stdout) {
        resolve(false);
      } else {
        resolve(stdout.includes("tor") || stdout.includes("Tor"));
      }
    });
  });
}

async function main() {
  console.log("🔍 Checking Tor availability...\n");

  // Check both ports
  const tor9050 = await checkTorConnection(9050);
  const tor9150 = await checkTorConnection(9150);

  if (!tor9050 && !tor9150) {
    console.error("❌ ERROR: Tor is not running!\n");
    console.log("Please start Tor first:");
    console.log("  Option 1: Install and run standalone Tor");
    console.log("    - Install: brew install tor");
    console.log("    - Run: tor");
    console.log("\n  Option 2: Use Tor Browser");
    console.log("    - Open Tor Browser (it will run on port 9150)");
    console.log("    - The scraper will use that connection\n");
    process.exit(1);
  }

  const torPort = tor9050 ? 9050 : 9150;
  console.log(`✅ Tor is running on port ${torPort}\n`);

  // The darknet forum URL from the task
  const darknetUrl =
    "http://darknet2efyjfa6vs6rbipf4pw5birq3wzlda43hmp2mrgt3py23qhad.onion/threads/discounts-on-avia-hotels-from-serggik00.3499/";

  try {
    const scraper = new DarknetScraper();
    const report = await scraper.scrape(darknetUrl);

    console.log("📊 FINAL REPORT SUMMARY:");
    console.log("─────────────────────────────────────────────────────");
    console.log(`✓ Thread: ${report.summary.threadTitle || "N/A"}`);
    console.log(`✓ Posts collected: ${report.summary.totalPosts}`);
    console.log(`✓ Unique users: ${report.summary.uniqueUsers}`);
    console.log(`✓ Links found: ${report.summary.totalLinks}`);
    console.log(`✓ Attachments: ${report.summary.totalAttachments}`);
    console.log(`✓ Posts with PII: ${report.piiAnalysis.postsWithPII}`);
    console.log("─────────────────────────────────────────────────────\n");

    console.log("📁 Generated files:");
    console.log(`   - Raw HTML: ${report.files.rawHtml}`);
    console.log(`   - JSON Data: ${report.files.jsonData}`);
    console.log(`   - Check ./output/reports/ for detailed reports\n`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Failed to complete scraping task:");
    console.error(`   ${error.message}\n`);

    if (
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("ECONNRESET")
    ) {
      console.log("💡 Troubleshooting tips:");
      console.log("   - Make sure Tor Browser is open and connected");
      console.log("   - Try accessing the URL in Tor Browser first");
      console.log("   - The .onion site might be down or slow");
      console.log("   - Wait a minute and try again\n");
    }

    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = main;
