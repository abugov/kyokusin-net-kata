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

    .status-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.85rem 1.25rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .status-left {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.9rem;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #e50914;
      display: inline-block;
    }

    .status-dot.online {
      background: #2ea043;
      box-shadow: 0 0 8px rgba(46, 160, 67, 0.4);
    }

    .status-right {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .btn-small {
      padding: 0.4rem 0.85rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--border);
      background: #21262d;
      color: var(--text);
      transition: all 0.2s;
    }

    .btn-small:hover {
      background: #30363d;
      color: #fff;
    }

    .btn-small.primary {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }

    .btn-small.primary:hover {
      background: #f40612;
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
      max-width: 480px;
      width: 100%;
      padding: 1.75rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }

    .modal-head {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.75rem;
    }

    .modal-body {
      font-size: 0.92rem;
      color: var(--text-muted);
      line-height: 1.55;
      margin-bottom: 1.25rem;
    }

    .modal-target {
      background: var(--bg);
      border-left: 3px solid var(--badge-prime);
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      font-size: 0.88rem;
      color: var(--text);
    }

    .modal-foot {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      flex-wrap: wrap;
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

    <div class="status-bar">
      <div class="status-left">
        <span class="status-dot" id="statusDot"></span>
        <span id="statusLabel">Login Status: Not Logged In</span>
      </div>
      <div class="status-right">
        <button class="btn-small" onclick="toggleLoginState()">Toggle "Logged In"</button>
        <button class="btn-small primary" onclick="openLoginWindow()">Go to Login Page</button>
      </div>
    </div>

    <div class="stats" id="statsBar">Showing ${kataList.length} of ${kataList.length} videos</div>

    <div class="kata-list" id="kataGrid">
${cardsHtml}
    </div>
  </div>

  <!-- Auth Prompt Modal -->
  <div class="modal-backdrop" id="authModal">
    <div class="modal-card">
      <div class="modal-head">
        <span>🔐</span>
        <span id="modalTitle">Login Required</span>
      </div>
      <div class="modal-body">
        This is a <strong id="modalBadgeText" style="color:#f59e0b">PRIME</strong> video on Kyokushin Online.<br><br>
        If you are not logged in with your Google / Kyokushin member account, the video player will stay stuck on <em>"Loading..."</em>.
      </div>
      <div class="modal-target">
        Selected Kata: <strong id="modalKataName"></strong>
      </div>
      <div class="modal-foot">
        <button class="btn-small" onclick="closeModal()">Cancel</button>
        <button class="btn-small" onclick="proceedToVideo()">Continue to Video</button>
        <button class="btn-small primary" onclick="goToLoginAndSave()">Log In First &rarr;</button>
      </div>
    </div>
  </div>

  <script>
    const allCards = Array.from(document.querySelectorAll('.kata-card'));
    const statsBar = document.getElementById('statsBar');
    let currentCategory = 'ALL';
    let pendingVideoUrl = '';

    // Check login state from localStorage
    function isUserLoggedIn() {
      return localStorage.getItem('kyokushin_user_logged_in') === 'true';
    }

    function updateStatusUI() {
      const logged = isUserLoggedIn();
      const dot = document.getElementById('statusDot');
      const label = document.getElementById('statusLabel');
      if (logged) {
        dot.className = 'status-dot online';
        label.innerHTML = 'Login Status: <strong>Logged In</strong> (Direct play enabled)';
      } else {
        dot.className = 'status-dot';
        label.innerHTML = 'Login Status: <strong>Not Logged In</strong> (Prompt will ask before playing)';
      }
    }

    function toggleLoginState() {
      const current = isUserLoggedIn();
      localStorage.setItem('kyokushin_user_logged_in', current ? 'false' : 'true');
      updateStatusUI();
    }

    function openLoginWindow() {
      localStorage.setItem('kyokushin_user_logged_in', 'true');
      updateStatusUI();
      window.open('https://www.kyokushin.net/login', '_blank');
    }

    function handleCardClick(card) {
      const url = card.getAttribute('data-href');
      const badge = card.getAttribute('data-badge');
      const title = card.querySelector('.kata-title').innerText;

      // If user is NOT logged in and clicking a MEMBER or PRIME video:
      if (!isUserLoggedIn() && (badge === 'PRIME' || badge === 'MEMBER')) {
        pendingVideoUrl = url;
        document.getElementById('modalBadgeText').innerText = badge;
        document.getElementById('modalKataName').innerText = title;
        document.getElementById('modalTitle').innerText = badge + ' Video &bull; Authentication Needed';
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

    function goToLoginAndSave() {
      const url = pendingVideoUrl;
      closeModal();
      localStorage.setItem('kyokushin_user_logged_in', 'true');
      updateStatusUI();
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

    updateStatusUI();
  </script>
</body>
</html>`;

fs.writeFileSync('./index.html', html);
console.log('Successfully generated index.html with authentication detection and prompts!');
