import { useState, type ChangeEvent } from 'react';
import { GripVertical, Plus, Trash2, Type } from 'lucide-react';
import type { TemplateField } from '../types';

interface MapFieldsStepProps {
  headers: string[];
  fields: TemplateField[];
  onFieldsChange: (fields: TemplateField[]) => void;
  pageCount: number;
  pdfWidth: number;
  pdfHeight: number;
  onNext: () => void;
  onBack: () => void;
}

const inputClass =
  'w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300';

export default function MapFieldsStep({
  headers,
  fields,
  onFieldsChange,
  pageCount,
  pdfWidth,
  pdfHeight,
  onNext,
  onBack,
}: MapFieldsStepProps) {
  const [expandedField, setExpandedField] = useState<number | null>(null);

  const addField = (headerName: string) => {
    const newField: TemplateField = {
      name: headerName,
      x: 72,
      y: Math.min(pdfHeight - 24, 100 + fields.length * 30),
      page: 1,
      fontSize: 12,
      color: '#000000',
      fontWeight: 'normal',
    };

    onFieldsChange([...fields, newField]);
    setExpandedField(fields.length);
  };

  const removeField = (index: number) => {
    onFieldsChange(fields.filter((_, fieldIndex) => fieldIndex !== index));
    setExpandedField((current) => {
      if (current === index) return null;
      if (current !== null && current > index) return current - 1;
      return current;
    });
  };

  const updateField = (index: number, updates: Partial<TemplateField>) => {
    onFieldsChange(
      fields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...updates } : field,
      ),
    );
  };

  const unusedHeaders = headers.filter(
    (header) => !fields.some((field) => field.name === header),
  );

  const quickPositions = [
    { label: 'Top Left', x: 72, y: 72 },
    { label: 'Top Centre', x: Math.round(pdfWidth / 2), y: 72 },
    {
      label: 'Centre',
      x: Math.round(pdfWidth / 2),
      y: Math.round(pdfHeight / 2),
    },
    { label: 'Bottom Left', x: 72, y: Math.max(0, Math.round(pdfHeight - 72)) },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          Map Data Fields
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-base text-slate-500 sm:text-lg">
          Position your data fields on the PDF template. Set the X and Y
          coordinates, font size and style.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(250px,340px)_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Type className="h-5 w-5 text-indigo-600" />
            Available Columns
          </h2>

          <div className="mt-4 space-y-2">
            {unusedHeaders.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-4 text-sm italic text-slate-500">
                All columns have been added
              </p>
            ) : (
              unusedHeaders.map((header) => (
                <button
                  key={header}
                  type="button"
                  onClick={() => addField(header)}
                  className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 break-words">{header}</span>
                </button>
              ))
            )}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              PDF Info
            </h3>
            <dl className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between gap-3">
                <dt>Pages</dt>
                <dd className="font-medium text-slate-800">{pageCount}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Size</dt>
                <dd className="text-right font-medium text-slate-800">
                  {Math.round(pdfWidth)} × {Math.round(pdfHeight)} pts
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-slate-400">72 pts = 1 inch</p>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          {fields.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <Type className="mx-auto h-10 w-10 text-slate-300" />
              <h2 className="mt-4 text-xl font-semibold text-slate-700">
                No fields added yet
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Select a column on the left to add it as a merge field.
              </p>
            </div>
          ) : (
            fields.map((field, index) => {
              const isExpanded = expandedField === index;

              return (
                <article
                  key={`${field.name}-${index}`}
                  className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3 px-4 py-4 sm:px-5">
                    <GripVertical className="h-5 w-5 shrink-0 text-slate-300" />
                    <span
                      className="h-4 w-4 shrink-0 rounded-full"
                      style={{ backgroundColor: field.color }}
                      aria-hidden="true"
                    />

                    <button
                      type="button"
                      onClick={() => setExpandedField(isExpanded ? null : index)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block break-words font-semibold text-slate-800">
                        {field.name}
                      </span>
                      <span className="mt-1 block text-xs text-slate-400">
                        Page {field.page} · ({field.x}, {field.y}) ·{' '}
                        {field.fontSize} pt
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="shrink-0 rounded-lg p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${field.name}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <label className="min-w-0 text-sm font-medium text-slate-600">
                          X Position (pts)
                          <input
                            type="number"
                            value={field.x}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              updateField(index, {
                                x: Number(event.target.value),
                              })
                            }
                            min={0}
                            max={pdfWidth}
                            className={`${inputClass} mt-1.5`}
                          />
                        </label>

                        <label className="min-w-0 text-sm font-medium text-slate-600">
                          Y Position (pts)
                          <input
                            type="number"
                            value={field.y}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              updateField(index, {
                                y: Number(event.target.value),
                              })
                            }
                            min={0}
                            max={pdfHeight}
                            className={`${inputClass} mt-1.5`}
                          />
                        </label>

                        <label className="min-w-0 text-sm font-medium text-slate-600">
                          Page
                          <select
                            value={field.page}
                            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                              updateField(index, {
                                page: Number(event.target.value),
                              })
                            }
                            className={`${inputClass} mt-1.5`}
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
                            value={field.fontSize}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              updateField(index, {
                                fontSize: Number(event.target.value),
                              })
                            }
                            min={6}
                            max={72}
                            className={`${inputClass} mt-1.5`}
                          />
                        </label>

                        <div className="min-w-0 text-sm font-medium text-slate-600">
                          <span>Colour</span>
                          <div className="mt-1.5 grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] gap-2">
                            <input
                              type="color"
                              value={field.color}
                              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                updateField(index, {
                                  color: event.target.value,
                                })
                              }
                              className="h-10 w-11 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                              aria-label="Text colour"
                            />
                            <input
                              type="text"
                              value={field.color}
                              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                updateField(index, {
                                  color: event.target.value,
                                })
                              }
                              className={`${inputClass} min-w-0 font-mono`}
                              aria-label="Text colour hexadecimal value"
                            />
                          </div>
                        </div>

                        <label className="min-w-0 text-sm font-medium text-slate-600">
                          Font Weight
                          <select
                            value={field.fontWeight}
                            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                              updateField(index, {
                                fontWeight: event.target.value as
                                  | 'normal'
                                  | 'bold',
                              })
                            }
                            className={`${inputClass} mt-1.5`}
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                          </select>
                        </label>

                        <label className="min-w-0 text-sm font-medium text-slate-600 sm:col-span-2 xl:col-span-1">
                          Max Width (pts, optional)
                          <input
                            type="number"
                            value={field.maxWidth ?? ''}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              updateField(index, {
                                maxWidth: event.target.value
                                  ? Number(event.target.value)
                                  : undefined,
                              })
                            }
                            placeholder="Auto"
                            min={0}
                            className={`${inputClass} mt-1.5`}
                          />
                        </label>
                      </div>

                      <div className="mt-5 border-t border-slate-200 pt-4">
                        <p className="mb-2 text-xs font-medium text-slate-400">
                          Quick Positions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {quickPositions.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() =>
                                updateField(index, {
                                  x: preset.x,
                                  y: preset.y,
                                })
                              }
                              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
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
          Preview →
        </button>
      </div>
    </section>
  );
}
