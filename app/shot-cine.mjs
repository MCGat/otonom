import puppeteer from 'puppeteer';
const URL = process.env.URL || 'http://localhost:4173/';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('EXC:', e.message));
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 45000 });
await wait(1500);

const positions = [
  { name: 'cine-0', p: 0.0 },
  { name: 'cine-1', p: 0.45 },
  { name: 'cine-2', p: 0.78 },
];
const total = await page.evaluate(() => document.querySelector('.cine').offsetHeight - window.innerHeight);
for (const s of positions) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * s.p));
  await wait(700);
  await page.screenshot({ path: `shot-${s.name}.png` });
  console.log(s.name, 'done');
}
// the postes cards, far below
await page.evaluate(() => window.scrollTo(0, document.querySelector('.cine__postes').offsetTop));
await wait(600);
await page.screenshot({ path: 'shot-cine-cards.png' });
console.log('cards done');
await browser.close();
