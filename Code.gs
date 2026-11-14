/**
 * Lista odlazaka kući - Apps Script (više odgojnih skupina)
 *
 * Kartice u tablici:
 *   Sheet1  - prijave (A:N kao i prije, O = Skupina)
 *   Imena   - popis imena (A Prezime, B Ime, C Skupina)
 *   Admini  - tko smije u admin (A Email, B Skupine: * ili npr. 3 ili 3,5)
 *
 * Javno (bez prijave):
 *   GET  ?action=names&skupina=N        -> popis imena skupine
 *   POST (bez "action")                 -> prijava učenika
 * Učenik (Google prijava -> sesija): studentLogin, myStatus, submit
 * Samo admin (POST s "action" i "session"):
 *   login, getData, listNames, addName, addNames, editName, removeName
 */

var DATA_SHEET   = 'Sheet1';
var NAMES_SHEET  = 'Imena';
var ADMINS_SHEET = 'Admini';
var CLIENT_ID    = '406542478341-9s7qehkmblkr3n0h1r78a0gq9dumv473.apps.googleusercontent.com';
var FIRST_ADMIN  = 'kristijankatic@gmail.com';   // upisuje se u karticu Admini pri prvom setup()
var GROUP_COUNT  = 7;     // broj odgojnih skupina (isto u config.js)
var LEGACY_GROUP = 7;     // skupina kojoj pripadaju stari zapisi bez oznake skupine
var MAX_NAMES    = 35;    // po skupini (PDF se do toliko redaka automatski prilagođava)
var SESSION_HOURS = 12;
var GROUP_COL    = 15;    // Sheet1: stupac O
var STAY_REASONS = ['praksa', 'nastava', 'školski izlet', 'prijevoz', 'ostalo'];   // razlozi za OSTAJEM CIJELI VIKEND
var MAX_EMAILS   = 3;     // najviše adresa e-pošte po članu (npr. školska + privatna)
// Kad je false: član čiji Google račun još nije povezan s imenom i dalje bira ime sa popisa (prijelazno razdoblje).
// Kad je true: prijavu može poslati samo član čiji je račun povezan s imenom (admin upisuje e-poštu u karticu Imena).
var REQUIRE_PROFILE = false;

// Početni popis za skupinu 7 (upisuje se samo ako je kartica Imena prazna)
var DEFAULT_NAMES = [
  ['Babić', 'Stjepan'], ['Bernardić', 'Niko'], ['Božičević', 'Josip'], ['Božičević', 'Maks Anton'],
  ['Ferara', 'Patrik'], ['Herceg', 'Mihael'], ['Išek', 'Dominik'], ['Jerčić', 'Duje'],
  ['Jurčević', 'Patrik'], ['Kukuruzović', 'Slavko'], ['Maračić', 'Luka'], ['Mičurin', 'Marko'],
  ['Petričušić', 'Patrik'], ['Rahan', 'Gabriel'], ['Rendulić', 'Noa Izak'], ['Sabljak', 'Marko'],
  ['Štemberger', 'Fran'], ['Tokić', 'Gabriel'], ['Tomičić', 'Karlo'], ['Turk', 'Niko'],
  ['Vuković', 'Stipe'], ['Žic', 'David']
];

// ---------------------------------------------------------------------------
// ULAZNE TOČKE
// ---------------------------------------------------------------------------

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (!data.action) return handleSubmission_(data);

    switch (data.action) {
      case 'login':      return json_(handleLogin_(data));
      case 'getData':    return json_(handleGetData_(data));
      case 'addName':
      case 'addNames':
      case 'editName':
      case 'removeName':
      case 'listNames':    return json_(handleNameAction_(data));
      case 'studentLogin': return json_(handleStudentLogin_(data));
      case 'myStatus':     return json_(handleMyStatus_(data));
      case 'submit':       return json_(handleStudentSubmit_(data));
      default: throw new Error('Nepoznata radnja.');   // nikad se ne sprema kao prijava
    }
  } catch (error) {
    return errorJson_(error);
  }
}

function doGet(e) {
  try {
    var p = (e && e.parameter) || {};
    if (p.action === 'names') {
      var group = (p.skupina === undefined || p.skupina === '') ? LEGACY_GROUP : parseGroup_(p.skupina);
      return json_({ success: true, skupina: group, names: namesForGroup_(group) });
    }
    return json_({ success: true, message: 'Lista odlazaka kući webhook' });
  } catch (error) {
    return errorJson_(error);
  }
}

