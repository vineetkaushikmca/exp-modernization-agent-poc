#!/usr/bin/env node

/**
 * Local Import Runner
 *
 * Serves cleaned HTML from migration-work/ via a local HTTP server,
 * then runs the import against localhost. This allows importing content
 * from pages that have dynamic content (Adobe Target, etc.) that doesn't
 * load in headless browsers.
 *
 * Usage:
 *   node tools/importer/run-import-local.js \
 *     --import-script path/to/import.bundle.js \
 *     --cleaned-html migration-work/cleaned.html \
 *     --original-url https://all.accor.com/a/en/deals-corner.html
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import http from 'http';

const pluginBase = '/home/node/.claude/plugins/cache/excat-marketplace/excat/2.1.1/skills/excat-content-import/scripts/';
const require = createRequire(pluginBase + 'run-bulk-import.js');
const { chromium } = require('playwright');

const { compileReportsToExcel } = await import(join(pluginBase, 'import-report.js'));

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--') && args[i + 1] && !args[i + 1].startsWith('--')) {
      parsed[args[i]] = args[i + 1];
      i++;
    }
  }
  if (!parsed['--import-script'] || !parsed['--cleaned-html'] || !parsed['--original-url']) {
    console.error('Usage: node run-import-local.js --import-script <path> --cleaned-html <path> --original-url <url>');
    process.exit(1);
  }
  return {
    importScript: resolve(parsed['--import-script']),
    cleanedHtml: resolve(parsed['--cleaned-html']),
    originalUrl: parsed['--original-url'],
    outputDir: resolve(process.cwd(), 'content'),
  };
}

function ensureDir(pathname) {
  mkdirSync(pathname, { recursive: true });
}

function sanitizeDocumentPath(docPath, fallbackUrl) {
  if (!docPath || typeof docPath !== 'string') {
    const { pathname } = new URL(fallbackUrl);
    docPath = pathname || '/';
  }
  let normalized = docPath.replace(/\\/g, '/');
  if (normalized.startsWith('/')) normalized = normalized.slice(1);
  if (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
  if (normalized === '') normalized = 'index';
  return normalized;
}

async function main() {
  const { importScript, cleanedHtml, originalUrl, outputDir } = parseArgs();

  if (!existsSync(importScript)) {
    console.error(`Import script not found: ${importScript}`);
    process.exit(1);
  }
  if (!existsSync(cleanedHtml)) {
    console.error(`Cleaned HTML not found: ${cleanedHtml}`);
    process.exit(1);
  }

  // Read the cleaned HTML - it may be JSON-escaped (from the scrape script)
  let htmlContent = readFileSync(cleanedHtml, 'utf-8');

  // The scrape-webpage skill saves cleaned.html as a JSON string literal
  // (starts and ends with quotes, uses \n and \" escapes)
  const trimmed = htmlContent.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      htmlContent = JSON.parse(trimmed);
      console.log('[Local Import] Successfully unescaped JSON-encoded HTML');
    } catch (e) {
      console.log('[Local Import] JSON parse failed, using raw content:', e.message);
    }
  }

  // Wrap in a full HTML document structure if it's just a fragment
  if (!htmlContent.includes('<!DOCTYPE') && !htmlContent.includes('<html')) {
    // Parse original URL for base tag
    const parsedUrl = new URL(originalUrl);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

    htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>ALL our offers</title>
  <base href="${baseUrl}">
  <meta name="og:title" content="ALL our offers">
</head>
<body>
${htmlContent}
</body>
</html>`;
  }

  ensureDir(outputDir);

  // Start local HTTP server
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlContent);
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const localUrl = `http://127.0.0.1:${port}/a/en/deals-corner.html`;

  console.log('[Local Import] Starting run with:');
  console.log(`  Import script:  ${importScript}`);
  console.log(`  Cleaned HTML:   ${cleanedHtml}`);
  console.log(`  Original URL:   ${originalUrl}`);
  console.log(`  Local server:   http://127.0.0.1:${port}`);
  console.log(`  Output dir:     ${outputDir}`);
  console.log('');

  const helixImporterPath = join(pluginBase, 'static', 'inject', 'helix-importer.js');
  const helixImporterScript = readFileSync(helixImporterPath, 'utf-8');
  const importScriptContent = readFileSync(importScript, 'utf-8');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text && !text.includes('[vite]')) {
      console.log(`[Browser Console] ${text}`);
    }
  });

  try {
    // Navigate to local server
    console.log('[1/1] Loading cleaned HTML from local server...');
    await page.goto(localUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Check if cards content is present
    const cardsCount = await page.$$eval('.ads-callout-editorial', els => els.length).catch(() => 0);
    console.log(`[1/1] Found ${cardsCount} .ads-callout-editorial elements in cleaned HTML`);

    // Inject Helix importer
    await page.evaluate(script => {
      const originalDefine = window.define;
      if (typeof window.define !== 'undefined') { delete window.define; }
      const scriptEl = document.createElement('script');
      scriptEl.textContent = script;
      document.head.appendChild(scriptEl);
      if (originalDefine) { window.define = originalDefine; }
    }, helixImporterScript);

    // Inject import script
    await page.evaluate(script => {
      const scriptEl = document.createElement('script');
      scriptEl.textContent = script;
      document.head.appendChild(scriptEl);
    }, importScriptContent);

    // Wait for CustomImportScript
    await page.waitForFunction(
      () => typeof window.CustomImportScript !== 'undefined' && window.CustomImportScript?.default,
      { timeout: 10000 }
    );

    // Run the transform - pass the ORIGINAL URL so paths generate correctly
    const result = await page.evaluate(async (originalURL) => {
      const customImportConfig = window.CustomImportScript?.default;
      if (!customImportConfig) throw new Error('CustomImportScript not available');

      const result = await window.WebImporter.html2md(originalURL, document, customImportConfig, {
        toDocx: false, toMd: true, originalURL
      });
      result.html = window.WebImporter.md2da(result.md);
      return result;
    }, originalUrl);

    if (!result.path || !result.html) {
      throw new Error('Transform did not return valid path or HTML.');
    }

    const relativeDocPath = sanitizeDocumentPath(result.path, originalUrl);
    const plainHtmlPath = join(outputDir, `${relativeDocPath}.plain.html`);
    ensureDir(dirname(plainHtmlPath));
    writeFileSync(plainHtmlPath, result.html, 'utf-8');

    // Write report
    const reportsDir = 'tools/importer/reports';
    const reportPath = join(reportsDir, `${relativeDocPath}.report.json`);
    ensureDir(dirname(reportPath));
    writeFileSync(reportPath, JSON.stringify({
      status: 'success', url: originalUrl, path: relativeDocPath,
      timestamp: new Date().toISOString(), ...(result.report || {}),
    }, null, 2), 'utf-8');

    console.log(`[1/1] ✅ Saved content to ${relativeDocPath}`);

  } catch (error) {
    console.error(`[1/1] ❌ Error: ${error.message}`);
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
    server.close();
  }

  console.log('[Local Import] Complete.');
  await compileReportsToExcel(importScript);
}

main().catch(err => {
  console.error('[Local Import] Unexpected error:', err);
  process.exit(1);
});
