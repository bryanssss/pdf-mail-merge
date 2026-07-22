import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Download,
  FileArchive,
  FileText,
  Info,
  Loader2,
  Package,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { DataRecord, TemplateField } from '../types';
import { generateMergedPDF } from '../utils/pdfUtils';

interface GenerateStepProps {
  pdfBytes: ArrayBuffer | null;
  fields: TemplateField[];
  records: DataRecord[];
  headers: string[];
  pageCount: number;
  onBack: () => void;
  onReset: () => void;
}

type GenerationMode = 'test' | 'range' | 'all';
type OutputMode = 'zip' | 'single';

interface GeneratedFile {
  name: string;
  data: Uint8Array;
  sourceRow: number;
}

const MAX_BROWSER_BATCH = 250;
const MAX_COMBINED_PAGES = 1000;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function safeFileName(value: unknown, fallback: string): string {
  const cleaned = String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 70);

  return cleaned || fallback;
}

function chooseDefaultFileNameColumn(headers: string[]): string {
  const preferredPatterns = [
    /company.*name/i,
    /full.*name/i,
    /^name$/i,
    /customer.*name/i,
    /row.*id/i,
    /^id$/i,
    /email/i,
  ];

  for (const pattern of preferredPatterns) {
    const match = headers.find((header) => pattern.test(header));
    if (match) return match;
  }

  return headers.find((header) => !/^index$/i.test(header)) ?? headers[0] ?? '';
}

