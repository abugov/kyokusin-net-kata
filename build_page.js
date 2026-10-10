const fs = require('fs');
const videos = JSON.parse(fs.readFileSync('./kata_links.json', 'utf8'));

// The 28 canonical katas in requested order with order index, belts, stripes & matching keywords (English & Japanese)
const KATA_MAP = [
  { order: 1, name: "Taikyoku Sono Ichi", belt: "White", stripe: "", keywords: ["taikyoku sono ichi", "taikyoku sonoichi", "太極その1", "太極その一", "太極その１", "太極其の一"] },
  { order: 2, name: "Taikyoku Sono Ni", belt: "White", stripe: "", keywords: ["taikyoku sono ni", "taikyoku sononi", "太極その2", "太極その二", "太極その２", "太極其の二"] },
  { order: 3, name: "Sokugi Taikyoku Sono Ichi", belt: "White", stripe: "", keywords: ["sokugi taikyoku sono ichi", "sokugi taikyoku sonoichi", "足技太極その1", "足技太極その一", "足技太極その１"] },
  { order: 4, name: "Taikyoku Sono San", belt: "Orange", stripe: "", keywords: ["taikyoku sono san", "taikyoku sonosan", "太極その3", "太極その三", "太極その３", "太極其の三"] },
  { order: 5, name: "Sokugi Taikyoku Sono Ni", belt: "Orange", stripe: "blue", keywords: ["sokugi taikyoku sono ni", "sokugi taikyoku sononi", "足技太極その2", "足技太極その二", "足技太極その２"] },
  { order: 6, name: "Sokugi Taikyoku Sono San", belt: "Orange", stripe: "blue", keywords: ["sokugi taikyoku sono san", "sokugi taikyoku sonosan", "足技太極その3", "足技太極その三", "足技太極その３"] },
  { order: 7, name: "Pinan Sono Ichi", belt: "Blue", stripe: "", keywords: ["pinan sono ichi", "pinan sonoichi", "平安その1", "平安その一", "平安その１"] },
  { order: 8, name: "Pinan Sono Ni", belt: "Blue", stripe: "", keywords: ["pinan sono ni", "pinan sononi", "平安その2", "平安その二", "平安その２"] },
  { order: 9, name: "Sanchin", belt: "Blue", stripe: "yellow", keywords: ["sanchin", "三戦", "サンチン"] },
  { order: 10, name: "Pinan Sono San", belt: "Yellow", stripe: "", keywords: ["pinan sono san", "pinan sonosan", "平安その3", "平安その三", "平安その３"] },
  { order: 11, name: "Yantsu", belt: "Yellow", stripe: "", keywords: ["yantsu", "安三", "ヤンツ"] },
  { order: 12, name: "Pinan Sono Yon", belt: "Yellow", stripe: "green", keywords: ["pinan sono yon", "pinan sonoyon", "平安その4", "平安その四", "平安その４"] },
  { order: 13, name: "Tsuki no Kata", belt: "Yellow", stripe: "green", keywords: ["tsuki no kata", "tsukinokata", "tsukino kata", "突きの型"] },
  { order: 14, name: "Pinan Sono Go", belt: "Green", stripe: "", keywords: ["pinan sono go", "pinan sonogo", "平安その5", "平安その五", "平安その５"] },
  { order: 15, name: "Gekisai sono ichi", belt: "Green", stripe: "", keywords: ["gekisai sono ichi", "gekisai sonoichi", "撃砕その1", "撃砕その一", "撃砕その１", "撃砕其の一"] },
  { order: 16, name: "Gekisai sono ni", belt: "Green", stripe: "brown", keywords: ["gekisai sono ni", "gekisai sononi", "撃砕その2", "撃砕その二", "撃砕その２", "撃砕其の二"] },
  { order: 17, name: "Tekki sono ichi", belt: "Green", stripe: "brown", keywords: ["tekki sono ichi", "tekki sonoichi", "鉄騎その1", "鉄騎その一", "鉄騎その１", "鉄騎其の一"] },
  { order: 18, name: "Gekisai sono san", belt: "Brown", stripe: "", keywords: ["gekisai sono san", "gekisai sonosan", "gekisai sono ni & sono san", "gekisai shou", "撃砕その3", "撃砕その三", "撃砕その３", "撃砕小"] },
  { order: 19, name: "Tekki sono ni", belt: "Brown", stripe: "", keywords: ["tekki sono ni", "tekki sononi", "鉄騎その2", "鉄騎その二", "鉄騎その２", "鉄騎其の二"] },
  { order: 20, name: "Saifa", belt: "Brown", stripe: "black", keywords: ["saifa", "最破", "サイファ", "サイハ"] },
  { order: 21, name: "Garyu", belt: "Dan 1", stripe: "dan-1", keywords: ["garyu", "臥龍", "臥竜", "ガリュウ"] },
  { order: 22, name: "Seienchin", belt: "Dan 1", stripe: "dan-1", keywords: ["seienchin", "征遠鎮", "セイエンチン"] },
  { order: 23, name: "Bassai", belt: "Dan 1", stripe: "dan-1", keywords: ["bassai", "抜塞", "バッサイ"] },
  { order: 24, name: "Tekki sono san", belt: "Dan 1", stripe: "dan-1", keywords: ["tekki sono san", "tekki sonosan", "鉄騎その3", "鉄騎その三", "鉄騎その３", "鉄騎其の三"] },
  { order: 25, name: "Seipai", belt: "Dan 2", stripe: "dan-2", keywords: ["seipai", "十八", "セーパイ", "セイパイ"] },
  { order: 26, name: "Kanku", belt: "Dan 3", stripe: "dan-3", keywords: ["kanku", "観空", "カンクウ"] },
  { order: 27, name: "Sushiho", belt: "Dan 4", stripe: "dan-4", keywords: ["sushiho", "五十四歩", "スーシーホ"] },
  { order: 28, name: "Tensho", belt: "Dan 5", stripe: "dan-5", keywords: ["tensho", "転掌", "テンショウ"] }
];

