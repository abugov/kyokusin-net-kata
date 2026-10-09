const fs = require('fs');
const videos = JSON.parse(fs.readFileSync('./kata_links.json', 'utf8'));

// The 28 canonical katas in requested order with order index, belts & matching keywords
const KATA_MAP = [
  { order: 1, name: "Taikyoku Sono Ichi", belt: "White", keywords: ["taikyoku sono ichi", "taikyoku sonoichi"] },
  { order: 2, name: "Taikyoku Sono Ni", belt: "White", keywords: ["taikyoku sono ni", "taikyoku sononi"] },
  { order: 3, name: "Sokugi Taikyoku Sono Ichi", belt: "White", keywords: ["sokugi taikyoku sono ichi", "sokugi taikyoku sonoichi"] },
  { order: 4, name: "Taikyoku Sono San", belt: "Orange", keywords: ["taikyoku sono san", "taikyoku sonosan"] },
  { order: 5, name: "Sokugi Taikyoku Sono Ni", belt: "Orange", keywords: ["sokugi taikyoku sono ni", "sokugi taikyoku sononi"] },
  { order: 6, name: "Sokugi Taikyoku Sono San", belt: "Orange", keywords: ["sokugi taikyoku sono san", "sokugi taikyoku sonosan"] },
  { order: 7, name: "Pinan Sono Ichi", belt: "Blue", keywords: ["pinan sono ichi", "pinan sonoichi"] },
  { order: 8, name: "Pinan Sono Ni", belt: "Blue", keywords: ["pinan sono ni", "pinan sononi"] },
  { order: 9, name: "Sanchin", belt: "Blue", keywords: ["sanchin"] },
  { order: 10, name: "Pinan Sono San", belt: "Yellow", keywords: ["pinan sono san", "pinan sonosan"] },
  { order: 11, name: "Yantsu", belt: "Yellow", keywords: ["yantsu"] },
  { name: "Pinan Sono Yon", order: 12, belt: "Yellow", keywords: ["pinan sono yon", "pinan sonoyon"] },
  { order: 13, name: "Tsuki no Kata", belt: "Yellow", keywords: ["tsuki no kata", "tsukinokata", "tsukino kata"] },
  { order: 14, name: "Pinan Sono Go", belt: "Green", keywords: ["pinan sono go", "pinan sonogo"] },
  { order: 15, name: "Gekisai sono ichi", belt: "Green", keywords: ["gekisai sono ichi", "gekisai sonoichi"] },
  { order: 16, name: "Gekisai sono ni", belt: "Green", keywords: ["gekisai sono ni", "gekisai sononi"] },
  { order: 17, name: "Tekki sono ichi", belt: "Green", keywords: ["tekki sono ichi", "tekki sonoichi"] },
  { order: 18, name: "Gekisai sono san", belt: "Brown", keywords: ["gekisai sono san", "gekisai sonosan", "gekisai shou"] },
  { order: 19, name: "Tekki sono ni", belt: "Brown", keywords: ["tekki sono ni", "tekki sononi"] },
  { order: 20, name: "Saifa", belt: "Brown", keywords: ["saifa"] },
  { order: 21, name: "Garyu", belt: "Dan 1", keywords: ["garyu"] },
  { order: 22, name: "Seienchin", belt: "Dan 1", keywords: ["seienchin"] },
  { order: 23, name: "Bassai", belt: "Dan 1", keywords: ["bassai"] },
  { order: 24, name: "Tekki sono san", belt: "Dan 1", keywords: ["tekki sono san", "tekki sonosan"] },
  { order: 25, name: "Seipai", belt: "Dan 2", keywords: ["seipai"] },
  { order: 26, name: "Kanku", belt: "Dan 3", keywords: ["kanku"] },
  { order: 27, name: "Sushiho", belt: "Dan 4", keywords: ["sushiho"] },
  { order: 28, name: "Tensho", belt: "Dan 5", keywords: ["tensho"] }
];

// Belt order
const BELT_ORDER = ["All Belts", "White", "Orange", "Blue", "Yellow", "Green", "Brown", "Dan 1", "Dan 2", "Dan 3", "Dan 4", "Dan 5"];

function matchKata(title) {
  const t = title.toLowerCase();
  for (const k of KATA_MAP) {
    for (const kw of k.keywords) {
      if (kw.startsWith("taikyoku") && t.includes("sokugi " + kw)) {
        continue;
      }
      const reg = new RegExp("(^|[^a-z0-9])" + kw + "([^a-z0-9]|$)", "i");
      if (reg.test(t)) {
        return k;
      }
    }
  }
  return null;
}

