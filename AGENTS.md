# Agent Instructions: Kyokushin Training Quick Search

Guidelines and core design principles derived from repository requirements and decisions.

---

## 1. Git & PR Workflow
- **Branch & PR**: Always develop features and fixes on feature branches (e.g. `feat/...`, `fix/...`), never commit directly to `main`.
- **Auto-Merge**: Open a PR with GitHub CLI (`gh pr create`). Once CI tests pass, auto-merge via squash (`gh pr merge --squash --delete-branch` or `gh pr merge --auto --squash`).
- **Bold Revert Checkpoints**: When undertaking major structural refactors, commit with a bold marker (e.g. `[REFACTOR] Description (BOLD REVERT CHECKPOINT)`) so changes can be easily reverted if needed.

---

## 2. Architecture & Data Principles
- **Scraper Touches DB Only**: `scrape.js` must only update database files (`kata_links.json`, `scrape-status.json`). Never generate HTML, CSS, or code from the scraper.
- **Client-Side Rendering**: The UI (`app.js`, `index.html`, `style.css`) is a static client-side application loading from JSON files.
- **Single Source of Truth (`kata_map.json`)**: All 28 canonical katas, belt progression, stripes, and keywords live in `kata_map.json`. Never duplicate this dictionary in code.
- **Full-Content Hash**: The hash in `scrape-status.json` must be computed over the entire `JSON.stringify(videos)` of `kata_links.json` so any catalog edit updates the hash.
- **Smart Beacon Logic**: Background polling checks `scrape-status.json`. If the hash changes, it inspects the updated catalog and **only** turns the "New" button green if newly discovered or young videos (< 2 months) actually exist. Avoid repeated polling loops by caching the inspected hash.
- **Preserve Timestamps**: Preserve `firstSeen` dates for existing videos across scraping runs; assign today's ISO date only for newly discovered videos.

---

## 3. Kata Matching & Classification
- **Number Spacing**: Always match both spaced ("sono ichi", "sono ni") and unspaced ("sonoichi", "sononi") variations.
- **Compound Names**: Always match spaced ("Tsuki no Kata") and single-word ("TSUKINOKATA") forms.
- **Revision Aliases**: Map formal aliases to canonical entries (e.g. "gekisai shou" &rarr; "Gekisai sono san").
- **Prevent False Positives**: "Sokugi Taikyoku" must NEVER match standard "Taikyoku" (White vs Orange belt).
- **Explanation = Bunkai**: "Explanation" or "解説" designates Kata Bunkai (application), NOT seminar.
- **Multi-Kata Expansion (Option 2)**: If a video covers multiple katas, duplicate the card under each matched kata in Kata view, but deduplicate (show a single card) in Seminar, New, and Misc views.

---

## 4. Testing Guidelines (Zero Bloat, Smart Coverage)
- **Zero-Bloat Unit Tests**: Use Node.js built-ins (`node:test`, `node:assert/strict`). Do not introduce external test runners, bundlers, or Babel.
- **Smart Joined Coverage**: Combine related test cases into cohesive tests instead of writing dozens of fragmented one-liners.
- **Deterministic E2E Tests**: Use headless Puppeteer in `test/e2e.test.js` with dynamic ports (`server.listen(0)`) and deterministic waiting (`page.waitForFunction(..., { polling: 100 })`).
- **No Test Mutation of Production DB**: Production code (`app.js`) must accept configurable endpoints via query params (`statusUrl`, `linksUrl`, `kataMapUrl`, `pollInterval`) so tests run against isolated fixtures without modifying production databases.
- **Keep Tests Path-Independent**: Use `path.join(__dirname, ...)` so tests execute cleanly from any current working directory.

---

## 5. Simplicity First
- Prioritize boring, trivial, standard solutions over clever abstractions.
- Keep HTML semantic, CSS in `style.css`, and JS modular.
- If a proposed approach feels bent or over-engineered, stop and simplify.
