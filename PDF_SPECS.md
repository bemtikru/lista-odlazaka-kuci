# EXACT PDF SPECIFICATIONS FROM WORD DOCUMENT

## Extracted from: 7_os_odlasci_kući.docx

**ORIENTATION: PORTRAIT (NOT LANDSCAPE!)**

### Column Widths (13 columns, in mm):
1. R.BR: 11.47 mm
2. PREZIME: 21.63 mm
3. IME: 21.04 mm
4. NEDOSTAJE: 6.67 mm
5. OSTAJE - napsati razlog: 15.59 mm
6. PETAK vrijeme odlaska: 13.65 mm
7. PETAK prijava RUČAK: 12.91 mm
8. PETAK prijava VEČERA: 14.89 mm
9. SUBOTA vrijeme odlaska: 13.65 mm
10. SUBOTA prijava RUČAK: 12.95 mm
11. SUBOTA prijava VEČERA: 14.89 mm
12. NEDJELJA prijava RUČAK: 12.95 mm
13. NEDJELJA prijava VEČERA: 14.78 mm

**Total width: ~180 mm** (fits A4 portrait width of ~210mm with margins)

### Font Sizes:
- Title: 16pt (32 half-points)
- Data cells: 10pt (20 half-points)
- Small text (sub-headers): 7-8pt

### Colors (RGB):
- **PETAK header**: rgb(217, 226, 243) - Light blue
- **SUBOTA header**: rgb(226, 239, 217) - Light green  
- **NEDJELJA header**: rgb(237, 237, 237) - Light gray
- **NEDOSTAJE cell**: rgb(255, 255, 229) - Light yellow
- **Header text (PETAK/SUBOTA/NEDJELJA)**: rgb(31, 78, 121) - Dark blue
- **"RUČAK"/"VEČERA" text**: rgb(192, 0, 0) - Red
- **Regular text**: rgb(0, 0, 0) - Black

### Layout:
- **Header height**: 12mm (split into 6mm + 6mm for merged cells)
- **Row height**: 7.5mm
- **Start X**: 15mm (left margin)
- **Start Y**: 30mm (below title)
- **Border width**: 0.1mm (very thin)

### Header Structure:
**Row 1** (top 6mm):
- Columns 1-3: Single cells (R.BR., PREZIME, IME)
- Column 4: NEDOSTAJE (yellow background)
- Column 5: OSTAJE (dark blue text)
- Columns 6-8: Merged "PETAK" cell (light blue)
- Columns 9-11: Merged "SUBOTA" cell (light green)
- Columns 12-13: Merged "NEDJELJA" cell (light gray)

**Row 2** (bottom 6mm):
- Columns 1-5: Empty (merged with row 1)
- Column 6: "vrijeme odlaska (hh:mm)" - small text
- Column 7: "prijava RUČAK" - red text
- Column 8: "prijava VEČERA" - red text
- Column 9: "vrijeme odlaska (hh:mm)" - small text
- Column 10: "prijava RUČAK" - red text
- Column 11: "prijava VEČERA" - red text
- Column 12: "prijava RUČAK" - red text
- Column 13: "prijava VEČERA" - red text

### Data Mapping:
- NEDOSTAJE: Currently empty (for future use)
- OSTAJE: Shows "DA" when user selected "OSTAJEM CIJELI VIKEND"
- Vrijeme odlaska columns: Show time (e.g., "14:00") or ":" if not entered
- Meal columns: Show "DA" if selected, empty otherwise

### UKUPNO Row:
- Appears after row 22 (last person)
- "UKUPNO:" label in column 3 (IME)
- Counts appear in bold in columns with "DA" values
- Empty cells for time columns

This matches the template image EXACTLY.
