# Configuration guide

Almost everything you may want to change is in **two places**: `config.js` (the website) and the first
lines of `Code.gs` (the script). The HTML files do not need editing.

## `config.js` (shared by `index.html` and `admin.html`)

```javascript
window.APP_CONFIG = {
    GOOGLE_CLIENT_ID: '1234567890-abc….apps.googleusercontent.com',
    WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycb…/exec',
    GROUP_COUNT: 7,
    DEFAULT_GROUP: 7
};
```

| Setting | What it is | Where to find it |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Google sign-in client | Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs |
| `WEBHOOK_URL` | The script's web address | Apps Script → Deploy → Manage deployments → *Web app* URL (ends in `/exec`) |
| `GROUP_COUNT` | Number of odgojne skupine (links `?skupina=1` … `N`) | – |
| `DEFAULT_GROUP` | Group the admin page opens when the link has no `?skupina=` | – |

The spreadsheet ID and the API key are **no longer needed** anywhere on the website.

## `Code.gs` (top of the file)

| Setting | Default | Meaning |
|---|---|---|
| `CLIENT_ID` | – | Must be **identical** to `GOOGLE_CLIENT_ID` in `config.js` (the script refuses Google logins issued for another app) |
| `FIRST_ADMIN` | your email | Written into the `Admini` tab by `setup()` the first time. Afterwards manage admins in the tab |
| `GROUP_COUNT` | 7 | Must be **identical** to `GROUP_COUNT` in `config.js` |
| `LEGACY_GROUP` | 7 | Group that old rows/names without a group belong to (the pre-groups data) |
| `MAX_NAMES` | 35 | Maximum names per group |
| `SESSION_HOURS` | 12 | How long an admin stays signed in |
| `DEFAULT_NAMES` | 22 names | Seed list for group 7, used only when `Imena` is empty |

After changing `Code.gs`: **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**
(saving alone does not change what the live web app does).

## Values that must match

| | `config.js` | `Code.gs` | Google Cloud |
|---|---|---|---|
| Client ID | `GOOGLE_CLIENT_ID` | `CLIENT_ID` | the OAuth client itself |
| Number of groups | `GROUP_COUNT` | `GROUP_COUNT` | – |
| Site address | – | – | *Authorized JavaScript origins* |

## The `Admini` tab

| Email | Skupine |
|---|---|
| `you@gmail.com` | `*` |
| `ana@gmail.com` | `3` |
| `marko@gmail.com` | `3,5` |

- Email: the exact Google account (capitalisation is ignored).
- Skupine: `*` for all groups, or group numbers separated by commas. Empty = cannot sign in.

## Common mistakes

- Pasting a **new deployment** URL after "New deployment" – the URL changes; use *Manage deployments → edit → New version* instead.
- Editing `Code.gs` and forgetting to publish a new version.
- `GROUP_COUNT` different in the two files (links beyond the smaller number are rejected).
- Forgetting to add the Netlify address to *Authorized JavaScript origins* (Google login fails with `origin_mismatch`).
- Keeping the spreadsheet shared publicly – set it to **Restricted**; the script does not need public access.
