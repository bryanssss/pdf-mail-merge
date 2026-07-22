import { Database, Download, Table } from 'lucide-react';
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
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Upload Your Data</h2>
        <p className="text-gray-500 text-lg">
          Upload a CSV or Excel file containing the data you want to merge into your PDF.
        </p>
      </div>

      <FileDropzone
        accept=".csv,.xlsx,.xls"
        onFileSelect={onDataSelect}
        label="Upload Data File"
        description="CSV files supported — drag & drop or click to browse"
        selectedFile={dataFile}
        icon={<Database size={48} />}
      />

      <div className="mt-4 flex justify-center">
        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
        >
          <Download size={16} />
          Download sample CSV file
        </button>
      </div>

      {headers.length > 0 && records.length > 0 && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gray-50 border-b flex items-center gap-2">
            <Table size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-700">
              Data Preview ({records.length} records, {headers.length} columns)
            </h3>
          </div>
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 sticky top-0">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.slice(0, 5).map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-gray-400 font-mono text-xs">{idx + 1}</td>
                    {headers.map((header) => (
                      <td key={header} className="px-4 py-2 text-gray-700 whitespace-nowrap">
                        {record[header] || <span className="text-gray-300 italic">empty</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {records.length > 5 && (
            <div className="px-5 py-2 bg-gray-50 border-t text-xs text-gray-400 text-center">
              Showing 5 of {records.length} records
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={records.length === 0}
          className={`
            px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300
            ${records.length > 0
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'
              : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
