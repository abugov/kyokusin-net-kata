
let KATA_MAP = [];
let CATALOG_HASH = '';
let isCatalogOutdated = false;
let allCards = [];
let totalVideosCount = 0;

let currentCategory = 'KATA'; // Default is Kata
let currentBelt = 'ALL';      // Default is All belts
let pendingVideoUrl = '';

// Configurable endpoints (allows query-param overrides for automated testing)
const urlParams = (typeof window !== 'undefined' && window.location && window.location.search)
  ? new URLSearchParams(window.location.search)
  : null;
const statusUrl = (urlParams && urlParams.get('statusUrl')) || './scrape-status.json';
const linksUrl = (urlParams && urlParams.get('linksUrl')) || './kata_links.json';
const kataMapUrl = (urlParams && urlParams.get('kataMapUrl')) || './kata_map.json';
const pollInterval = (urlParams && parseInt(urlParams.get('pollInterval'), 10)) ||
  ((typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) ? 1500 : 60 * 1000);

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

// Matches kata keywords (handles spaced/unspaced numbers, compounds, aliases; excludes Taikyoku on Sokugi)
function matchKatas(title, kataMap) {
  const t = title.toLowerCase();
  const matched = [];
  for (const k of kataMap) {
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

// Explanation/解説 = Bunkai (not seminar). Multi-kata cards duplicated in Kata view (Option 2).
function renderCardHtml({ item, matched, originalIdx, subIdx, isMultiKata, twoMonthsAgo }) {
  const isExplanation = /explanation|解説/i.test(item.title);
  const isBunkai = /bunkai|分解/i.test(item.title) || isExplanation;
  const isSeminar = (/seminar/i.test(item.title) || /講習会|セミナー/i.test(item.title)) && !isExplanation;
  const isKata = !!matched;
  const isMainKata = isKata && !isSeminar && !isBunkai;

  const badgeHtml = item.badge ? `<span class="badge ${item.badge.toLowerCase()}">${escapeHtml(item.badge)}</span>` : '';
  const safeTitle = escapeHtml(item.title);
  
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
      beltHtml = `<span class="belt-badge belt-${beltClass} has-stripe stripe-count-${stripeInfo.count}">${escapeHtml(matched.name)}${stripesContainer}</span>`;
    } else {
      beltHtml = `<span class="belt-badge belt-${beltClass}">${escapeHtml(matched.name)}</span>`;
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

  const isNewVideo = item.firstSeen && (new Date(item.firstSeen).getTime() >= twoMonthsAgo);

  return `      <div class="kata-card${isMainKata ? ' is-main-kata' : ''}" 
           data-id="${escapeHtml(item.id || '')}"
           data-href="${escapeHtml(item.url || '')}" 
           data-badge="${escapeHtml(item.badge || '')}" 
           data-title="${safeTitle.toLowerCase()}" 
           data-kata-search="${escapeHtml(kataSearchText)}"
           data-is-kata="${isKata ? '1' : '0'}"
           data-is-main="${isMainKata ? '1' : '0'}"
           data-is-seminar="${isSeminar ? '1' : '0'}"
           data-is-bunkai="${isBunkai ? '1' : '0'}"
           data-is-multi="${isMultiKata ? '1' : '0'}"
           data-first-seen="${escapeHtml(item.firstSeen || '')}"
           data-is-new="${isNewVideo ? '1' : '0'}"
           data-kata-name="${matched ? escapeHtml(matched.name) : ''}"
           data-belt="${matched ? escapeHtml(matched.belt) : ''}"
           data-stripe="${matched ? escapeHtml(matched.stripe || '') : ''}"
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
}

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
    const tipModal = document.getElementById('tipModal');
    if (tipModal) tipModal.style.display = 'flex';
  }
}

function closeModal() {
  const tipModal = document.getElementById('tipModal');
  if (tipModal) tipModal.style.display = 'none';
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

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function setCategory(cat) {
  if (cat === 'NEW' && isCatalogOutdated) {
    window.location.reload();
    return;
  }
  currentCategory = cat;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === 'btn-' + cat);
  });

  // Show/Hide Belt filter row only when Kata is active
  const beltFilterRow = document.getElementById('beltFilterRow');
  if (beltFilterRow) {
    if (cat === 'KATA') {
      beltFilterRow.style.display = 'flex';
    } else {
      beltFilterRow.style.display = 'none';
      currentBelt = 'ALL';
      document.querySelectorAll('.belt-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-belt') === 'ALL');
      });
    }
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
  const searchInput = document.getElementById('searchInput');
  const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
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

    // Category filter: in SEMINAR, MISC views deduplicate multi-kata cards (keep only subIdx === 0)
    let matchesCategory = false;
    if (currentCategory === 'KATA') {
      matchesCategory = isKata;
      // Apply belt color sub-filter
      if (currentBelt !== 'ALL' && cardBelt.toLowerCase() !== currentBelt.toLowerCase()) {
        matchesCategory = false;
      }
    } else if (currentCategory === 'SEMINAR') {
      if (subIdx === 0) {
        matchesCategory = isSeminar;
      }
    } else if (currentCategory === 'NEW') {
      if (subIdx === 0) {
        matchesCategory = card.getAttribute('data-is-new') === '1';
      }
    } else if (currentCategory === 'MISC') {
      if (subIdx === 0) {
        matchesCategory = !isKata && !isSeminar;
      }
    }

    // Search filter: in KATA view, use specific kata search text; in other views, use catalog title
    let textToSearch = title;
    if (currentCategory === 'KATA' && card.hasAttribute('data-kata-search')) {
      textToSearch = card.getAttribute('data-kata-search') || title;
    }
    const kataName = (card.getAttribute('data-kata-name') || '').toLowerCase();
    const isBunkaiCard = card.getAttribute('data-is-bunkai') === '1';
    const matchesQuery = !q || textToSearch.includes(q) || kataName.includes(q) || (isBunkaiCard && (q === 'bunkai' || q === '分解' || q === 'explanation' || q === '解説'));

    if (matchesCategory && matchesQuery) {
      card.style.display = 'flex';
      count++;
    } else {
      card.style.display = 'none';
    }

    fragment.appendChild(card);
  });

  const kataGrid = document.getElementById('kataGrid');
  if (kataGrid) {
    kataGrid.appendChild(fragment);
  }

  const labelMap = {
    'KATA': (currentBelt !== 'ALL' ? currentBelt + ' belt kata videos' : 'Kata videos'),
    'SEMINAR': 'Seminar videos',
    'NEW': 'New videos',
    'MISC': 'Misc videos'
  };
  const statsBar = document.getElementById('statsBar');
  if (statsBar) {
    statsBar.innerText = 'Showing ' + count + ' ' + (labelMap[currentCategory] || 'videos') + ' out of ' + totalVideosCount;
  }
}

// Background beacon check: checks status file periodically.
// If hash changed, verifies if any new videos exist in the updated DB before turning "New" green.
let inspectedCatalogHash = '';

function checkScrapeStatus() {
  fetch(statusUrl + (statusUrl.includes('?') ? '&' : '?') + 't=' + Date.now())
    .then(res => res.json())
    .then(async data => {
      if (data && data.hash && data.hash !== CATALOG_HASH) {
        if (data.hash === inspectedCatalogHash) return; // already inspected this catalog version
        inspectedCatalogHash = data.hash;

        try {
          const resLinks = await fetch(linksUrl + (linksUrl.includes('?') ? '&' : '?') + 't=' + Date.now());
          const newVideos = await resLinks.json();
          const twoMonthsAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
          const hasNewInDb = Array.isArray(newVideos) && newVideos.some(v => v.firstSeen && (new Date(v.firstSeen).getTime() >= twoMonthsAgo));
          if (hasNewInDb) {
            isCatalogOutdated = true;
            const btnNew = document.getElementById('btn-NEW');
            if (btnNew) {
              btnNew.classList.add('is-new-active');
              btnNew.title = 'New videos available! Click to reload';
            }
          }
        } catch (e) {
          console.log('Background catalog check note:', e);
        }
      }
    })
    .catch(err => {
      console.log('Background status check note:', err);
    });
}

// Initialize Application
async function initApp() {
  const kataGrid = document.getElementById('kataGrid');
  try {
    const [kataMapRes, videosRes, statusRes] = await Promise.all([
      fetch(kataMapUrl).then(r => {
        if (!r.ok) throw new Error(`HTTP error ${r.status} fetching kata_map.json`);
        return r.json();
      }),
      fetch(linksUrl).then(r => {
        if (!r.ok) throw new Error(`HTTP error ${r.status} fetching kata_links.json`);
        return r.json();
      }),
      fetch(statusUrl).then(r => r.json()).catch(() => ({}))
    ]);

    KATA_MAP = kataMapRes;
    CATALOG_HASH = (statusRes && statusRes.hash) || '';
    inspectedCatalogHash = CATALOG_HASH;
    totalVideosCount = Array.isArray(videosRes) ? videosRes.length : 0;

    const twoMonthsAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
    const hasAnyNewVideos = videosRes.some(v => v.firstSeen && (new Date(v.firstSeen).getTime() >= twoMonthsAgo));
    const btnNew = document.getElementById('btn-NEW');
    if (btnNew && hasAnyNewVideos) {
      btnNew.classList.add('is-new-active');
    }

    const expandedCards = [];
    videosRes.forEach((item, originalIdx) => {
      const matchedList = matchKatas(item.title, KATA_MAP);
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

    if (kataGrid) {
      kataGrid.innerHTML = expandedCards.map(c => renderCardHtml({ ...c, twoMonthsAgo })).join('\n');
      allCards = Array.from(kataGrid.querySelectorAll('.kata-card'));
    }

    // Apply default filter & sort
    filterKata();

    // Start background beacon polling
    setInterval(checkScrapeStatus, pollInterval);

  } catch (err) {
    console.error('Initialization error:', err);
    if (kataGrid) {
      kataGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2rem; background: #161b22; border: 1px solid #30363d; border-radius: 8px; text-align: center;">
          <p style="color: #f85149; font-weight: 600; margin-bottom: 0.5rem;">⚠️ Failed to load catalog data</p>
          <p style="color: #8b949e; font-size: 0.9rem;">${escapeHtml(err.message)}</p>
          <p style="color: #8b949e; font-size: 0.85rem; margin-top: 0.5rem;">Note: If opening locally directly from disk (<code>file://</code>), please serve via HTTP (e.g. <code>python3 -m http.server</code> or <code>npx serve</code>).</p>
        </div>
      `;
    }
  }

  // Register Service Worker for PWA installability & offline caching
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.log('SW registration note:', err);
      });
    });
  }
}

// Expose handlers to window for inline onclick attributes
if (typeof window !== 'undefined') {
  window.handleCardClick = handleCardClick;
  window.closeModal = closeModal;
  window.handleBackdropClick = handleBackdropClick;
  window.proceedToVideo = proceedToVideo;
  window.setCategory = setCategory;
  window.setBeltFilter = setBeltFilter;
  window.filterKata = filterKata;
  window.checkScrapeStatus = checkScrapeStatus;
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initApp);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    matchKatas,
    parseStripe,
    escapeHtml,
    renderCardHtml
  };
}
