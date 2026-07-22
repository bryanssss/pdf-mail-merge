# 📄 PDF Mail Merge

A powerful, privacy-focused web application for generating personalized PDF documents at scale. Upload a PDF template, provide your data via CSV, map fields to positions, and generate hundreds of customized PDFs — all in your browser.

![PDF Mail Merge](https://img.shields.io/badge/PDF-Mail%20Merge-6366f1?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss)

## ✨ Features

- **🔒 100% Client-Side** — Your data never leaves your browser. No server, no uploads, complete privacy.
- **📋 CSV Data Import** — Upload CSV files with any number of columns and records.
- **🎨 Visual Field Mapping** — Position merge fields on your PDF with precise X/Y coordinates, font size, color, and weight controls.
- **👁️ Live Preview** — Preview merged PDFs before generating, navigate through records.
- **📦 Flexible Output** — Download as individual PDFs in a ZIP archive or as a single combined PDF.
- **⚡ Fast Generation** — Efficiently generates hundreds of PDFs using pdf-lib.
- **📱 Responsive Design** — Works on desktop, tablet, and mobile devices.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/YOUR-GITHUB-USERNAME/pdf-mail-merge.git
cd pdf-mail-merge
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the development server:**

```bash
npm run dev
```

4. **Open your browser** and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📖 How to Use

### Step 1: Upload PDF Template
Upload any PDF document that you want to use as a template. This could be:
- A letter or certificate
- An invoice or receipt
- A badge or name tag
- Any document with areas for personalized text

### Step 2: Upload Data (CSV)
Upload a CSV file containing your data. Each row represents one document, and each column is a field you can merge.

**Example CSV:**
```csv
First Name,Last Name,Email,Company
John,Doe,john@example.com,Acme Corp
Jane,Smith,jane@example.com,Widget Inc
```

### Step 3: Map Fields
Add columns from your data as merge fields and configure:
- **X/Y Position** — Where on the page to place the text (in points, 72 pts = 1 inch)
- **Page Number** — Which page of the PDF to add the text to
- **Font Size** — Size of the text (6-72 pts)
- **Color** — Text color using a color picker or hex code
- **Font Weight** — Normal or Bold
- **Max Width** — Optional max width for text wrapping

### Step 4: Preview
Navigate through records to see a live preview of how each merged PDF will look.

### Step 5: Generate
Choose your output format and generate all PDFs:
- **ZIP Archive** — Individual PDF files bundled in a .zip
- **Combined PDF** — All documents merged into one PDF file

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [React 19](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vitejs.dev/) | Build tool |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [pdf-lib](https://pdf-lib.js.org/) | PDF generation & manipulation |
| [PapaParse](https://www.papaparse.com/) | CSV parsing |
| [JSZip](https://stuk.github.io/jszip/) | ZIP file creation |
| [FileSaver.js](https://github.com/nicolo-ribaudo/FileSaver.js) | File download utility |
| [Lucide React](https://lucide.dev/) | Icon library |

## 📁 Project Structure

```
pdf-mail-merge/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── FileDropzone.tsx     # Drag & drop file upload
│   │   ├── GenerateStep.tsx     # PDF generation & download
│   │   ├── MapFieldsStep.tsx    # Field positioning config
│   │   ├── PreviewStep.tsx      # Live PDF preview
│   │   ├── StepIndicator.tsx    # Progress stepper
│   │   ├── UploadDataStep.tsx   # CSV upload & preview
│   │   └── UploadPDFStep.tsx    # PDF template upload
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── utils/
│   │   ├── cn.ts                # Class name utility
│   │   ├── csvUtils.ts          # CSV parsing utilities
│   │   └── pdfUtils.ts          # PDF generation utilities
│   ├── App.tsx                  # Main application component
│   ├── index.css                # Global styles
│   └── main.tsx                 # Entry point
├── .gitignore
├── index.html
├── LICENSE
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

## 🔐 Privacy & Security

This application runs **entirely in your browser**. No data is sent to any server.

- ✅ PDFs are processed locally using JavaScript
- ✅ CSV data stays in browser memory
- ✅ Generated files are created client-side
- ✅ No analytics, tracking, or external requests
- ✅ Works offline after initial page load

## 💛 Support This Free Project

PDF Mail Merge is free and open source. If it saves you time and you would like to support future improvements, you can make an optional donation:

[**Donate securely with PayPal**](https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38)

Donations are completely optional. The software remains free to use.

## 🌐 Free Online Deployment

This repository includes a GitHub Actions workflow that builds and publishes the application with GitHub Pages. See [DEPLOY-GUIDE.md](DEPLOY-GUIDE.md) for beginner-friendly Windows instructions.

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Write descriptive commit messages
- Test with various PDF templates and CSV files

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [pdf-lib](https://pdf-lib.js.org/) for the excellent PDF manipulation library
- [PapaParse](https://www.papaparse.com/) for robust CSV parsing
- [Lucide](https://lucide.dev/) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---

<p align="center">
  Made with ❤️ using React, pdf-lib & Tailwind CSS
</p>
