# PDF Mail Merge – Bug Fix Pack

This patch fixes the three problems visible in the screenshots:

1. **XLSX files were being read as CSV text**
   - The ZIP/XML content inside an `.xlsx` file appeared as corrupted rows such as `docProps/app.xml`.
   - `csvUtils.ts` now detects `.xlsx` files and reads the first worksheet correctly using the project's existing JSZip dependency.
   - CSV imports now also handle UTF-8, UTF-16 and Windows-1252 encoding more safely.

2. **Preview failed with `WinAnsi cannot encode`**
   - Null/control characters are removed before PDF generation.
   - Text supported by Helvetica remains normal selectable PDF text.
   - Unicode text that StandardFonts cannot encode is rendered through the browser as a transparent image, preventing the preview and batch generation from crashing.

3. **Colour input overlapped the Font Weight menu**
   - The field editor now uses responsive minimum-width-safe grids.
   - The colour control cannot push into the Font Weight dropdown.

## Replacement files

Copy these files into the matching paths in the repository:

- `src/utils/csvUtils.ts`
- `src/utils/pdfUtils.ts`
- `src/components/MapFieldsStep.tsx`

No new npm package is required. The XLSX reader uses `jszip`, which is already listed in the project dependencies.

## GitHub upload steps

1. Extract this ZIP on your computer.
2. Open `https://github.com/bryanssss/pdf-mail-merge`.
3. Click **Add file** and then **Upload files**.
4. Open the extracted `pdf-mail-merge-fix` folder.
5. Drag the `src` folder into GitHub's upload area. The three files must keep the paths shown above.
6. In the commit box, enter: `Fix XLSX import, Unicode PDF preview and field layout`.
7. Click **Commit changes**.
8. Open the **Actions** tab and wait for the deployment workflow to show a green tick.
9. Open `https://bryanssss.github.io/pdf-mail-merge/` in a private/incognito window and test again.

## Test checklist

- Upload a normal PDF template.
- Upload a CSV and confirm the headings and first five records are correct.
- Upload an `.xlsx` workbook and confirm `docProps`, `xl/worksheets` and other binary-looking text do not appear.
- Test a value containing curly quotes, an en dash and non-English letters.
- Open Map Data Fields and confirm Colour and Font Weight no longer overlap.
- Generate one preview, a ZIP batch and a combined PDF.

## Important format note

Modern Excel `.xlsx` files are supported. Old binary `.xls` files should be opened in Excel and saved as `.xlsx` or `.csv` before upload.
