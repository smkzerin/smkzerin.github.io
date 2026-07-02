# Zerin & Shoumik — Wedding Showcase

A wedding photo/video gallery for Zerin and Shoumik's three ceremonies: Holud (night one), Wedding (night two), and Reception / Bou-Bhaat (night three).

💒 Built with plain HTML, vanilla JS, and Tailwind CSS (CDN, no build step). Hosted on GitHub Pages.

## ✨ Features

- **Photo galleries** per event with lazy-loaded grid and infinite scroll
- **Carousel** at the top of each page sourced from Covers subfolders
- **Lightbox** for full-resolution photo viewing with keyboard/touch navigation
- **Video modal** with inline playback and download links
- **Person filter tabs** on the Holud page to split photos by Zerin / Shoumik
- **Download page** with per-file and per-folder links
- **Responsive** layout with mobile hamburger menu
- **Clean URLs** — `/holud`, `/wedding`, `/reception`, `/downloads` (no `.html` extension)

## 🛠️ Tech stack

- HTML5, Vanilla JavaScript (ES6+), CSS3
- Tailwind CSS via CDN
- Google Fonts (Cormorant Garamond + Jost)
- Google Drive as media storage
- GitHub Pages for hosting
- GitHub Actions for scheduled data generation

## 📁 File structure

```
├── index.html            # Homepage with hero carousel and event cards
├── holud.html            # Holud gallery with person filter tabs
├── wedding.html          # Wedding gallery
├── reception.html        # Reception gallery
├── downloads.html        # Per-file and folder download page
├── style.css             # Custom styles (Tailwind via CDN)
├── data.js               # Media manifest (auto-generated)
├── shared.js             # Lightbox, video modal, carousel, Drive URL helpers
├── gallery.js            # Gallery rendering, person filters, infinite scroll
├── generate-data.js      # Build-time script to generate data.js from Drive
└── .github/workflows/
    └── generate-data.yml # GitHub Actions workflow
```

## ☁️ Google Drive setup

Holud and Wedding/Reception live on separate Drive accounts. Follow this folder structure exactly — the fetch script uses subfolder names to set `category`, `type`, and `person` automatically.

```
[Holud Drive account]
└── Holud Night/
    ├── Photos/
    │   ├── Zerin/       ← person: "zerin"
    │   └── Shoumik/     ← person: "shoumik"
    ├── Videos/
    └── Covers/          ← 4–12 favourite shots for the carousel

[Wedding + Reception Drive account]
└── Wedding Night/
    ├── Photos/
    ├── Videos/
    └── Covers/

└── Reception/
    ├── Photos/
    ├── Videos/
    └── Covers/
```

**Key rules:**
- 📸 Filenames can stay as-is from your camera (`IMG_xxxx.jpg`, etc.)
- 👰 Everything inside `Photos/Zerin/` gets tagged `person: "zerin"`
- 🤵 Everything inside `Photos/Shoumik/` gets tagged `person: "shoumik"`
- ⭐ Photos in a `Covers/` subfolder get tagged `cover: true`
- 🔗 Set sharing on every top-level folder to **"Anyone with the link — Viewer"**

## ⚙️ Data generation

`data.js` is generated from Google Drive by running:

```bash
node generate-data.js
```

You need a Google API key with the Drive API enabled, stored as an environment variable:

```bash
set GOOGLE_API_KEY=your_key_here
node generate-data.js
```

The script reads the Drive folder IDs configured inside `generate-data.js`, walks the folder tree, and writes `data.js` with the complete media manifest.

## 🤖 CI/CD

A GitHub Actions workflow (`.github/workflows/generate-data.yml`) can be triggered manually via `workflow_dispatch`. It checks out the repo, runs `node generate-data.js` with the `GOOGLE_API_KEY` secret, and commits/pushes the updated `data.js` back to the repository.

## ❤️ Credits

Site built for Zerin and Shoumik by [Pranto](https://pranto-smss.github.io/).
