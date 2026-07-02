# Generating data.js — API key stays secret, always

The API key is stored in GitHub Secrets and never appears in any file in the repo.

---

## One-time setup (10 minutes)

### 1 — Get a Google API key

1. Go to https://console.cloud.google.com
2. Create a new project (e.g. "Wedding Site")
3. Left sidebar → **APIs & Services → Library** → search **Google Drive API** → Enable
4. Left sidebar → **APIs & Services → Credentials** → **+ Create Credentials → API key**
5. Copy the key
6. Click **Edit key → API restrictions → Restrict to Google Drive API** (recommended)

### 2 — Add it as a GitHub Secret

1. Open your repo on GitHub
2. **Settings → Secrets and variables → Actions → New repository secret**
3. Name: `GOOGLE_API_KEY`
4. Value: paste your key
5. Click **Add secret**

The key is now encrypted in GitHub. It will never appear in logs, diffs, or files.

### 3 — Add folder IDs to generate-data.js

As you upload each Drive folder, open `generate-data.js` and:
- Replace the placeholder ID (e.g. `"HOLUD_PHOTOS_SHOUMIK_FOLDER_ID"`) with the real folder ID
  from its share URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
- Change `skip: true` → `skip: false` for that folder
- Commit and push

---

## Running the Action (whenever you upload new photos)

1. Go to your repo on GitHub
2. Click the **Actions** tab
3. Click **Generate data.js from Google Drive** in the left sidebar
4. Click **Run workflow** → **Run workflow**

The Action will:
- Fetch all real Drive folders (those with `skip: false`)
- Use placeholder data for any folder still marked `skip: true`
- Commit the generated `data.js` directly back into your repo
- The site on GitHub Pages will update automatically within ~30 seconds

---

## Running locally (optional)

If you want to test without triggering the Action:

```powershell
# Windows PowerShell
$env:GOOGLE_API_KEY="AIza...your-key-here..."
node generate-data.js
```

```bash
# Mac / Linux
export GOOGLE_API_KEY="AIza...your-key-here..."
node generate-data.js
```

---

## Folder progress tracker

| Folder | ID in generate-data.js | skip |
|--------|------------------------|------|
| Holud/Photos/Zerin     | ✅ real ID | false |
| Holud/Photos/Shoumik   | ✅ real ID | false |
| Holud/Videos           | ✅ real ID | true |
| Holud/Covers           | ✅ real ID | true |
| Wedding/Photos         | ✅ real ID | false |
| Wedding/Videos         | ✅ real ID | true |
| Wedding/Covers         | ✅ real ID | true |
| Reception/Photos       | ✅ real ID | false |
| Reception/Videos       | ✅ real ID | false |
| Reception/Covers       | ✅ real ID | false |

Update this table as you go.
