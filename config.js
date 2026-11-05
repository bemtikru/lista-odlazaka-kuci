// Zajednička podešavanja za index.html i admin.html.
// Ovdje se mijenja ono što je zajedničko - HTML datoteke ne treba dirati.
window.APP_CONFIG = {
    // Google OAuth Client ID (Google Cloud Console > APIs & Services > Credentials)
    GOOGLE_CLIENT_ID: '406542478341-9s7qehkmblkr3n0h1r78a0gq9dumv473.apps.googleusercontent.com',

    // URL Apps Script web aplikacije (Deploy > Manage deployments > Web app URL)
    WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbwKA9VBT_fM0Rn9yNLpMHyotQcg8CVl4mfnXKVyf8RX3Gev4yyfzb2pXCPYzHUHW6V4hA/exec',

    // Broj odgojnih skupina (mora biti isti kao GROUP_COUNT u Code.gs)
    GROUP_COUNT: 7,

    // Skupina koju admin stranica otvara kad u linku nema ?skupina=
    DEFAULT_GROUP: 7
};
