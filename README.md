# Tamaz & Shoumik — wedding showcase (demo)

This is a working demo built with plain HTML, vanilla JS, and Tailwind (via CDN, no build step).
All photos/videos right now are **placeholders** (Picsum images + a sample clip) — no real
Google Drive files are wired in yet.

Three events are covered: Holud (night one), Wedding (night two), and Reception / Bou-Bhaat
(night three, the day after the wedding).

## Structure
- `index.html` — homepage with a staggered, rotated photo collage hero (cycles through sets of 4 featured photos across all three events) and links into each event
- `holud.html`, `wedding.html`, `reception.html` — galleries, each with their own staggered collage sourced only from that event's own "cover" photos, plus a video row and lazy-loaded "load more" photo grid
- `downloads.html` — per-file download list + whole-folder shortcuts, grouped by all three events
- `js/data.js` — the media manifest (currently placeholder data). Items flagged `cover: true` are what feed the collages.
- `js/shared.js` — Drive URL builders, lightbox, video modal, collage cycling (filters by `data-category` on `<body>` when present, so each event page only shows its own covers)
- `js/gallery.js` — gallery rendering / batching logic
- `css/style.css` — fonts, color tokens, the marigold "garland" divider, collage layout

## Swapping in real files later
Once you upload the real photos/videos to Drive (separate Holud and Wedding accounts, plus
wherever Reception ends up):
1. We'll run a fetch script against each Drive account/folder to list contents and generate real
   `id` / `name` / `category` / `type` entries — same shape as what's in `js/data.js` now.
   Anything in a `Covers` subfolder gets `cover: true` automatically.
2. That generated JSON replaces the placeholder arrays in `js/data.js`.
3. In `js/shared.js`, flip `const IS_DEMO = true;` to `false` — this switches the thumbnail/
   download URL builders from Picsum placeholders to real Drive URLs.

No other code changes needed — pages, lightbox, video modal, collages, and downloads list all
read from the same manifest shape regardless of whether it's demo or real data.

## Notes
- Couple names, date, and copy are placeholders — easy to find/replace across the HTML files.
- Cover photos on the homepage event cards currently point at Picsum; swap for real cover image URLs once available.
- Each event page's collage needs at least 4 `cover: true` photos in that category to display — fewer than that, and the collage section hides itself automatically rather than showing a broken layout.

