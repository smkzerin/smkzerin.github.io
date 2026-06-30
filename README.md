# Tamaz & Shoumik — wedding showcase (demo)

This is a working demo built with plain HTML, vanilla JS, and Tailwind (via CDN, no build step).
All photos/videos right now are **placeholders** (Picsum images + a sample clip) — no real
Google Drive files are wired in yet.

## Structure
- `index.html` — homepage with a staggered, rotated photo collage hero (cycles through sets of 4 featured photos) and links into each night
- `holud.html`, `wedding.html` — galleries (video row + lazy-loaded, "load more" photo grid)
- `downloads.html` — per-file download list + whole-folder shortcuts
- `js/data.js` — the media manifest (currently placeholder data). Items flagged `cover: true` are what feed the homepage collage.
- `js/shared.js` — Drive URL builders, lightbox, video modal, hero collage cycling
- `js/gallery.js` — gallery rendering / batching logic
- `css/style.css` — fonts, color tokens, the marigold "garland" divider, collage layout

## Swapping in real files later
Once you upload the real photos/videos to Drive:
1. We'll run a fetch script against the Drive API to list your folders and generate real
   `id` / `name` / `category` / `type` entries — same shape as what's in `js/data.js` now.
   Mark your favorite 4, 8, or 12 shots per night with `cover: true` so they show up in the
   homepage collage.
2. That generated JSON replaces the placeholder arrays in `js/data.js`.
3. In `js/shared.js`, flip `const IS_DEMO = true;` to `false` — this switches the thumbnail/
   download URL builders from Picsum placeholders to real Drive URLs.

No other code changes needed — pages, lightbox, video modal, collage, and downloads list all
read from the same manifest shape regardless of whether it's demo or real data.

## Notes
- Couple names, date, and copy are placeholders — easy to find/replace across the HTML files.
- Cover photos on the homepage event cards currently point at Picsum; swap for real cover image URLs once available.
- The homepage collage cycles through every group of 4 `cover: true` photos via the arrow buttons — add more cover-flagged photos any time to extend it.
