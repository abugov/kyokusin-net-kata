const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const puppeteer = require('puppeteer');
const assert = require('node:assert/strict');

const ROOT_DIR = path.resolve(__dirname, '..');
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

// Simple static HTTP server for tests
function createServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png'
  };

  return http.createServer((req, res) => {
    const reqUrl = req.url.split('?')[0];
    const safePath = path.normalize(reqUrl).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(ROOT_DIR, safePath === '/' ? 'index.html' : safePath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(data);
    });
  });
}

async function runE2ETests() {
  console.log('--- Starting Puppeteer Browser E2E Test Suite ---');
  let server = null;
  let browser = null;

  try {
    server = createServer();
    // Dynamic port assignment to avoid port collision in CI / parallel runs
    await new Promise((resolve) => server.listen(0, resolve));
    const PORT = server.address().port;
    console.log(`Test server listening on dynamic port http://127.0.0.1:${PORT}`);

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    // =========================================================================
    // Scenario 1: Full UI Controls, Layout Alignment & Filtering
    // =========================================================================
    console.log('\n[Scenario 1] Testing UI Controls, Alignment & Filter Text...');
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.kata-card', { timeout: 5000 });

    // 1. Verify "All" category button is completely removed
    const btnAllCategory = await page.$('#btn-ALL');
    assert.equal(btnAllCategory, null, 'Redundant category btn-ALL must not exist');

    // 2. Verify "New" button is right-aligned to match the search box
    const searchBoxRight = await page.$eval('.search-box', el => el.getBoundingClientRect().right);
    const btnNewRight = await page.$eval('#btn-NEW', el => el.getBoundingClientRect().right);
    console.log(`Search Box right: ${searchBoxRight}, New Button right: ${btnNewRight}`);
    assert.ok(
      Math.abs(searchBoxRight - btnNewRight) <= 5,
      `New button right edge (${btnNewRight}) must align with search box right edge (${searchBoxRight})`
    );

    // 3. Verify Stats text format: "Showing 55 Kata videos out of 104"
    const statsInitial = await page.$eval('#statsBar', el => el.innerText);
    console.log('Initial stats text:', statsInitial);
    assert.ok(
      /^Showing \d+ Kata videos out of \d+$/.test(statsInitial),
      `Stats text must match format "Showing X Kata videos out of Y", got: "${statsInitial}"`
    );

    // 4. Verify Belt filtering updates stats text
    await page.click('[data-belt="Brown"]');
    await new Promise(r => setTimeout(r, 200));
    const statsBrown = await page.$eval('#statsBar', el => el.innerText);
    console.log('Brown belt stats text:', statsBrown);
    assert.ok(
      /^Showing \d+ Brown belt kata videos out of \d+$/.test(statsBrown),
      `Brown belt stats must follow pattern, got: "${statsBrown}"`
    );

    // 5. Verify Misc category (renamed from REST)
    await page.click('[data-belt="ALL"]');
    await page.click('#btn-MISC');
    await new Promise(r => setTimeout(r, 200));
    const statsMisc = await page.$eval('#statsBar', el => el.innerText);
    console.log('Misc stats text:', statsMisc);
    assert.ok(
      statsMisc.includes('Misc videos out of'),
      `Misc stats must mention Misc videos, got: "${statsMisc}"`
    );

    // 6. Verify Tip Modal flow & Stop showing persistence
    await page.click('#btn-KATA');
    await new Promise(r => setTimeout(r, 200));
    const firstCard = await page.$('.kata-card');
    await firstCard.click();
    await new Promise(r => setTimeout(r, 200));

    const modalDisplay = await page.$eval('#tipModal', el => getComputedStyle(el).display);
    assert.equal(modalDisplay, 'flex', 'Tip modal must be visible on card click');

    // Check "Stop showing this" and click Continue
    await page.click('#stopShowingTip');
    await page.click('#tipModal .btn-action.continue');
    await new Promise(r => setTimeout(r, 200));

    const modalAfter = await page.$eval('#tipModal', el => getComputedStyle(el).display);
    assert.equal(modalAfter, 'none', 'Tip modal must close after Continue');

    const hideTipStorage = await page.evaluate(() => localStorage.getItem('kyokushin_hide_tip'));
    assert.equal(hideTipStorage, 'true', 'localStorage kyokushin_hide_tip must be set to "true"');

    console.log('✅ Scenario 1 Passed successfully!');

    // =========================================================================
    // Scenario 2: Configurable Background Beacon Check (No Prod DB Mutation)
    // =========================================================================
    console.log('\n[Scenario 2] Testing Background Beacon Polling via Configurable Parameters...');

    const activeLinksPath = path.join(FIXTURES_DIR, 'active-links.json');
    const activeStatusPath = path.join(FIXTURES_DIR, 'active-status.json');

    // Baseline catalog: all videos older than 2 months
    const oldDate = '2025-01-01';
    const initialTestVideos = [
      { id: '9001', title: 'Kyokushin Kata Revision 2020 : SAIFA', url: 'https://kyokushin.net/video/9001', firstSeen: oldDate },
      { id: '9002', title: 'Kyokushin Kata: Bassai', url: 'https://kyokushin.net/video/9002', firstSeen: oldDate }
    ];
    fs.writeFileSync(activeLinksPath, JSON.stringify(initialTestVideos, null, 2));

    const initialHash = crypto.createHash('sha256').update(JSON.stringify(initialTestVideos)).digest('hex').slice(0, 16);
    fs.writeFileSync(activeStatusPath, JSON.stringify({ _comment: 'test', hash: initialHash }, null, 2));

    // Open page with configured test endpoints and 250ms polling interval
    const testUrl = `http://127.0.0.1:${PORT}/?statusUrl=/test/fixtures/active-status.json&linksUrl=/test/fixtures/active-links.json&pollInterval=250`;
    await page.goto(testUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.kata-card', { timeout: 5000 });

    // Initially, "New" button should NOT be active (no videos younger than 2 months)
    const isNewActiveInitially = await page.$eval('#btn-NEW', b => b.classList.contains('is-new-active'));
    assert.equal(isNewActiveInitially, false, 'New button must NOT be green initially when no videos < 2 months');

    // Step A: Catalog changes, but NO new videos (< 2 months) added (e.g. title typo fix)
    console.log('Simulating catalog update with typo fix only (no videos < 2 months)...');
    const updatedTyposOnly = [
      { id: '9001', title: 'Kyokushin Kata Revision 2020 : SAIFA (HD)', url: 'https://kyokushin.net/video/9001', firstSeen: oldDate },
      { id: '9002', title: 'Kyokushin Kata: Bassai', url: 'https://kyokushin.net/video/9002', firstSeen: oldDate }
    ];
    fs.writeFileSync(activeLinksPath, JSON.stringify(updatedTyposOnly, null, 2));
    const typoHash = crypto.createHash('sha256').update(JSON.stringify(updatedTyposOnly)).digest('hex').slice(0, 16);
    fs.writeFileSync(activeStatusPath, JSON.stringify({ _comment: 'test', hash: typoHash }, null, 2));

    // Wait for at least one polling cycle to run
    await new Promise(r => setTimeout(r, 600));
    const isNewActiveAfterTypo = await page.$eval('#btn-NEW', b => b.classList.contains('is-new-active'));
    assert.equal(
      isNewActiveAfterTypo,
      false,
      'New button must REMAIN OFF when catalog hash changes but NO videos are younger than 2 months'
    );
    console.log('Confirmed: New button stayed OFF when change did not include young videos.');

    // Step B: Catalog updates WITH a video younger than 2 months
    console.log('Simulating catalog update with newly discovered video (< 2 months)...');
    const today = new Date().toISOString().slice(0, 10);
    const updatedWithNewVideo = [
      ...updatedTyposOnly,
      { id: '9003', title: 'Kyokushin Kata: Garyu', url: 'https://kyokushin.net/video/9003', firstSeen: today }
    ];
    fs.writeFileSync(activeLinksPath, JSON.stringify(updatedWithNewVideo, null, 2));
    const newVideoHash = crypto.createHash('sha256').update(JSON.stringify(updatedWithNewVideo)).digest('hex').slice(0, 16);
    fs.writeFileSync(activeStatusPath, JSON.stringify({ _comment: 'test', hash: newVideoHash }, null, 2));

    // Wait deterministically for polling to detect the change and turn the button green
    await page.waitForFunction(
      () => {
        const el = document.getElementById('btn-NEW');
        return el && el.classList.contains('is-new-active');
      },
      { polling: 100, timeout: 5000 }
    );

    const isNewActiveNow = await page.$eval('#btn-NEW', b => b.classList.contains('is-new-active'));
    const newBtnTitle = await page.$eval('#btn-NEW', b => b.getAttribute('title') || '');
    assert.equal(isNewActiveNow, true, 'New button MUST turn green (.is-new-active) when new video exists');
    assert.ok(newBtnTitle.includes('New videos available'), 'New button must display reload tooltip');
    console.log('Confirmed: New button turned green with reload tooltip!');

    console.log('✅ Scenario 2 Passed successfully!');

  } finally {
    // Cleanup temporary test fixtures
    try {
      fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
    } catch (e) {}

    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
    if (server) {
      try { await new Promise(resolve => server.close(resolve)); } catch (e) {}
    }
    console.log('Test server and browser closed cleanly.');
  }

  console.log('\n🎉 ALL E2E BROWSER TESTS PASSED!');
}

runE2ETests().catch(err => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