// ---------------------------------------------------------------------------
// JEDNOKRATNO (i sigurno za ponavljanje): pripremi kartice, migriraj stare zapise, dozvole
// ---------------------------------------------------------------------------

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Imena
  var names = ss.getSheetByName(NAMES_SHEET) || ss.insertSheet(NAMES_SHEET);
  if (names.getLastRow() < 2) {
    names.getRange(1, 1, 1, 4).setValues([['Prezime', 'Ime', 'Skupina', 'Email']]);
    var seed = DEFAULT_NAMES.map(function (n) { return [n[0], n[1], LEGACY_GROUP, '']; });
    names.getRange(2, 1, seed.length, 4).setValues(seed);
  } else {
    if (clean_(names.getRange(1, 3).getValue()) === '') names.getRange(1, 3).setValue('Skupina');
    if (clean_(names.getRange(1, 4).getValue()) === '') names.getRange(1, 4).setValue('Email');
    fillBlankGroup_(names, 3);
  }

  // Admini
  var admins = ss.getSheetByName(ADMINS_SHEET) || ss.insertSheet(ADMINS_SHEET);
  if (admins.getLastRow() < 2) {
    admins.getRange(1, 1, 1, 2).setValues([['Email', 'Skupine (* = sve, ili npr. 3 ili 3,5)']]);
    admins.getRange(2, 1, 1, 2).setValues([[FIRST_ADMIN, '*']]);
  }

  // Sheet1: stupac Skupina + stari zapisi -> skupina 7
  var data = ss.getSheetByName(DATA_SHEET);
  if (clean_(data.getRange(1, GROUP_COL).getValue()) === '') data.getRange(1, GROUP_COL).setValue('Skupina');
  fillBlankGroup_(data, GROUP_COL);

  // Tajni ključ za sesije
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SESSION_SECRET')) {
    props.setProperty('SESSION_SECRET', Utilities.getUuid() + Utilities.getUuid());
  }

  // Potiče Google da zatraži dozvolu "vanjski servis" (provjera Google prijave)
  UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo', { muteHttpExceptions: true });

  Logger.log('Gotovo. Imena (skupina 7): ' + namesForGroup_(LEGACY_GROUP).length +
             ', admini: ' + (admins.getLastRow() - 1));
}

function fillBlankGroup_(sheet, col) {
  var last = sheet.getLastRow();
  if (last < 2) return;
  var range = sheet.getRange(2, col, last - 1, 1);
  var vals = range.getValues();
  var changed = false;
  for (var r = 0; r < vals.length; r++) {
    if (clean_(vals[r][0]) === '') { vals[r][0] = LEGACY_GROUP; changed = true; }
  }
  if (changed) range.setValues(vals);
}

// ---------------------------------------------------------------------------
// OPĆE POMOĆNE FUNKCIJE
// ---------------------------------------------------------------------------

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorJson_(error) {
  return json_({
    success: false,
    error: (error && error.message) ? error.message : String(error),
    code: error && error.code
  });
}

function clean_(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
}

// Mora počinjati slovom (sprječava formule poput =... ili +...), samo slova, razmak, točka, apostrof, crtica
function validName_(s) {
  return s.length >= 1 && s.length <= 40 &&
    /^[A-Za-z\u00C0-\u017F][A-Za-z\u00C0-\u017F .'\-]*$/.test(s);
}

function parseGroup_(v) {
  var n = Number(v);
  if (!isFinite(n) || n % 1 !== 0 || n < 1 || n > GROUP_COUNT) throw new Error('Nepoznata odgojna skupina.');
  return n;
}

function groupOf_(cell) {
  return Number(clean_(cell)) || LEGACY_GROUP;
}

// ---------------------------------------------------------------------------
// IMENA
// ---------------------------------------------------------------------------

function getNamesSheet_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NAMES_SHEET);
  if (!sheet) throw new Error('Kartica "' + NAMES_SHEET + '" ne postoji. Pokrenite funkciju setup().');
  return sheet;
}

// E-pošta: više adresa u jednoj ćeliji (zarez, razmak ili točka-zarez), sve malim slovima
function parseEmails_(s) {
  var out = [];
  String(s == null ? '' : s).split(/[\s,;]+/).forEach(function (x) {
    x = x.toLowerCase();
    if (x && out.indexOf(x) < 0) out.push(x);
  });
  return out;
}

