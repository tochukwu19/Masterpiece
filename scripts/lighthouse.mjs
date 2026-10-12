import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import * as chromeLauncher from 'chrome-launcher';

const base = (process.env.LH_BASE || 'http://127.0.0.1:9292').replace(/\/$/, '');
const outDir = join(process.cwd(), '.lighthouse');
const thresholds = { performance: 60, accessibility: 90 };
const categories = ['performance', 'accessibility', 'best-practices'];

const lockedMessage = 'The storefront is showing its password page. Unlock it in the browser, then run again.';

const assertUnlocked = async () => {
  const response = await fetch(`${base}/`, { redirect: 'manual' });
  if (response.status >= 300 && response.status < 400 && response.headers.get('location')?.includes('/password')) {
    throw new Error(lockedMessage);
  }
};

const firstProductPath = async () => {
  const response = await fetch(`${base}/products.json?limit=1`);
  const { products } = await response.json();
  if (!products?.length) throw new Error(`No products found at ${base}/products.json`);
  return `/products/${products[0].handle}`;
};

await assertUnlocked();

const pages = [
  ['home', '/'],
  ['collection', process.env.LH_COLLECTION || '/collections/all'],
  ['product', process.env.LH_PRODUCT || (await firstProductPath())],
];

const formFactors = [
  ['mobile', undefined],
  ['desktop', desktopConfig],
];

mkdirSync(outDir, { recursive: true });
const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new'] });
const rows = [];

try {
  for (const [formFactor, config] of formFactors) {
    for (const [name, path] of pages) {
      const url = `${base}${path}`;
      const result = await lighthouse(
        url,
        { port: chrome.port, output: 'html', onlyCategories: categories, logLevel: 'error', disableStorageReset: true },
        config
      );
      if (new URL(result.lhr.finalDisplayedUrl).pathname.startsWith('/password')) {
        throw new Error(`${url}: ${lockedMessage}`);
      }
      const scores = Object.fromEntries(categories.map((id) => [id, Math.round(result.lhr.categories[id].score * 100)]));
      writeFileSync(join(outDir, `${name}-${formFactor}.html`), result.report);
      rows.push({ formFactor, page: name, path, ...scores });
      console.log(`${formFactor.padEnd(8)} ${name.padEnd(11)} perf ${String(scores.performance).padStart(3)}  a11y ${String(scores.accessibility).padStart(3)}  bp ${String(scores['best-practices']).padStart(3)}  ${path}`);
    }
  }
} finally {
  await chrome.kill();
}

let failed = false;
for (const [formFactor] of formFactors) {
  const subset = rows.filter((row) => row.formFactor === formFactor);
  const average = (id) => Math.round(subset.reduce((sum, row) => sum + row[id], 0) / subset.length);
  const perf = average('performance');
  const a11y = average('accessibility');
  const pass = perf >= thresholds.performance && a11y >= thresholds.accessibility;
  if (!pass) failed = true;
  console.log(`${formFactor} average: performance ${perf} (min ${thresholds.performance}), accessibility ${a11y} (min ${thresholds.accessibility}) ${pass ? 'PASS' : 'FAIL'}`);
}
console.log(`Reports: ${outDir}`);
process.exitCode = failed ? 1 : 0;
