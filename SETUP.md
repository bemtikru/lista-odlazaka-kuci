# Quick Setup Guide

## Prerequisites
- GitHub account
- Google account
- 15 minutes of your time

## Step-by-Step Setup (Simplified)

### Part 1: Google Cloud Setup (5 minutes)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create new project: "Lista odlazaka kući"

2. **Enable APIs**
   - Go to: APIs & Services > Library
   - Enable: "Google Sheets API"

3. **Create OAuth Client**
   - Go to: APIs & Services > Credentials
   - Create OAuth client ID > Web application
   - Add origin: `https://YOUR-GITHUB-USERNAME.github.io`
   - Copy the Client ID

4. **Create API Key**
   - Create Credentials > API Key
   - Restrict to: Google Sheets API
   - Copy the API Key

### Part 2: Google Sheet Setup (2 minutes)

1. **Create Spreadsheet**
   - Go to: https://sheets.google.com
   - Create new sheet: "Lista odlazaka kući"
   - Add headers in row 1:
     ```
     Timestamp | Week | Email | Ime i Prezime | Idem prije Petka | Ostajem cijeli vikend | Petak vrijeme odlaska | Petak ručak | Petak večera | Subota vrijeme odlaska | Subota ručak | Subota večera | Nedjelja ručak | Nedjelja večera
     ```

2. **Share the Sheet**
   - Click Share
   - Set to: "Anyone with the link" can "Edit"
   - Copy the Spreadsheet ID from URL

### Part 3: Configure Files (3 minutes)

1. **Edit index.html**
   - Find line 294:
   ```javascript
   const CONFIG = {
       GOOGLE_CLIENT_ID: 'PASTE_CLIENT_ID_HERE',
       SPREADSHEET_ID: 'PASTE_SPREADSHEET_ID_HERE',
       API_KEY: 'PASTE_API_KEY_HERE'
   };
   ```

2. **Edit admin.html**
   - Find line 236:
   - Paste the same three values

### Part 4: Deploy to GitHub (5 minutes)

1. **Create Repository**
   - Go to: https://github.com/new
   - Name: `lista-odlazaka-kuci`
   - Make it Public
   - Create repository

2. **Upload Files**
   - Click "Add file" > "Upload files"
   - Drag and drop all 4 files:
     - index.html
     - admin.html
     - README.md
     - .gitignore
   - Commit changes

3. **Enable GitHub Pages**
   - Go to: Settings > Pages
   - Source: "Deploy from a branch"
   - Branch: main / root
   - Save

4. **Wait 2 minutes** then visit:
   - App: `https://YOUR-USERNAME.github.io/lista-odlazaka-kuci/`
   - Admin: `https://YOUR-USERNAME.github.io/lista-odlazaka-kuci/admin.html`

## Done! 🎉

Your app is now live and ready to use.

## Important URLs to Save

- **User App**: `https://YOUR-USERNAME.github.io/lista-odlazaka-kuci/`
- **Admin Dashboard**: `https://YOUR-USERNAME.github.io/lista-odlazaka-kuci/admin.html`
- **Google Sheet**: (your spreadsheet URL)

## Testing

1. Open the user app
2. Sign in with Google
3. Fill out the form
4. Submit
5. Check the Google Sheet - data should appear
6. Open admin dashboard - see real-time data

## Common Issues

**"Failed to submit"**
→ Make sure Google Sheet is shared with "Anyone with link can edit"

**"Sign in failed"**
→ Check OAuth origins include your GitHub Pages URL

**"CORS error"**
→ Make sure you're using HTTPS (GitHub Pages URL), not opening the file directly

## Need Help?

Check the full README.md for detailed troubleshooting and customization options.
