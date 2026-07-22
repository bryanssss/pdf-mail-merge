# 📄 PDF Mail Merge

A free, privacy-focused visual PDF mail merge tool for creating personalised documents from CSV and Excel data.

Upload a PDF template, import your spreadsheet, and drag data fields directly onto a live PDF preview. Position and format every field visually, preview individual records, generate a test document, and export personalised PDFs securely inside your browser.

## 🚀 Use PDF Mail Merge Online

**No installation, registration or account is required.**

[![Open PDF Mail Merge Online](https://img.shields.io/badge/Open%20PDF%20Mail%20Merge-Use%20Online-22c55e?style=for-the-badge&logo=googlechrome&logoColor=white)](https://bryanssss.github.io/pdf-mail-merge/)

### 👉 [Open PDF Mail Merge in your browser](https://bryanssss.github.io/pdf-mail-merge/)

Your PDF, CSV and Excel files are processed locally inside your browser. They are not uploaded to a PDF Mail Merge server.

![PDF Mail Merge](https://img.shields.io/badge/PDF-Mail%20Merge-6366f1?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss)
![CSV](https://img.shields.io/badge/CSV-Supported-16a34a?style=flat-square)
![XLSX](https://img.shields.io/badge/XLSX-Supported-217346?style=flat-square&logo=microsoftexcel&logoColor=white)
![Licence](https://img.shields.io/badge/Licence-MIT-yellow?style=flat-square)

## ✨ Features

- **🖱️ Visual drag-and-drop mapping** — Drag spreadsheet columns directly onto the PDF page.
- **📄 Live PDF preview** — See the real PDF template while positioning merge fields.
- **👆 Click-to-add option** — Add fields using buttons when you prefer not to drag them.
- **↔️ Visual repositioning** — Drag mapped fields to move them anywhere on the selected page.
- **🎯 Precise coordinates** — Fine-tune placement using exact X and Y positions.
- **📊 CSV and Excel support** — Import data from `.csv` and modern `.xlsx` files.
- **🌍 Unicode support** — Process international characters and multilingual spreadsheet data.
- **👁️ Record preview** — Preview how different spreadsheet rows will look before generation.
- **🧪 Test PDF generation** — Generate one test document before creating a larger batch.
- **🔢 Record range selection** — Generate only the spreadsheet rows you need.
- **🛡️ Safer batch processing** — Browser-friendly limits help prevent excessively large generation jobs.
- **📝 Custom filenames** — Choose a spreadsheet column to use when naming generated PDFs.
- **🎨 Text formatting controls** — Configure font size, colour, weight and maximum width.
- **📑 Multi-page PDF support** — Place fields on different pages of a PDF template.
- **🔍 Page navigation and zoom** — Move between pages and adjust the PDF preview size.
- **📦 Flexible downloads** — Download individual files, a ZIP archive or a combined PDF.
- **🔒 Browser-based processing** — Documents remain on your device while you use the application.
- **📱 Responsive interface** — Use the application on desktop, tablet and supported mobile browsers.
- **💯 Free and open source** — No subscriptions, usage fees or registration requirements.

## 📖 How to Use PDF Mail Merge

### Step 1: Upload Your PDF Template

Upload the PDF document that you want to personalise.

Suitable templates include:

- Letters
- Certificates
- Invoices
- Receipts
- Badges
- Name tags
- Invitations
- Membership documents
- Customer reports
- Business documents
- Any PDF containing areas where personalised text should appear

The application reads the PDF page size and number of pages automatically.

### Step 2: Upload Your Data

Upload a CSV or XLSX file containing the information you want to place into the PDF.

Each spreadsheet row represents one possible generated document. Each column represents a field that can be added to the PDF.

Supported formats:

- `.csv`
- `.xlsx`

#### Example CSV File

```csv
First Name,Last Name,Email,Company
John,Doe,john@example.com,Acme Corp
Jane,Smith,jane@example.com,Widget Inc
```

This example contains:

- Two data records
- Four available merge fields
- One possible generated PDF for each row

The application displays a preview of the uploaded data so you can confirm that the headings and records were imported correctly.

> Large spreadsheets may contain thousands of rows. You do not need to generate every row at once. Use the record-range controls to select only the documents you want to create.

### Step 3: Map Your Fields Visually

The mapping screen displays your PDF template and all available spreadsheet columns.

You can add a field in two ways:

1. Drag a spreadsheet column directly onto the PDF page.
2. Click the plus button beside a column and position it using the available controls.

Mapped fields appear directly over the PDF using sample data from the selected spreadsheet row.

You can drag each field to the exact location where the value should appear.

Available settings include:

- **X position** — Horizontal position on the PDF page
- **Y position** — Vertical position on the PDF page
- **Page number** — The PDF page where the text should appear
- **Font size** — Size of the inserted text
- **Text colour** — Select a colour or enter a hexadecimal colour code
- **Font weight** — Choose normal or bold text
- **Maximum width** — Optionally restrict the width of longer values

PDF positions use points:

```text
72 points = 1 inch
```

Quick-position buttons are also available:

- Top Left
- Top Centre
- Centre
- Bottom Left

For precise placement, use the X and Y controls after dragging a field into position.

### Step 4: Preview the Merge

Use the preview screen to inspect the completed document before generating files.

You can:

- Move between spreadsheet records
- Review sample values
- Check field positions
- Confirm text formatting
- Inspect different PDF pages
- Return to the mapping screen when adjustments are needed

Only fields that you map will be added to the PDF.

Uploading a spreadsheet does not automatically insert every spreadsheet column into the template.

### Step 5: Choose What to Generate

Before generating documents, select the required record or record range.

The recommended workflow is:

1. Generate one test PDF.
2. Open the test document and inspect it carefully.
3. Return to the mapping screen if changes are required.
4. Select a larger record range after confirming the layout.
5. Generate the final documents.

Example record selections:

```text
Record 1 only
Records 1–50
Records 51–100
Records 101–250
```

The number of generated PDFs normally matches the number of selected spreadsheet rows.

```text
1 selected row = 1 personalised PDF
100 selected rows = 100 personalised PDFs
```

### Step 6: Download Your PDFs

Choose one of the available output options:

- **Individual PDF** — Download a specific generated document
- **ZIP archive** — Place separate generated PDFs inside one ZIP download
- **Combined PDF** — Join all selected generated documents into one PDF file

For very large jobs, smaller record ranges are recommended. Generating thousands of large or multi-page PDFs simultaneously may require significant browser memory.

## 🧠 How PDF Mail Merge Works

PDF Mail Merge does not combine the visual contents of an Excel workbook with a PDF file.

Instead, it uses:

- The PDF as the document template
- The spreadsheet columns as available merge fields
- Each spreadsheet row as one set of personalised values

For example, this spreadsheet:

| First Name | Company |
|---|---|
| John | Acme Corp |
| Jane | Widget Inc |

Can generate:

```text
John_Acme_Corp.pdf
Jane_Widget_Inc.pdf
```

The original PDF design remains unchanged. Only the spreadsheet values you map are added at the positions you select.

## 📈 Working with Large Spreadsheets

A spreadsheet containing 10,000 rows represents up to 10,000 possible personalised PDFs.

It does not mean that you must generate all 10,000 documents.

Use record selection to:

- Generate one test file
- Process only a small group of rows
- Divide a large job into manageable batches
- Avoid creating an unnecessarily large ZIP or combined PDF
- Reduce browser memory usage

A 23-page template used with 10,000 spreadsheet rows could theoretically create 230,000 output pages.

For this reason, smaller batches are strongly recommended.

## 🔐 Privacy and Security

PDF Mail Merge is designed to process documents locally inside your browser.

- ✅ PDF templates are processed using browser-based JavaScript
- ✅ CSV and XLSX information remains inside the browser session
- ✅ Generated PDF files are created on your device
- ✅ No registration is required
- ✅ No PDF Mail Merge account is required
- ✅ No subscription is required
- ✅ No document-processing server is required

For sensitive documents:

- Use a trusted device
- Avoid shared or public computers
- Review generated files before distributing them
- Close the browser tab after finishing
- Delete downloaded files that are no longer required

Browser-based processing improves privacy, but users remain responsible for protecting files stored on their devices.

## ⚠️ Browser and File Limitations

PDF generation is performed using the memory and processing power available to your browser.

Performance can vary depending on:

- PDF file size
- Number of PDF pages
- Number of mapped fields
- Length of spreadsheet values
- Number of selected records
- Available device memory
- Browser and operating system

For the best results:

- Generate one test PDF first
- Use smaller record ranges
- Avoid processing thousands of large documents simultaneously
- Keep the browser tab open during generation
- Do not allow the device to sleep during a large batch
- Use an up-to-date desktop browser

Modern `.xlsx` files are supported.

Older `.xls` files should be saved as `.xlsx` or `.csv` before uploading.

## 💡 Example Uses

PDF Mail Merge can help create:

- Personalised certificates
- Customer letters
- Event invitations
- Employee documents
- Student reports
- Name badges
- Membership cards
- Address labels
- Order documents
- Account statements
- Client reports
- Personalised marketing materials
- Business forms
- Registration confirmations
- Payment receipts

## 💛 Support This Free Project

PDF Mail Merge is free and open source.

If the application saves you time and you would like to support future maintenance and improvements, you can make an optional PayPal donation.

[![Donate with PayPal](https://img.shields.io/badge/Donate%20with-PayPal-0070BA?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38)

### [Donate securely with PayPal](https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38)

Donations are completely optional. The software will remain free to use.

## 🌐 Live Website

The application is hosted free through GitHub Pages.

### [https://bryanssss.github.io/pdf-mail-merge/](https://bryanssss.github.io/pdf-mail-merge/)

Visitors can open the website and use the software immediately without downloading or installing the project.

## 💻 Run the Project Locally

The instructions below are for developers who want to inspect or modify the source code.

Regular users should use the live website:

[Open PDF Mail Merge online](https://bryanssss.github.io/pdf-mail-merge/)

### Requirements

- [Node.js](https://nodejs.org/) version 18 or newer
- [npm](https://www.npmjs.com/) version 9 or newer

### 1. Clone the Repository

```bash
git clone https://github.com/bryanssss/pdf-mail-merge.git
cd pdf-mail-merge
```

### 2. Install the Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

Open the local address displayed in the terminal. It will normally be:

```text
http://localhost:5173
```

### 4. Build for Production

```bash
npm run build
```

The production files will be created inside:

```text
dist/
```

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | User interface framework |
| [TypeScript](https://www.typescriptlang.org/) | Type checking and application development |
| [Vite](https://vite.dev/) | Development and production build tool |
| [Tailwind CSS 4](https://tailwindcss.com/) | Interface styling |
| [pdf-lib](https://pdf-lib.js.org/) | PDF creation and manipulation |
| [PDF.js](https://mozilla.github.io/pdf.js/) | Browser-based PDF page rendering |
| [Papa Parse](https://www.papaparse.com/) | CSV file parsing |
| [JSZip](https://stuk.github.io/jszip/) | XLSX reading and ZIP archive creation |
| [FileSaver.js](https://github.com/eligrey/FileSaver.js/) | Browser file downloads |
| [Lucide React](https://lucide.dev/) | Interface icons |

## 📁 Project Structure

```text
pdf-mail-merge/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── components/
│   │   ├── FileDropzone.tsx
│   │   ├── GenerateStep.tsx
│   │   ├── MapFieldsStep.tsx
│   │   ├── PdfPageCanvas.tsx
│   │   ├── PreviewStep.tsx
│   │   ├── StepIndicator.tsx
│   │   ├── UploadDataStep.tsx
│   │   └── UploadPDFStep.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── csvUtils.ts
│   │   └── pdfUtils.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── CONTRIBUTING.md
├── DEPLOY-GUIDE.md
├── index.html
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

## 🚀 GitHub Pages Deployment

This repository contains a GitHub Actions workflow that builds the application and publishes it through GitHub Pages.

The live application is available here:

[Open PDF Mail Merge](https://bryanssss.github.io/pdf-mail-merge/)

Beginner-friendly deployment instructions are available in:

[DEPLOY-GUIDE.md](DEPLOY-GUIDE.md)

## 🤝 Contributing

Contributions, bug reports and improvements are welcome.

Useful contribution areas include:

- PDF rendering improvements
- Accessibility
- Browser compatibility
- Additional spreadsheet support
- Text formatting options
- Performance optimisation
- Batch-processing improvements
- User interface improvements
- Automated testing
- Documentation

### Contribution Steps

1. Fork this repository.

2. Create a new feature branch:

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes:

```bash
git commit -m "Add amazing feature"
```

4. Push the branch:

```bash
git push origin feature/amazing-feature
```

5. Open a pull request on GitHub.

### Development Guidelines

- Follow TypeScript best practices
- Use functional React components and hooks
- Write clear commit messages
- Test changes with different PDF templates
- Test multi-page PDF documents
- Test CSV and XLSX files
- Test international and Unicode characters
- Test different record counts
- Test small and large generation ranges
- Avoid unnecessary server-side processing
- Protect the privacy-focused design
- Keep the interface understandable for non-technical users

## 🐛 Reporting a Problem

When submitting a bug report, include:

- Browser name and version
- Operating system
- PDF page count
- Approximate PDF file size
- Spreadsheet format
- Number of spreadsheet rows
- Number of mapped fields
- A description of what happened
- A screenshot of any visible error

Do not publicly upload confidential PDFs or spreadsheets when reporting a problem.

## 🗺️ Possible Future Improvements

Potential future additions may include:

- Additional font choices
- Text alignment controls
- Multi-line text boxes
- Image merge fields
- QR code generation
- Date and number formatting
- Saved mapping templates
- Undo and redo controls
- Field duplication
- Optional field labels
- Improved mobile editing
- Additional export settings

Feature availability is not guaranteed and will depend on development time and community contributions.

## 📝 Licence

This project is licensed under the MIT Licence.

See the [LICENSE](LICENSE) file for complete details.

## 🙏 Acknowledgements

- [pdf-lib](https://pdf-lib.js.org/) for PDF creation and manipulation
- [PDF.js](https://mozilla.github.io/pdf.js/) for browser-based PDF rendering
- [Papa Parse](https://www.papaparse.com/) for CSV parsing
- [JSZip](https://stuk.github.io/jszip/) for archive and spreadsheet processing
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) for browser downloads
- [Lucide](https://lucide.dev/) for interface icons
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/) for application development

---

<p align="center">
  <strong><a href="https://bryanssss.github.io/pdf-mail-merge/">Open PDF Mail Merge Online</a></strong>
</p>

<p align="center">
  Visual drag-and-drop mapping • CSV and XLSX support • Private browser processing
</p>

<p align="center">
  No installation required • Free to use • Open source
</p>

<p align="center">
  Made with ❤️ using React, TypeScript, PDF.js, pdf-lib and Tailwind CSS
</p>
