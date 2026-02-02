# Lista odlazaka kući

A mobile-optimized web application for weekly departure scheduling with Google authentication and real-time Google Sheets integration.

## Features

- ✅ Google Sign-In authentication
- ✅ Mobile-first responsive design
- ✅ Real-time data sync to Google Sheets
- ✅ Weekly automatic reset (Saturday midnight)
- ✅ Admin dashboard with live statistics
- ✅ Export data to Excel/CSV
- ✅ 23 users with individual dropdown selections
- ✅ Tracks meals and departure times for Friday, Saturday, and Sunday

## Files

- `index.html` - Main user application
- `admin.html` - Admin dashboard for viewing submissions
- `README.md` - This file
- `.gitignore` - Git ignore file

## Setup Instructions

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Name it "Lista odlazaka kući" or whatever you prefer

### 2. Enable Required APIs

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search and enable these APIs:
   - **Google Sheets API**
   - **Google Identity Services**

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Configure consent screen if prompted:
   - User Type: External
   - App name: Lista odlazaka kući
   - User support email: Your email
   - Developer contact: Your email
   - Add test users (the 23 people who will use the app)
4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: Lista odlazaka kući
   - Authorized JavaScript origins: 
     - `https://yourusername.github.io` (replace with your GitHub username)
     - `http://localhost:8000` (for local testing)
   - Authorized redirect URIs:
     - `https://yourusername.github.io/lista-odlazaka-kuci` (replace with your repo name)
5. Copy the **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)

### 4. Create API Key

1. Still in **Credentials**, click **Create Credentials** > **API key**
2. Copy the API key
3. Click **Edit API key** and restrict it:
   - Application restrictions: **HTTP referrers**
   - Add referrer: `yourusername.github.io/*`
   - API restrictions: **Restrict key** > Select **Google Sheets API**
4. Save

### 5. Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Lista odlazaka kući"
4. Add headers in the first row (Sheet1):
   ```
   Timestamp | Week | Email | Ime i Prezime | Idem prije Petka | Ostajem cijeli vikend | Petak vrijeme odlaska | Petak ručak | Petak večera | Subota vrijeme odlaska | Subota ručak | Subota večera | Nedjelja ručak | Nedjelja večera
   ```
5. Copy the Spreadsheet ID from the URL:
   - URL: `https://docs.google.com/spreadsheets/d/1abc123def456ghi789/edit`
   - ID: `1abc123def456ghi789`
6. **IMPORTANT**: Share the spreadsheet:
   - Click **Share** button
   - Change access to: **Anyone with the link** can **Edit**
   - This is required for the app to write data

### 6. Configure the Application

Open both `index.html` and `admin.html` files and replace these values in the CONFIG object:

```javascript
const CONFIG = {
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE',      // From step 3
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',          // From step 5
    API_KEY: 'YOUR_GOOGLE_API_KEY_HERE'                  // From step 4
};
```

### 7. Deploy to GitHub Pages

1. Create a new repository on GitHub:
   - Name: `lista-odlazaka-kuci` (or any name you prefer)
   - Make it public
2. Upload all files to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/lista-odlazaka-kuci.git
   git push -u origin main
   ```
3. Enable GitHub Pages:
   - Go to repository **Settings** > **Pages**
   - Source: **Deploy from a branch**
   - Branch: **main** / **root**
   - Click **Save**
4. Wait 1-2 minutes for deployment
5. Your app will be available at: `https://yourusername.github.io/lista-odlazaka-kuci/`

### 8. Update OAuth Authorized Origins

1. Go back to Google Cloud Console > **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add your actual GitHub Pages URL to **Authorized JavaScript origins**:
   - `https://yourusername.github.io`
4. Add to **Authorized redirect URIs**:
   - `https://yourusername.github.io/lista-odlazaka-kuci`
5. Save

## Testing Locally

To test before deploying:

1. Install a simple HTTP server (Python comes with one):
   ```bash
   python -m http.server 8000
   ```
2. Open browser to `http://localhost:8000`
3. Make sure `http://localhost:8000` is in your OAuth authorized origins

## Usage

### For Users

1. Visit the app URL
2. Click "Prijavi se s Google računom"
3. Sign in with Google account
4. Select your name from the dropdown
5. Fill out all fields
6. Click "Pošalji"

### For Admin

1. Visit `https://yourusername.github.io/lista-odlazaka-kuci/admin.html`
2. Sign in with Google account
3. View all submissions in real-time
4. Export data to CSV/Excel
5. Auto-refreshes every 30 seconds

## Weekly Reset

The app automatically tracks submissions by week. Each week starts fresh on Saturday at midnight. Historical data is preserved in the Google Sheet with week identifiers (e.g., "2026-W5").

## Troubleshooting

### "Failed to submit data"
- Check that the Google Sheet is shared with "Anyone with the link can edit"
- Verify the SPREADSHEET_ID is correct
- Make sure Google Sheets API is enabled

### "Sign in failed"
- Check that GOOGLE_CLIENT_ID is correct
- Verify your domain is in OAuth authorized origins
- Make sure the OAuth consent screen is published (or users are added as test users)

### "CORS error"
- You must serve the files from a web server (GitHub Pages or local server)
- Cannot open index.html directly as a file (file:// protocol won't work)

### App not loading on GitHub Pages
- Wait 1-2 minutes after enabling GitHub Pages
- Check repository is public
- Verify files are in the root directory (not in a subfolder)

## Customization

### Change Colors
Edit the CSS gradient in both files:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change Dropdown Options
Edit the `<select>` elements in `index.html`

### Change Week Reset Day
Modify the `getWeekNumber()` function to change the day of week calculation

## Data Structure

Each submission creates a row in Google Sheets with:
- Timestamp (when submitted)
- Week identifier (e.g., "2026-W5")
- User email
- Name (selected from dropdown)
- 10 data fields (going before Friday, staying whole weekend, departure times, meals)

## Security Notes

- API key is restricted to Google Sheets API and your domain
- OAuth is properly configured for your domain only
- Google Sheet requires link sharing but users must be authenticated
- No sensitive data stored in localStorage or cookies

## Support

For issues or questions:
1. Check Google Cloud Console for API errors
2. Verify all configuration values are correct
3. Check browser console for JavaScript errors
4. Ensure Google Sheet permissions are correct

## License

Open source - feel free to modify and use as needed.
