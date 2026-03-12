#!/usr/bin/env node

/**
 * Import Runner with Wait-for-Selector Support
 *
 * Wraps the standard bulk import runner, adding a --wait-for-selector option
 * to wait for dynamically loaded content (e.g., Adobe Target) before running
 * the import transform.
 *
 * Usage:
 *   node tools/importer/run-import-with-wait.js \
 *     --import-script path/to/import.bundle.js \
 *     --urls path/to/urls.txt \
 *     --wait-for-selector ".ads-callout-editorial" \
 *     --wait-timeout 15000
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

// Use createRequire to resolve playwright from the plugin's node_modules
const pluginBase = '/home/node/.claude/plugins/cache/excat-marketplace/excat/2.1.1/skills/excat-content-import/scripts/';
const require = createRequire(pluginBase + 'run-bulk-import.js');
const { chromium } = require('playwright');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the compileReportsToExcel function from the plugin scripts
const pluginScriptsDir = join(
  process.env.HOME || '/home/node',
  '.claude/plugins/cache/excat-marketplace/excat/2.1.1/skills/excat-content-import/scripts'
);
const importReportPath = join(pluginScriptsDir, 'import-report.js');
const { compileReportsToExcel } = await import(importReportPath);

const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;
const PAGE_TIMEOUT = 45000;
const DEFAULT_WAIT_TIMEOUT = 15000;
const POPUP_DISMISS_DELAY = 500;
const ESCAPE_KEY_DELAY = 300;

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const value = args[i + 1];
      if (!value || value.startsWith('--')) {
        console.error(`Missing value for ${arg}`);
        process.exit(1);
      }
      parsed[arg] = value;
      i++;
    }
  }

  if (!parsed['--import-script'] || !parsed['--urls']) {
    console.error('Usage: node run-import-with-wait.js --import-script <path> --urls <path> [--wait-for-selector <selector>] [--wait-timeout <ms>]');
    process.exit(1);
  }

  return {
    importScript: resolve(parsed['--import-script']),
    urlsFile: resolve(parsed['--urls']),
    outputDir: resolve(process.cwd(), 'content'),
    waitForSelector: parsed['--wait-for-selector'] || null,
    waitTimeout: parseInt(parsed['--wait-timeout'] || DEFAULT_WAIT_TIMEOUT, 10),
  };
}

function loadUrls(urlFile) {
  const raw = readFileSync(urlFile, 'utf-8');
  return raw.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.startsWith('#'));
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

async function dismissPopups(page) {
  try {
    const dismissSelectors = [
      'button[id*="accept" i]', 'button[id*="cookie" i]',
      'button[class*="accept" i]', 'button[class*="cookie" i]',
      '#onetrust-accept-btn-handler', '.onetrust-close-btn-handler',
      'button[aria-label*="close" i]',
    ];
    for (const selector of dismissSelectors) {
      const elements = await page.$$(selector);
      for (const element of elements) {
        const isVisible = await element.isVisible().catch(() => false);
        if (!isVisible) continue;
        const text = await element.evaluate(el => el.textContent?.toLowerCase() || '');
        if (text.includes('accept') || text.includes('agree') || text.includes('close') || text.includes('ok')) {
          await element.click().catch(() => {});
          await page.waitForTimeout(POPUP_DISMISS_DELAY);
          break;
        }
      }
    }
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(ESCAPE_KEY_DELAY);
  } catch { /* ignore */ }
}

async function randomScroll(page) {
  const scrollCount = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < scrollCount; i++) {
    const scrollAmount = Math.floor(Math.random() * 500) + 200;
    await page.evaluate((amount) => { window.scrollBy(0, amount); }, scrollAmount);
    await page.waitForTimeout(Math.floor(Math.random() * 500) + 200);
  }
}

async function injectScript(page, scriptContent) {
  await page.evaluate(script => {
    const scriptEl = document.createElement('script');
    scriptEl.textContent = script;
    document.head.appendChild(scriptEl);
  }, scriptContent);
}

