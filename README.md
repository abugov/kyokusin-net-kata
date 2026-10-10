# Kyokushin Kata Library

Fast, client-side catalog and search for Kyokushin Online kata videos, organized by belt progression, seminars, bunkai, and recent additions.

## Project Structure

- `index.html`, `app.js`, `style.css`: Client-side application with search, belt filters, and new video alerts.
- `kata_map.json`: Single source of truth for canonical katas, belt progression, stripes, and keywords.
- `kata_links.json`: Video catalog with IDs, URLs, tags, and `firstSeen` dates.
- `scrape-status.json`: Catalog hash and timestamp for background update detection.
- `scrape.js`: Scraper for fetching videos into the JSON database.

## Development & Testing

```bash
# Run unit and E2E browser tests
npm test

# Update video catalog from Kyokushin Online
npm run scrape
```
