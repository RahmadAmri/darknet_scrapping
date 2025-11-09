/**
 * Utility functions for the Darknet Scraper
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * Clean HTML entities and tags from text
 */
function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generate MD5 hash of content
 */
function generateHash(content) {
  return crypto.createHash("md5").update(JSON.stringify(content)).digest("hex");
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

/**
 * Save JSON to file
 */
function saveJson(data, filepath) {
  const dir = path.dirname(filepath);
  ensureDir(dir);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf8");
  return filepath;
}

/**
 * Save text to file
 */
function saveText(text, filepath) {
  const dir = path.dirname(filepath);
  ensureDir(dir);
  fs.writeFileSync(filepath, text, "utf8");
  return filepath;
}

/**
 * Read JSON from file
 */
function readJson(filepath) {
  if (!fs.existsSync(filepath)) {
    return null;
  }
  const content = fs.readFileSync(filepath, "utf8");
  return JSON.parse(content);
}

/**
 * Format timestamp to readable string
 */
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toISOString().replace(/T/, " ").replace(/\..+/, "");
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return "unknown";
  }
}

/**
 * Sleep/delay function
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sanitize filename
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9._-]/gi, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

/**
 * Extract text between tags
 */
function extractBetween(text, startTag, endTag) {
  const startIndex = text.indexOf(startTag);
  if (startIndex === -1) return null;

  const start = startIndex + startTag.length;
  const endIndex = text.indexOf(endTag, start);
  if (endIndex === -1) return null;

  return text.substring(start, endIndex);
}

/**
 * Parse query string from URL
 */
function parseQueryString(url) {
  try {
    const urlObj = new URL(url);
    const params = {};
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  } catch (error) {
    return {};
  }
}

/**
 * Validate URL
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Get file size in human readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Count words in text
 */
function countWords(text) {
  return text.trim().split(/\s+/).length;
}

/**
 * Truncate text with ellipsis
 */
function truncate(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Detect language (simple detection)
 */
function detectLanguage(text) {
  const cyrillicChars = text.match(/[а-яА-ЯёЁ]/g);
  const latinChars = text.match(/[a-zA-Z]/g);

  if (cyrillicChars && cyrillicChars.length > (latinChars?.length || 0)) {
    return "ru";
  }
  return "en";
}

/**
 * Extract URLs from text
 */
function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const onionRegex = /(http:\/\/[a-z0-9]+\.onion[^\s]*)/g;

  const urls = [];
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    urls.push(match[1]);
  }

  while ((match = onionRegex.exec(text)) !== null) {
    if (!urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }

  return urls;
}

/**
 * Rate limiter class
 */
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  async acquire() {
    const now = Date.now();
    this.requests = this.requests.filter(
      (time) => now - time < this.timeWindow
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      await sleep(waitTime);
      return this.acquire();
    }

    this.requests.push(now);
  }
}

/**
 * Retry wrapper for async functions
 */
async function retry(fn, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(
        `[RETRY] Attempt ${i + 1}/${maxRetries} failed: ${error.message}`
      );

      if (i < maxRetries - 1) {
        await sleep(delay * (i + 1));
      }
    }
  }

  throw lastError;
}

module.exports = {
  cleanText,
  generateHash,
  ensureDir,
  saveJson,
  saveText,
  readJson,
  formatTimestamp,
  extractDomain,
  sleep,
  sanitizeFilename,
  extractBetween,
  parseQueryString,
  isValidUrl,
  formatFileSize,
  countWords,
  truncate,
  detectLanguage,
  extractUrls,
  RateLimiter,
  retry,
};