function parseStripe(stripeValue) {
  if (!stripeValue) return null;
  const s = String(stripeValue).trim().toLowerCase();
  if (!s) return null;

  const danMatch = s.match(/^dan-(\d+)$/);
  if (danMatch) {
    const count = parseInt(danMatch[1], 10);
    return {
      type: 'gold',
      colorClass: 'stripe-gold',
      count: count,
      label: `${count} golden stripe${count > 1 ? 's' : ''}`
    };
  }

  if (s === 'black') {
    return {
      type: 'black',
      colorClass: 'stripe-black',
      count: 1,
      label: 'Black stripe'
    };
  }

  return {
    type: s,
    colorClass: `stripe-${s}`,
    count: 1,
    label: `${s.charAt(0).toUpperCase() + s.slice(1)} stripe`
  };
}

function matchKatas(title) {
  const t = title.toLowerCase();
  const matched = [];
  for (const k of KATA_MAP) {
    let hasMatch = false;
    for (const kw of k.keywords) {
      const kwLower = kw.toLowerCase();
      if (kwLower.startsWith("taikyoku") && t.includes("sokugi " + kwLower)) continue;
      if (kwLower.startsWith("太極") && t.includes("足技" + kwLower)) continue;
      if (/^[a-z0-9 ]+$/.test(kwLower)) {
        const reg = new RegExp("(^|[^a-z0-9])" + kwLower + "([^a-z0-9]|$)", "i");
        if (reg.test(t)) { hasMatch = true; break; }
      } else {
        if (t.includes(kwLower)) { hasMatch = true; break; }
      }
    }
    if (hasMatch) matched.push(k);
  }
  return matched;
}

const expandedCards = [];
videos.forEach((item, originalIdx) => {
  const matchedList = matchKatas(item.title);
  if (matchedList.length > 0) {
    matchedList.forEach((matched, subIdx) => {
      expandedCards.push({
        item,
        matched,
        originalIdx,
        subIdx,
        isMultiKata: matchedList.length > 1
      });
    });
  } else {
    expandedCards.push({
      item,
      matched: null,
      originalIdx,
      subIdx: 0,
      isMultiKata: false
    });
  }
});