function validEmail_(e) {
  return e.length <= 100 && /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(e);
}

function readNameEntries_() {
  var sheet = getNamesSheet_();
  var last = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, 4).getValues();
  var out = [];
  for (var r = 0; r < rows.length; r++) {
    var p = clean_(rows[r][0]);
    var i = clean_(rows[r][1]);
    if (p && i) out.push({ row: r + 2, p: p, i: i, g: groupOf_(rows[r][2]), e: parseEmails_(rows[r][3]) });
  }
  return out;
}

function entriesForGroup_(group) {
  return readNameEntries_().filter(function (e) { return e.g === group; });
}

// JAVNO (bez prijave): samo prezime i ime, nikad e-pošta
function namesForGroup_(group) {
  return entriesForGroup_(group).map(function (e) { return { p: e.p, i: e.i }; });
}

// Samo za admina: s adresama e-pošte
function namesAdminForGroup_(group) {
  return entriesForGroup_(group).map(function (e) { return { p: e.p, i: e.i, e: e.e.join(', ') }; });
}

function entryByFull_(full, group) {
  var list = entriesForGroup_(group);
  for (var k = 0; k < list.length; k++) {
    if (list[k].p + ' ' + list[k].i === full) return list[k];
  }
  return null;
}

function nameInGroup_(full, group) {
  return !!entryByFull_(full, group);
}

function findEntry_(entries, p, i) {
  for (var k = 0; k < entries.length; k++) {
    if (entries[k].p === p && entries[k].i === i) return entries[k];
  }
  return null;
}

function keyOf_(p, i) { return (p + ' ' + i).toLowerCase(); }

// Svaka adresa mora biti ispravna i ne smije pripadati DRUGOM članu (ni u jednoj skupini)
function checkEmails_(emails, exceptRow) {
  if (emails.length > MAX_EMAILS) throw new Error('Najviše ' + MAX_EMAILS + ' adrese e-pošte po članu.');
  var all = readNameEntries_();
  emails.forEach(function (m) {
    if (!validEmail_(m)) throw new Error('Neispravna e-pošta: ' + m);
    for (var k = 0; k < all.length; k++) {
      if (all[k].row !== exceptRow && all[k].e.indexOf(m) >= 0) {
        throw new Error('E-pošta ' + m + ' već je povezana s: ' + all[k].p + ' ' + all[k].i + ' (' + all[k].g + '. skupina).');
      }
    }
  });
}

// Član čiji je ovo Google račun (ili null). Dvoznačnost = greška, nikad pogađanje.
function profileFor_(email) {
  var hits = readNameEntries_().filter(function (e) { return e.e.indexOf(email) >= 0; });
  if (hits.length > 1) throw new Error('Ovaj Google račun povezan je s više imena. Obratite se administratoru.');
  return hits[0] || null;
}

// ---------------------------------------------------------------------------
// PRIJAVA UČENIKA
// ---------------------------------------------------------------------------

// Dopuštene vrijednosti polja: "-", "DA" ili vrijeme (npr. 7:30); prazno = nije odabrano
function cleanField_(v) {
  if (v === undefined || v === null || v === '') return '';
  var t = String(v).trim();
  if (!/^(-|DA|\d{1,2}:\d{2})$/.test(t)) throw new Error('Neispravni podaci u prijavi.');
  return t;
}

// OSTAJEM CIJELI VIKEND: "-" ili jedan od razloga. "DA" se još prihvaća (stari obrazac u prijelaznom razdoblju).
function cleanStay_(v) {
  if (v === undefined || v === null || v === '') return '';
  var t = clean_(v);
  if (t === '-' || t === 'DA' || STAY_REASONS.indexOf(t) >= 0) return t;
  throw new Error('Neispravan razlog za ostanak.');
}

// Zadnja prijava člana za dani tjedan (po vremenu prijave) ili null
function lastSubmission_(entry, week) {
  if (!/^\d{4}-W\d{1,2}$/.test(String(week || ''))) return null;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DATA_SHEET);
  var full = entry.p + ' ' + entry.i, found = null;
  readSubmissionEntries_(sheet, entry.g, week).forEach(function (x) {
    if (clean_(x.row[3]) === full) found = x;
  });
  return found ? { row: found.row, sentAt: found.t } : null;
}

