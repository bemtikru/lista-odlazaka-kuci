# Configuration Example

This file shows you exactly where to find and paste your configuration values.

## Step 1: Get Your Values

### Google Client ID
**Where to find it:**
- Google Cloud Console > APIs & Services > Credentials
- Look for "OAuth 2.0 Client IDs"
- Format: `123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com`

### Spreadsheet ID
**Where to find it:**
- Open your Google Sheet
- Look at the URL: `https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_ID/edit`
- Format: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` (example)

### API Key
**Where to find it:**
- Google Cloud Console > APIs & Services > Credentials
- Look for "API Keys"
- Format: `AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqwS8` (example)

## Step 2: Open Files and Replace

### In index.html (around line 294):

**BEFORE (what you see now):**
```javascript
const CONFIG = {
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE',
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
    API_KEY: 'YOUR_GOOGLE_API_KEY_HERE'
};
```

**AFTER (with your actual values):**
```javascript
const CONFIG = {
    GOOGLE_CLIENT_ID: '123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com',
    SPREADSHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    API_KEY: 'AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqwS8'
};
```

### In admin.html (around line 236):

Do the exact same replacement with the same three values.

## Important Notes

1. **Keep the quotes** around the values
2. **Don't add spaces** before or after the values
3. **Both files** (index.html and admin.html) need the same values
4. **Save the files** after editing
5. **Upload to GitHub** after saving

## Verification Checklist

✅ Client ID starts with numbers and ends with `.apps.googleusercontent.com`
✅ Spreadsheet ID is a long string of letters, numbers, and special characters
✅ API Key starts with `AIza`
✅ All three values are wrapped in single quotes
✅ No typos or extra spaces
✅ Both files are updated
✅ Files are saved

## Test Your Configuration

After uploading to GitHub Pages:
1. Visit your app URL
2. Open browser console (F12)
3. Click "Sign in with Google"
4. If successful → Configuration is correct! ✅
5. If error → Check console for error messages and verify values

## Need Help Finding the CONFIG Section?

**For index.html:**
- Search for: `const CONFIG = {`
- Should be around line 294
- Inside the `<script>` section near the bottom

**For admin.html:**
- Search for: `const CONFIG = {`
- Should be around line 236
- Inside the `<script>` section near the bottom

## Example of Complete Setup

```javascript
// ✅ CORRECT EXAMPLE
const CONFIG = {
    GOOGLE_CLIENT_ID: '123456789012-abc123def456ghi789jkl012mno345pqr.apps.googleusercontent.com',
    SPREADSHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    API_KEY: 'AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqwS8'
};

// ❌ WRONG - Missing quotes
const CONFIG = {
    GOOGLE_CLIENT_ID: 123456789012-abc123def456ghi789jkl012mno345pqr.apps.googleusercontent.com,
    SPREADSHEET_ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms,
    API_KEY: AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqwS8
};

// ❌ WRONG - Not replaced
const CONFIG = {
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE',
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
    API_KEY: 'YOUR_GOOGLE_API_KEY_HERE'
};
```

You've got this! 💪
