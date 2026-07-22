import { useCallback, useState } from 'react';
import { Coffee, FileText, Heart } from 'lucide-react';
import type { AppStep, DataRecord, TemplateField } from './types';
import { parseCSV } from './utils/csvUtils';
import { getPDFPageDimensions } from './utils/pdfUtils';
import GenerateStep from './components/GenerateStep';
import MapFieldsStep from './components/MapFieldsStep';
import PreviewStep from './components/PreviewStep';
import StepIndicator from './components/StepIndicator';
import UploadDataStep from './components/UploadDataStep';
import UploadPDFStep from './components/UploadPDFStep';

const DONATION_URL =
  'https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38';

function App() {
  const githubUrl = window.location.hostname.endsWith('.github.io')
    ? `https://github.com/${window.location.hostname.split('.')[0]}/pdf-mail-merge`
    : 'https://github.com';

  const [currentStep, setCurrentStep] =
    useState<AppStep>('upload-pdf');
  const [completedSteps, setCompletedSteps] = useState<AppStep[]>([]);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pdfWidth, setPdfWidth] = useState(612);
  const [pdfHeight, setPdfHeight] = useState(792);
  const [pageCount, setPageCount] = useState(1);

  const [dataFile, setDataFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [fields, setFields] = useState<TemplateField[]>([]);

  const markStepComplete = (step: AppStep) => {
    setCompletedSteps((previous) =>
      previous.includes(step) ? previous : [...previous, step],
    );
  };

  const handlePdfSelect = useCallback(async (file: File) => {
    setPdfFile(file);
    const bytes = await file.arrayBuffer();
    setPdfBytes(bytes);
    setFields([]);

    try {
      const dimensions = await getPDFPageDimensions(bytes);
      setPdfWidth(dimensions.width);
      setPdfHeight(dimensions.height);
      setPageCount(dimensions.pageCount);
    } catch (error) {
      console.error('Failed to read PDF dimensions:', error);
    }
  }, []);

  const handleDataSelect = useCallback(async (file: File) => {
    setDataFile(file);

    try {
      const parsed = await parseCSV(file);
      setHeaders(parsed.headers);
      setRecords(parsed.records);
      setFields([]);
    } catch (error) {
      console.error('Failed to parse the data file:', error);
      setHeaders([]);
      setRecords([]);
    }
  }, []);

  const handleReset = () => {
    setCurrentStep('upload-pdf');
    setCompletedSteps([]);
    setPdfFile(null);
    setPdfBytes(null);
    setDataFile(null);
    setHeaders([]);
    setRecords([]);
    setFields([]);
    setPdfWidth(612);
    setPdfHeight(792);
    setPageCount(1);
  };

  const goToStep = (step: AppStep) => setCurrentStep(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50 text-slate-800">
      <header className="border-t-4 border-slate-900 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <FileText className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                PDF Mail Merge
              </h1>
              <p className="hidden text-sm text-slate-500 sm:block">
                Visually place spreadsheet data onto PDF templates
              </p>
            </div>
          </div>

          <nav className="flex shrink-0 items-center gap-2">
            <a
              href={DONATION_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-amber-300 sm:px-5"
            >
              <Coffee className="h-5 w-5" />
              <span className="hidden sm:inline">Support this free tool</span>
              <span className="sm:hidden">Support</span>
            </a>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 md:inline-flex"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      <main>
        {currentStep === 'upload-pdf' && (
          <UploadPDFStep
            pdfFile={pdfFile}
            onPdfSelect={handlePdfSelect}
            onNext={() => {
              markStepComplete('upload-pdf');
              goToStep('upload-data');
            }}
          />
        )}

        {currentStep === 'upload-data' && (
          <UploadDataStep
            dataFile={dataFile}
            onDataSelect={handleDataSelect}
            headers={headers}
            records={records}
            onNext={() => {
              markStepComplete('upload-data');
              goToStep('map-fields');
            }}
            onBack={() => goToStep('upload-pdf')}
          />
        )}

        {currentStep === 'map-fields' && (
          <MapFieldsStep
            headers={headers}
            records={records}
            fields={fields}
            onFieldsChange={setFields}
            pageCount={pageCount}
            pdfWidth={pdfWidth}
            pdfHeight={pdfHeight}
            pdfBytes={pdfBytes}
            onNext={() => {
              markStepComplete('map-fields');
              goToStep('preview');
            }}
            onBack={() => goToStep('upload-data')}
          />
        )}

        {currentStep === 'preview' && (
          <PreviewStep
            pdfBytes={pdfBytes}
            fields={fields}
            records={records}
            headers={headers}
            onNext={() => {
              markStepComplete('preview');
              goToStep('generate');
            }}
            onBack={() => goToStep('map-fields')}
          />
        )}

        {currentStep === 'generate' && (
          <GenerateStep
            pdfBytes={pdfBytes}
            fields={fields}
            records={records}
            headers={headers}
            pageCount={pageCount}
            onBack={() => goToStep('preview')}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white/80">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-3 px-4 py-6 text-center text-sm text-slate-500 sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p className="flex items-center gap-1.5">
            Made with <Heart className="h-4 w-4 fill-red-400 text-red-400" /> using
            React, pdf-lib and Tailwind CSS
          </p>
          <p>
            100% client-side — your PDF and spreadsheet stay in your browser
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
