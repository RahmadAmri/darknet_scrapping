const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

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

function generateHash(content) {
  return crypto.createHash("md5").update(JSON.stringify(content)).digest("hex");
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

function saveJson(data, filepath) {
  const dir = path.dirname(filepath);
  ensureDir(dir);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf8");
  return filepath;
}

function saveText(text, filepath) {
  const dir = path.dirname(filepath);
  ensureDir(dir);
  fs.writeFileSync(filepath, text, "utf8");
  return filepath;
}

function readJson(filepath) {
  if (!fs.existsSync(filepath)) {
    return null;
  }
  const content = fs.readFileSync(filepath, "utf8");
  return JSON.parse(content);
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toISOString().replace(/T/, " ").replace(/\..+/, "");
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return "unknown";
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9._-]/gi, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

function extractBetween(text, startTag, endTag) {
  const startIndex = text.indexOf(startTag);
  if (startIndex === -1) return null;

  const start = startIndex + startTag.length;
  const endIndex = text.indexOf(endTag, start);
  if (endIndex === -1) return null;

  return text.substring(start, endIndex);
}

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

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function countWords(text) {
  return text.trim().split(/\s+/).length;
}

function truncate(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

function detectLanguage(text) {
  const cyrillicChars = text.match(/[а-яА-ЯёЁ]/g);
  const latinChars = text.match(/[a-zA-Z]/g);

  if (cyrillicChars && cyrillicChars.length > (latinChars?.length || 0)) {
    return "ru";
  }
  return "en";
}

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