async function processUrl({ context, url, helixImporterScript, importScriptContent, outputDir, index, total, waitForSelector, waitTimeout }) {
  const label = `[${index}/${total}]`;
  console.log(`${label} Starting ${url}`);

  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text && !text.includes('[vite]') && !text.includes('Download the')) {
      console.log(`[Browser Console] ${text}`);
    }
  });

  // Stealth: override navigator properties
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
  });

  try {
    // Navigate to URL
    try {
      await page.goto(url);
    } catch (error) {
      console.log('⚠️  Falling back to domcontentloaded...');
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT });
      await page.waitForTimeout(3000);
    }

    await dismissPopups(page);
    await randomScroll(page);

    // WAIT FOR DYNAMIC CONTENT if --wait-for-selector was provided
    if (waitForSelector) {
      console.log(`${label} Waiting for dynamic content: ${waitForSelector} (timeout: ${waitTimeout}ms)`);
      try {
        await page.waitForSelector(waitForSelector, { timeout: waitTimeout });
        const count = await page.$$eval(waitForSelector, els => els.length);
        console.log(`${label} ✅ Found ${count} elements matching ${waitForSelector}`);
      } catch (e) {
        console.log(`${label} ⚠️  Selector ${waitForSelector} not found after ${waitTimeout}ms - proceeding anyway`);
      }
    }

    // Inject Helix importer bundle
    await page.evaluate(script => {
      const originalDefine = window.define;
      if (typeof window.define !== 'undefined') { delete window.define; }
      const scriptEl = document.createElement('script');
      scriptEl.textContent = script;
      document.head.appendChild(scriptEl);
      if (originalDefine) { window.define = originalDefine; }
    }, helixImporterScript);

    // Inject the import script
    await injectScript(page, importScriptContent);

    // Wait for CustomImportScript to be available
    try {
      await page.waitForFunction(
        () => typeof window.CustomImportScript !== 'undefined' && window.CustomImportScript?.default,
        { timeout: 10000 }
      );
    } catch (error) {
      throw new Error('CustomImportScript.default not found after 10s.');
    }

    // Run the transform
    const result = await page.evaluate(async pageUrl => {
      if (!window.WebImporter || typeof window.WebImporter.html2md !== 'function') {
        throw new Error('WebImporter not available.');
      }
      const customImportConfig = window.CustomImportScript?.default;
      if (!customImportConfig) {
        throw new Error('CustomImportScript not available.');
      }
      try {
        const result = await window.WebImporter.html2md(pageUrl, document, customImportConfig, {
          toDocx: false, toMd: true, originalURL: pageUrl
        });
        result.html = window.WebImporter.md2da(result.md);
        return result;
      } catch (error) {
        throw new Error(`Failed to import page: ${error.message}`);
      }
    }, url);

    if (!result.path || !result.html) {
      throw new Error('Transform did not return valid path or HTML.');
    }

    const relativeDocPath = sanitizeDocumentPath(result.path, url);
    const plainHtmlPath = join(outputDir, `${relativeDocPath}.plain.html`);
    ensureDir(dirname(plainHtmlPath));
    writeFileSync(plainHtmlPath, result.html, 'utf-8');

    // Write report
    const reportsDir = 'tools/importer/reports';
    const reportPath = join(reportsDir, `${relativeDocPath}.report.json`);
    ensureDir(dirname(reportPath));
    writeFileSync(reportPath, JSON.stringify({
      status: 'success', url, path: relativeDocPath,
      timestamp: new Date().toISOString(), ...(result.report || {}),
    }, null, 2), 'utf-8');

    console.log(`${label} ✅ Saved content to ${relativeDocPath}`);
    return { success: true, path: relativeDocPath };

  } catch (error) {
    console.error(`${label} ❌ Error: ${error.message}`);
    try {
      const reportsDir = 'tools/importer/reports';
      const relDocPath = sanitizeDocumentPath(null, url);
      const reportPath = join(reportsDir, `${relDocPath}.report.json`);
      ensureDir(dirname(reportPath));
      writeFileSync(reportPath, JSON.stringify({
        status: 'error', url, error: error.message, timestamp: new Date().toISOString(),
      }, null, 2), 'utf-8');
    } catch { /* ignore */ }
    return { success: false, error };
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  const { importScript, urlsFile, outputDir, waitForSelector, waitTimeout } = parseArgs();

  if (!existsSync(importScript)) {
    console.error(`Import script not found: ${importScript}`);
    process.exit(1);
  }

  const urls = loadUrls(urlsFile);
  if (urls.length === 0) {
    console.error('URL list is empty.');
    process.exit(1);
  }

  ensureDir(outputDir);

  const helixImporterPath = join(pluginScriptsDir, 'static', 'inject', 'helix-importer.js');
  if (!existsSync(helixImporterPath)) {
    console.error(`helix-importer.js not found at ${helixImporterPath}`);
    process.exit(1);
  }

  const helixImporterScript = readFileSync(helixImporterPath, 'utf-8');
  const importScriptContent = readFileSync(importScript, 'utf-8');

  console.log('[Import with Wait] Starting run with:');
  console.log(`  Import script:     ${importScript}`);
  console.log(`  URLs file:         ${urlsFile}`);
  console.log(`  Output dir:        ${outputDir}`);
  console.log(`  Wait for selector: ${waitForSelector || '(none)'}`);
  console.log(`  Wait timeout:      ${waitTimeout}ms`);
  console.log(`  URL count:         ${urls.length}`);
  console.log('');

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox', '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas',
      '--disable-gpu', '--window-size=1920,1080',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true,
  });

  let successCount = 0;

  try {
    for (let i = 0; i < urls.length; i++) {
      if (i > 0) {
        await new Promise(r => setTimeout(r, Math.floor(Math.random() * 2000) + 1000));
      }
      const result = await processUrl({
        context, url: urls[i], helixImporterScript, importScriptContent,
        outputDir, index: i + 1, total: urls.length, waitForSelector, waitTimeout,
      });
      if (result.success) successCount++;
    }
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  console.log(`[Import with Wait] Completed. Success: ${successCount}/${urls.length}, Failures: ${urls.length - successCount}`);
  await compileReportsToExcel(importScript);
}

main().catch(err => {
  console.error('[Import with Wait] Unexpected error:', err);
  process.exit(1);
});