// Stari način slanja (bez prijave Google računom): radi samo dok REQUIRE_PROFILE nije uključen
function handleSubmission_(data) {
  if (REQUIRE_PROFILE) throw new Error('Osvježite stranicu (Ctrl+F5) i prijavite se ponovno.');
  var group = (data.skupina === undefined || data.skupina === null || data.skupina === '')
    ? LEGACY_GROUP : parseGroup_(data.skupina);
  var full = clean_(data.ime_prezime);
  if (!nameInGroup_(full, group)) throw new Error('Ime nije na popisu ove odgojne skupine.');

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DATA_SHEET);
  sheet.appendRow([
    data.timestamp,
    data.week,
    data.email,
    full,
    data.idem_prije_petka,
    data.ostajem_cijeli_vikend,
    data.petak_vrijeme_odlaska,
    data.petak_rucak,
    data.petak_vecera,
    data.subota_vrijeme_odlaska,
    data.subota_rucak,
    data.subota_vecera,
    data.nedjelja_rucak,
    data.nedjelja_vecera,
    group
  ]);
  return json_({ success: true });
}

function studentState_(email, week) {
  var entry = profileFor_(email);
  return {
    requireProfile: REQUIRE_PROFILE,
    profile: entry ? { prezime: entry.p, ime: entry.i, skupina: entry.g } : null,
    last: entry ? lastSubmission_(entry, week) : null
  };
}

// Učenik: Google prijava -> sesija + profil (ako je račun povezan s imenom) + zadnja prijava za ovaj tjedan
function handleStudentLogin_(data) {
  var info = verifyGoogleToken_(data.credential);
  var email = clean_(info.email).toLowerCase();
  var out = studentState_(email, data.week);
  var session = makeSession_(email);
  out.success = true;
  out.session = session.token;
  out.expires = session.expires;
  out.email = email;
  out.name = info.name || '';
  return out;
}

function handleMyStatus_(data) {
  var email = readSession_(data.session);
  var out = studentState_(email, data.week);
  out.success = true;
  out.email = email;
  return out;
}

// Slanje prijave s provjerenom sesijom: e-pošta i ime dolaze s poslužitelja (profil), ne iz preglednika
function handleStudentSubmit_(data) {
  var email = readSession_(data.session);
  var week = String(data.week || '');
  if (!/^\d{4}-W\d{1,2}$/.test(week)) throw new Error('Neispravan tjedan.');

  var entry = profileFor_(email);
  if (!entry) {
    if (REQUIRE_PROFILE) throw new Error('Vaš Google račun nije povezan s imenom. Obratite se administratoru.');
    var chosen = parseGroup_(data.skupina);
    entry = entryByFull_(clean_(data.ime_prezime), chosen);
    if (!entry) throw new Error('Ime nije na popisu ove odgojne skupine.');
  }

  var f = {
    idem: cleanField_(data.idem_prije_petka), ostaje: cleanStay_(data.ostajem_cijeli_vikend),
    pO: cleanField_(data.petak_vrijeme_odlaska), pR: cleanField_(data.petak_rucak), pV: cleanField_(data.petak_vecera),
    sO: cleanField_(data.subota_vrijeme_odlaska), sR: cleanField_(data.subota_rucak), sV: cleanField_(data.subota_vecera),
    nR: cleanField_(data.nedjelja_rucak), nV: cleanField_(data.nedjelja_vecera)
  };
  if (!(f.idem === 'DA' || (f.ostaje && f.ostaje !== '-') || /\d/.test(f.pO) || /\d/.test(f.sO))) {
    throw new Error('Prijava je prazna: odaberite vrijeme odlaska, IDEM PRIJE PETKA ili razlog ostanka.');
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DATA_SHEET);
  sheet.appendRow([
    new Date().toISOString(), week, email, entry.p + ' ' + entry.i,
    f.idem, f.ostaje, f.pO, f.pR, f.pV, f.sO, f.sR, f.sV, f.nR, f.nV, entry.g
  ]);
  return { success: true, last: lastSubmission_(entry, week) };
}

// ---------------------------------------------------------------------------
// ADMIN: prijava, sesije, ovlasti
// ---------------------------------------------------------------------------

function sessionError_(msg) {
  var e = new Error(msg);
  e.code = 'SESSION';
  return e;
}