const cardsHtml = expandedCards.map(({ item, matched, originalIdx, subIdx, isMultiKata }) => {
  const isSeminar = /seminar/i.test(item.title) || /講習会|セミナー/i.test(item.title);
  const isBunkai = /bunkai|分解/i.test(item.title);
  const isKata = !!matched;
  const isMainKata = isKata && !isSeminar && !isBunkai;

  const badgeHtml = item.badge ? `<span class="badge ${item.badge.toLowerCase()}">${item.badge}</span>` : '';
  const safeTitle = item.title.replace(/"/g, '&quot;');
  
  // Tags: Kata belt badge (with stripe indicator if applicable) + Seminar tag + Bunkai tag
  let beltHtml = '';
  if (matched) {
    const beltClass = matched.belt.toLowerCase().replace(/\s+/g, '-');
    const stripeInfo = parseStripe(matched.stripe);
    if (stripeInfo) {
      const stripesSpans = Array.from({ length: stripeInfo.count }, () =>
        `<span class="belt-stripe ${stripeInfo.colorClass}"></span>`
      ).join('');
      const stripesContainer = `<span class="belt-stripes-container" title="${stripeInfo.label}">${stripesSpans}</span>`;
      beltHtml = `<span class="belt-badge belt-${beltClass} has-stripe stripe-count-${stripeInfo.count}">${matched.name}${stripesContainer}</span>`;
    } else {
      beltHtml = `<span class="belt-badge belt-${beltClass}">${matched.name}</span>`;
    }
  }
  const seminarHtml = isSeminar ? `<span class="tag-seminar">Seminar</span>` : '';
  const bunkaiHtml = isBunkai ? `<span class="tag-bunkai">Bunkai</span>` : '';

  const headerHtml = (beltHtml || seminarHtml || bunkaiHtml || badgeHtml) ? `
          <div class="card-header">
            <div class="header-left">
              ${beltHtml}
              ${seminarHtml}
              ${bunkaiHtml}
            </div>
            <div class="header-right">
              ${badgeHtml}
            </div>
          </div>` : '';

  // Calculate extra tag count: Bunkai and Seminar tags
  const extraTagCount = (isBunkai ? 1 : 0) + (isSeminar ? 1 : 0);

  // Search keywords: in Kata view, search base seminar title + matched kata name & keywords
  const baseTitle = item.title.replace(/\s*\([^)]*\)\s*$/, "").trim() || item.title;
  const kataSearchText = (isMultiKata && matched)
    ? `${baseTitle} ${matched.name} ${matched.keywords.join(' ')}`.toLowerCase()
    : safeTitle.toLowerCase();

  return `      <div class="kata-card${isMainKata ? ' is-main-kata' : ''}" 
           data-id="${item.id}"
           data-href="${item.url}" 
           data-badge="${item.badge || ''}" 
           data-title="${safeTitle.toLowerCase()}" 
           data-kata-search="${kataSearchText.replace(/"/g, '&quot;')}"
           data-is-kata="${isKata ? '1' : '0'}"
           data-is-main="${isMainKata ? '1' : '0'}"
           data-is-seminar="${isSeminar ? '1' : '0'}"
           data-is-bunkai="${isBunkai ? '1' : '0'}"
           data-is-multi="${isMultiKata ? '1' : '0'}"
           data-kata-name="${matched ? matched.name : ''}"
           data-belt="${matched ? matched.belt : ''}"
           data-stripe="${matched ? (matched.stripe || '') : ''}"
           data-order="${matched ? matched.order : 999}"
           data-extra-tags="${extraTagCount}"
           data-original-index="${originalIdx}"
           data-sub-index="${subIdx}"
           onclick="handleCardClick(this)">
        <div class="card-main">
${headerHtml}
          <div class="kata-title">${safeTitle}</div>
        </div>
      </div>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kyokushin Training Quick Search</title>

  <!-- Mobile & PWA meta tags for Android Chrome "Add to Home screen" & standalone shortcut -->
  <meta name="theme-color" content="#0d1117">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Kyokushin">
  <meta name="application-name" content="Kyokushin">

  <!-- App Manifest & Icons -->
  <link rel="manifest" href="./manifest.json">
  <link rel="icon" type="image/svg+xml" href="./favicon.svg">
  <link rel="icon" type="image/png" sizes="192x192" href="./icon-192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="./icon-512.png">
  <link rel="apple-touch-icon" href="./icon-192.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!--
    =============================================================================================
    [AGENT_INSTRUCTION_GUIDE: KATA_MAP & KEYWORD MATCHING RULES]
    When updating kata keywords or scraping new video catalogs for this repository:
    1. NUMBER SPACING ("Sono Ichi" vs "Sonoichi"):
       Official Kyokushin Online video titles fluctuate between spaced ("SONO ICHI", "SONO NI")
       and non-spaced compound words ("SONOICHI", "SONONI"). Both MUST be retained in keywords:
       e.g., ["gekisai sono ichi", "gekisai sonoichi"], ["pinan sono ni", "pinan sononi"].
    2. COMPOUND KATA NAMES ("Tsuki no Kata"):
       Appears both as spaced "Tsuki no KATA" (seminars) and single word "TSUKINOKATA" (revision 2020).
       Always match: ["tsuki no kata", "tsukinokata", "tsukino kata"].
    3. ALTERNATIVE JAPANESE ALIASES:
       Some Katas have formal revision aliases (e.g. "GEKISAI SONO SAN(GEKISAI SHOU)").
       Always map aliases like "gekisai shou" to the canonical "Gekisai sono san" entry.
    4. PREVENTING FALSE POSITIVES (Sokugi vs Standard Taikyoku):
       Never use loose substring search for "Taikyoku Sono...". Always check that it is NOT preceded
       by "Sokugi" so Sokugi and Standard Taikyoku entries remain correctly classified in their
       respective belts (White vs Orange).
    5. CANONICAL BELT PROGRESSION & STRIPES:
       Keep the strict 1 to 28 sequential order as defined in KATA_MAP (White -> Orange -> Blue ->
       Yellow -> Green -> Brown -> Dan 1 -> Dan 2 -> Dan 3 -> Dan 4 -> Dan 5).
       Belt stripes are explicitly defined in KATA_MAP ('', 'blue', 'dan-1', 'dan-2'...) with golden stripes for Dan ranks.
       In the Kata filter, cards are ordered by Kata canonical order, then by fewer tags first
       (plain kata video before [Bunkai] before [Seminar]).
    6. MAIN KATA DEMONSTRATION VIDEO ACCENT:
       The primary demonstration video for each Kata (i.e. isKata and not Seminar and not Bunkai)
       is styled with an amber left spine border (.is-main-kata) to immediately stand out.
    7. MULTI-KATA SEMINARS (OPTION 2 DUPLICATION):
       Some seminar videos cover multiple katas (e.g., Gekisai sono ni, Gekisai sono san, Saifa...).
       In the KATA view, these videos are expanded into duplicate card instances, one for each kata covered,
       positioned under that specific kata with its belt badge.
       In SEMINAR and ALL views, duplicate cards are de-duplicated (subIdx === 0) so each video appears once.
       kata_links.json MUST remain virgin.
    =============================================================================================
  -->

  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --card-hover: #1f2937;
      --border: #30363d;
      --text: #e6edf3;
      --text-muted: #8b949e;
      --accent: #e50914;
      --badge-prime: #f59e0b;
      --badge-member: #3b82f6;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 2.5rem 1.5rem;
      line-height: 1.5;
    }

    .container {
      max-width: 1040px;
      margin: 0 auto;
    }

    header {
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 1rem;
    }

    h1 {
      font-family: 'Cinzel', serif;
      font-size: 2.1rem;
      letter-spacing: 0.04em;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      white-space: nowrap;
    }

    h1 span.kanji {
      color: var(--accent);
      font-size: 1.15em;
      line-height: 1;
      white-space: nowrap;
      flex-shrink: 0;
      display: inline-flex;
    }

    .qs-pill-turbo {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 0.52em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.22em 0.75em;
      border-radius: 9999px;
      background: rgba(245, 158, 11, 0.14);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.45);
      box-shadow: 0 0 14px rgba(245, 158, 11, 0.25);
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      vertical-align: middle;
      white-space: nowrap;
      flex-shrink: 0;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .qs-pill-turbo:hover {
      background: rgba(245, 158, 11, 0.22);
      border-color: rgba(245, 158, 11, 0.7);
      box-shadow: 0 0 18px rgba(245, 158, 11, 0.45);
      color: #fde047;
      text-decoration: none;
    }

    .meta {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-top: 0.4rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .source-link {
      color: #58a6ff;
      text-decoration: none;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      margin-top: 0.5rem;
    }

    .source-link:hover {
      text-decoration: underline;
    }

    .controls {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 250px;
      padding: 0.75rem 1rem;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-box:focus {
      border-color: #58a6ff;
    }

    .toolbar-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .filter-tags {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      background: var(--card-bg);
      color: var(--text-muted);
      border: 1px solid var(--border);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      background: #21262d;
      color: #fff;
      border-color: #8b949e;
    }

    .filter-btn.active {
      background: #21262d;
      color: #fff;
      font-weight: 600;
      border-color: #58a6ff;
      box-shadow: 0 0 0 1px #58a6ff;
    }

    /* Sub-row for Belt Colors without label */
    .belt-filter-row {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 0.85rem;
      padding: 0.5rem 0.25rem;
      align-items: center;
      transition: all 0.25s ease;
    }

    .belt-btn {
      border: 1px solid transparent;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      opacity: 0.75;
    }

    .belt-btn:hover {
      opacity: 1;
      transform: translateY(-1px);
    }

    /* Distinct vibrant theme for each belt button */
    .belt-btn[data-belt="ALL"] {
      background: #21262d;
      color: #e6edf3;
      border-color: #30363d;
    }
    .belt-btn[data-belt="White"] {
      background: rgba(255, 255, 255, 0.1);
      color: #f0f6fc;
      border-color: rgba(255, 255, 255, 0.25);
    }
    .belt-btn[data-belt="Orange"] {
      background: rgba(249, 115, 22, 0.15);
      color: #fb923c;
      border-color: rgba(249, 115, 22, 0.35);
    }
    .belt-btn[data-belt="Blue"] {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border-color: rgba(59, 130, 246, 0.35);
    }
    .belt-btn[data-belt="Yellow"] {
      background: rgba(234, 179, 8, 0.15);
      color: #facc15;
      border-color: rgba(234, 179, 8, 0.35);
    }
    .belt-btn[data-belt="Green"] {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border-color: rgba(34, 197, 94, 0.35);
    }
    .belt-btn[data-belt="Brown"] {
      background: rgba(180, 83, 9, 0.18);
      color: #f59e0b;
      border-color: rgba(180, 83, 9, 0.45);
    }
    .belt-btn[data-belt*="Dan"] {
      background: rgba(212, 175, 55, 0.12);
      color: #fde047;
      border-color: rgba(212, 175, 55, 0.38);
    }

    /* Selected state: intense brightness, thick glowing border & pop-out shadow */
    .belt-btn.active {
      opacity: 1 !important;
      transform: scale(1.06) !important;
      filter: brightness(1.35) !important;
      font-weight: 800 !important;
    }
    .belt-btn[data-belt="ALL"].active {
      background: #30363d;
      color: #fff;
      border-color: #58a6ff;
      box-shadow: 0 0 12px rgba(88, 166, 255, 0.5);
    }
    .belt-btn[data-belt="White"].active {
      background: #ffffff;
      color: #0d1117;
      border-color: #ffffff;
      box-shadow: 0 0 14px rgba(255, 255, 255, 0.7);
    }
    .belt-btn[data-belt="Orange"].active {
      background: #ea580c;
      color: #fff;
      border-color: #fb923c;
      box-shadow: 0 0 14px rgba(249, 115, 22, 0.7);
    }
    .belt-btn[data-belt="Blue"].active {
      background: #2563eb;
      color: #fff;
      border-color: #60a5fa;
      box-shadow: 0 0 14px rgba(37, 99, 235, 0.7);
    }
    .belt-btn[data-belt="Yellow"].active {
      background: #ca8a04;
      color: #000;
      border-color: #facc15;
      box-shadow: 0 0 14px rgba(250, 204, 21, 0.7);
    }
    .belt-btn[data-belt="Green"].active {
      background: #16a34a;
      color: #fff;
      border-color: #4ade80;
      box-shadow: 0 0 14px rgba(22, 163, 74, 0.7);
    }
    .belt-btn[data-belt="Brown"].active {
      background: #92400e;
      color: #fff;
      border-color: #d97706;
      box-shadow: 0 0 14px rgba(180, 83, 9, 0.7);
    }
    .belt-btn[data-belt*="Dan"].active {
      background: linear-gradient(135deg, #b48a1c, #85640e);
      color: #ffffff;
      border-color: #fde047;
      box-shadow: 0 0 14px rgba(212, 175, 55, 0.7);
    }

    .stats {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin: 1.25rem 0;
    }

    /* List Layout */
    .kata-list {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .kata-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.7rem 1.1rem;
      display: flex;
      flex-direction: row;
      align-items: center;
      transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }

    .kata-card:hover {
      transform: translateX(3px);
      border-color: #58a6ff;
      background: var(--card-hover);
    }

    /* Primary Kata video accent: solid 4px amber left border + soft gradient */
    .kata-card.is-main-kata {
      border-left: 4px solid #f59e0b;
      background: linear-gradient(90deg, rgba(245, 158, 11, 0.08) 0%, var(--card-bg) 35%);
    }

    .kata-card.is-main-kata:hover {
      background: linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, var(--card-hover) 35%);
      border-left-color: #fbbf24;
    }

    .card-main {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      flex: 1;
      min-width: 0;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.18rem 0.45rem;
      border-radius: 4px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .badge.prime {
      background: rgba(245, 158, 11, 0.15);
      color: var(--badge-prime);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .badge.member {
      background: rgba(59, 130, 246, 0.15);
      color: var(--badge-member);
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    /* Belt badges on cards */
    .belt-badge {
      position: relative;
      display: inline-flex;
      align-items: center;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      white-space: nowrap;
    }
    .belt-badge.has-stripe {
      padding-right: 1.15rem;
    }
    .belt-badge.has-stripe.stripe-count-1 { padding-right: 1.15rem; }
    .belt-badge.has-stripe.stripe-count-2 { padding-right: 1.45rem; }
    .belt-badge.has-stripe.stripe-count-3 { padding-right: 1.75rem; }
    .belt-badge.has-stripe.stripe-count-4 { padding-right: 2.05rem; }
    .belt-badge.has-stripe.stripe-count-5 { padding-right: 2.35rem; }

    .belt-stripes-container {
      position: absolute;
      right: 5px;
      top: 3px;
      bottom: 3px;
      display: flex;
      align-items: stretch;
      gap: 2px;
      pointer-events: none;
    }
    .belt-stripe {
      width: 2.5px;
      border-radius: 1px;
    }
    .stripe-count-1 .belt-stripe {
      width: 3.5px;
    }
    .stripe-white { background-color: #ffffff; box-shadow: 0 0 5px rgba(255, 255, 255, 0.85); }
    .stripe-orange { background-color: #f97316; box-shadow: 0 0 5px rgba(249, 115, 22, 0.85); }
    .stripe-blue { background-color: #3b82f6; box-shadow: 0 0 6px rgba(59, 130, 246, 0.9); }
    .stripe-yellow { background-color: #facc15; box-shadow: 0 0 6px rgba(250, 204, 21, 0.9); }
    .stripe-green { background-color: #22c55e; box-shadow: 0 0 6px rgba(34, 197, 94, 0.9); }
    .stripe-brown { background-color: #78350f; box-shadow: 0 0 4px rgba(120, 53, 15, 0.9); }
    .stripe-black {
      background-color: #000000;
      border: 1px solid rgba(255, 255, 255, 0.55);
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.9);
    }
    .stripe-gold {
      background-color: #fde047;
      box-shadow: 0 0 4px rgba(212, 175, 55, 0.9);
    }
    .belt-white { background: rgba(255, 255, 255, 0.12); color: #f0f6fc; border: 1px solid rgba(255, 255, 255, 0.25); }
    .belt-orange { background: rgba(249, 115, 22, 0.18); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.35); }
    .belt-blue { background: rgba(59, 130, 246, 0.18); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.35); }
    .belt-yellow { background: rgba(234, 179, 8, 0.18); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.35); }
    .belt-green { background: rgba(34, 197, 94, 0.18); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.35); }
    .belt-brown { background: rgba(180, 83, 9, 0.22); color: #d97706; border: 1px solid rgba(180, 83, 9, 0.4); }
    .belt-dan-1, .belt-dan-2, .belt-dan-3, .belt-dan-4, .belt-dan-5 {
      background: rgba(0, 0, 0, 0.85);
      color: #fef08a;
      border: 1.5px solid #d4af37;
      box-shadow: 0 0 6px rgba(212, 175, 55, 0.25);
    }

    .tag-seminar {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      white-space: nowrap;
      background: rgba(168, 85, 247, 0.16);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.35);
    }

    .tag-bunkai {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      white-space: nowrap;
      background: rgba(6, 182, 212, 0.16);
      color: #22d3ee;
      border: 1px solid rgba(6, 182, 212, 0.35);
    }

    .kata-title {
      font-size: 0.93rem;
      font-weight: 500;
      color: #f0f6fc;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.78);
      backdrop-filter: blur(5px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 999;
      padding: 1.25rem;
    }

    .modal-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 14px;
      max-width: 470px;
      width: 100%;
      padding: 1.75rem 1.75rem 1.5rem 1.75rem;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.75), 0 0 1px rgba(255, 255, 255, 0.15);
      position: relative;
    }

    .modal-head {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.85rem;
    }

    .modal-head .doggi {
      font-size: 1.6rem;
      line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
    }

    .modal-body {
      color: #c9d1d9;
      font-size: 0.95rem;
      line-height: 1.55;
      margin-bottom: 1.4rem;
    }

    .modal-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.85rem;
      flex-wrap: wrap;
      padding-top: 0.85rem;
      border-top: 1px solid rgba(48, 54, 61, 0.6);
    }

    .foot-left {
      display: flex;
      align-items: center;
    }

    .link-signin {
      color: #8b949e;
      font-size: 0.78rem;
      text-decoration: underline;
      text-underline-offset: 3px;
      transition: color 0.15s ease;
      cursor: pointer;
    }

    .link-signin:hover {
      color: #c9d1d9;
    }

    .foot-right {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.8rem;
      color: #8b949e;
      cursor: pointer;
      user-select: none;
      transition: color 0.15s ease;
    }

    .checkbox-label:hover {
      color: #c9d1d9;
    }

    .checkbox-label input[type="checkbox"] {
      width: 14px;
      height: 14px;
      cursor: pointer;
      accent-color: #238636;
    }

    .btn-action.continue {
      background: #238636;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 0.55rem 1.35rem;
      border-radius: 7px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 2px 8px rgba(35, 134, 54, 0.35);
      display: inline-flex;
      align-items: center;
    }

    .btn-action.continue:hover {
      background: #2ea043;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(46, 160, 67, 0.45);
    }

    .btn-action.continue:active {
      transform: translateY(0);
    }

    @media (max-width: 640px) {
      body {
        padding: 1.25rem 0.75rem;
      }
      h1 {
        font-size: clamp(0.55rem, 3.15vw, 1.35rem);
        gap: 0.35rem;
        letter-spacing: 0;
      }
      .card-main {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.35rem;
      }
      .kata-title {
        white-space: normal;
      }
    }

    @media (max-width: 350px) {
      body {
        padding: 0.75rem 0.4rem;
      }
      h1 {
        font-size: clamp(0.45rem, 2.45vw, 0.58rem);
        gap: 0.2rem;
        letter-spacing: -0.01em;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-top">
        <div>
          <h1><span class="kanji">極真</span> Kyokushin Training <a href="./" class="qs-pill-turbo">⚡ Quick Search</a></h1>
          
          <a class="source-link" href="https://www.kyokushin.net/search-result?category=hesWJFxSJEaAHwfnbbSn&s=" target="_blank" rel="noopener noreferrer">
            🔗 Original Training Page at Kyokushin.net
          </a>
        </div>
      </div>

      <div class="controls">
        <input type="text" id="searchInput" class="search-box" placeholder="Search videos (e.g. Kata, Pinan, Bassai, Kumite)..." oninput="filterKata()">
      </div>

      <div class="toolbar-row">
        <div class="filter-tags">
          <button class="filter-btn" id="btn-ALL" onclick="setCategory('ALL')">All</button>
          <button class="filter-btn active" id="btn-KATA" onclick="setCategory('KATA')">Kata</button>
          <button class="filter-btn" id="btn-SEMINAR" onclick="setCategory('SEMINAR')">Seminar</button>
          <button class="filter-btn" id="btn-REST" onclick="setCategory('REST')">All the rest</button>
        </div>
      </div>

      <!-- Belt Colors Sub-Filter without label prefix -->
      <div class="belt-filter-row" id="beltFilterRow">
        <button class="belt-btn active" data-belt="ALL" onclick="setBeltFilter('ALL')">All</button>
        <button class="belt-btn" data-belt="White" onclick="setBeltFilter('White')">White</button>
        <button class="belt-btn" data-belt="Orange" onclick="setBeltFilter('Orange')">Orange</button>
        <button class="belt-btn" data-belt="Blue" onclick="setBeltFilter('Blue')">Blue</button>
        <button class="belt-btn" data-belt="Yellow" onclick="setBeltFilter('Yellow')">Yellow</button>
        <button class="belt-btn" data-belt="Green" onclick="setBeltFilter('Green')">Green</button>
        <button class="belt-btn" data-belt="Brown" onclick="setBeltFilter('Brown')">Brown</button>
        <button class="belt-btn" data-belt="Dan 1" onclick="setBeltFilter('Dan 1')">Dan 1</button>
        <button class="belt-btn" data-belt="Dan 2" onclick="setBeltFilter('Dan 2')">Dan 2</button>
        <button class="belt-btn" data-belt="Dan 3" onclick="setBeltFilter('Dan 3')">Dan 3</button>
        <button class="belt-btn" data-belt="Dan 4" onclick="setBeltFilter('Dan 4')">Dan 4</button>
        <button class="belt-btn" data-belt="Dan 5" onclick="setBeltFilter('Dan 5')">Dan 5</button>
      </div>
    </header>

    <div class="stats" id="statsBar">Showing Kata videos</div>

    <div class="kata-list" id="kataGrid">
${cardsHtml}
    </div>
  </div>

  <!-- Tip Modal -->
  <div class="modal-backdrop" id="tipModal" onclick="handleBackdropClick(event)">
    <div class="modal-card">
      <div class="modal-head">
        <span class="doggi">🥋</span>
        <span>Tip</span>
      </div>
      <div class="modal-body">
        If the video doesn't start automatically, sign in with your Kyokushin account.
      </div>
      <div class="modal-foot">
        <div class="foot-left">
          <a class="link-signin" href="https://www.kyokushin.net/login" target="_blank" rel="noopener noreferrer">Take me to sign in page &rarr;</a>
        </div>
        <div class="foot-right">
          <label class="checkbox-label">
            <input type="checkbox" id="stopShowingTip">
            <span>Stop showing this</span>
          </label>
          <button class="btn-action continue" onclick="proceedToVideo()">Continue</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Hardcoded 28 Katas mapping with order, belts and keywords
    const KATA_MAP = ${JSON.stringify(KATA_MAP, null, 2)};

    const allCards = Array.from(document.querySelectorAll('.kata-card'));
    const kataGrid = document.getElementById('kataGrid');
    const statsBar = document.getElementById('statsBar');
    const beltFilterRow = document.getElementById('beltFilterRow');
    
    let currentCategory = 'KATA'; // Default is Kata
    let currentBelt = 'ALL';      // Default is All belts
    let pendingVideoUrl = '';

    function handleCardClick(card) {
      const url = card.getAttribute('data-href');
      if (!url) return;

      const hideTip = localStorage.getItem('kyokushin_hide_tip') === 'true';
      if (hideTip) {
        window.open(url, '_blank');
      } else {
        pendingVideoUrl = url;
        const checkbox = document.getElementById('stopShowingTip');
        if (checkbox) checkbox.checked = false;
        document.getElementById('tipModal').style.display = 'flex';
      }
    }

    function closeModal() {
      document.getElementById('tipModal').style.display = 'none';
      pendingVideoUrl = '';
    }

    function handleBackdropClick(event) {
      if (event.target && event.target.id === 'tipModal') {
        closeModal();
      }
    }

    function proceedToVideo() {
      const url = pendingVideoUrl;
      const checkbox = document.getElementById('stopShowingTip');
      if (checkbox && checkbox.checked) {
        localStorage.setItem('kyokushin_hide_tip', 'true');
      }
      closeModal();
      if (url) window.open(url, '_blank');
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    function setCategory(cat) {
      currentCategory = cat;
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === 'btn-' + cat);
      });

      // Show/Hide Belt filter row only when Kata is active
      if (cat === 'KATA') {
        beltFilterRow.style.display = 'flex';
      } else {
        beltFilterRow.style.display = 'none';
        currentBelt = 'ALL';
        document.querySelectorAll('.belt-btn').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-belt') === 'ALL');
        });
      }

      filterKata();
    }

    function setBeltFilter(belt) {
      currentBelt = belt;
      document.querySelectorAll('.belt-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-belt') === belt);
      });
      filterKata();
    }



    function filterKata() {
      const q = document.getElementById('searchInput').value.trim().toLowerCase();
      let count = 0;

      // When Kata filter is active, sort DOM elements by Kata order 1 -> 28, then fewer tags first
      if (currentCategory === 'KATA') {
        allCards.sort((a, b) => {
          const orderA = parseInt(a.getAttribute('data-order') || '999', 10);
          const orderB = parseInt(b.getAttribute('data-order') || '999', 10);
          if (orderA !== orderB) return orderA - orderB;

          // Secondary sort: fewer tags first (0 tags before 1 tag before 2 tags)
          const tagsA = parseInt(a.getAttribute('data-extra-tags') || '0', 10);
          const tagsB = parseInt(b.getAttribute('data-extra-tags') || '0', 10);
          if (tagsA !== tagsB) return tagsA - tagsB;

          // If tag count is equal, prioritize Bunkai before Seminar
          const isBunkaiA = a.getAttribute('data-is-bunkai') === '1' ? 1 : 0;
          const isBunkaiB = b.getAttribute('data-is-bunkai') === '1' ? 1 : 0;
          if (isBunkaiA !== isBunkaiB) return isBunkaiB - isBunkaiA;

          const origA = parseInt(a.getAttribute('data-original-index') || '0', 10);
          const origB = parseInt(b.getAttribute('data-original-index') || '0', 10);
          if (origA !== origB) return origA - origB;

          return parseInt(a.getAttribute('data-sub-index') || '0', 10) - parseInt(b.getAttribute('data-sub-index') || '0', 10);
        });
      } else {
        // Restore original catalog order
        allCards.sort((a, b) => {
          const origA = parseInt(a.getAttribute('data-original-index') || '0', 10);
          const origB = parseInt(b.getAttribute('data-original-index') || '0', 10);
          if (origA !== origB) return origA - origB;

          return parseInt(a.getAttribute('data-sub-index') || '0', 10) - parseInt(b.getAttribute('data-sub-index') || '0', 10);
        });
      }

      // Re-append sorted cards in fragment
      const fragment = document.createDocumentFragment();

      allCards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const isKata = card.getAttribute('data-is-kata') === '1';
        const isSeminar = card.getAttribute('data-is-seminar') === '1';
        const cardBelt = card.getAttribute('data-belt') || '';
        const subIdx = parseInt(card.getAttribute('data-sub-index') || '0', 10);

        // Category filter: in SEMINAR, REST, and ALL views deduplicate multi-kata cards (keep only subIdx === 0)
        let matchesCategory = false;
        if (currentCategory === 'KATA') {
          matchesCategory = isKata;
          // Apply belt color sub-filter
          if (currentBelt !== 'ALL' && cardBelt.toLowerCase() !== currentBelt.toLowerCase()) {
            matchesCategory = false;
          }
        } else if (currentCategory === 'SEMINAR') {
          if (subIdx === 0) {
            matchesCategory = isSeminar || title.includes('seminar') || title.includes('講習会') || title.includes('セミナー');
          }
        } else if (currentCategory === 'REST') {
          if (subIdx === 0) {
            const isSem = isSeminar || title.includes('seminar') || title.includes('講習会') || title.includes('セミナー');
            matchesCategory = !isKata && !isSem;
          }
        } else if (currentCategory === 'ALL') {
          if (subIdx === 0) {
            matchesCategory = true;
          }
        }

        // Search filter: in KATA view, use specific kata search text; in other views, use catalog title
        let textToSearch = title;
        if (currentCategory === 'KATA' && card.hasAttribute('data-kata-search')) {
          textToSearch = card.getAttribute('data-kata-search') || title;
        }
        const kataName = (card.getAttribute('data-kata-name') || '').toLowerCase();
        const isBunkaiCard = card.getAttribute('data-is-bunkai') === '1';
        const matchesQuery = !q || textToSearch.includes(q) || kataName.includes(q) || (isBunkaiCard && (q === 'bunkai' || q === '分解'));

        if (matchesCategory && matchesQuery) {
          card.style.display = 'flex';
          count++;
        } else {
          card.style.display = 'none';
        }

        fragment.appendChild(card);
      });

      kataGrid.appendChild(fragment);

      const labelMap = {
        'KATA': (currentBelt !== 'ALL' ? currentBelt + ' belt kata videos' : 'Kata videos'),
        'SEMINAR': 'Seminar videos',
        'REST': 'All the rest videos',
        'ALL': 'all videos'
      };
      statsBar.innerText = 'Showing ' + count + ' ' + (labelMap[currentCategory] || 'videos');
    }

    // Apply default filter and sorting on load
    filterKata();

    // Register Service Worker for PWA installability & offline caching
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.log('SW registration note:', err);
        });
      });
    }
  </script>
</body>
</html>`;

fs.writeFileSync('./index.html', html);
console.log('Successfully updated index.html with hidden agent instruction, belt colors and glowing active states!');
