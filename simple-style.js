const fs = require("fs");
const path = require("path");

/**
 * Simple CSS injection that just makes the raw HTML readable
 * without hiding or transforming elements
 */
function injectSimpleCSS(htmlContent) {
  // Remove any existing style tags first
  htmlContent = htmlContent.replace(/<style>[\s\S]*?<\/style>/gi, "");

  const simpleCSS = `
<style>
/* Simple Clean Styling for Darknet Forum Raw HTML */

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  background: #ffffff;
  color: #333333;
  line-height: 1.6;
  padding: 20px;
  margin: 0;
}

/* Main Container - Don't hide anything */
#XF {
  max-width: 1400px;
  margin: 0 auto;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Header with Thread Title */
.p-title,
.p-body-header {
  background: linear-gradient(135deg, #667eea 0%, # 100%);
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.p-title-value {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 10px;
}

.p-description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

/* Thread Info (Thread starter, start date) */
.pairs {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background: rgba(255, 255, 255, 0.8);
  padding: 12px 20px;
  border-radius: 6px;
  margin-top: 15px;
}

.pairs dt {
  font-weight: 600;
  color: #667eea;
}

.pairs dd {
  color: #333;
  margin-left: 5px;
}

/* Show all content - don't hide anything */
.p-body-content,
.p-body-main,
.p-body-pageContent {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Posts Container */
.block-container {
  margin-top: 20px;
}

/* Individual Post/Message */
article.message {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  display: block !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

/* Message Structure - Show everything */
.message-inner,
.message-cell {
  display: block !important;
}

/* User Info Section */
.message-user {
  display: flex !important;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f0f2ff;
  border-radius: 6px;
  margin-bottom: 15px;
}

/* Avatar */
.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #667eea;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-u {
  font-size: 24px;
  font-weight: bold;
  color: white;
}

/* Username and Details */
.message-userDetails {
  flex: 1;
}

.username {
  font-size: 18px;
  font-weight: 700;
  color: #667eea !important;
  text-decoration: none;
  display: block;
  margin-bottom: 5px;
}

.username:hover {
  color: #764ba2 !important;
}

.userTitle {
  font-size: 13px;
  color: #666;
  font-style: italic;
}

.userBanner {
  display: inline-block;
  padding: 3px 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 5px;
  text-transform: uppercase;
}

/* Message Content Area */
.message-main {
  padding: 15px;
  display: block !important;
}

.message-content {
  display: block !important;
}

/* Post Content Text */
.bbWrapper {
  color: #333;
  font-size: 15px;
  line-height: 1.8;
  display: block !important;
}

/* Images in Posts */
.bbWrapper img,
.bbImage {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 15px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  display: block !important;
}

.bbImageWrapper {
  display: block !important;
  margin: 15px 0;
}

/* Attachments */
.message-attachments {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ccc;
  display: block !important;
}

.attachment {
  display: flex !important;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #ffffff;
  border-radius: 6px;
  margin-bottom: 10px;
  border: 1px solid #e0e0e0;
}

/* Post Footer with Date and Reactions */
.message-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
  display: flex !important;
  justify-content: space-between;
  align-items: center;
}

.message-date {
  color: #666;
  font-size: 13px;
}

time {
  color: #666;
}

/* Reactions */
.reactionsBar {
  display: flex !important;
  gap: 10px;
}

.reaction {
  background: #f0f2ff;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
  border: 1px solid #d0d4ff;
  color: #667eea;
}

/* Links */
a {
  color: #667eea;
  text-decoration: none;
}

a:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Buttons */
.button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  display: inline-block;
}

/* Pagination */
.pageNav {
  display: flex !important;
  justify-content: center;
  gap: 10px;
  padding: 30px;
  flex-wrap: wrap;
}

.pageNav-page {
  background: #ffffff;
  padding: 10px 16px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  color: #333;
}

.pageNav-page:hover,
.pageNav-page.is-current {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: transparent;
  color: white;
}

/* Quote Blocks */
blockquote,
.bbCodeBlock--quote {
  border-left: 4px solid #667eea;
  padding: 15px;
  margin: 15px 0;
  background: #f0f2ff;
  border-radius: 4px;
  color: #333;
}

/* Code Blocks */
code,
pre {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: #333;
  border: 1px solid #e0e0e0;
}

pre {
  padding: 15px;
  overflow-x: auto;
  display: block;
}

/* Tags */
.tagList {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 15px 0;
}

.tag {
  background: #f0f2ff;
  color: #667eea;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #d0d4ff;
}

/* Don't hide navigation or any other elements */
.p-nav,
.p-header,
.p-footer,
.p-body-sidebar {
  display: block !important;
  opacity: 0.7;
}

/* Sidebar */
.p-body-sidebar {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  border: 1px solid #e0e0e0;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f5f5f5;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 5px;
}

/* Responsive */
@media (max-width: 768px) {
  body {
    padding: 10px;
  }
  
  .p-title-value {
    font-size: 20px;
  }
  
  .message {
    padding: 15px;
  }
  
  .message-user {
    flex-direction: column;
    text-align: center;
  }
}

/* Make sure everything is visible - remove the broken display rule */
.message,
.message-inner,
.message-cell,
.message-cell--main,
.message-cell--user,
.message-user,
.message-userDetails,
.message-avatar,
.message-main,
.message-content,
.message-body,
.bbWrapper,
.bbImageWrapper,
.bbImage,
img {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.message-user,
.message-footer {
  display: flex !important;
}

/* Make sure images load */
img {
  display: inline-block !important;
}
</style>
`;

  // Inject CSS into the head section
  const headCloseTag = "</head>";
  if (htmlContent.includes(headCloseTag)) {
    return htmlContent.replace(headCloseTag, simpleCSS + "\n" + headCloseTag);
  } else {
    return simpleCSS + "\n" + htmlContent;
  }
}

// Process HTML file
const htmlPath = path.join(__dirname, "output/data/raw_1762748479908.html");
console.log("[INFO] Applying simple CSS to:", htmlPath);

const htmlContent = fs.readFileSync(htmlPath, "utf8");
const styledHTML = injectSimpleCSS(htmlContent);
fs.writeFileSync(htmlPath, styledHTML, "utf8");

console.log("[SUCCESS] Simple CSS applied! Opening in browser...\n");