function parseAdminGroups_(spec) {
  var s = clean_(spec);
  var out = [], k;
  if (s === '*') {
    for (k = 1; k <= GROUP_COUNT; k++) out.push(k);
    return out;
  }
  s.split(/[\s,;]+/).forEach(function (x) {
    var n = Number(x);
    if (x && n % 1 === 0 && n >= 1 && n <= GROUP_COUNT && out.indexOf(n) < 0) out.push(n);
  });
  return out.sort(function (a, b) { return a - b; });
}

function findAdmin_(email) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ADMINS_SHEET);
  if (!sheet) throw new Error('Kartica "' + ADMINS_SHEET + '" ne postoji. Pokrenite funkciju setup().');
  var last = sheet.getLastRow();
  if (last < 2) return null;
  var rows = sheet.getRange(2, 1, last - 1, 2).getValues();
  var key = clean_(email).toLowerCase();
  if (!key) return null;
  for (var r = 0; r < rows.length; r++) {
    if (clean_(rows[r][0]).toLowerCase() === key) {
      return { email: key, groups: parseAdminGroups_(rows[r][1]) };
    }
  }
  return null;
}

function verifyGoogleToken_(idToken) {
  if (!idToken) throw new Error('Nedostaje Google prijava.');
  var resp = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
    { muteHttpExceptions: true }
  );
  if (resp.getResponseCode() !== 200) throw new Error('Google prijava nije valjana ili je istekla. Pokušajte ponovno.');
  var info = JSON.parse(resp.getContentText());
  if (info.aud !== CLIENT_ID) throw new Error('Neispravna prijava.');
  if (String(info.email_verified) !== 'true') throw new Error('Email nije potvrđen.');
  return info;
}

function sessionSecret_() {
  var s = PropertiesService.getScriptProperties().getProperty('SESSION_SECRET');
  if (!s) throw new Error('Nedostaje tajni ključ sesije. Pokrenite funkciju setup().');
  return s;
}

function sign_(text) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(text, sessionSecret_()));
}

function safeEqual_(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var k = 0; k < a.length; k++) diff |= a.charCodeAt(k) ^ b.charCodeAt(k);
  return diff === 0;
}

function makeSession_(email) {
  var expires = Date.now() + SESSION_HOURS * 3600 * 1000;
  var body = Utilities.base64EncodeWebSafe(JSON.stringify({ e: email, x: expires }));
  return { token: body + '.' + sign_(body), expires: expires };
}

function readSession_(token) {
  var parts = String(token || '').split('.');
  if (parts.length !== 2) throw sessionError_('Nedostaje prijava. Prijavite se ponovno.');
  if (!safeEqual_(sign_(parts[0]), parts[1])) throw sessionError_('Neispravna prijava. Prijavite se ponovno.');
  var payload;
  try {
    payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  } catch (err) {
    throw sessionError_('Neispravna prijava. Prijavite se ponovno.');
  }
  if (!payload || !payload.x || payload.x < Date.now()) throw sessionError_('Sesija je istekla. Prijavite se ponovno.');
  return payload.e;
}

// Provjerava sesiju I da je osoba još uvijek na popisu admina (uklanjanje iz kartice Admini djeluje odmah)
function requireAdmin_(token, group) {
  var email = readSession_(token);
  var admin = findAdmin_(email);
  if (!admin) throw sessionError_('Nemate ovlasti. Prijavite se ponovno.');
  if (group != null && admin.groups.indexOf(group) < 0) throw new Error('Nemate ovlasti za ovu odgojnu skupinu.');
  return admin;
}

function handleLogin_(data) {
  var info = verifyGoogleToken_(data.credential);
  var admin = findAdmin_(info.email);
  if (!admin) throw new Error('Nemate ovlasti za admin stranicu.');
  if (!admin.groups.length) throw new Error('Nemate dodijeljenu nijednu odgojnu skupinu.');
  var session = makeSession_(admin.email);
  return {
    success: true,
    session: session.token,
    expires: session.expires,
    email: admin.email,
    name: info.name || '',
    groups: admin.groups
  };
}

// ---------------------------------------------------------------------------
// ADMIN: čitanje prijava (tablica može biti privatna - čita samo skripta)
// ---------------------------------------------------------------------------

