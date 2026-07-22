import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const PDFJS_URL =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.1.200/build/pdf.mjs';
const PDFJS_WORKER_URL =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.1.200/build/pdf.worker.mjs';

interface PdfViewport {
  width: number;
  height: number;
}

interface PdfRenderTask {
  promise: Promise<void>;
  cancel: () => void;
}

interface PdfPageProxy {
  getViewport: (options: { scale: number }) => PdfViewport;
  render: (options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewport;
  }) => PdfRenderTask;
}

interface PdfDocumentProxy {
  getPage: (pageNumber: number) => Promise<PdfPageProxy>;
  destroy?: () => Promise<void>;
}

interface PdfLoadingTask {
  promise: Promise<PdfDocumentProxy>;
  destroy?: () => Promise<void>;
}

interface PdfJsModule {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { data: Uint8Array }) => PdfLoadingTask;
}

let pdfJsModulePromise: Promise<PdfJsModule> | null = null;

async function loadPdfJs(): Promise<PdfJsModule> {
  if (!pdfJsModulePromise) {
    pdfJsModulePromise = import(/* @vite-ignore */ PDFJS_URL).then((module) => {
      const pdfJs = module as unknown as PdfJsModule;
      pdfJs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      return pdfJs;
    });
  }

  return pdfJsModulePromise;
}

interface PdfPageCanvasProps {
  pdfBytes: ArrayBuffer | null;
  pageNumber: number;
  targetWidth: number;
  fallbackWidth: number;
  fallbackHeight: number;
  onSizeChange: (width: number, height: number) => void;
}

export default function PdfPageCanvas({
  pdfBytes,
  pageNumber,
  targetWidth,
  fallbackWidth,
  fallbackHeight,
  onSizeChange,
}: PdfPageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfBytes || !canvasRef.current) {
      setIsLoading(false);
      setError('The PDF preview is not available.');
      return;
    }

    let cancelled = false;
    let renderTask: PdfRenderTask | null = null;
    let loadingTask: PdfLoadingTask | null = null;
    let documentProxy: PdfDocumentProxy | null = null;

    const renderPage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const pdfJs = await loadPdfJs();
        if (cancelled) return;

        loadingTask = pdfJs.getDocument({
          data: new Uint8Array(pdfBytes.slice(0)),
        });
        documentProxy = await loadingTask.promise;
        if (cancelled) return;

        const page = await documentProxy.getPage(pageNumber);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const safeTargetWidth = Math.max(260, targetWidth);
        const cssScale = safeTargetWidth / baseViewport.width;
        const cssViewport = page.getViewport({ scale: cssScale });
        const pixelRatio = Math.max(
          1,
          Math.min(2.5, window.devicePixelRatio || 1),
        );
        const renderViewport = page.getViewport({
          scale: cssScale * pixelRatio,
        });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) {
          throw new Error('Your browser could not create the PDF canvas.');
        }

        canvas.width = Math.max(1, Math.round(renderViewport.width));
        canvas.height = Math.max(1, Math.round(renderViewport.height));
        canvas.style.width = `${cssViewport.width}px`;
        canvas.style.height = `${cssViewport.height}px`;

        onSizeChange(cssViewport.width, cssViewport.height);

        renderTask = page.render({
          canvasContext: context,
          viewport: renderViewport,
        });
        await renderTask.promise;

        if (!cancelled) {
          setIsLoading(false);
        }
      } catch (caughtError) {
        if (cancelled) return;

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : 'The visual PDF preview could not be loaded.';
        setError(message);
        setIsLoading(false);

        const safeFallbackWidth = Math.max(260, targetWidth || fallbackWidth);
        const safeFallbackHeight =
          safeFallbackWidth * (fallbackHeight / fallbackWidth);
        onSizeChange(safeFallbackWidth, safeFallbackHeight);
      }
    };

    void renderPage();

    return () => {
      cancelled = true;
      try {
        renderTask?.cancel();
      } catch {
        // The render task may already be complete.
      }
      void documentProxy?.destroy?.();
      void loadingTask?.destroy?.();
    };
  }, [
    fallbackHeight,
    fallbackWidth,
    onSizeChange,
    pageNumber,
    pdfBytes,
    targetWidth,
  ]);

  return (
    <div className="relative overflow-hidden bg-white">
      <canvas ref={canvasRef} className="block bg-white" />

      {isLoading && (
        <div className="absolute inset-0 flex min-h-72 items-center justify-center bg-white/90">
          <div className="text-center text-sm text-slate-500">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-indigo-600" />
            <p className="mt-3 font-medium">Loading PDF page…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex min-h-72 items-center justify-center bg-white px-6 text-center">
          <div className="max-w-md text-sm text-slate-600">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
            <p className="mt-3 font-semibold text-slate-800">
              Visual PDF background unavailable
            </p>
            <p className="mt-1">
              You can still place and move fields on the page. Check your internet
              connection, then reopen this step to load the PDF background.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
