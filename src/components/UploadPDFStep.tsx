import { FileText } from 'lucide-react';
import FileDropzone from './FileDropzone';

interface UploadPDFStepProps {
  pdfFile: File | null;
  onPdfSelect: (file: File) => void;
  onNext: () => void;
}

export default function UploadPDFStep({ pdfFile, onPdfSelect, onNext }: UploadPDFStepProps) {
  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Upload Your PDF Template</h2>
        <p className="text-gray-500 text-lg">
          Start by uploading the PDF document you want to use as a template for mail merge.
        </p>
      </div>

      <FileDropzone
        accept=".pdf"
        onFileSelect={onPdfSelect}
        label="Upload PDF Template"
        description="Drag & drop your PDF file here or click to browse"
        selectedFile={pdfFile}
        icon={<FileText size={48} />}
      />

      <div className="mt-8 bg-indigo-50 rounded-xl p-5 border border-indigo-100">
        <h3 className="font-semibold text-indigo-800 mb-2">💡 Tips for best results:</h3>
        <ul className="text-sm text-indigo-700 space-y-1.5">
          <li>• Use a PDF with clear areas where you want to insert personalized text</li>
          <li>• Templates with form fields or blank spaces work best</li>
          <li>• Any PDF format is supported — letters, certificates, invoices, etc.</li>
          <li>• Maximum recommended file size: 10 MB</li>
        </ul>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!pdfFile}
          className={`
            px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300
            ${pdfFile
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300'
              : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
