import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Loader2,
} from 'lucide-react';
import type { DataRecord, TemplateField } from '../types';
import { generateMergedPDF } from '../utils/pdfUtils';

interface PreviewStepProps {
  pdfBytes: ArrayBuffer | null;
  fields: TemplateField[];
  records: DataRecord[];
  headers: string[];
  onNext: () => void;
  onBack: () => void;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
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
  const [previewAttempt, setPreviewAttempt] = useState(0);

  const record = records[currentRecord] ?? {};
  const mappedValues = useMemo(
    () =>
      fields.map((field) => ({
        field,
        value: String(record[field.name] ?? ''),
      })),
    [fields, record],
  );

  useEffect(() => {
    if (!pdfBytes || records.length === 0) return;

    let active = true;
    let createdUrl: string | null = null;

    const generatePreview = async () => {
      setIsGenerating(true);
      setError(null);
      setPreviewUrl(null);

      try {
        const mergedPdf = await generateMergedPDF(
          pdfBytes,
          fields,
          records[currentRecord],
        );
        if (!active) return;

        const blob = new Blob([mergedPdf.buffer as ArrayBuffer], {
          type: 'application/pdf',
        });
        createdUrl = URL.createObjectURL(blob);
        setPreviewUrl(createdUrl);
      } catch (caughtError) {
        if (!active) return;
        setError(
          `Failed to generate preview: ${
            caughtError instanceof Error ? caughtError.message : 'Unknown error'
          }`,
        );
      } finally {
        if (active) setIsGenerating(false);
      }
    };

    void generatePreview();

    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [currentRecord, fields, pdfBytes, previewAttempt, records]);

  const moveToRecord = (recordNumber: number) => {
    setCurrentRecord(clamp(recordNumber - 1, 0, records.length - 1));
  };

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          Preview the Mail Merge
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-base text-slate-500 sm:text-lg">
          Check a real spreadsheet row inside the PDF before choosing how many
          documents to generate.
        </p>
      </div>

      <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <div className="flex gap-3">
          <Eye className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="font-semibold">This is a mail merge, not a simple file join.</p>
            <p className="mt-1 leading-6 text-blue-800">
              Each selected spreadsheet row creates one personalised copy of the
              PDF template. You have {records.length.toLocaleString()} data rows,
              but the next step will default to one test PDF and let you choose a
              safe row range.
            </p>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Eye className="h-5 w-5 text-indigo-600" />
              Preview Record
            </h2>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveToRecord(currentRecord)}
                disabled={currentRecord === 0}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Previous record"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <label className="min-w-0 flex-1 text-sm text-slate-600">
                <span className="sr-only">Record number</span>
                <div className="flex items-center rounded-lg border border-slate-300 bg-white px-3">
                  <span className="shrink-0 text-slate-400">Record</span>
                  <input
                    type="number"
                    min={1}
                    max={records.length}
                    value={currentRecord + 1}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      moveToRecord(Number(event.target.value))
                    }
                    className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-center font-semibold text-slate-800 outline-none"
                  />
                  <span className="shrink-0 text-slate-400">
                    of {records.length.toLocaleString()}
                  </span>
                </div>
              </label>

              <button
                type="button"
                onClick={() => moveToRecord(currentRecord + 2)}
                disabled={currentRecord === records.length - 1}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Next record"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="block text-xs text-slate-400">Mapped fields</span>
                <strong className="text-slate-800">{fields.length}</strong>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="block text-xs text-slate-400">Data columns</span>
                <strong className="text-slate-800">{headers.length}</strong>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">Inserted Values</h2>
            <p className="mt-1 text-xs text-slate-500">
              Only these mapped fields are added to this PDF copy.
            </p>

            <div className="mt-4 max-h-[52vh] space-y-2 overflow-y-auto pr-1">
              {mappedValues.map(({ field, value }, index) => (
                <div
                  key={`${field.name}-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-semibold text-slate-700">
                      {field.name}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">
                      P{field.page} · {field.x},{field.y}
                    </span>
                  </div>
                  <p className="mt-1 break-words text-sm text-slate-600">
                    {value || <span className="italic text-slate-400">Empty</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
              <FileText className="h-5 w-5 text-indigo-600" />
              Merged PDF Preview
            </h2>
            {isGenerating && (
              <span className="flex items-center gap-2 text-sm text-indigo-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating…
              </span>
            )}
          </div>

          <div className="min-h-[72vh] bg-slate-200 p-3 sm:p-5">
            {error ? (
              <div className="flex min-h-[66vh] items-center justify-center rounded-xl bg-white p-8 text-center">
                <div className="max-w-xl">
                  <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
                  <p className="mt-4 font-semibold text-red-600">{error}</p>
                  <button
                    type="button"
                    onClick={() => setPreviewAttempt((value) => value + 1)}
                    className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : previewUrl ? (
              <iframe
                title={`Merged PDF preview for record ${currentRecord + 1}`}
                src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
                className="h-[72vh] w-full rounded-xl border-0 bg-white shadow-inner"
              />
            ) : (
              <div className="flex min-h-[66vh] items-center justify-center rounded-xl bg-white text-slate-500">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                  <p className="mt-3">Generating the merged preview…</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          ← Back to Mapping
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={Boolean(error) || isGenerating || !previewUrl}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          Choose Records & Generate →
        </button>
      </div>
    </section>
  );
}
