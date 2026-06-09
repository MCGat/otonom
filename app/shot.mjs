import puppeteer from 'puppeteer';

const URL = process.env.URL || 'http://localhost:4173/';
const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox', '--disable-setuid-sandbox',
    '--use-gl=angle', '--use-angle=swiftshader',
    '--enable-webgl', '--ignore-gpu-blocklist',
    '--window-size=1600,1000',
  ],
});
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERR:', m.text()); });
page.on('pageerror', (e) => console.log('PAGE EXC:', e.message));

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
// give the scene a few frames to light up
await new Promise((r) => setTimeout(r, 2500));
await page.screenshot({ path: 'shot-composed.png' });
console.log('composed shot done');

// trigger explode
await page.click('#cta-explode');
await new Promise((r) => setTimeout(r, 2200));
await page.screenshot({ path: 'shot-exploded.png' });
console.log('exploded shot done');

await browser.close();
