// ============================================================
// OTONOM — Pré-rendu de la cinématique mobile.
// Pilote la scène en mode ?capture et exporte N frames WebP
// portrait dans public/cinematic/. Lancé au build (CPU/SwiftShader).
// ============================================================
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';

const URL = (process.env.URL || 'http://localhost:4173/') + '?capture=1';
const N = parseInt(process.env.FRAMES || '36', 10);
const OUT = 'public/cinematic';
const QUALITY = parseInt(process.env.QUALITY || '82', 10);
mkdirSync(OUT, { recursive: true });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});

const page = await browser.newPage();
// portrait, 9:16 — output 900x1600
await page.setViewport({ width: 450, height: 800, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.log('EXC:', e.message));
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 45000 });

// wait for the capture hook
await page.waitForFunction('window.__cap && window.__cap.ready', { timeout: 30000 });
const canvas = await page.$('#stage canvas');

const only = process.env.ONLY ? parseInt(process.env.ONLY, 10) : null;
for (let i = 0; i < N; i++) {
  if (only !== null && i !== only) continue;
  const p = N === 1 ? 0 : i / (N - 1);
  await page.evaluate((pp) => window.__cap.setProgress(pp), p);
  await wait(220); // let SwiftShader settle the frame
  const name = `${OUT}/frame-${String(i).padStart(2, '0')}.webp`;
  await canvas.screenshot({ path: name, type: 'webp', quality: QUALITY });
  process.stdout.write(`frame ${i + 1}/${N}\r`);
}
console.log(`\n${only !== null ? '1' : N} frame(s) → ${OUT}`);
await browser.close();
