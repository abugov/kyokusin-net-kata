const fs = require('fs');
const kataList = JSON.parse(fs.readFileSync('./kata_links.json', 'utf8'));

const cardsHtml = kataList.map((item, idx) => {
  const badgeHtml = item.badge ? `<span class="badge ${item.badge.toLowerCase()}">${item.badge}</span>` : '';
  const safeTitle = item.title.replace(/"/g, '&quot;');
  return `      <div class="kata-card" data-href="${item.url}" data-badge="${item.badge || ''}" data-title="${safeTitle.toLowerCase()}" onclick="handleCardClick(this)">
        <div>
          <div class="card-header">
            <span class="video-id">#${idx + 1} &bull; ID: ${item.id}</span>
            ${badgeHtml}
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
  <title>Kyokushin Kata Video Links</title>
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
      padding: 0.45rem 0.9rem;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover, .filter-btn.active {
      background: #21262d;
      color: #fff;
      border-color: #8b949e;
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
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
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
      margin-bottom: 1.25rem;
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

    .remember-choice {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
      cursor: pointer;
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
          <h1><span class="kanji">極真</span> Kyokushin Kata Library</h1>
          <p class="meta">Extracted index of kata videos from Kyokushin Online</p>
          <a class="source-link" href="https://www.kyokushin.net/search-result?category=hesWJFxSJEaAHwfnbbSn&s=kata" target="_blank" rel="noopener noreferrer">
            🔗 Original Search Page (kyokushin.net)
          </a>
        </div>
      </div>

      <div class="controls">
        <input type="text" id="searchInput" class="search-box" placeholder="Search kata (e.g. Pinan, Bassai, Garyu, 2020)..." oninput="filterKata()">
        <div class="filter-tags">
          <button class="filter-btn active" onclick="setCategory('ALL')">All</button>
          <button class="filter-btn" onclick="setCategory('Pinan')">Pinan</button>
          <button class="filter-btn" onclick="setCategory('Taikyoku')">Taikyoku</button>
          <button class="filter-btn" onclick="setCategory('Bunkai')">Bunkai</button>
          <button class="filter-btn" onclick="setCategory('Seminar')">Seminars</button>
        </div>
      </div>
    </header>

    <div class="stats" id="statsBar">Showing ${kataList.length} of ${kataList.length} videos</div>

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
      <label class="remember-choice">
        <input type="checkbox" id="dontAskAgainCheckbox">
        I am logged in &bull; Don't ask again (always continue directly)
      </label>
      <div class="modal-foot">
        <button class="btn-action cancel" onclick="closeModal()">Cancel</button>
        <button class="btn-action continue" onclick="proceedToVideo()">Continue to Video</button>
        <button class="btn-action login" onclick="openLogin()">Open Login &rarr;</button>
      </div>
    </div>
  </div>

  <script>
    const allCards = Array.from(document.querySelectorAll('.kata-card'));
    const statsBar = document.getElementById('statsBar');
    let currentCategory = 'ALL';
    let pendingVideoUrl = '';

    function handleCardClick(card) {
      const url = card.getAttribute('data-href');
      const badge = card.getAttribute('data-badge');
      const title = card.querySelector('.kata-title').innerText;

      // If user selected "Don't ask again", open directly
      if (localStorage.getItem('kyokushin_always_continue') === 'true') {
        window.open(url, '_blank');
        return;
      }

      // If it is a PRIME or MEMBER video, ask whether to open login or continue
      if (badge === 'PRIME' || badge === 'MEMBER') {
        pendingVideoUrl = url;
        document.getElementById('modalBadgeText').innerText = badge;
        document.getElementById('modalVideoName').innerText = title;
        document.getElementById('authModal').style.display = 'flex';
      } else {
        // Free / standard videos open directly
        window.open(url, '_blank');
      }
    }

    function closeModal() {
      document.getElementById('authModal').style.display = 'none';
      pendingVideoUrl = '';
    }

    function proceedToVideo() {
      const url = pendingVideoUrl;
      const dontAsk = document.getElementById('dontAskAgainCheckbox').checked;
      if (dontAsk) {
        localStorage.setItem('kyokushin_always_continue', 'true');
      }
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
        btn.classList.toggle('active', btn.innerText.toLowerCase() === cat.toLowerCase() || (cat === 'ALL' && btn.innerText === 'All'));
      });
      filterKata();
    }

    function filterKata() {
      const q = document.getElementById('searchInput').value.trim().toLowerCase();
      let count = 0;

      allCards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const matchesQuery = !q || title.includes(q);
        const matchesCategory = currentCategory === 'ALL' || title.includes(currentCategory.toLowerCase());

        if (matchesQuery && matchesCategory) {
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
console.log('Successfully updated index.html with new modal layout and bypass checkbox!');
