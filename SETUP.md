# Setup guide

Two paths:

- **[A. Upgrading the existing single-group installation](#a-upgrading-from-the-single-group-version)** – what to do now
- **[B. Installing from scratch](#b-installing-from-scratch)**

Then: [C. Adding a group, an admin, or names](#c-day-to-day-adding-a-group-an-admin-or-names) ·
[D. Troubleshooting](#d-troubleshooting)

---

## A. Upgrading from the single-group version

Your current system is group **7**. The upgrade keeps all existing data and marks it as group 7.
Do the steps **in this order**, and do step 8 last.

1. **Back up.** In the spreadsheet: *File → Make a copy*.
2. **Update the script.** Open the script (*Extensions → Apps Script* from the spreadsheet).
   Select everything in `Code.gs`, replace it with the new `Code.gs`, press **Ctrl+S**.
3. **Run `setup` once.** In the function drop-down choose **`setup`**, click **Run**.
   If Google asks for permission: *Review permissions → your account → Advanced → Go to … (unsafe) → Allow*.
   Check the log says "Gotovo", and in the spreadsheet you now have:
   - tab **`Imena`** with a `Skupina` column (your 22 names = 7),
   - tab **`Admini`** with your email and `*`,
   - column **`O` "Skupina"** in `Sheet1`, filled with `7` for all old rows.
   `setup` is safe to run again – it never duplicates or overwrites data.
4. **Publish the new script version.** *Deploy → Manage deployments → ✏️ (edit) on the existing
   deployment → Version: **New version** → Deploy.*
   Do **not** choose "New deployment" – that would change the URL.
5. **Upload the site files** (GitHub → Netlify redeploys automatically):
   `config.js` (new), `index.html`, `admin.html`, `_redirects`, and the docs.
   Do this right after step 4. In between, students' old pages keep working (their submissions are
   stored as group 7), but the *old* admin page can no longer edit names.
6. **Test.**
   - `https://YOUR-SITE/?skupina=7` → the 22 names appear in the drop-down.
   - `https://YOUR-SITE/admin?skupina=7` → sign in with Google → table, statistics, names panel and PDF work.
   - Send one test submission and delete the test row in `Sheet1` afterwards.
7. **Give out the links** (see `README.md`). Tell group 7 to use `…/?skupina=7` – the old bare link
   now shows a group chooser.
8. **Lock the spreadsheet (last step).**
   - Spreadsheet → *Share → General access → **Restricted***.
   - Google Cloud Console → *APIs & Services → Credentials* → **delete the API key** the old admin
     page used. (The new pages no longer use any key.)
   - Test the admin page once more – it reads through the script, so it must still work.

**Rolling back:** in *Manage deployments* you can set the deployment back to the previous version,
and the previous HTML files are in your GitHub history.

---

## B. Installing from scratch

### 1. Google Cloud: the login (OAuth client)

1. <https://console.cloud.google.com/> → create a project (e.g. "Lista odlazaka kuci").
2. *APIs & Services → OAuth consent screen* (Google Auth platform): app name, your email;
   audience **External**. If it is in *Testing*, add the Google accounts that may sign in as test
   users, or publish it (basic sign-in needs no Google verification).
3. *Credentials → Create credentials → OAuth client ID → Web application*.
   **Authorized JavaScript origins:** `https://YOUR-SITE.netlify.app` (and your own domain if you
   use one). No redirect URIs are needed.
4. Copy the **Client ID**.

### 2. Google Sheet

1. Create a spreadsheet. Rename the first tab to **`Sheet1`**.
2. Row 1 headers (A–O):
   `Timestamp | Week | Email | Ime i Prezime | Idem prije Petka | Ostajem cijeli vikend | Petak vrijeme odlaska | Petak ručak | Petak večera | Subota vrijeme odlaska | Subota ručak | Subota večera | Nedjelja ručak | Nedjelja večera | Skupina`
3. Keep sharing **Restricted** (only you). Nothing else needs access.

### 3. Apps Script

1. In the spreadsheet: *Extensions → Apps Script*. Paste `Code.gs` over the default code.
2. At the top of `Code.gs` set `CLIENT_ID` (from step 1), `FIRST_ADMIN` (your Google email) and
   `GROUP_COUNT`.
3. Run **`setup`** (see A3). It creates `Imena`, `Admini` and the secret used for sessions.
4. *Deploy → New deployment → type **Web app*** · Execute as: **Me** · Who has access: **Anyone** →
   Deploy. Copy the **Web app URL**.

### 4. Site files

Edit `config.js`: `GOOGLE_CLIENT_ID`, `WEBHOOK_URL` (the Web app URL), `GROUP_COUNT`,
`DEFAULT_GROUP`. Nothing else in the HTML files needs editing – see `CONFIG_GUIDE.md`.

### 5. Netlify

Put `index.html`, `admin.html`, `config.js`, `_redirects` in the GitHub repository root and connect the
repository to a Netlify site (no build command, publish directory = root). Every push redeploys.
Then add the Netlify address to the OAuth client's authorized origins (step 1.3).

### 6. First test

Open `…/?skupina=N` and `…/admin?skupina=N` and follow A6.

---

## C. Day to day: adding a group, an admin, or names

**Add names to a group** – the group's admin (or you) opens `…/admin?skupina=N` →
*👥 Upravljanje imenima* → add one by one, or *Dodaj više imena odjednom*.

**Add an admin** – in the spreadsheet tab `Admini` add a row:

| Email | Skupine |
|---|---|
| `new.admin@gmail.com` | `3` |
| `second.person@gmail.com` | `3,5` |
| `you@gmail.com` | `*` |

The email must be the exact Google account they will sign in with. Removing the row cuts their access
immediately. An admin with an empty `Skupine` cell cannot sign in.

**Start a new group** – nothing to install: send the students `…/?skupina=N`, and the admin fills the
names (they will see "Popis imena … prazan" until then).

**Change the number of groups** – change `GROUP_COUNT` in both `Code.gs` and `config.js`, publish a
new script version, upload `config.js`.

---

## D. Troubleshooting

**Drop-down empty / "Popis imena nije učitan".** Open
`WEBHOOK_URL?action=names&skupina=7` in a browser tab:

| You see | Meaning / fix |
|---|---|
| `{"success":true,"names":[…]}` | Script is fine – hard-refresh the page (Ctrl+F5) |
| `Script function not found: doGet` | New version not published – step A4 |
| `…Kartica "Imena" ne postoji…` | Run `setup` – step A3 |
| A Google sign-in page | Deployment access is not *Anyone* – edit the deployment |

**"Nemate ovlasti".** The signed-in email is not in `Admini` (or that row has no groups). Check for
typos and that they chose the right Google account.

**"Sesija je istekla".** Sessions last 12 hours; sign in again.

**"Ime nije na popisu ove odgojne skupine".** The student opened the wrong group's link, or an admin
removed/renamed their name. Check the names panel.

**Changes not visible after upload.** Wait for Netlify to finish deploying, then Ctrl+F5.

**"Google hasn't verified this app" when authorizing the script.** Expected for your own script:
Advanced → Go to … (unsafe) → Allow.

**The permission page in your Google account calls the script "Untitled project".** Cosmetic –
the name comes from the hidden Google Cloud project behind the script. It is your own script.
