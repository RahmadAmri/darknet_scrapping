const torAxios = require("tor-axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class DarknetScraper {
  constructor() {
    this.outputDir = path.join(__dirname, "output");
    this.dataDir = path.join(this.outputDir, "data");
    this.reportsDir = path.join(this.outputDir, "reports");
    this.collectedData = [];
    this.deduplicationSet = new Set();

    this.torClient = null;
    this.setupTorClient();

    [this.outputDir, this.dataDir, this.reportsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  setupTorClient() {
    try {
      this.torClient = torAxios.torSetup({
        ip: "localhost",
        port: 9150,
      });
      console.log("[INFO] Tor client configured for port 9150 (Tor Browser)\n");
    } catch (error) {
      try {
        this.torClient = torAxios.torSetup({
          ip: "localhost",
          port: 9050,
        });
        console.log(
          "[INFO] Tor client configured for port 9050 (standalone Tor)\n"
        );
      } catch (err) {
        console.error("[ERROR] Failed to setup Tor client:", err.message);
        throw new Error(
          "Could not setup Tor connection. Make sure Tor is running."
        );
      }
    }
  }

  async fetchFromDarknet(url) {
    console.log(`[INFO] Fetching data from: ${url}`);
    console.log("[INFO] Connecting through Tor network...\n");

    try {
      const response = await this.torClient.get(url, {
        timeout: 60000,
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
      });

      return {
        url: url,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        timestamp: new Date().toISOString(),
        contentLength: response.data.length,
      };
    } catch (error) {
      console.log(error.message);
    }
  }

  parseThreadData(html, sourceUrl) {
    const data = {
      sourceUrl: sourceUrl,
      timestamp: new Date().toISOString(),
      threadInfo: {},
      posts: [],
      users: [],
      attachments: [],
      links: [],
    };

    try {
      const titleMatch = html.match(
        /<h1[^>]*class="[^"]*p-title-value[^"]*"[^>]*>(.*?)<\/h1>/s
      );
      if (titleMatch) {
        data.threadInfo.title = this.cleanText(titleMatch[1]);
      }

      const threadMetaMatch = html.match(
        /<dl[^>]*class="[^"]*pairs[^"]*"[^>]*>(.*?)<\/dl>/s
      );
      if (threadMetaMatch) {
        const metaData = threadMetaMatch[1];

        const starterMatch = metaData.match(
          /<dt>Thread starter<\/dt>\s*<dd[^>]*>(.*?)<\/dd>/s
        );
        if (starterMatch) {
          const userMatch = starterMatch[1].match(/username[^>]*>([^<]+)</);
          if (userMatch) {
            data.threadInfo.starter = this.cleanText(userMatch[1]);
          }
        }

        const dateMatch = metaData.match(
          /<dt>Start date<\/dt>\s*<dd[^>]*>(.*?)<\/dd>/s
        );
        if (dateMatch) {
          const timeMatch = dateMatch[1].match(/datetime="([^"]+)"/);
          if (timeMatch) {
            data.threadInfo.startDate = timeMatch[1];
          }
        }
      }

      const postRegex =
        /<article[^>]*class="[^"]*message[^"]*"[^>]*data-content="[^"]*"[^>]*>(.*?)<\/article>/gs;
      let postMatch;
      let postCount = 0;

      while ((postMatch = postRegex.exec(html)) !== null) {
        postCount++;
        const postHtml = postMatch[1];

        const post = {
          postNumber: postCount,
          username: "",
          userTitle: "",
          postDate: "",
          content: "",
          reactions: 0,
        };

        const usernameMatch = postHtml.match(
          /class="[^"]*username[^"]*"[^>]*>([^<]+)</
        );
        if (usernameMatch) {
          post.username = this.cleanText(usernameMatch[1]);
          if (!data.users.includes(post.username)) {
            data.users.push(post.username);
          }
        }

        const userTitleMatch = postHtml.match(
          /class="[^"]*userTitle[^"]*"[^>]*>([^<]+)</
        );
        if (userTitleMatch) {
          post.userTitle = this.cleanText(userTitleMatch[1]);
        }

        const dateMatch = postHtml.match(/datetime="([^"]+)"/);
        if (dateMatch) {
          post.postDate = dateMatch[1];
        }

        const contentMatch = postHtml.match(
          /<div[^>]*class="[^"]*bbWrapper[^"]*"[^>]*>(.*?)<\/div>/s
        );
        if (contentMatch) {
          post.content = this.cleanText(contentMatch[1]);

          post.piiDetected = this.detectPII(post.content);
        }

        const reactionsMatch = postHtml.match(/class="[^"]*reactionsBar[^"]*"/);
        if (reactionsMatch) {
          const reactionCountMatch = postHtml.match(
            /reaction-count[^>]*>(\d+)</
          );
          if (reactionCountMatch) {
            post.reactions = parseInt(reactionCountMatch[1]);
          }
        }

        data.posts.push(post);
      }

      const linkRegex = /href="([^"]+)"/g;
      let linkMatch;
      while ((linkMatch = linkRegex.exec(html)) !== null) {
        const link = linkMatch[1];
        if (link.includes(".onion") || link.startsWith("http")) {
          if (!data.links.includes(link)) {
            data.links.push(link);
          }
        }
      }

      const attachmentRegex =
        /class="[^"]*attachment[^"]*"[^>]*>(.*?)<\/div>/gs;
      let attachMatch;
      while ((attachMatch = attachmentRegex.exec(html)) !== null) {
        const attachHtml = attachMatch[1];
        const fileMatch = attachHtml.match(/href="([^"]+)"/);
        const nameMatch = attachHtml.match(/>([^<]+\.\w+)</);

        if (fileMatch) {
          data.attachments.push({
            url: fileMatch[1],
            filename: nameMatch ? nameMatch[1] : "unknown",
          });
        }
      }

      console.log(
        `Success Parsed ${data.posts.length} posts from ${data.users.length} users`
      );

      return data;
    } catch (error) {
      console.error(error.message);
      return data;
    }
  }

  cleanText(text) {
    return text
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  detectPII(text) {
    const patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /\b(\+?\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
    };

    const detected = {};
    let hasAny = false;

    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        detected[type] = matches.length;
        hasAny = true;
      }
    }

    return hasAny ? detected : null;
  }

  deduplicate(item) {
    const hash = crypto
      .createHash("md5")
      .update(JSON.stringify(item))
      .digest("hex");

    if (this.deduplicationSet.has(hash)) {
      console.log(
        `[INFO] Duplicate item detected and skipped (hash: ${hash.substring(
          0,
          8
        )}...)`
      );
      return false;
    }

    this.deduplicationSet.add(hash);
    return true;
  }

  saveRawData(html, filename) {
    const filepath = path.join(this.dataDir, filename);
    fs.writeFileSync(filepath, html, "utf8");
    console.log(`[SUCCESS] Saved raw HTML to: ${filepath}\n`);
    return filepath;
  }

  saveJsonData(data, filename) {
    const filepath = path.join(this.dataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf8");
    console.log(`[SUCCESS] Saved JSON data to: ${filepath}\n`);
    return filepath;
  }

  generateReport(scrapedData) {
    console.log("[INFO] Generating comprehensive report...");

    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        scrapedAt: scrapedData.timestamp,
        sourceUrl: scrapedData.url,
        status: scrapedData.status,
        contentLength: scrapedData.contentLength,
      },
      summary: {
        totalPosts: scrapedData.parsedData.posts.length,
        uniqueUsers: scrapedData.parsedData.users.length,
        totalLinks: scrapedData.parsedData.links.length,
        totalAttachments: scrapedData.parsedData.attachments.length,
        threadTitle: scrapedData.parsedData.threadInfo.title,
        threadStarter: scrapedData.parsedData.threadInfo.starter,
        threadStartDate: scrapedData.parsedData.threadInfo.startDate,
      },
      piiAnalysis: {
        postsWithPII: 0,
        piiTypes: {},
      },
      threadInfo: scrapedData.parsedData.threadInfo,
      users: scrapedData.parsedData.users,
      posts: scrapedData.parsedData.posts,
      links: scrapedData.parsedData.links,
      attachments: scrapedData.parsedData.attachments,
      files: {
        rawHtml: scrapedData.rawHtmlFile,
        jsonData: scrapedData.jsonDataFile,
      },
    };
    scrapedData.parsedData.posts.forEach((post) => {
      if (post.piiDetected) {
        report.piiAnalysis.postsWithPII++;
        for (const [type, count] of Object.entries(post.piiDetected)) {
          report.piiAnalysis.piiTypes[type] =
            (report.piiAnalysis.piiTypes[type] || 0) + count;
        }
      }
    });

    const reportPath = path.join(this.reportsDir, `report_${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`[SUCCESS] Report saved to: ${reportPath}\n`);

    this.generateMarkdownReport(report);

    return report;
  }

  generateMarkdownReport(report) {
    const md = `# Darknet Scraping Report

## Metadata
- **Generated At**: ${report.metadata.generatedAt}
- **Scraped At**: ${report.metadata.scrapedAt}
- **Source URL**: ${report.metadata.sourceUrl}
- **Status**: ${report.metadata.status}
- **Content Length**: ${report.metadata.contentLength} bytes

## Summary
- **Thread Title**: ${report.summary.threadTitle || "N/A"}
- **Thread Starter**: ${report.summary.threadStarter || "N/A"}
- **Thread Start Date**: ${report.summary.threadStartDate || "N/A"}
- **Total Posts**: ${report.summary.totalPosts}
- **Unique Users**: ${report.summary.uniqueUsers}
- **Total Links**: ${report.summary.totalLinks}
- **Total Attachments**: ${report.summary.totalAttachments}

## PII Analysis
- **Posts with PII**: ${report.piiAnalysis.postsWithPII}
- **PII Types Detected**: ${JSON.stringify(
      report.piiAnalysis.piiTypes,
      null,
      2
    )}

## Users
${report.users.map((user, i) => `${i + 1}. ${user}`).join("\n")}

## Posts
${report.posts
  .slice(0, 5)
  .map(
    (post, i) => `
### Post #${post.postNumber}
- **Username**: ${post.username}
- **User Title**: ${post.userTitle}
- **Date**: ${post.postDate}
- **Content**: ${post.content.substring(0, 200)}${
      post.content.length > 200 ? "..." : ""
    }
- **PII Detected**: ${post.piiDetected ? "Yes" : "No"}
`
  )
  .join("\n")}

${
  report.posts.length > 5 ? `... and ${report.posts.length - 5} more posts` : ""
}

## Links
${report.links
  .slice(0, 10)
  .map((link, i) => `${i + 1}. ${link}`)
  .join("\n")}

${
  report.links.length > 10
    ? `... and ${report.links.length - 10} more links`
    : ""
}

## Attachments
${report.attachments
  .map((att, i) => `${i + 1}. ${att.filename} - ${att.url}`)
  .join("\n")}

## Files Generated
- **Raw HTML**: \`${report.files.rawHtml}\`
- **JSON Data**: \`${report.files.jsonData}\`

---
*Report generated by Darknet Scraper*
`;

    const mdPath = path.join(this.reportsDir, `report_${Date.now()}.md`);
    fs.writeFileSync(mdPath, md, "utf8");
    console.log(`[SUCCESS] Markdown report saved to: ${mdPath}\n`);
  }

  async scrape(url) {
    console.log("═══════════════════════════════════════════════════════");
    console.log("           DARKNET SCRAPER - STARTING");
    console.log("═══════════════════════════════════════════════════════\n");

    try {
      const response = await this.fetchFromDarknet(url);

      const timestamp = Date.now();
      const rawHtmlFile = this.saveRawData(
        response.data,
        `raw_${timestamp}.html`
      );

      const parsedData = this.parseThreadData(response.data, url);

      const jsonDataFile = this.saveJsonData(
        parsedData,
        `parsed_${timestamp}.json`
      );

      const scrapedData = {
        url: response.url,
        status: response.status,
        timestamp: response.timestamp,
        contentLength: response.contentLength,
        rawHtmlFile: rawHtmlFile,
        jsonDataFile: jsonDataFile,
        parsedData: parsedData,
      };

      const report = this.generateReport(scrapedData);

      console.log("═══════════════════════════════════════════════════════");
      console.log("           SCRAPING COMPLETED SUCCESSFULLY");
      console.log("═══════════════════════════════════════════════════════\n");

      return report;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
}

async function main() {
  const scraper = new DarknetScraper();

  const darknetUrl =
    "http://darknet2efyjfa6vs6rbipf4pw5birq3wzlda43hmp2mrgt3py23qhad.onion/threads/discounts-on-avia-hotels-from-serggik00.3499/";

  try {
    const report = await scraper.scrape(darknetUrl);
    console.log("Succes make report");
    console.log(report);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DarknetScraper;
