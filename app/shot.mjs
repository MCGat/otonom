import puppeteer from 'puppeteer';

const URL = process.env.URL || 'http://localhost:4173/';
const launch = {
  headless: 'new',
  args: [
    '--no-sandbox', '--disable-setuid-sandbox',
    '--use-gl=angle', '--use-angle=swiftshader',
    '--enable-webgl', '--ignore-gpu-blocklist',
  ],
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch(launch);

// ---------- DESKTOP ----------
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.log('EXC:', e.message));
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(2600);
  await page.screenshot({ path: 'shot-composed.png' });
  console.log('desktop composed done');

  // hover the FLOTTE hotspot to reveal the rich popover
  try {
    await page.hover('.hotspot[data-id="flotte"] .hotspot__pin');
    await wait(700);
    await page.screenshot({ path: 'shot-card.png' });
    console.log('desktop card done');
  } catch (e) { console.log('hover failed:', e.message); }

  // explode
  await page.click('#cta-explode');
  await wait(2000);
  await page.screenshot({ path: 'shot-exploded.png' });
  console.log('desktop exploded done');
  await page.close();
}

// ---------- MOBILE ----------
{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page.on('pageerror', (e) => console.log('M-EXC:', e.message));
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(2600);
  await page.screenshot({ path: 'shot-mobile.png' });
  console.log('mobile hero done');

  // start the guided tour -> camera flies + bottom sheet opens
  try {
    await page.click('#cta-explode');
    await wait(2200);
    await page.screenshot({ path: 'shot-mobile-tour.png' });
    console.log('mobile tour done');
  } catch (e) { console.log('mobile tour failed:', e.message); }
  await page.close();
}

await browser.close();
