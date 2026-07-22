import { Database, Download, Info, Table } from 'lucide-react';
import FileDropzone from './FileDropzone';
import type { DataRecord } from '../types';
import { generateSampleCSV } from '../utils/csvUtils';

interface UploadDataStepProps {
  dataFile: File | null;
  onDataSelect: (file: File) => void;
  headers: string[];
  records: DataRecord[];
  onNext: () => void;
  onBack: () => void;
}

export default function UploadDataStep({
  dataFile,
  onDataSelect,
  headers,
  records,
  onNext,
  onBack,
}: UploadDataStepProps) {
  const handleDownloadSample = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'sample_data.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          Upload Your Spreadsheet Data
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-base text-slate-500 sm:text-lg">
          Upload a CSV or modern Excel file. The first row supplies the column
          names you will drag onto the PDF.
        </p>
      </div>

      <FileDropzone
        accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onFileSelect={onDataSelect}
        label="Upload CSV or Excel file"
        description="Choose a .csv or .xlsx file containing your merge data"
        selectedFile={dataFile}
        icon={<Database className="h-12 w-12" />}
      />

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-800"
        >
          <Download className="h-4 w-4" />
          Download sample CSV file
        </button>
      </div>

      {headers.length > 0 && records.length > 0 && (
        <div className="mt-7 space-y-4">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="font-semibold">Important: one row can create one PDF.</p>
                <p className="mt-1 leading-6 text-blue-800">
                  This file contains {records.length.toLocaleString()} data rows.
                  The software will not generate all of them automatically. After
                  mapping and previewing, you can create one test PDF or choose a
                  safe row range.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Table className="h-5 w-5 text-indigo-600" />
                Data Preview
              </h2>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1.5">
                  {records.length.toLocaleString()} rows
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5">
                  {headers.length} columns
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-500">
                      #
                    </th>
                    {headers.map((header) => (
                      <th
                        key={header}
                        className="min-w-44 whitespace-nowrap px-4 py-3 font-semibold text-slate-600"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {records.slice(0, 5).map((record, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                        {index + 1}
                      </td>
                      {headers.map((header) => (
                        <td
                          key={header}
                          className="max-w-80 truncate px-4 py-3 text-slate-700"
                          title={record[header] || ''}
                        >
                          {record[header] || (
                            <span className="italic text-slate-300">Empty</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm text-slate-500">
              Showing the first {Math.min(5, records.length)} of{' '}
              {records.length.toLocaleString()} rows
            </div>
          </div>
        </div>
      )}

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
          disabled={records.length === 0}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          Continue to Visual Mapper →
        </button>
      </div>
    </section>
  );
}
