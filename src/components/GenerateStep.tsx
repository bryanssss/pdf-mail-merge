import { useState } from 'react';
import {
  Download,
  FileArchive,
  FileText,
  CheckCircle,
  Loader2,
  RotateCcw,
  Package,
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { TemplateField, DataRecord } from '../types';
import { generateMergedPDF } from '../utils/pdfUtils';

interface GenerateStepProps {
  pdfBytes: ArrayBuffer | null;
  fields: TemplateField[];
  records: DataRecord[];
  onBack: () => void;
  onReset: () => void;
}

export default function GenerateStep({
  pdfBytes,
  fields,
  records,
  onBack,
  onReset,
}: GenerateStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<{ name: string; data: Uint8Array }[]>([]);
  const [outputMode, setOutputMode] = useState<'zip' | 'single'>('zip');

  const generateAll = async () => {
    if (!pdfBytes) return;

    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setIsComplete(false);
    setGeneratedFiles([]);

    try {
      const files: { name: string; data: Uint8Array }[] = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const mergedPdf = await generateMergedPDF(pdfBytes, fields, record);

        const firstFieldValue = Object.values(record)[0] || `document_${i + 1}`;
        const safeName = firstFieldValue.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);

        files.push({
          name: `${safeName}_${i + 1}.pdf`,
          data: mergedPdf,
        });

        setProgress(Math.round(((i + 1) / records.length) * 100));
      }

      setGeneratedFiles(files);
      setIsComplete(true);
    } catch (err) {
      setError(
        `Generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAsZip = async () => {
    const zip = new JSZip();

    for (const file of generatedFiles) {
      zip.file(file.name, file.data);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'mail_merge_output.zip');
  };

  const downloadSingleMergedPDF = async () => {
    if (!pdfBytes) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      const { PDFDocument } = await import('pdf-lib');
      const mergedDoc = await PDFDocument.create();

      for (let i = 0; i < generatedFiles.length; i++) {
        const srcDoc = await PDFDocument.load(generatedFiles[i].data);
        const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((page) => mergedDoc.addPage(page));
        setProgress(Math.round(((i + 1) / generatedFiles.length) * 100));
      }

      const pdfBytesResult = await mergedDoc.save();
      const blob = new Blob([pdfBytesResult.buffer as ArrayBuffer], { type: 'application/pdf' });
      saveAs(blob, 'mail_merge_combined.pdf');
    } catch (err) {
      setError(`Failed to create combined PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSingleFile = (file: { name: string; data: Uint8Array }) => {
    const blob = new Blob([file.data.buffer as ArrayBuffer], { type: 'application/pdf' });
    saveAs(blob, file.name);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Generate Merged PDFs</h2>
        <p className="text-gray-500 text-lg">
          Generate {records.length} personalized PDF{records.length !== 1 ? 's' : ''} from your
          template and data.
        </p>
      </div>

      {!isComplete && !isGenerating && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <Package size={64} className="mx-auto text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Ready to Generate</h3>
            <p className="text-gray-500">
              {records.length} documents will be created with {fields.length} merged field
              {fields.length !== 1 ? 's' : ''} each.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-600 mb-3">Output Format:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOutputMode('zip')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  outputMode === 'zip'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileArchive
                  size={24}
                  className={outputMode === 'zip' ? 'text-indigo-600' : 'text-gray-400'}
                />
                <p className="font-semibold text-gray-700 mt-2">ZIP Archive</p>
                <p className="text-xs text-gray-500 mt-1">Individual PDFs in a zip file</p>
              </button>
              <button
                onClick={() => setOutputMode('single')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  outputMode === 'single'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText
                  size={24}
                  className={outputMode === 'single' ? 'text-indigo-600' : 'text-gray-400'}
                />
                <p className="font-semibold text-gray-700 mt-2">Combined PDF</p>
                <p className="text-xs text-gray-500 mt-1">All pages in one PDF document</p>
              </button>
            </div>
          </div>

          <button
            onClick={generateAll}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 transition-all duration-300 text-lg"
          >
            🚀 Generate {records.length} PDFs
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {isGenerating && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-6">
            <Loader2 size={48} className="mx-auto text-indigo-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Generating PDFs...</h3>
            <p className="text-gray-500">Please wait while your documents are being created.</p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-500">{progress}% complete</p>
        </div>
      )}

      {isComplete && (
        <div className="space-y-6">
          <div className="bg-green-50 rounded-2xl border border-green-200 p-8 text-center">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-green-800 mb-2">Generation Complete! 🎉</h3>
            <p className="text-green-600">
              Successfully generated {generatedFiles.length} PDF
              {generatedFiles.length !== 1 ? 's' : ''}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={downloadAsZip}
              className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg transition-all"
            >
              <FileArchive size={22} />
              Download as ZIP
            </button>
            <button
              onClick={downloadSingleMergedPDF}
              className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all"
            >
              <FileText size={22} />
              Download Combined PDF
            </button>
          </div>

          {/* Individual Files */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-700">
                Individual Files ({generatedFiles.length})
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {generatedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <FileText size={16} className="text-red-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-gray-400">
                    {(file.data.length / 1024).toFixed(1)} KB
                  </span>
                  <button
                    onClick={() => downloadSingleFile(file)}
                    className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          disabled={isGenerating}
          className="px-6 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          ← Back
        </button>
        {isComplete && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all"
          >
            <RotateCcw size={18} />
            Start New Merge
          </button>
        )}
      </div>
    </div>
  );
}
