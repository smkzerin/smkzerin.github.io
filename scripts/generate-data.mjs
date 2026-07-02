/**
 * generate-data.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches file listings from Google Drive and writes data.js.
 *
 * The API key is read from the GOOGLE_API_KEY environment variable.
 * It is NEVER hardcoded here — set it as a GitHub Secret for the Action,
 * or export it in your terminal for local runs:
 *
 *   Windows PowerShell:  $env:GOOGLE_API_KEY="AIza..."
 *   Mac/Linux:           export GOOGLE_API_KEY="AIza..."
 *
 * Then run:   node generate-data.mjs
 *
 * Requires Node 18+. No npm installs needed.
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── API KEY from environment — never hardcoded ────────────────────────────────
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error(`
❌  GOOGLE_API_KEY environment variable is not set.

Set it before running:
  Windows PowerShell:  $env:GOOGLE_API_KEY="AIza..."
  Mac/Linux:           export GOOGLE_API_KEY="AIza..."

Then run: node generate-data.mjs
`);
  process.exit(1);
}

// ── THUMBNAILS FOLDER ─────────────────────────────────────────────────────────
// A single folder that holds custom thumbnail images for videos.
// Name each image file after the video's Drive file ID (e.g. "1abc123.jpg").
const THUMBNAILS_FOLDER_ID = "1Iunwqjp0sU1KXzVeWP0FVnlp0z6WKZLd";

// ── FOLDER CONFIG ─────────────────────────────────────────────────────────────
// Set each folder's Drive ID and skip:false once it's been uploaded.
// Folder IDs come from the share URL:
//   https://drive.google.com/drive/folders/FOLDER_ID_HERE
const FOLDERS = [
  // ── HOLUD ─────────────────────────────────────────────────────────────────
  {
    id:       "1lS1_X_bym99TmBPaeJ4Hs6kWh3_dc9aN", // Holud/Photos/Zerin ✅
    category: "holud",
    type:     "photo",
    person:   "zerin",
    skip:     false,
  },
  {
    id:       "1s1aNeE0UsVAbz3GwMzWqOwMuokintkZw", // Holud/Photos/Shoumik ✅
    category: "holud",
    type:     "photo",
    person:   "shoumik",
    skip:     false,
  },
  {
    id:       "1EF4U831ZIw1oAm8K33T8-V95oKuwQmAh",
    category: "holud",
    type:     "video",
    skip:     true,
  },
  {
    id:       "1_PMCD3MrfLoU4m6JyRtGNBcVBt7Kgl9O",
    category: "holud",
    type:     "photo",
    cover:    true,
    skip:     true,
  },

  // ── WEDDING ───────────────────────────────────────────────────────────────
  {
    id:       "1-ML4PDxsMAJiNkDMRfkbcM041Xk9CZDy",
    category: "wedding",
    type:     "photo",
    skip:     false,
  },
  {
    id:       "1faJuP0o4ycnRPZCZ8hIYCf3un7yzWuDh",
    category: "wedding",
    type:     "video",
    skip:     true,
  },
  {
    id:       "1Oj-6KRfyeT54IphIhYhahZuiUDOc6JoC",
    category: "wedding",
    type:     "photo",
    cover:    true,
    skip:     true,
  },

  // ── RECEPTION ─────────────────────────────────────────────────────────────
  {
    id:       "1PeR9AiyZP8VLEUnvv_UFlyK0wr4Pt983",
    category: "reception",
    type:     "photo",
    skip:     false,
  },
  {
    id:       "1vhQsTFlDSfmczOveN9Hfp2Yaea2LQ6kj",
    category: "reception",
    type:     "video",
    skip:     false,
  },
  {
    id:       "1DK2YFdnOvD31mhi1ufBumwZuppcIv7nV",
    category: "reception",
    type:     "photo",
    cover:    true,
    skip:     false,
  },
];

// ── PLACEHOLDER COUNTS ────────────────────────────────────────────────────────
const PLACEHOLDER_COUNTS = { photo: 18, video: 4, cover: 4 };

function makePlaceholders(folder) {
  const count = folder.cover
    ? PLACEHOLDER_COUNTS.cover
    : PLACEHOLDER_COUNTS[folder.type];
  return Array.from({ length: count }, (_, i) => {
    const item = {
      id:       `DEMO-${folder.category}-${folder.type}-${folder.person || ""}-${i + 1}`,
      name:     `${folder.category} ${folder.type} ${i + 1}`,
      category: folder.category,
      type:     folder.type,
    };
    if (folder.person) item.person = folder.person;
    if (folder.cover)  item.cover  = true;
    return item;
  });
}

// ── DRIVE API ─────────────────────────────────────────────────────────────────
async function listDriveFolder(folderId) {
  const allFiles = [];
  let pageToken = null;

  do {
    const params = new URLSearchParams({
      q:         `'${folderId}' in parents and trashed = false`,
      fields:    "nextPageToken, files(id, name, mimeType)",
      pageSize:  "1000",
      key:       API_KEY,
      ...(pageToken && { pageToken }),
    });

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params}`
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `Drive API error for folder ${folderId}: ${res.status} — ${JSON.stringify(err?.error?.message || err)}`
      );
    }

    const data = await res.json();
    allFiles.push(...(data.files || []));
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return allFiles;
}

// ── THUMBNAIL MAP ──────────────────────────────────────────────────────────────
// Fetch the Thumbnails folder and build a lookup: videoDriveId → thumbnailFileId
const thumbMap = {};
try {
  const thumbFiles = await listDriveFolder(THUMBNAILS_FOLDER_ID);
  for (const f of thumbFiles) {
    if (f.mimeType.startsWith("image/")) {
      const name = f.name.replace(/\.[^.]+$/, "");
      thumbMap[name] = f.id;
    }
  }
  console.log(`✓  Thumbnails: ${Object.keys(thumbMap).length} custom thumbnails loaded`);
} catch (err) {
  console.error(`⚠  Thumbnails: ${err.message} — continuing without custom thumbnails`);
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
const photos = [];
const videos = [];
let realCount = 0;
let placeholderCount = 0;

for (const folder of FOLDERS) {
  const label = [folder.category, folder.type, folder.person, folder.cover && "covers"]
    .filter(Boolean).join("/");

  if (folder.skip) {
    const placeholders = makePlaceholders(folder);
    (folder.type === "video" ? videos : photos).push(...placeholders);
    placeholderCount += placeholders.length;
    console.log(`⚠  ${label}: skipped — ${placeholders.length} placeholders`);
    continue;
  }

  try {
    const files = await listDriveFolder(folder.id);
    const items = files
      .filter(f =>
        f.mimeType.startsWith("image/") ||
        f.mimeType.startsWith("video/")
      )
      .map(f => {
        const item = { id: f.id, name: f.name, category: folder.category, type: folder.type };
        if (folder.person) item.person = folder.person;
        if (folder.cover)  item.cover  = true;
        if (folder.type === "video" && thumbMap[f.id]) item.thumbId = thumbMap[f.id];
        return item;
      });

    (folder.type === "video" ? videos : photos).push(...items);
    realCount += items.length;
    console.log(`✓  ${label}: ${items.length} real files`);
  } catch (err) {
    console.error(`✗  ${label}: ${err.message}`);
    process.exit(1);
  }
}

// ── WRITE OUTPUT ──────────────────────────────────────────────────────────────
const output = `/*
  data.js — generated by generate-data.js on ${new Date().toISOString()}
  ${realCount} real Drive files  |  ${placeholderCount} placeholders (folders not yet uploaded)
  Do NOT edit by hand — re-run generate-data.js or trigger the GitHub Action.

  Schema per item:
    id        -> Google Drive file ID  (or DEMO-* for placeholders)
    name      -> filename as stored in Drive
    category  -> "holud" | "wedding" | "reception"
    type      -> "photo" | "video"
    person    -> "zerin" | "shoumik"   (Holud photos only)
    cover     -> true                  (items from Covers subfolder)
    thumbId   -> Drive file ID of custom thumbnail image (video items only)
*/

const MEDIA = {
  photos: ${JSON.stringify(photos, null, 2)},
  videos: ${JSON.stringify(videos, null, 2)}
};
`;

// Write to the JavaScript assets folder used by the site
const outPath = resolve(__dirname, "../js/data.js");
writeFileSync(outPath, output, "utf8");

console.log(`\n✅  data.js written to: ${outPath}`);
console.log(`    ${realCount} real  |  ${placeholderCount} placeholder`);
