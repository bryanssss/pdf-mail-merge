# 📄 PDF Mail Merge

A free, privacy-focused web application for creating personalised PDF documents at scale. Upload a PDF template, import your data from a CSV file, position the fields, preview the results and generate customised PDFs directly in your browser.

## 🚀 Use PDF Mail Merge Online

**No installation, registration or account is required.**

[![Open PDF Mail Merge Online](https://img.shields.io/badge/Open%20PDF%20Mail%20Merge-Use%20Online-22c55e?style=for-the-badge&logo=googlechrome&logoColor=white)](https://bryanssss.github.io/pdf-mail-merge/)

### 👉 [Open PDF Mail Merge in your browser](https://bryanssss.github.io/pdf-mail-merge/)

Your PDF and CSV files are processed locally inside your browser. They are not uploaded to a PDF Mail Merge server.

![PDF Mail Merge](https://img.shields.io/badge/PDF-Mail%20Merge-6366f1?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss)

## ✨ Features

- **🔒 Browser-based processing** — Your PDF and CSV data are processed locally in your browser.
- **📋 CSV data import** — Upload CSV files containing any number of columns and records.
- **🎨 Visual field mapping** — Position merge fields using precise X and Y coordinates.
- **✏️ Text controls** — Adjust page number, font size, colour, weight and maximum width.
- **👁️ Live preview** — Preview the merged document and move between individual records.
- **📦 Flexible downloads** — Download individual PDFs in a ZIP archive or create one combined PDF.
- **⚡ Batch generation** — Generate many personalised PDF documents in one operation.
- **📱 Responsive interface** — Use the application on desktop, tablet and supported mobile browsers.
- **💯 Free and open source** — Use the software without subscriptions or registration.

## 📖 How to Use PDF Mail Merge

### Step 1: Upload Your PDF Template

Upload the PDF document that you want to personalise.

Examples include:

- Letters
- Certificates
- Invoices
- Receipts
- Badges
- Name tags
- Invitations
- Membership documents
- Any PDF containing areas where personalised text should appear

### Step 2: Upload Your CSV Data

Upload a CSV file containing the information you want to place into the PDF.

Each row represents one generated document. Each column represents a field that can be added to the PDF.

**Example CSV file:**

```csv
First Name,Last Name,Email,Company
John,Doe,john@example.com,Acme Corp
Jane,Smith,jane@example.com,Widget Inc
```

### Step 3: Map Your Fields

Choose columns from the CSV file and configure where each value should appear.

Available settings include:

- **X position** — Horizontal position on the PDF page
- **Y position** — Vertical position on the PDF page
- **Page number** — The page where the text should appear
- **Font size** — Text size between the available limits
- **Text colour** — Select a colour or enter a hexadecimal colour code
- **Font weight** — Choose normal or bold text
- **Maximum width** — Optionally restrict the width of the inserted text

PDF positions use points:

```text
72 points = 1 inch
```

### Step 4: Preview the Result

Use the preview screen to check how the information will appear.

You can move through the CSV records and inspect each personalised document before generating the final files.

### Step 5: Generate Your PDFs

Choose one of the available output formats:

- **ZIP archive** — Creates separate PDF files and places them inside one ZIP download
- **Combined PDF** — Joins all generated documents into one PDF file

## 🔐 Privacy and Security

PDF Mail Merge is designed to process documents locally in your browser.

- ✅ PDF templates are processed using browser-based JavaScript
- ✅ CSV information remains in the browser while you use the application
- ✅ Generated PDF files are created on your device
- ✅ No registration is required
- ✅ No PDF Mail Merge account is required
- ✅ No subscription is required

For sensitive documents, always use a trusted device and close the browser tab after finishing your work.

## 💛 Support This Free Project

PDF Mail Merge is free and open source.

If the application saves you time and you would like to support future maintenance and improvements, you can make an optional PayPal donation.

[![Donate with PayPal](https://img.shields.io/badge/Donate%20with-PayPal-0070BA?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38)

### [Donate securely with PayPal](https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38)

Donations are completely optional. The software will remain free to use.

## 🌐 Live Website

The application is hosted free through GitHub Pages.

### [https://bryanssss.github.io/pdf-mail-merge/](https://bryanssss.github.io/pdf-mail-merge/)

Visitors can open this link and use the software immediately without downloading or installing the project.

## 💻 Run the Project Locally

The instructions below are only for developers who want to edit the source code.

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

### Build for Production

```bash
npm run build
```

The production files will be created inside the following folder:

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
| [Papa Parse](https://www.papaparse.com/) | CSV file parsing |
| [JSZip](https://stuk.github.io/jszip/) | ZIP archive creation |
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
- Test CSV files containing different columns and record counts
- Avoid introducing unnecessary server-side processing
- Protect the privacy-focused design of the application

## 📝 Licence

This project is licensed under the MIT Licence.

See the [LICENSE](LICENSE) file for complete details.

## 🙏 Acknowledgements

- [pdf-lib](https://pdf-lib.js.org/) for PDF manipulation
- [Papa Parse](https://www.papaparse.com/) for CSV parsing
- [JSZip](https://stuk.github.io/jszip/) for ZIP creation
- [Lucide](https://lucide.dev/) for interface icons
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---

<p align="center">
  <strong><a href="https://bryanssss.github.io/pdf-mail-merge/">Open PDF Mail Merge Online</a></strong>
</p>

<p align="center">
  No installation required • Free to use • Open source
</p>

<p align="center">
  Made with ❤️ using React, TypeScript, pdf-lib and Tailwind CSS
</p>
