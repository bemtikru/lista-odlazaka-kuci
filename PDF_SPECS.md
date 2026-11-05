# PDF specification (weekly list)

Generated in the browser (jsPDF) from `admin.html`, based on the Word template
`7_os_odlasci_kući.docx`. One A4 **portrait** page per group and week.

File name: `odlazak-kuci-os<GROUP>-<WEEK>.pdf`, e.g. `odlazak-kuci-os3-2026-W45.pdf`.

## Page

- A4 portrait (210 × 297 mm), font **Roboto Condensed** (Regular + Bold, embedded in `admin.html`)
- Title: `<N>. ODGOJNA SKUPINA` (16 pt, centred, y = 25 mm), below it `ODLAZAK KUĆI <Friday>-<Sunday>` (y = 33 mm),
  e.g. `ODLAZAK KUĆI 6.11.-8.11.2026.` – the dates of that ISO week, `d.m.-d.m.yyyy.` without leading zeros.
  A weekend that spans two years shows both: `31.12.2027.-2.1.2028.`
- Table starts at x = 15 mm, y = 40 mm; hairline borders (0.1 mm)

## Columns (13, in mm)

| # | Column | Width |
|---|---|---|
| 1 | R.BR. | 11.47 |
| 2 | PREZIME | 21.63 |
| 3 | IME | 21.04 |
| 4 | NEDOSTAJE | 6.67 |
| 5 | OSTAJE – napisati razlog | 15.59 |
| 6 | PETAK vrijeme odlaska | 13.65 |
| 7 | PETAK prijava RUČAK | 12.91 |
| 8 | PETAK prijava VEČERA | 14.89 |
| 9 | SUBOTA vrijeme odlaska | 13.65 |
| 10 | SUBOTA prijava RUČAK | 12.95 |
| 11 | SUBOTA prijava VEČERA | 14.89 |
| 12 | NEDJELJA prijava RUČAK | 12.95 |
| 13 | NEDJELJA prijava VEČERA | 14.78 |

Total width ≈ 187 mm.

## Colours (RGB)

| Element | Colour |
|---|---|
| PETAK header | 217, 226, 243 |
| SUBOTA header | 226, 239, 217 |
| NEDJELJA header | 237, 237, 237 |
| NEDOSTAJE header | 255, 255, 229 |
| Day names | 31, 78, 121 |
| "RUČAK" / "VEČERA" | 192, 0, 0 |
| Other text | 0, 0, 0 |

## Rows

- Header block: 18 mm (two 9 mm rows; day names merged over their columns; `NEDOSTAJE` rotated 90°)
- **One row per name on the group's list**, alphabetical (Croatian order: …C, Č, Ć, D, …S, Š, T…), numbered 1…N
- Row height: **9 mm**, shrinking automatically when the list is longer than 24 names
  (`min(9, 224 / (N + 1))` mm; at the 35-name maximum ≈ 6.2 mm). Row font: 10 pt, scaled with the row height.
- Last row: `UKUPNO:` in the IME column with the counts

## What goes in each cell

| Column | Content |
|---|---|
| NEDOSTAJE | `DA` when the person chose **IDEM PRIJE PETKA = DA** |
| OSTAJE | `DA` when the person chose **OSTAJEM CIJELI VIKEND = DA** |
| vrijeme odlaska | the time (e.g. `14:00`), or `:` when none was entered |
| RUČAK / VEČERA | `DA` when chosen, otherwise empty |

## Which submissions count

- Only the **current week** and the **selected group**.
- If a person submitted several times, **only the latest submission (by Timestamp, not by row position in the sheet)** is used – in the row, in `UKUPNO`, and in the dashboard's summary cards.
- `UKUPNO` counts only people who are on the group's list (a removed name is not counted).
- A name on the list with no submission still gets a row (with `:` in the time columns).
