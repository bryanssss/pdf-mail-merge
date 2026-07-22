import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent,
} from 'react';
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Info,
  Minus,
  Move,
  Plus,
  Search,
  Trash2,
  Type,
  ZoomIn,
} from 'lucide-react';
import type { DataRecord, TemplateField } from '../types';
import PdfPageCanvas from './PdfPageCanvas';

interface MapFieldsStepProps {
  headers: string[];
  records: DataRecord[];
  fields: TemplateField[];
  onFieldsChange: (fields: TemplateField[]) => void;
  pageCount: number;
  pdfWidth: number;
  pdfHeight: number;
  pdfBytes: ArrayBuffer | null;
  onNext: () => void;
  onBack: () => void;
}

interface CanvasSize {
  width: number;
  height: number;
}

interface FieldDragState {
  index: number;
  offsetX: number;
  offsetY: number;
}

const HEADER_DRAG_TYPE = 'application/x-pdf-mail-merge-header';

const inputClass =
  'mt-1.5 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export default function MapFieldsStep({
  headers,
  records,
  fields,
  onFieldsChange,
  pageCount,
  pdfWidth,
  pdfHeight,
  pdfBytes,
  onNext,
  onBack,
}: MapFieldsStepProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const pageFrameRef = useRef<HTMLDivElement | null>(null);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(
    fields.length > 0 ? 0 : null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sampleRecordIndex, setSampleRecordIndex] = useState(0);
  const [columnSearch, setColumnSearch] = useState('');
  const [zoom, setZoom] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(760);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    width: 760,
    height: 760 * (pdfHeight / pdfWidth),
  });
  const [draggingField, setDraggingField] =
    useState<FieldDragState | null>(null);
  const [isHeaderOverPage, setIsHeaderOverPage] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateWidth = () => {
      setViewportWidth(Math.max(320, viewport.clientWidth));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (
      selectedFieldIndex !== null &&
      selectedFieldIndex >= fields.length
    ) {
      setSelectedFieldIndex(fields.length > 0 ? fields.length - 1 : null);
    }
  }, [fields.length, selectedFieldIndex]);

  const targetWidth = Math.max(300, (viewportWidth - 32) * zoom);
  const sampleRecord = records[sampleRecordIndex] ?? records[0] ?? {};
  const selectedField =
    selectedFieldIndex === null ? null : fields[selectedFieldIndex] ?? null;

  const updateField = useCallback(
    (index: number, updates: Partial<TemplateField>) => {
      onFieldsChange(
        fields.map((field, fieldIndex) =>
          fieldIndex === index ? { ...field, ...updates } : field,
        ),
      );
    },
    [fields, onFieldsChange],
  );

  const addField = useCallback(
    (
      headerName: string,
      position?: { x: number; y: number; page: number },
    ) => {
      const existingIndex = fields.findIndex(
        (field) => field.name === headerName,
      );

      if (existingIndex >= 0) {
        if (position) {
          updateField(existingIndex, position);
        }
        setSelectedFieldIndex(existingIndex);
        setCurrentPage(position?.page ?? fields[existingIndex].page);
        return;
      }

      const newField: TemplateField = {
        name: headerName,
        x: position?.x ?? 72,
        y:
          position?.y ??
          clamp(100 + fields.length * 30, 0, Math.max(0, pdfHeight - 24)),
        page: position?.page ?? currentPage,
        fontSize: 12,
        color: '#000000',
        fontWeight: 'normal',
      };

      onFieldsChange([...fields, newField]);
      setSelectedFieldIndex(fields.length);
      setCurrentPage(newField.page);
    },
    [currentPage, fields, onFieldsChange, pdfHeight, updateField],
  );

  const removeField = (index: number) => {
    onFieldsChange(fields.filter((_, fieldIndex) => fieldIndex !== index));
    setSelectedFieldIndex((current) => {
      if (current === null) return null;
      if (current === index) return fields.length > 1 ? 0 : null;
      return current > index ? current - 1 : current;
    });
  };

  const getPdfPosition = useCallback(
    (clientX: number, clientY: number) => {
      const frame = pageFrameRef.current;
      if (!frame) return null;

      const rect = frame.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;

      return {
        x: clamp(((clientX - rect.left) / rect.width) * pdfWidth, 0, pdfWidth),
        y: clamp(
          ((clientY - rect.top) / rect.height) * pdfHeight,
          0,
          pdfHeight,
        ),
      };
    },
    [pdfHeight, pdfWidth],
  );

  useEffect(() => {
    if (!draggingField) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const position = getPdfPosition(event.clientX, event.clientY);
      if (!position) return;

      updateField(draggingField.index, {
        x: Math.round(
          clamp(position.x - draggingField.offsetX, 0, pdfWidth),
        ),
        y: Math.round(
          clamp(position.y - draggingField.offsetY, 0, pdfHeight),
        ),
        page: currentPage,
      });
    };

    const stopDragging = () => setDraggingField(null);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDragging, { once: true });
    window.addEventListener('pointercancel', stopDragging, { once: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, [
    currentPage,
    draggingField,
    getPdfPosition,
    pdfHeight,
    pdfWidth,
    updateField,
  ]);

  const startMovingField = (
    event: PointerEvent<HTMLButtonElement>,
    index: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const position = getPdfPosition(event.clientX, event.clientY);
    const field = fields[index];
    if (!position || !field) return;

    setSelectedFieldIndex(index);
    setDraggingField({
      index,
      offsetX: position.x - field.x,
      offsetY: position.y - field.y,
    });
  };

  const handlePagePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (selectedFieldIndex === null) return;
    const position = getPdfPosition(event.clientX, event.clientY);
    if (!position) return;

    updateField(selectedFieldIndex, {
      x: Math.round(position.x),
      y: Math.round(position.y),
      page: currentPage,
    });
  };

  const handleHeaderDragStart = (
    event: DragEvent<HTMLButtonElement>,
    header: string,
  ) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData(HEADER_DRAG_TYPE, header);
    event.dataTransfer.setData('text/plain', header);
  };

  const handlePageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsHeaderOverPage(false);
    const header =
      event.dataTransfer.getData(HEADER_DRAG_TYPE) ||
      event.dataTransfer.getData('text/plain');
    if (!header || !headers.includes(header)) return;

    const position = getPdfPosition(event.clientX, event.clientY);
    if (!position) return;

    addField(header, {
      x: Math.round(position.x),
      y: Math.round(position.y),
      page: currentPage,
    });
  };

  const handleFieldKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const field = fields[index];
    if (!field) return;
    const distance = event.shiftKey ? 5 : 1;
    let x = field.x;
    let y = field.y;

    if (event.key === 'ArrowLeft') x -= distance;
    else if (event.key === 'ArrowRight') x += distance;
    else if (event.key === 'ArrowUp') y -= distance;
    else if (event.key === 'ArrowDown') y += distance;
    else return;

    event.preventDefault();
    updateField(index, {
      x: Math.round(clamp(x, 0, pdfWidth)),
      y: Math.round(clamp(y, 0, pdfHeight)),
    });
  };

  const unusedHeaders = useMemo(
    () =>
      headers.filter(
        (header) =>
          !fields.some((field) => field.name === header) &&
          header.toLowerCase().includes(columnSearch.trim().toLowerCase()),
      ),
    [columnSearch, fields, headers],
  );

  const fieldsOnCurrentPage = fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => field.page === currentPage);

  const quickPositions = [
    { label: 'Top Left', x: 36, y: 36 },
    { label: 'Top Centre', x: Math.round(pdfWidth / 2), y: 36 },
    {
      label: 'Centre',
      x: Math.round(pdfWidth / 2),
      y: Math.round(pdfHeight / 2),
    },
    {
      label: 'Bottom Left',
      x: 36,
      y: Math.max(0, Math.round(pdfHeight - 54)),
    },
  ];

  const handleCanvasSizeChange = useCallback((width: number, height: number) => {
    setCanvasSize({ width, height });
  }, []);

  const setPage = (page: number) => {
    setCurrentPage(clamp(page, 1, pageCount));
  };

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          Place Your Data on the PDF
        </h1>
        <p className="mx-auto mt-3 max-w-4xl text-base text-slate-500 sm:text-lg">
          Drag a spreadsheet column onto the real PDF page, or click a column to
          add it and then move it visually. The precise position controls remain
          available below.
        </p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          <span className="font-semibold">1. Choose a column</span>
          <p className="mt-1 text-indigo-700">Drag it or click the + button.</p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          <span className="font-semibold">2. Place it on the PDF</span>
          <p className="mt-1 text-indigo-700">Move it exactly where it belongs.</p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          <span className="font-semibold">3. Preview the real value</span>
          <p className="mt-1 text-indigo-700">Use a sample spreadsheet row.</p>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Type className="h-5 w-5 text-indigo-600" />
              Data Columns
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {fields.length}/{headers.length} mapped
            </span>
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={columnSearch}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setColumnSearch(event.target.value)
              }
              placeholder="Find a column"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="mt-3 max-h-[44vh] space-y-2 overflow-y-auto pr-1">
            {unusedHeaders.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                {fields.length === headers.length
                  ? 'All columns have been mapped.'
                  : 'No columns match your search.'}
              </p>
            ) : (
              unusedHeaders.map((header) => (
                <button
                  key={header}
                  type="button"
                  draggable
                  onDragStart={(event: DragEvent<HTMLButtonElement>) =>
                    handleHeaderDragStart(event, header)
                  }
                  onClick={() => addField(header)}
                  className="group flex w-full min-w-0 cursor-grab items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:cursor-grabbing"
                  title="Drag onto the PDF, or click to add"
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-indigo-400" />
                  <span className="min-w-0 flex-1 break-words">{header}</span>
                  <Plus className="h-4 w-4 shrink-0" />
                </button>
              ))
            )}
          </div>

          {fields.length > 0 && (
            <div className="mt-5 border-t border-slate-200 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Mapped fields
              </h3>
              <div className="mt-2 max-h-52 space-y-1 overflow-y-auto">
                {fields.map((field, index) => (
                  <button
                    key={`${field.name}-${index}`}
                    type="button"
                    onClick={() => {
                      setSelectedFieldIndex(index);
                      setCurrentPage(field.page);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedFieldIndex === index
                        ? 'bg-indigo-100 font-semibold text-indigo-800'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: field.color }}
                    />
                    <span className="min-w-0 flex-1 truncate">{field.name}</span>
                    <span className="text-xs text-slate-400">P{field.page}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            <div className="flex gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Only mapped columns are inserted into the PDF. Unmapped columns
                stay in the spreadsheet but do not appear in the output.
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Previous PDF page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <select
                  value={currentPage}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    setPage(Number(event.target.value))
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                >
                  {Array.from({ length: pageCount }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      Page {index + 1} of {pageCount}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= pageCount}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Next PDF page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {records.length > 0 && (
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    Sample row
                    <input
                      type="number"
                      value={sampleRecordIndex + 1}
                      min={1}
                      max={records.length}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setSampleRecordIndex(
                          clamp(Number(event.target.value) - 1, 0, records.length - 1),
                        )
                      }
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    />
                    <span className="text-xs text-slate-400">of {records.length}</span>
                  </label>
                )}

                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setZoom((value) => Math.max(0.65, value - 0.15))}
                    className="rounded-md p-1.5 text-slate-600 hover:bg-white"
                    aria-label="Zoom out"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-14 text-center text-xs font-semibold text-slate-600">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((value) => Math.min(1.8, value + 0.15))}
                    className="rounded-md p-1.5 text-slate-600 hover:bg-white"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={viewportRef}
              className="max-h-[76vh] min-h-[520px] overflow-auto bg-slate-200/70 p-4"
            >
              <div
                ref={pageFrameRef}
                className={`relative mx-auto overflow-hidden bg-white shadow-xl ring-1 transition ${
                  isHeaderOverPage
                    ? 'ring-4 ring-indigo-400'
                    : 'ring-slate-300'
                }`}
                style={{
                  width: `${canvasSize.width}px`,
                  height: `${canvasSize.height}px`,
                }}
                onDragOver={(event: DragEvent<HTMLDivElement>) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'copy';
                  setIsHeaderOverPage(true);
                }}
                onDragLeave={() => setIsHeaderOverPage(false)}
                onDrop={handlePageDrop}
                onPointerDown={handlePagePointerDown}
              >
                <PdfPageCanvas
                  pdfBytes={pdfBytes}
                  pageNumber={currentPage}
                  targetWidth={targetWidth}
                  fallbackWidth={pdfWidth}
                  fallbackHeight={pdfHeight}
                  onSizeChange={handleCanvasSizeChange}
                />

                <div className="absolute inset-0">
                  {fieldsOnCurrentPage.map(({ field, index }) => {
                    const value = String(sampleRecord[field.name] ?? '').trim();
                    const displayText = value || `[${field.name}]`;
                    const scaleX = canvasSize.width / pdfWidth;
                    const scaleY = canvasSize.height / pdfHeight;
                    const isSelected = selectedFieldIndex === index;

                    return (
                      <button
                        key={`${field.name}-${index}`}
                        type="button"
                        onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
                          startMovingField(event, index)
                        }
                        onKeyDown={(event: ReactKeyboardEvent<HTMLButtonElement>) =>
                          handleFieldKeyDown(event, index)
                        }
                        onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
                          event.stopPropagation();
                          setSelectedFieldIndex(index);
                        }}
                        className={`absolute cursor-move select-none rounded px-1 text-left leading-tight outline-none transition focus:ring-2 focus:ring-indigo-500 ${
                          isSelected
                            ? 'border-2 border-indigo-500 bg-indigo-100/70 shadow-md'
                            : 'border border-dashed border-indigo-400 bg-white/55 hover:bg-indigo-50/80'
                        }`}
                        style={{
                          left: `${field.x * scaleX}px`,
                          top: `${field.y * scaleY}px`,
                          maxWidth: field.maxWidth
                            ? `${field.maxWidth * scaleX}px`
                            : `${Math.max(120, canvasSize.width - field.x * scaleX - 8)}px`,
                          color: field.color,
                          fontSize: `${Math.max(9, field.fontSize * scaleY)}px`,
                          fontWeight: field.fontWeight === 'bold' ? 700 : 400,
                        }}
                        title="Drag to move. Use arrow keys for precise adjustment."
                      >
                        {displayText}
                      </button>
                    );
                  })}
                </div>

                {isHeaderOverPage && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-indigo-500/10">
                    <div className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-xl">
                      Drop the column here
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
              Drag fields to move them. Select a field and click anywhere on the
              page to reposition it. Arrow keys move it by 1 pt; Shift + arrow
              moves it by 5 pts.
            </div>
          </div>

          {selectedField && selectedFieldIndex !== null ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                    <Move className="h-5 w-5 text-indigo-600" />
                    {selectedField.name}
                  </h2>
                  <p className="mt-1 break-words text-sm text-slate-500">
                    Sample value:{' '}
                    <span className="font-medium text-slate-700">
                      {String(sampleRecord[selectedField.name] ?? '') || '(empty)'}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeField(selectedFieldIndex)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove field
                </button>
              </div>

              <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <label className="min-w-0 text-sm font-medium text-slate-600">
                  X Position (pts)
                  <input
                    type="number"
                    value={selectedField.x}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      updateField(selectedFieldIndex, {
                        x: clamp(Number(event.target.value), 0, pdfWidth),
                      })
                    }
                    min={0}
                    max={pdfWidth}
                    className={inputClass}
                  />
                </label>

                <label className="min-w-0 text-sm font-medium text-slate-600">
                  Y Position (pts)
                  <input
                    type="number"
                    value={selectedField.y}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      updateField(selectedFieldIndex, {
                        y: clamp(Number(event.target.value), 0, pdfHeight),
                      })
                    }
                    min={0}
                    max={pdfHeight}
                    className={inputClass}
                  />
                </label>

                <label className="min-w-0 text-sm font-medium text-slate-600">
                  PDF Page
                  <select
                    value={selectedField.page}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                      const page = Number(event.target.value);
                      updateField(selectedFieldIndex, { page });
                      setCurrentPage(page);
                    }}
                    className={inputClass}
                  >
                    {Array.from({ length: pageCount }, (_, pageIndex) => (
                      <option key={pageIndex + 1} value={pageIndex + 1}>
                        Page {pageIndex + 1}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="min-w-0 text-sm font-medium text-slate-600">
                  Font Size
                  <input
                    type="number"
                    value={selectedField.fontSize}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      updateField(selectedFieldIndex, {
                        fontSize: clamp(Number(event.target.value), 6, 72),
                      })
                    }
                    min={6}
                    max={72}
                    className={inputClass}
                  />
                </label>

                <div className="min-w-0 text-sm font-medium text-slate-600">
                  <span>Colour</span>
                  <div className="mt-1.5 grid grid-cols-[2.75rem_minmax(0,1fr)] gap-2">
                    <input
                      type="color"
                      value={selectedField.color}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        updateField(selectedFieldIndex, {
                          color: event.target.value,
                        })
                      }
                      className="h-10 w-11 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                      aria-label="Text colour"
                    />
                    <input
                      type="text"
                      value={selectedField.color}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        updateField(selectedFieldIndex, {
                          color: event.target.value,
                        })
                      }
                      className={`${inputClass} mt-0 font-mono`}
                      aria-label="Text colour hexadecimal value"
                    />
                  </div>
                </div>

                <label className="min-w-0 text-sm font-medium text-slate-600">
                  Font Weight
                  <select
                    value={selectedField.fontWeight}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      updateField(selectedFieldIndex, {
                        fontWeight: event.target.value as 'normal' | 'bold',
                      })
                    }
                    className={inputClass}
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </label>

                <label className="min-w-0 text-sm font-medium text-slate-600">
                  Max Width (pts, optional)
                  <input
                    type="number"
                    value={selectedField.maxWidth ?? ''}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      updateField(selectedFieldIndex, {
                        maxWidth: event.target.value
                          ? Math.max(0, Number(event.target.value))
                          : undefined,
                      })
                    }
                    placeholder="Auto"
                    min={0}
                    className={inputClass}
                  />
                </label>

                <div className="min-w-0 text-sm font-medium text-slate-600">
                  Quick Position
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {quickPositions.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          updateField(selectedFieldIndex, {
                            x: preset.x,
                            y: preset.y,
                            page: currentPage,
                          })
                        }
                        className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Add a column from the left to begin mapping your data.
            </div>
          )}
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={fields.length === 0}
          className={`rounded-xl px-6 py-3 font-semibold text-white transition ${
            fields.length > 0
              ? 'bg-indigo-600 shadow-lg shadow-indigo-200 hover:bg-indigo-700'
              : 'cursor-not-allowed bg-slate-300'
          }`}
        >
          Preview {fields.length} Mapped Field{fields.length === 1 ? '' : 's'} →
        </button>
      </div>
    </section>
  );
}
