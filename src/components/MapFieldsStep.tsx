import { useState } from 'react';
import { Plus, Trash2, GripVertical, Type, Palette } from 'lucide-react';
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
      y: 100 + fields.length * 30,
      page: 1,
      fontSize: 12,
      color: '#000000',
      fontWeight: 'normal',
    };
    onFieldsChange([...fields, newField]);
    setExpandedField(fields.length);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    onFieldsChange(newFields);
    if (expandedField === index) setExpandedField(null);
  };

  const updateField = (index: number, updates: Partial<TemplateField>) => {
    const newFields = fields.map((f, i) => (i === index ? { ...f, ...updates } : f));
    onFieldsChange(newFields);
  };

  const unusedHeaders = headers.filter((h) => !fields.some((f) => f.name === h));

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Map Data Fields</h2>
        <p className="text-gray-500 text-lg">
          Position your data fields on the PDF template. Set the X, Y coordinates, font size, and style.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Fields */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Type size={18} className="text-indigo-600" />
            Available Columns
          </h3>
          <div className="space-y-2">
            {unusedHeaders.length === 0 ? (
              <p className="text-sm text-gray-400 italic">All columns have been added</p>
            ) : (
              unusedHeaders.map((header) => (
                <button
                  key={header}
                  onClick={() => addField(header)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 text-sm font-medium transition-all border border-gray-200 hover:border-indigo-300"
                >
                  <Plus size={16} />
                  {header}
                </button>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t">
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">PDF Info</h4>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Pages: {pageCount}</p>
              <p>Size: {Math.round(pdfWidth)} × {Math.round(pdfHeight)} pts</p>
              <p className="text-xs text-gray-400">(72 pts = 1 inch)</p>
            </div>
          </div>
        </div>

        {/* Field Configuration */}
        <div className="lg:col-span-2 space-y-3">
          {fields.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <Type size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-400">No fields added yet</h3>
              <p className="text-sm text-gray-400 mt-1">
                Click on a column name to add it as a merge field
              </p>
            </div>
          ) : (
            fields.map((field, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all"
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedField(expandedField === index ? null : index)}
                >
                  <GripVertical size={16} className="text-gray-300" />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: field.color }}
                  />
                  <span className="font-semibold text-gray-700 flex-1">{field.name}</span>
                  <span className="text-xs text-gray-400">
                    Page {field.page} · ({field.x}, {field.y}) · {field.fontSize}px
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeField(index);
                    }}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {expandedField === index && (
                  <div className="px-4 py-4 bg-gray-50 border-t border-gray-100 animate-fadeIn">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          X Position (pts)
                        </label>
                        <input
                          type="number"
                          value={field.x}
                          onChange={(e) => updateField(index, { x: Number(e.target.value) })}
                          min={0}
                          max={pdfWidth}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Y Position (pts)
                        </label>
                        <input
                          type="number"
                          value={field.y}
                          onChange={(e) => updateField(index, { y: Number(e.target.value) })}
                          min={0}
                          max={pdfHeight}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Page
                        </label>
                        <select
                          value={field.page}
                          onChange={(e) => updateField(index, { page: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none"
                        >
                          {Array.from({ length: pageCount }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              Page {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Font Size
                        </label>
                        <input
                          type="number"
                          value={field.fontSize}
                          onChange={(e) => updateField(index, { fontSize: Number(e.target.value) })}
                          min={6}
                          max={72}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                          <Palette size={12} /> Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={field.color}
                            onChange={(e) => updateField(index, { color: e.target.value })}
                            className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={field.color}
                            onChange={(e) => updateField(index, { color: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Font Weight
                        </label>
                        <select
                          value={field.fontWeight}
                          onChange={(e) =>
                            updateField(index, {
                              fontWeight: e.target.value as 'normal' | 'bold',
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Max Width (pts, optional)
                        </label>
                        <input
                          type="number"
                          value={field.maxWidth || ''}
                          onChange={(e) =>
                            updateField(index, {
                              maxWidth: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          placeholder="Auto"
                          min={0}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Quick position presets */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-400 mb-2">Quick Positions:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Top Left', x: 72, y: 72 },
                          { label: 'Top Center', x: Math.round(pdfWidth / 2), y: 72 },
                          { label: 'Center', x: Math.round(pdfWidth / 2), y: Math.round(pdfHeight / 2) },
                          { label: 'Bottom Left', x: 72, y: Math.round(pdfHeight - 72) },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => updateField(index, { x: preset.x, y: preset.y })}
                            className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
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
          disabled={fields.length === 0}
          className={`
            px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300
            ${fields.length > 0
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'
              : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          Preview →
        </button>
      </div>
    </div>
  );
}
