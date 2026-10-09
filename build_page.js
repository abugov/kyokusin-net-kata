const fs = require('fs');
const videos = JSON.parse(fs.readFileSync('./kata_links.json', 'utf8'));

// The 28 canonical katas in requested order with their belts & matching keywords
const KATA_MAP = [
  { name: "Taikyoku Sono Ichi", belt: "white", keywords: ["taikyoku sono ichi", "taikyoku sonoichi"] },
  { name: "Taikyoku Sono Ni", belt: "white", keywords: ["taikyoku sono ni", "taikyoku sononi"] },
  { name: "Sokugi Taikyoku Sono Ichi", belt: "white", keywords: ["sokugi taikyoku sono ichi", "sokugi taikyoku sonoichi"] },
  { name: "Taikyoku Sono San", belt: "orange", keywords: ["taikyoku sono san", "taikyoku sonosan"] },
  { name: "Sokugi Taikyoku Sono Ni", belt: "orange", keywords: ["sokugi taikyoku sono ni", "sokugi taikyoku sononi"] },
  { name: "Sokugi Taikyoku Sono San", belt: "orange", keywords: ["sokugi taikyoku sono san", "sokugi taikyoku sonosan"] },
  { name: "Pinan Sono Ichi", belt: "blue", keywords: ["pinan sono ichi", "pinan sonoichi"] },
  { name: "Pinan Sono Ni", belt: "blue", keywords: ["pinan sono ni", "pinan sononi"] },
  { name: "Sanchin", belt: "blue", keywords: ["sanchin"] },
  { name: "Pinan Sono San", belt: "yellow", keywords: ["pinan sono san", "pinan sonosan"] },
  { name: "Yantsu", belt: "yellow", keywords: ["yantsu"] },
  { name: "Pinan Sono Yon", belt: "yellow", keywords: ["pinan sono yon", "pinan sonoyon"] },
  { name: "Tsuki no Kata", belt: "yellow", keywords: ["tsuki no kata", "tsukinokata", "tsukino kata"] },
  { name: "Pinan Sono Go", belt: "green", keywords: ["pinan sono go", "pinan sonogo"] },
  { name: "Gekisai sono ichi", belt: "green", keywords: ["gekisai sono ichi", "gekisai sonoichi"] },
  { name: "Gekisai sono ni", belt: "green", keywords: ["gekisai sono ni", "gekisai sononi"] },
  { name: "Tekki sono ichi", belt: "green", keywords: ["tekki sono ichi", "tekki sonoichi"] },
  { name: "Gekisai sono san", belt: "brown", keywords: ["gekisai sono san", "gekisai sonosan", "gekisai shou"] },
  { name: "Tekki sono ni", belt: "brown", keywords: ["tekki sono ni", "tekki sononi"] },
  { name: "Saifa", belt: "brown", keywords: ["saifa"] },
  { name: "Garyu", belt: "dan 1", keywords: ["garyu"] },
  { name: "Seienchin", belt: "dan 1", keywords: ["seienchin"] },
  { name: "Bassai", belt: "dan 1", keywords: ["bassai"] },
  { name: "Tekki sono san", belt: "dan 1", keywords: ["tekki sono san", "tekki sonosan"] },
  { name: "Seipai", belt: "dan 2", keywords: ["seipai"] },
  { name: "Kanku", belt: "dan 3", keywords: ["kanku"] },
  { name: "Sushiho", belt: "dan 4", keywords: ["sushiho"] },
  { name: "Tensho", belt: "dan 5", keywords: ["tensho"] }
];

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
  
  // Belt pill if matched kata
  const beltHtml = matched ? `<span class="belt-badge belt-${matched.belt.replace(/\s+/g, '-')}">${matched.belt} &bull; ${matched.name}</span>` : '';

  return `      <div class="kata-card" 
           data-id="${item.id}"
           data-href="${item.url}" 
           data-badge="${item.badge || ''}" 
           data-title="${safeTitle.toLowerCase()}" 
           data-is-kata="${isKata ? '1' : '0'}"
           data-is-seminar="${isSeminar ? '1' : '0'}"
           data-kata-name="${matched ? matched.name : ''}"
           data-belt="${matched ? matched.belt : ''}"
           onclick="handleCardClick(this)">
        <div>
          <div class="card-header">
            <span class="video-id">#${idx + 1} &bull; ID: ${item.id}</span>
            <div style="display:flex;gap:0.35rem;align-items:center;">
              ${beltHtml}
              ${badgeHtml}
            </div>
          </div>
          <div class="kata-title">${safeTitle}</div>
        </div>
        <div class="card-footer">
          <span>Direct Video</span>
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
      margin-bottom: 2rem;
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

    .filter-tags {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      background: var(--card-bg);
      color: var(--text-muted);
      border: 1px solid var(--border);
      padding: 0.55rem 1.1rem;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover, .filter-btn.active {
      background: #21262d;
      color: #fff;
      border-color: #8b949e;
    }

    .filter-btn.active {
      background: #30363d;
      color: #fff;
      font-weight: 600;
      border-color: #58a6ff;
    }

    .stats {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
    }

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
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
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
      font-size: 0.68rem;
      font-weight: 600;
      padding: 0.18rem 0.5rem;
      border-radius: 4px;
      text-transform: capitalize;
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

    .video-id {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.75rem;
      color: #7d8590;
    }

    .card-footer .open-btn {
      color: #58a6ff;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
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
        <div class="filter-tags">
          <button class="filter-btn active" id="btn-ALL" onclick="setCategory('ALL')">All</button>
          <button class="filter-btn" id="btn-KATA" onclick="setCategory('KATA')">Kata</button>
          <button class="filter-btn" id="btn-SEMINAR" onclick="setCategory('SEMINAR')">Seminar</button>
          <button class="filter-btn" id="btn-REST" onclick="setCategory('REST')">All the Rest</button>
        </div>
      </div>
    </header>

    <div class="stats" id="statsBar">Showing ${videos.length} of ${videos.length} videos</div>

    <div class="kata-list" id="kataGrid">
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
    // Hardcoded 28 Katas mapping with belts and keywords
    const KATA_MAP = ${JSON.stringify(KATA_MAP, null, 2)};

    const allCards = Array.from(document.querySelectorAll('.kata-card'));
    const statsBar = document.getElementById('statsBar');
    let currentCategory = 'ALL';
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
      filterKata();
    }

    function filterKata() {
      const q = document.getElementById('searchInput').value.trim().toLowerCase();
      let count = 0;

      allCards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const isKata = card.getAttribute('data-is-kata') === '1';
        const isSeminar = card.getAttribute('data-is-seminar') === '1';

        // Check category condition
        let matchesCategory = false;
        if (currentCategory === 'ALL') {
          matchesCategory = true;
        } else if (currentCategory === 'KATA') {
          matchesCategory = isKata;
        } else if (currentCategory === 'SEMINAR') {
          // Exactly as if user searched "seminar"
          matchesCategory = isSeminar || title.includes('seminar');
        } else if (currentCategory === 'REST') {
          // All non-kata and non-seminar
          matchesCategory = !isKata && !isSeminar && !title.includes('seminar');
        }

        // Check text search
        const matchesQuery = !q || title.includes(q);

        if (matchesCategory && matchesQuery) {
          card.style.display = 'flex';
          count++;
        } else {
          card.style.display = 'none';
        }
      });

      statsBar.innerText = 'Showing ' + count + ' of ' + allCards.length + ' videos';
    }
  </script>
</body>
</html>`;

fs.writeFileSync('./index.html', html);
console.log('Successfully rebuilt index.html with 28-Kata map and 4 quick filters!');