function handleGetData_(data) {
  var group = parseGroup_(data.skupina);
  requireAdmin_(data.session, group);
  var week = String(data.week || '');
  if (!/^\d{4}-W\d{1,2}$/.test(week)) throw new Error('Neispravan tjedan.');

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DATA_SHEET);
  return {
    success: true,
    header: sheet.getRange(1, 1, 1, 14).getDisplayValues()[0],
    rows: readSubmissionRows_(sheet, group, week)
  };
}

// Vrijeme prijave kao broj: Date iz tablice ili tekst (npr. ISO). Nečitljivo = 0.
function timeOf_(v) {
  var t = (Object.prototype.toString.call(v) === '[object Date]') ? v.getTime() : Date.parse(String(v));
  return isNaN(t) ? 0 : t;
}

// Čita samo stupce Timestamp, Tjedan i Skupina, pa tek blok redaka koji se poklapa (brzo i uz veliku tablicu).
// Redci se vraćaju po VREMENU prijave (najstarija prva), a ne po položaju u tablici, pa sortiranje tablice
// ne mijenja ishod: admin stranica za svaku osobu uzima zadnju prijavu. Isto vrijeme = redoslijed u tablici.
function readSubmissionEntries_(sheet, group, week) {
  var last = sheet.getLastRow();
  if (last < 2) return [];
  var n = last - 1;
  var stamps = sheet.getRange(2, 1, n, 1).getValues();
  var weeks = sheet.getRange(2, 2, n, 1).getDisplayValues();
  var groups = sheet.getRange(2, GROUP_COL, n, 1).getDisplayValues();
  var hits = [];
  for (var r = 0; r < n; r++) {
    if (weeks[r][0] === week && groupOf_(groups[r][0]) === group) hits.push({ r: r, t: timeOf_(stamps[r][0]) });
  }
  if (!hits.length) return [];
  var from = hits[0].r, to = hits[hits.length - 1].r;      // hits su još po redoslijedu redaka
  var block = sheet.getRange(2 + from, 1, to - from + 1, 14).getDisplayValues();
  hits.sort(function (a, b) { return (a.t - b.t) || (a.r - b.r); });
  return hits.map(function (h) { return { t: h.t, row: block[h.r - from] }; });
}

function readSubmissionRows_(sheet, group, week) {
  return readSubmissionEntries_(sheet, group, week).map(function (e) { return e.row; });
}

// ---------------------------------------------------------------------------
// ADMIN: upravljanje imenima (po skupini)
// ---------------------------------------------------------------------------

function handleNameAction_(data) {
  var group = parseGroup_(data.skupina);
  requireAdmin_(data.session, group);

  switch (data.action) {
    case 'listNames':  return { success: true, names: namesAdminForGroup_(group) };
    case 'addName':    return addName_(group, clean_(data.prezime), clean_(data.ime), data.emails);
    case 'addNames':   return addNames_(group, data.names);
    case 'editName':   return editName_(group, clean_(data.prezime), clean_(data.ime), clean_(data.newPrezime), clean_(data.newIme), data.newEmails);
    default:           return removeName_(group, clean_(data.prezime), clean_(data.ime));
  }
}

var NAME_RULE_MSG = 'Prezime i ime smiju sadržavati samo slova (do 40 znakova).';

function addName_(group, p, i, emailsRaw) {
  if (!validName_(p) || !validName_(i)) throw new Error(NAME_RULE_MSG);
  var entries = entriesForGroup_(group);
  if (entries.length >= MAX_NAMES) throw new Error('Dosegnut je najveći broj imena (' + MAX_NAMES + ').');
  var key = keyOf_(p, i);
  for (var k = 0; k < entries.length; k++) {
    if (keyOf_(entries[k].p, entries[k].i) === key) throw new Error('To ime već postoji na popisu.');
  }
  var emails = parseEmails_(emailsRaw);
  checkEmails_(emails, null);
  getNamesSheet_().appendRow([p, i, group, emails.join(', ')]);
  return { success: true, names: namesAdminForGroup_(group) };
}

