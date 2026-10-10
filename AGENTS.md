# Agent Instructions

## 1. PR Workflow & Auto-Merge
- Develop all features and fixes on feature branches; never commit directly to `main`.
- Open PRs with GitHub CLI (`gh pr create`).
- Once CI passes, auto-merge via squash (`gh pr merge --squash --delete-branch`).

## 2. Architecture & Data
- **Scraper touches DB only**: `scrape.js` updates `kata_links.json` and `scrape-status.json` only. Never touch HTML, CSS, or client code from scraper.
- **Client-Side Rendering**: Static client application loading from JSON files.
- **Single Source of Truth**: `kata_map.json` contains all canonical katas, belt progression, stripes, and keywords. Never duplicate in code.

## 3. Testing (Zero Bloat, Smart Coverage)
- Use Node.js built-ins (`node:test`, `node:assert/strict`) for unit tests and headless Puppeteer for E2E. No external test runners or bundlers.
- Join related cases into cohesive tests; avoid fragmented one-liners.
- Tests must never mutate production DB files (use configurable endpoints via query params).

## 4. Simplicity First
- Prioritize boring, trivial solutions over clever abstractions. If something feels over-engineered, stop and simplify.
