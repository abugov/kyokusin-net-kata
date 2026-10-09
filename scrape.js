const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeKyokushin() {
  console.log('Starting headless Chrome scraper...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Force English in browser context before Elm initializes
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.setItem('settings', JSON.stringify({ language: 'en', saveEmail: '', saveEmailFlg: false }));
      } catch (e) {}
    });

    const targetUrl = 'https://www.kyokushin.net/search-result?category=hesWJFxSJEaAHwfnbbSn&s=&lang=en';
    console.log('Navigating to:', targetUrl);
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Click English switch if present or trigger Elm language change
    try {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button, a, span, div, li'));
        const eng = btns.find(b => b.innerText && b.innerText.trim() === 'Eng');
        if (eng) eng.click();
      });
      await new Promise(r => setTimeout(r, 2000));
    } catch(e) {
      console.log('Note: English button step skipped');
    }

    // Scroll to load all videos
    console.log('Scrolling down to trigger infinite scroll...');
    let lastHeight = 0;
    for (let i = 0; i < 30; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(r => setTimeout(r, 800));
      const currentHeight = await page.evaluate(() => document.body.scrollHeight);
      if (currentHeight === lastHeight && i > 3) break;
      lastHeight = currentHeight;
    }

    // Extract all video cards
    const videos = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a[href*='/video/']"));
      const seen = new Set();
      const list = [];
      for (const a of links) {
        const href = a.href;
        if (seen.has(href)) continue;
        seen.add(href);
        const idMatch = href.match(/video\/(\d+)/);
        const id = idMatch ? idMatch[1] : '';
        const text = a.innerText.trim();
        const isPrime = text.includes('PRIME');
        const isMember = text.includes('MEMBER');
        const cleanTitle = text.replace(/^(PRIME|MEMBER)\s*/g, '').trim();
        if (!id || !cleanTitle) continue;
        list.push({
          id,
          title: cleanTitle,
          url: href,
          badge: isPrime ? 'PRIME' : (isMember ? 'MEMBER' : '')
        });
      }
      return list;
    });

    console.log(`Scraped ${videos.length} videos.`);
    if (videos.length > 0) {
      fs.writeFileSync('./kata_links.json', JSON.stringify(videos, null, 2));
      console.log('Successfully updated kata_links.json');
    } else {
      console.warn('Warning: Scraper returned 0 videos, keeping existing dataset.');
    }
  } catch (err) {
    console.error('Scraper encountered an error:', err.message);
  } finally {
    await browser.close();
  }
}

scrapeKyokushin();