export default function GenerateStep({
  pdfBytes,
  fields,
  records,
  headers,
  pageCount,
  onBack,
  onReset,
}: GenerateStepProps) {
  const [generationMode, setGenerationMode] =
    useState<GenerationMode>('test');
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(
    Math.max(1, Math.min(records.length, 25)),
  );
  const [fileNameColumn, setFileNameColumn] = useState(() =>
    chooseDefaultFileNameColumn(headers),
  );
  const [outputMode, setOutputMode] = useState<OutputMode>('zip');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [showAllFiles, setShowAllFiles] = useState(false);
  const cancelRequested = useRef(false);

  const selectedEntries = useMemo(() => {
    if (records.length === 0) return [];

    if (generationMode === 'test') {
      return [{ record: records[0], rowIndex: 0 }];
    }

    if (generationMode === 'all') {
      return records.map((record, rowIndex) => ({ record, rowIndex }));
    }

    const startIndex = clamp(rangeStart - 1, 0, records.length - 1);
    const endIndex = clamp(rangeEnd, startIndex + 1, records.length);
    return records
      .slice(startIndex, endIndex)
      .map((record, offset) => ({
        record,
        rowIndex: startIndex + offset,
      }));
  }, [generationMode, rangeEnd, rangeStart, records]);

  const selectedCount = selectedEntries.length;
  const totalOutputPages = selectedCount * pageCount;
  const exceedsBatchLimit = selectedCount > MAX_BROWSER_BATCH;
  const exceedsCombinedLimit = totalOutputPages > MAX_COMBINED_PAGES;
  const estimatedMegabytes = pdfBytes
    ? (pdfBytes.byteLength * selectedCount) / (1024 * 1024)
    : 0;

  useEffect(() => {
    if (outputMode === 'single' && exceedsCombinedLimit) {
      setOutputMode('zip');
    }
  }, [exceedsCombinedLimit, outputMode]);

  const resetGeneratedOutput = () => {
    setGeneratedFiles([]);
    setIsComplete(false);
    setProgress(0);
    setError(null);
    setShowAllFiles(false);
  };

  const changeGenerationMode = (mode: GenerationMode) => {
    setGenerationMode(mode);
    resetGeneratedOutput();
  };

  const generateSelected = async () => {
    if (!pdfBytes || selectedCount === 0 || exceedsBatchLimit) return;

    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setIsComplete(false);
    setGeneratedFiles([]);
    cancelRequested.current = false;

    try {
      const files: GeneratedFile[] = [];

      for (let index = 0; index < selectedEntries.length; index += 1) {
        if (cancelRequested.current) {
          throw new Error('Generation was cancelled.');
        }

        const { record, rowIndex } = selectedEntries[index];
        const mergedPdf = await generateMergedPDF(pdfBytes, fields, record);
        const nameValue = fileNameColumn ? record[fileNameColumn] : '';
        const baseName = safeFileName(
          nameValue,
          `document_${rowIndex + 1}`,
        );

        files.push({
          name: `${baseName}_row_${rowIndex + 1}.pdf`,
          data: mergedPdf,
          sourceRow: rowIndex + 1,
        });

        setProgress(
          Math.round(((index + 1) / selectedEntries.length) * 100),
        );

        if ((index + 1) % 5 === 0) {
          await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
        }
      }

      setGeneratedFiles(files);
      setIsComplete(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'PDF generation failed for an unknown reason.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAsZip = async () => {
    if (generatedFiles.length === 0) return;
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      const zip = new JSZip();
      generatedFiles.forEach((file) => zip.file(file.name, file.data));
      const zipBlob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (metadata) => setProgress(Math.round(metadata.percent)),
      );
      saveAs(zipBlob, 'pdf_mail_merge_output.zip');
    } catch (caughtError) {
      setError(
        `ZIP creation failed: ${
          caughtError instanceof Error ? caughtError.message : 'Unknown error'
        }`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCombinedPDF = async () => {
    if (generatedFiles.length === 0 || exceedsCombinedLimit) return;
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      const { PDFDocument } = await import('pdf-lib');
      const combinedDocument = await PDFDocument.create();

      for (let index = 0; index < generatedFiles.length; index += 1) {
        const sourceDocument = await PDFDocument.load(
          generatedFiles[index].data,
        );
        const copiedPages = await combinedDocument.copyPages(
          sourceDocument,
          sourceDocument.getPageIndices(),
        );
        copiedPages.forEach((page) => combinedDocument.addPage(page));
        setProgress(Math.round(((index + 1) / generatedFiles.length) * 100));
      }

      const result = await combinedDocument.save();
      saveAs(
        new Blob([result.buffer as ArrayBuffer], { type: 'application/pdf' }),
        'pdf_mail_merge_combined.pdf',
      );
    } catch (caughtError) {
      setError(
        `Combined PDF creation failed: ${
          caughtError instanceof Error ? caughtError.message : 'Unknown error'
        }`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSingleFile = (file: GeneratedFile) => {
    saveAs(
      new Blob([file.data.buffer as ArrayBuffer], { type: 'application/pdf' }),
      file.name,
    );
  };

  const visibleFiles = showAllFiles
    ? generatedFiles
    : generatedFiles.slice(0, 50);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          Choose Records & Generate
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-base text-slate-500 sm:text-lg">
          Start with one test PDF, then generate only the spreadsheet rows you
          actually need.
        </p>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="font-semibold">How this merge works</p>
            <p className="mt-1 leading-6 text-blue-800">
              One selected spreadsheet row creates one copy of your PDF template.
              The {fields.length} mapped field{fields.length === 1 ? '' : 's'} are
              written onto that copy. Your spreadsheet contains{' '}
              {records.length.toLocaleString()} rows, so “all rows” would create{' '}
              {records.length.toLocaleString()} separate PDFs.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold text-slate-800">1. Select the rows</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => changeGenerationMode('test')}
            className={`rounded-xl border-2 p-4 text-left transition ${
              generationMode === 'test'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-200'
            }`}
          >
            <span className="block font-semibold text-slate-800">Test one row</span>
            <span className="mt-1 block text-sm text-slate-500">
              Safest first step. Creates only row 1.
            </span>
          </button>

          <button
            type="button"
            onClick={() => changeGenerationMode('range')}
            className={`rounded-xl border-2 p-4 text-left transition ${
              generationMode === 'range'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-200'
            }`}
          >
            <span className="block font-semibold text-slate-800">Choose a range</span>
            <span className="mt-1 block text-sm text-slate-500">
              Example: rows 1–25 or 251–500.
            </span>
          </button>

          <button
            type="button"
            onClick={() => changeGenerationMode('all')}
            className={`rounded-xl border-2 p-4 text-left transition ${
              generationMode === 'all'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-200'
            }`}
          >
            <span className="block font-semibold text-slate-800">All rows</span>
            <span className="mt-1 block text-sm text-slate-500">
              {records.length.toLocaleString()} PDFs — available only when within
              the safe browser batch limit.
            </span>
          </button>
        </div>

        {generationMode === 'range' && (
          <div className="mt-4 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-600">
              First spreadsheet row
              <input
                type="number"
                min={1}
                max={records.length}
                value={rangeStart}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const value = clamp(
                    Number(event.target.value),
                    1,
                    records.length,
                  );
                  setRangeStart(value);
                  if (rangeEnd < value) setRangeEnd(value);
                  resetGeneratedOutput();
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Last spreadsheet row
              <input
                type="number"
                min={rangeStart}
                max={records.length}
                value={rangeEnd}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setRangeEnd(
                    clamp(Number(event.target.value), rangeStart, records.length),
                  );
                  resetGeneratedOutput();
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </label>
          </div>
        )}

        {exceedsBatchLimit && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">This selection is too large for one browser batch.</p>
                <p className="mt-1 leading-6">
                  Select no more than {MAX_BROWSER_BATCH} rows at a time. For your
                  file, use ranges such as 1–250, 251–500 and continue in batches.
                  This prevents the tab from freezing or consuming several
                  gigabytes of memory.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold text-slate-800">2. Output settings</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-600">
            Use this column for PDF file names
            <select
              value={fileNameColumn}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                setFileNameColumn(event.target.value);
                resetGeneratedOutput();
              }}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              {headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="text-sm font-medium text-slate-600">Download format</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOutputMode('zip')}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  outputMode === 'zip'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ZIP of separate PDFs
              </button>
              <button
                type="button"
                onClick={() => setOutputMode('single')}
                disabled={exceedsCombinedLimit}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  outputMode === 'single'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
              >
                One combined PDF
              </button>
            </div>
            {exceedsCombinedLimit && (
              <p className="mt-2 text-xs text-amber-700">
                Combined PDF is disabled because this selection would contain{' '}
                {totalOutputPages.toLocaleString()} pages. Use a smaller range or
                download a ZIP.
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block text-xs text-slate-400">Selected rows</span>
            <strong className="text-lg text-slate-800">
              {selectedCount.toLocaleString()}
            </strong>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block text-xs text-slate-400">PDFs created</span>
            <strong className="text-lg text-slate-800">
              {selectedCount.toLocaleString()}
            </strong>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block text-xs text-slate-400">Total output pages</span>
            <strong className="text-lg text-slate-800">
              {totalOutputPages.toLocaleString()}
            </strong>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block text-xs text-slate-400">Rough memory estimate</span>
            <strong className="text-lg text-slate-800">
              {estimatedMegabytes < 1
                ? '<1 MB'
                : `${estimatedMegabytes.toFixed(0)} MB`}
            </strong>
          </div>
        </div>
      </div>

      {!isComplete && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          {isGenerating ? (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
              <h2 className="mt-4 text-xl font-semibold text-slate-800">
                Generating {selectedCount.toLocaleString()} PDF
                {selectedCount === 1 ? '' : 's'}…
              </h2>
              <div className="mx-auto mt-5 h-3 max-w-3xl overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-slate-500">{progress}% complete</p>
              <button
                type="button"
                onClick={() => {
                  cancelRequested.current = true;
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <Package className="mx-auto h-10 w-10 text-indigo-600" />
              <h2 className="mt-4 text-xl font-semibold text-slate-800">
                Ready to generate
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {selectedCount.toLocaleString()} selected row
                {selectedCount === 1 ? '' : 's'} × {pageCount} template page
                {pageCount === 1 ? '' : 's'} = {totalOutputPages.toLocaleString()}{' '}
                output page{totalOutputPages === 1 ? '' : 's'}.
              </p>
              <button
                type="button"
                onClick={() => void generateSelected()}
                disabled={
                  !pdfBytes ||
                  fields.length === 0 ||
                  selectedCount === 0 ||
                  exceedsBatchLimit
                }
                className="mt-5 rounded-xl bg-indigo-600 px-7 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                Generate {generationMode === 'test' ? '1 Test PDF' : `${selectedCount.toLocaleString()} PDFs`}
              </button>
            </>
          )}

          {error && (
            <div className="mx-auto mt-5 max-w-3xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      {isComplete && (
        <div className="mt-5 space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <CheckCircle className="mx-auto h-11 w-11 text-emerald-600" />
            <h2 className="mt-3 text-2xl font-bold text-emerald-800">
              Generation complete
            </h2>
            <p className="mt-1 text-emerald-700">
              Created {generatedFiles.length.toLocaleString()} personalised PDF
              {generatedFiles.length === 1 ? '' : 's'}.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {outputMode === 'zip' ? (
              <button
                type="button"
                onClick={() => void downloadAsZip()}
                disabled={isGenerating}
                className="flex items-center justify-center gap-3 rounded-xl bg-indigo-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <FileArchive className="h-6 w-6" />
                )}
                Download ZIP
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void downloadCombinedPDF()}
                disabled={isGenerating || exceedsCombinedLimit}
                className="flex items-center justify-center gap-3 rounded-xl bg-fuchsia-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-fuchsia-200 transition hover:bg-fuchsia-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <FileText className="h-6 w-6" />
                )}
                Download Combined PDF
              </button>
            )}

            <button
              type="button"
              onClick={resetGeneratedOutput}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-4 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RotateCcw className="h-5 w-5" />
              Change rows or settings
            </button>
          </div>

          {isGenerating && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-center text-sm text-indigo-700">
              Preparing download… {progress}%
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-800">
                Individual Files ({generatedFiles.length.toLocaleString()})
              </h2>
              {generatedFiles.length > 50 && (
                <button
                  type="button"
                  onClick={() => setShowAllFiles((value) => !value)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  {showAllFiles ? 'Show first 50' : 'Show all'}
                </button>
              )}
            </div>

            <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {visibleFiles.map((file) => (
                <div
                  key={`${file.sourceRow}-${file.name}`}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <FileText className="h-5 w-5 shrink-0 text-red-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      Spreadsheet row {file.sourceRow} ·{' '}
                      {(file.data.length / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadSingleFile(file)}
                    className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                    aria-label={`Download ${file.name}`}
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isGenerating}
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          ← Back to Preview
        </button>
        {isComplete && (
          <button
            type="button"
            onClick={onReset}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Start New Merge
          </button>
        )}
      </div>
    </section>
  );
}
