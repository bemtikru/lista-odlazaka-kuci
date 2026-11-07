# Lista odlazaka kući

Web application for weekly "going home" sign-ups in student dormitory groups (**odgojne skupine**).
Students pick their name and enter their weekend departure times and meals. Admins see the
submissions and statistics, and print the weekly PDF list. Each group (1.–7.) has its own link,
its own list of names, and its own PDF.

Everything is in Croatian in the user interface.

## How it fits together

```
 Students ── index.html?skupina=N ──┐
                                    ├──►  Google Apps Script web app  ◄──►  Google Sheet
 Admins ──── admin.html?skupina=N ──┘     (Code.gs – the only thing that
        (Vercel, static files)              reads or writes the sheet)
```

- **Vercel** (any static host would do) serves three static files: `index.html`, `admin.html`, `config.js`.
- **Google Sign-In** identifies people (students: their email is saved with the submission;
  admins: checked against the `Admini` tab).
- **Apps Script** (`Code.gs`, bound to the spreadsheet) is the gatekeeper. The spreadsheet itself
  can be private – the pages never talk to it directly.

## Links

| Who | Link |
|---|---|
| Students of group 3 | `https://YOUR-SITE.vercel.app/?skupina=3` |
| Admin of group 3 | `https://YOUR-SITE.vercel.app/admin.html?skupina=3` |
| Superadmin | same admin link, then switch groups in the drop-down |

A student link without `?skupina=` shows a chooser (1.–7. odgojna skupina). The admin page
without `?skupina=` opens the last group you used (or `DEFAULT_GROUP` from `config.js`).

## Files

| File | Purpose |
|---|---|
| `index.html` | Student form (Google login, group-specific names, conditional dropdown rules) |
| `admin.html` | Admin page: weekly table, statistics, PDF, names management |
| `config.js` | Shared settings: Client ID, webhook URL, number of groups |
| `Code.gs` | Apps Script – **paste into the script editor, not deployed to Vercel** |
| `vercel.json` | Optional Vercel settings, e.g. the short link `/admin` → `admin.html` (see `SETUP.md`) |
| `SETUP.md` | Installation, upgrading, adding groups/admins, locking down the sheet |
| `CONFIG_GUIDE.md` | Every setting and where it lives |
| `PDF_SPECS.md` | Layout of the printed list |

## Spreadsheet tabs

| Tab | Columns | Notes |
|---|---|---|
| `Sheet1` | A Timestamp · B Week · C Email · D Ime i Prezime · E Idem prije petka · F Ostajem cijeli vikend · G–I Petak (vrijeme, ručak, večera) · J–L Subota · M–N Nedjelja (ručak, večera) · **O Skupina** | One row per submission; for each person the **latest by Timestamp** counts (so sorting the sheet does not matter). If you sort or filter, include **column O** in the range, or use *Data → Filter views* |
| `Imena` | A Prezime · B Ime · C Skupina | The names shown in each group's drop-down and on the PDF |
| `Admini` | A Email · B Skupine | `*` = all groups, or e.g. `3` or `3,5` |

A **week runs from Saturday 00:00 to Friday 23:59** and is the list for the weekend that follows (Friday–Sunday).
It is labelled with the ISO week of that weekend, e.g. `2026-W46` for the weekend 13.–15.11.2026. From Saturday
00:00 the pages show the next, empty week (by the clock of the device in use). Old data is kept in the sheet.

## What admins can do

- See the current week's submissions for a group, with live summary counts
- Print the weekly **PDF** list (the heading carries the group number and the Friday–Sunday dates, e.g.
  `ODLAZAK KUĆI 6.11.-8.11.2026.`; the file name carries the group)
- See live statistics for the week, counted from each person's **latest** submission:
  - **Ukupno prijava** – `x/y`: members who have submitted / members on the list
  - **Ukupno promjena** – how many submissions replaced an earlier one by the same person
  - **Nedostaje** – members who chose DA on IDEM PRIJE PETKA
  - **Noći na petak** – all members on the list minus *Nedostaje*
  - **Ručak / Večera Petak**
  - **Noći na subotu** – members who entered a departure time on Saturday
  - **Ručak / Večera Subota**
  - **Ostaje cijeli vikend** – members who chose DA on OSTAJEM CIJELI VIKEND
  - **Ručak / Večera Nedjelja**
  - **Nedostaje prijava** – how many members have not submitted yet, with their names
- **Add, edit (Uredi) and remove names** of the group, including *Dodaj više imena odjednom*
  (paste one `Prezime Ime` per line; use a comma for double surnames: `Marić Kovač, Ana Maria`)
- Editing a name also renames that person's existing submissions in the same group, so this week's
  data still matches the list

## Form rules for students

- **IDEM PRIJE PETKA = DA** disables everything below it
- **OSTAJEM CIJELI VIKEND = DA** disables IDEM PRIJE PETKA and both "vrijeme odlaska" fields
- A time in **PETAK VRIJEME ODLASKA** disables IDEM/OSTAJEM and the Saturday + Sunday sections
- A time in **SUBOTA VRIJEME ODLASKA** disables IDEM/OSTAJEM, Friday time and the Sunday section
- The departure time on **PETAK** and on **SUBOTA** decides that day's meals:
  - 5:00 – 11:00 → ručak and večera are locked
  - 12:00 – 16:00 → only ručak is available (večera locked)
  - 17:00 or later → both available

  Locked meals are cleared and stay empty in the sheet. Changing the time re-applies the rule.
- After a submission (or logout) the form is cleared and every field is available again, so a correction can be sent at once
- An empty report cannot be sent: a time, or DA on IDEM PRIJE PETKA / OSTAJEM CIJELI VIKEND is required

## Security model (short version)

- A submission is only accepted if the name is on **that group's** list – a student cannot submit
  into another group by editing the link.
- Admin actions need a session issued by the script after a Google login **and** the email must be in
  the `Admini` tab. This is checked on every request, so removing a row from `Admini` cuts access
  immediately. Sessions last 12 hours and are signed with a secret that only the script knows.
- A group-restricted admin (`3`) cannot read or change other groups, whatever they type in the link.
- The list of names of a group is public (anyone with the webhook URL can read it).
- **Treat edit access to the spreadsheet as full control** – whoever can edit it can edit `Admini`.
  Keep the sheet shared as *Restricted* (see `SETUP.md`).

## Limits

- 35 names per group (the PDF shrinks its rows automatically above 24 names)
- Apps Script has daily quotas; normal use stays far below them. The admin page refreshes once a
  minute, and only while its browser tab is visible.

## Troubleshooting

| Symptom | Usual cause |
|---|---|
| Drop-down empty, "Popis imena nije učitan" | Script not deployed as a **new version**, `setup()` not run, or web app access is not *Anyone* |
| Admin: "Nemate ovlasti" | The Google account's email is not in the `Admini` tab (exact address) |
| Admin: "Sesija je istekla" | Session older than 12 h – sign in again |
| Student: "Ime nije na popisu ove odgojne skupine" | Wrong group link, or an admin removed/renamed the name |
| Page shows old behaviour after an update | Browser cache – hard refresh (Ctrl+F5) |
| No Google sign-in button, or "Google prijava se nije učitala" | The browser or an ad blocker blocks `accounts.google.com` – refresh, or allow it for this site |
| Google shows "unverified app" when authorizing the script | Normal for your own Apps Script: Advanced → Go to … (unsafe) → Allow |

More in `SETUP.md`.
