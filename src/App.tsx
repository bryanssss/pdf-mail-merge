import { useState, useCallback } from 'react';
import { Coffee, FileText, Heart } from 'lucide-react';
import type { AppStep, TemplateField, DataRecord } from './types';
import { parseCSV } from './utils/csvUtils';
import { getPDFPageDimensions } from './utils/pdfUtils';
import StepIndicator from './components/StepIndicator';
import UploadPDFStep from './components/UploadPDFStep';
import UploadDataStep from './components/UploadDataStep';
import MapFieldsStep from './components/MapFieldsStep';
import PreviewStep from './components/PreviewStep';
import GenerateStep from './components/GenerateStep';

const DONATION_URL = 'https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38';

function App() {
  const githubUrl = window.location.hostname.endsWith('.github.io')
    ? `https://github.com/${window.location.hostname.split('.')[0]}/pdf-mail-merge`
    : 'https://github.com';

  // Step management
  const [currentStep, setCurrentStep] = useState<AppStep>('upload-pdf');
  const [completedSteps, setCompletedSteps] = useState<AppStep[]>([]);

  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pdfWidth, setPdfWidth] = useState(612); // default letter size
  const [pdfHeight, setPdfHeight] = useState(792);
  const [pageCount, setPageCount] = useState(1);

  // Data state
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [records, setRecords] = useState<DataRecord[]>([]);

  // Field mapping state
  const [fields, setFields] = useState<TemplateField[]>([]);

  const markStepComplete = (step: AppStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }
  };

  const handlePdfSelect = useCallback(async (file: File) => {
    setPdfFile(file);
    const bytes = await file.arrayBuffer();
    setPdfBytes(bytes);

    try {
      const dims = await getPDFPageDimensions(bytes);
      setPdfWidth(dims.width);
      setPdfHeight(dims.height);
      setPageCount(dims.pageCount);
    } catch (err) {
      console.error('Failed to read PDF dimensions:', err);
    }
  }, []);

  const handleDataSelect = useCallback(async (file: File) => {
    setDataFile(file);
    try {
      const { headers: h, records: r } = await parseCSV(file);
      setHeaders(h);
      setRecords(r);
    } catch (err) {
      console.error('Failed to parse CSV:', err);
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

  const goToStep = (step: AppStep) => {
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">PDF Mail Merge</h1>
              <p className="text-xs text-gray-500">Generate personalized PDFs at scale</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-sm transition-colors text-sm font-semibold"
              aria-label="Support PDF Mail Merge with a PayPal donation"
            >
              <Coffee size={18} />
              <span className="hidden sm:inline">Support this free tool</span>
              <span className="sm:hidden">Donate</span>
            </a>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors text-sm font-medium"
              aria-label="View PDF Mail Merge on GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
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
            fields={fields}
            onFieldsChange={setFields}
            pageCount={pageCount}
            pdfWidth={pdfWidth}
            pdfHeight={pdfHeight}
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
            onBack={() => goToStep('preview')}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Made with</span>
              <Heart size={14} className="text-red-500 fill-red-500" />
              <span>using React, pdf-lib & Tailwind CSS</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm text-gray-500">
              <span>✨ 100% client-side — your data never leaves your browser</span>
              <a
                href={DONATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Keep it free with a donation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