const cardsHtml = videos.map((item, idx) => {
  const matched = matchKata(item.title);
  const isSeminar = /seminar/i.test(item.title);
  const isKata = !!matched;

  const badgeHtml = item.badge ? `<span class="badge ${item.badge.toLowerCase()}">${item.badge}</span>` : '';
  const safeTitle = item.title.replace(/"/g, '&quot;');
  
  // Belt tag on left: Name | Belt
  const beltHtml = matched ? `<span class="belt-badge belt-${matched.belt.toLowerCase().replace(/\s+/g, '-')}">${matched.name} | ${matched.belt}</span>` : '';

  return `      <div class="kata-card" 
           data-id="${item.id}"
           data-href="${item.url}" 
           data-badge="${item.badge || ''}" 
           data-title="${safeTitle.toLowerCase()}" 
           data-is-kata="${isKata ? '1' : '0'}"
           data-is-seminar="${isSeminar ? '1' : '0'}"
           data-kata-name="${matched ? matched.name : ''}"
           data-belt="${matched ? matched.belt : ''}"
           data-order="${matched ? matched.order : 999}"
           data-original-index="${idx}"
           onclick="handleCardClick(this)">
        <div class="card-main">
          <div class="card-header">
            <div class="header-left">
              ${beltHtml}
            </div>
            <div class="header-right">
              ${badgeHtml}
            </div>
          </div>
          <div class="kata-title">${safeTitle}</div>
        </div>
        <div class="card-footer">
          <span class="footer-note">Direct Video</span>
          <span class="open-btn">Watch &rarr;</span>
        </div>
      </div>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kyokushin Training & Kata Videos</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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
      letter-spacing: 0.05em;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    h1 span.kanji {
      color: var(--accent);
      font-size: 2.4rem;
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

    /* Sub-row for Belt Colors */
    .belt-filter-row {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-top: 0.75rem;
      padding: 0.65rem 0.85rem;
      background: rgba(22, 27, 34, 0.6);
      border: 1px solid rgba(48, 54, 61, 0.6);
      border-radius: 8px;
      align-items: center;
      transition: all 0.25s ease;
    }

    .belt-filter-label {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-right: 0.35rem;
    }

    .belt-btn {
      background: transparent;
      border: 1px solid var(--border);
      padding: 0.28rem 0.65rem;
      border-radius: 5px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .belt-btn:hover {
      color: #fff;
      border-color: #8b949e;
    }

    .belt-btn.active {
      font-weight: 700;
      color: #fff;
      border-color: #58a6ff;
      background: #21262d;
    }

    /* Belt button specific accents */
    .belt-btn[data-belt="White"].active { border-color: #f0f6fc; }
    .belt-btn[data-belt="Orange"].active { border-color: #fb923c; color: #fb923c; }
    .belt-btn[data-belt="Blue"].active { border-color: #60a5fa; color: #60a5fa; }
    .belt-btn[data-belt="Yellow"].active { border-color: #facc15; color: #facc15; }
    .belt-btn[data-belt="Green"].active { border-color: #4ade80; color: #4ade80; }
    .belt-btn[data-belt="Brown"].active { border-color: #d97706; color: #d97706; }
    .belt-btn[data-belt*="Dan"].active { border-color: #e50914; color: #f87171; }

    .view-toggle {
      display: flex;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
    }

    .view-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.45rem 0.85rem;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s;
    }

    .view-btn.active {
      background: #30363d;
      color: #fff;
    }

    .stats {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin: 1.25rem 0;
    }

    /* Grid Layout */
    .kata-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    .kata-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }

    .kata-card:hover {
      transform: translateY(-2px);
      border-color: #58a6ff;
      background: var(--card-hover);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      min-height: 22px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-left: auto;
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

    /* Belt badges */
    .belt-badge {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      white-space: nowrap;
    }
    .belt-white { background: rgba(255, 255, 255, 0.12); color: #f0f6fc; border: 1px solid rgba(255, 255, 255, 0.25); }
    .belt-orange { background: rgba(249, 115, 22, 0.18); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.35); }
    .belt-blue { background: rgba(59, 130, 246, 0.18); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.35); }
    .belt-yellow { background: rgba(234, 179, 8, 0.18); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.35); }
    .belt-green { background: rgba(34, 197, 94, 0.18); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.35); }
    .belt-brown { background: rgba(180, 83, 9, 0.22); color: #d97706; border: 1px solid rgba(180, 83, 9, 0.4); }
    .belt-dan-1, .belt-dan-2, .belt-dan-3, .belt-dan-4, .belt-dan-5 {
      background: rgba(0, 0, 0, 0.6); color: #e6edf3; border: 1px solid #e50914;
    }

    .kata-title {
      font-size: 1rem;
      font-weight: 600;
      color: #f0f6fc;
      line-height: 1.4;
      margin-bottom: 0.5rem;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .card-footer .open-btn {
      color: #58a6ff;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    /* List View Mode (Default) */
    .kata-list.concise-view {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .kata-list.concise-view .kata-card {
      padding: 0.7rem 1.1rem;
      flex-direction: row;
      align-items: center;
      border-radius: 8px;
    }

    .kata-list.concise-view .kata-card:hover {
      transform: translateX(3px);
    }

    .kata-list.concise-view .card-main {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      flex: 1;
      min-width: 0;
    }

    .kata-list.concise-view .card-header {
      margin-bottom: 0;
      min-height: auto;
      flex-shrink: 0;
    }

    .kata-list.concise-view .kata-title {
      margin-bottom: 0;
      font-size: 0.93rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .kata-list.concise-view .card-footer {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
      margin-left: 1rem;
      flex-shrink: 0;
    }

    .kata-list.concise-view .footer-note {
      display: none;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 999;
      padding: 1rem;
    }

    .modal-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      max-width: 520px;
      width: 100%;
      padding: 1.75rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }

    .modal-head {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 1.25rem;
      line-height: 1.4;
    }

    .modal-head .doggi {
      font-size: 1.5rem;
      flex-shrink: 0;
      line-height: 1;
    }

    .modal-head .video-name {
      color: #f0f6fc;
      font-size: 1.1rem;
      word-break: break-word;
    }

    .modal-body {
      font-size: 0.95rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 1.5rem;
      padding: 0.75rem 1rem;
      background: var(--bg);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .modal-foot {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .btn-action {
      padding: 0.55rem 1rem;
      border-radius: 6px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--border);
      transition: all 0.2s;
    }

    .btn-action.cancel {
      background: transparent;
      color: var(--text-muted);
      border-color: transparent;
    }

    .btn-action.cancel:hover {
      color: #fff;
    }

    .btn-action.continue {
      background: #21262d;
      color: var(--text);
    }

    .btn-action.continue:hover {
      background: #30363d;
      color: #fff;
    }

    .btn-action.login {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }

    .btn-action.login:hover {
      background: #f40612;
    }

    @media (max-width: 640px) {
      .kata-list {
        grid-template-columns: 1fr;
      }
      .kata-list.concise-view .card-main {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.35rem;
      }
      .kata-list.concise-view .kata-title {
        white-space: normal;
      }
      h1 {
        font-size: 1.6rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-top">
        <div>
          <h1><span class="kanji">極真</span> Kyokushin Training &amp; Kata Library</h1>
          <p class="meta">Extracted index of videos from Kyokushin Online</p>
          <a class="source-link" href="https://www.kyokushin.net/search-result?category=hesWJFxSJEaAHwfnbbSn&s=" target="_blank" rel="noopener noreferrer">
            🔗 Original Training Page (Kyokushin.net)
          </a>
        </div>
      </div>

      <div class="controls">
        <input type="text" id="searchInput" class="search-box" placeholder="Search videos (e.g. Kata, Pinan, Bassai, Kumite)..." oninput="filterKata()">
      </div>

      <div class="toolbar-row">
        <div class="filter-tags">
          <button class="filter-btn active" id="btn-KATA" onclick="setCategory('KATA')">Kata</button>
          <button class="filter-btn" id="btn-SEMINAR" onclick="setCategory('SEMINAR')">Seminar</button>
          <button class="filter-btn" id="btn-REST" onclick="setCategory('REST')">All the rest</button>
          <button class="filter-btn" id="btn-ALL" onclick="setCategory('ALL')">All</button>
        </div>

        <div class="view-toggle">
          <button class="view-btn active" id="viewBtnConcise" onclick="setViewMode('concise')">☰ List</button>
          <button class="view-btn" id="viewBtnCards" onclick="setViewMode('cards')">☷ Cards</button>
        </div>
      </div>

      <!-- Belt Colors Sub-Filter (shown when Kata is selected) -->
      <div class="belt-filter-row" id="beltFilterRow">
        <span class="belt-filter-label">Belt:</span>
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

    <div class="kata-list concise-view" id="kataGrid">
${cardsHtml}
    </div>
  </div>

  <!-- Prompt Modal on Clicking PRIME / MEMBER Video -->
  <div class="modal-backdrop" id="authModal">
    <div class="modal-card">
      <div class="modal-head">
        <span class="doggi">🥋</span>
        <span class="video-name" id="modalVideoName"></span>
      </div>
      <div class="modal-body">
        This video requires a <strong id="modalBadgeText" style="color:#f59e0b">PRIME</strong> account.<br>
        Would you like to open the <strong>Login page</strong> first, or <strong>continue</strong> directly to the video?
      </div>
      <div class="modal-foot">
        <button class="btn-action cancel" onclick="closeModal()">Cancel</button>
        <button class="btn-action continue" onclick="proceedToVideo()">Continue to Video</button>
        <button class="btn-action login" onclick="openLogin()">Open Login &rarr;</button>
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
    let currentView = 'concise';   // Default is List
    let pendingVideoUrl = '';

    function handleCardClick(card) {
      const url = card.getAttribute('data-href');
      const badge = card.getAttribute('data-badge');
      const title = card.querySelector('.kata-title').innerText;

      if (badge === 'PRIME' || badge === 'MEMBER') {
        pendingVideoUrl = url;
        document.getElementById('modalBadgeText').innerText = badge;
        document.getElementById('modalVideoName').innerText = title;
        document.getElementById('authModal').style.display = 'flex';
      } else {
        window.open(url, '_blank');
      }
    }

    function closeModal() {
      document.getElementById('authModal').style.display = 'none';
      pendingVideoUrl = '';
    }

    function proceedToVideo() {
      const url = pendingVideoUrl;
      closeModal();
      if (url) window.open(url, '_blank');
    }

    function openLogin() {
      closeModal();
      window.open('https://www.kyokushin.net/login', '_blank');
    }

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

    function setViewMode(mode) {
      currentView = mode;
      document.getElementById('viewBtnConcise').classList.toggle('active', mode === 'concise');
      document.getElementById('viewBtnCards').classList.toggle('active', mode === 'cards');
      if (mode === 'concise') {
        kataGrid.classList.add('concise-view');
      } else {
        kataGrid.classList.remove('concise-view');
      }
    }

    function filterKata() {
      const q = document.getElementById('searchInput').value.trim().toLowerCase();
      let count = 0;

      // When Kata filter is active, sort DOM elements by Kata order 1 -> 28
      if (currentCategory === 'KATA') {
        allCards.sort((a, b) => {
          const orderA = parseInt(a.getAttribute('data-order') || '999', 10);
          const orderB = parseInt(b.getAttribute('data-order') || '999', 10);
          if (orderA !== orderB) return orderA - orderB;
          return parseInt(a.getAttribute('data-original-index') || '0', 10) - parseInt(b.getAttribute('data-original-index') || '0', 10);
        });
      } else {
        // Restore original catalog order
        allCards.sort((a, b) => {
          return parseInt(a.getAttribute('data-original-index') || '0', 10) - parseInt(b.getAttribute('data-original-index') || '0', 10);
        });
      }

      // Re-append sorted cards in fragment
      const fragment = document.createDocumentFragment();

      allCards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const isKata = card.getAttribute('data-is-kata') === '1';
        const isSeminar = card.getAttribute('data-is-seminar') === '1';
        const cardBelt = card.getAttribute('data-belt') || '';

        // Category filter
        let matchesCategory = false;
        if (currentCategory === 'KATA') {
          matchesCategory = isKata;
          // Apply belt color sub-filter
          if (currentBelt !== 'ALL' && cardBelt.toLowerCase() !== currentBelt.toLowerCase()) {
            matchesCategory = false;
          }
        } else if (currentCategory === 'SEMINAR') {
          matchesCategory = isSeminar || title.includes('seminar');
        } else if (currentCategory === 'REST') {
          matchesCategory = !isKata && !isSeminar && !title.includes('seminar');
        } else if (currentCategory === 'ALL') {
          matchesCategory = true;
        }

        // Search filter
        const matchesQuery = !q || title.includes(q);

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
        'KATA': (currentBelt !== 'ALL' ? currentBelt + ' belt kata videos' : 'Kata videos (ordered #1 to #28)'),
        'SEMINAR': 'Seminar videos',
        'REST': 'All the rest videos',
        'ALL': 'all videos'
      };
      statsBar.innerText = 'Showing ' + count + ' ' + (labelMap[currentCategory] || 'videos');
    }

    // Apply default filter and sorting on load
    filterKata();
  </script>
</body>
</html>`;

fs.writeFileSync('./index.html', html);
console.log('Successfully updated index.html with canonical Kata ordering and Belt color filter line!');