function addNames_(group, list) {
  if (!Array.isArray(list) || !list.length) throw new Error('Nema imena za dodavanje.');
  if (list.length > MAX_NAMES) throw new Error('Previše imena odjednom (najviše ' + MAX_NAMES + ').');

  var entries = entriesForGroup_(group);
  var seen = {};
  entries.forEach(function (e) { seen[keyOf_(e.p, e.i)] = true; });
  var usedEmails = {};
  readNameEntries_().forEach(function (e) { e.e.forEach(function (m) { usedEmails[m] = true; }); });

  var toAdd = [], skipped = [];
  list.forEach(function (x) {
    var p = clean_(x && x.prezime), i = clean_(x && x.ime);
    var label = (p + ' ' + i).trim();
    if (!validName_(p) || !validName_(i)) { skipped.push({ name: label, reason: 'neispravni znakovi' }); return; }
    if (seen[keyOf_(p, i)]) { skipped.push({ name: label, reason: 'već postoji' }); return; }
    if (entries.length + toAdd.length >= MAX_NAMES) { skipped.push({ name: label, reason: 'dosegnut najveći broj imena' }); return; }
    var emails = parseEmails_(x && x.email);
    if (emails.length > MAX_EMAILS || !emails.every(validEmail_)) { skipped.push({ name: label, reason: 'neispravna e-pošta' }); return; }
    if (emails.some(function (m) { return usedEmails[m]; })) { skipped.push({ name: label, reason: 'e-pošta je već povezana s drugim članom' }); return; }
    emails.forEach(function (m) { usedEmails[m] = true; });
    seen[keyOf_(p, i)] = true;
    toAdd.push([p, i, group, emails.join(', ')]);
  });

  if (toAdd.length) {
    var sheet = getNamesSheet_();
    sheet.getRange(sheet.getLastRow() + 1, 1, toAdd.length, 4).setValues(toAdd);
  }
  return { success: true, added: toAdd.length, skipped: skipped, names: namesAdminForGroup_(group) };
}

// newEmailsRaw: undefined/null = e-pošta se ne mijenja; (i prazan tekst) = ukloni sve
function editName_(group, p, i, np, ni, newEmailsRaw) {
  if (!validName_(np) || !validName_(ni)) throw new Error(NAME_RULE_MSG);
  var entries = entriesForGroup_(group);
  var entry = findEntry_(entries, p, i);
  if (!entry) throw new Error('Ime nije pronađeno na popisu.');

  var emailsGiven = newEmailsRaw !== undefined && newEmailsRaw !== null;
  var emails = emailsGiven ? parseEmails_(newEmailsRaw) : entry.e;
  var emailsChanged = emails.join(',') !== entry.e.join(',');
  var nameChanged = !(np === p && ni === i);
  if (!nameChanged && !emailsChanged) return { success: true, names: namesAdminForGroup_(group), updatedSubmissions: 0 };

  var key = keyOf_(np, ni);
  for (var k = 0; k < entries.length; k++) {
    if (entries[k] !== entry && keyOf_(entries[k].p, entries[k].i) === key) throw new Error('To ime već postoji na popisu.');
  }
  if (emailsChanged) checkEmails_(emails, entry.row);

  var sheet = getNamesSheet_();
  sheet.getRange(entry.row, 1, 1, 2).setValues([[np, ni]]);
  if (emailsChanged) sheet.getRange(entry.row, 4).setValue(emails.join(', '));
  var updated = nameChanged ? renameInSubmissions_(group, p + ' ' + i, np + ' ' + ni) : 0;
  return { success: true, names: namesAdminForGroup_(group), updatedSubmissions: updated };
}

function removeName_(group, p, i) {
  var entry = findEntry_(entriesForGroup_(group), p, i);
  if (!entry) throw new Error('Ime nije pronađeno na popisu.');
  getNamesSheet_().deleteRow(entry.row);
  return { success: true, names: namesAdminForGroup_(group) };
}

// Prepisuje ime u stupcu D (Prezime Ime) samo za prijave ISTE skupine; vraća broj promijenjenih
function renameInSubmissions_(group, oldFull, newFull) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DATA_SHEET);
  var last = sheet.getLastRow();
  if (last < 1) return 0;
  var range = sheet.getRange(1, 4, last, 1);        // od retka 1: zaglavlje se nikad ne poklapa s imenom osobe
  var col = range.getValues();
  var groups = sheet.getRange(1, GROUP_COL, last, 1).getValues();
  var count = 0;
  for (var r = 0; r < col.length; r++) {
    if (clean_(col[r][0]) === oldFull && groupOf_(groups[r][0]) === group) { col[r][0] = newFull; count++; }
  }
  if (count > 0) range.setValues(col);
  return count;
}
