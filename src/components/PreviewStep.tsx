import { useState, useEffect } from 'react';
import { Eye, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import type { TemplateField, DataRecord } from '../types';
import { generateMergedPDF } from '../utils/pdfUtils';

interface PreviewStepProps {
  pdfBytes: ArrayBuffer | null;
  fields: TemplateField[];
  records: DataRecord[];
  headers: string[];
  onNext: () => void;
  onBack: () => void;
}

export default function PreviewStep({
  pdfBytes,
  fields,
  records,
  headers,
  onNext,
  onBack,
}: PreviewStepProps) {
  const [currentRecord, setCurrentRecord] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generatePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRecord]);

  const generatePreview = async () => {
    if (!pdfBytes || records.length === 0) return;

    setIsGenerating(true);
    setError(null);

    try {
      const mergedPdf = await generateMergedPDF(pdfBytes, fields, records[currentRecord]);
      const blob = new Blob([mergedPdf.buffer as ArrayBuffer], { type: 'application/pdf' });
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      setError(`Failed to generate preview: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const record = records[currentRecord];

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Preview Merged PDFs</h2>
        <p className="text-gray-500 text-lg">
          Review how your merged documents will look before generating all of them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Record Navigator */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Eye size={18} className="text-indigo-600" />
              Record {currentRecord + 1} of {records.length}
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setCurrentRecord(Math.max(0, currentRecord - 1))}
                disabled={currentRecord === 0}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={records.length - 1}
                  value={currentRecord}
                  onChange={(e) => setCurrentRecord(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
              <button
                onClick={() => setCurrentRecord(Math.min(records.length - 1, currentRecord + 1))}
                disabled={currentRecord === records.length - 1}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {headers.map((header) => (
                <div key={header} className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium truncate mr-2">{header}:</span>
                  <span className="text-gray-800 font-semibold truncate text-right">
                    {record?.[header] || <span className="text-gray-300 italic">empty</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-3">Field Mappings</h3>
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: field.color }}
                  />
                  <span className="font-medium text-gray-700">{field.name}</span>
                  <span className="text-gray-400 text-xs ml-auto">
                    P{field.page} ({field.x}, {field.y})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" />
              <span className="font-semibold text-gray-700 text-sm">PDF Preview</span>
              {isGenerating && (
                <span className="ml-auto text-xs text-indigo-500 animate-pulse">Generating...</span>
              )}
            </div>
            <div className="aspect-[8.5/11] bg-gray-100 relative">
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-red-500 font-medium">{error}</p>
                    <button
                      onClick={generatePreview}
                      className="mt-3 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="PDF Preview"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-300"
        >
          Generate All →
        </button>
      </div>
    </div>
  );
}
