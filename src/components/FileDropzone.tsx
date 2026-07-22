import React, { useCallback, useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  accept: string;
  onFileSelect: (file: File) => void;
  label: string;
  description: string;
  selectedFile: File | null;
  icon?: React.ReactNode;
}

export default function FileDropzone({
  accept,
  onFileSelect,
  label,
  description,
  selectedFile,
  icon,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateAndSelect = useCallback(
    (file: File) => {
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!acceptedTypes.some((t) => fileExt === t || file.type === t)) {
        setError(`Invalid file type. Please upload: ${accept}`);
        return;
      }
      
      setError(null);
      onFileSelect(file);
    },
    [accept, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        validateAndSelect(files[0]);
      }
    },
    [validateAndSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        validateAndSelect(files[0]);
      }
    },
    [validateAndSelect]
  );

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
        ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : ''}
        ${selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
        ${error ? 'border-red-400 bg-red-50' : ''}
      `}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById(`file-input-${label}`)?.click()}
    >
      <input
        id={`file-input-${label}`}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4">
        {selectedFile ? (
          <>
            <CheckCircle size={48} className="text-green-500" />
            <div>
              <p className="text-lg font-semibold text-green-700">{selectedFile.name}</p>
              <p className="text-sm text-green-600 mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </>
        ) : error ? (
          <>
            <AlertCircle size={48} className="text-red-500" />
            <div>
              <p className="text-lg font-semibold text-red-700">{error}</p>
              <p className="text-sm text-red-500 mt-1">Click or drag to try again</p>
            </div>
          </>
        ) : (
          <>
            <div className="text-indigo-400">
              {icon || <Upload size={48} />}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">{label}</p>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
            <p className="text-xs text-gray-400">Click or drag & drop</p>
          </>
        )}
      </div>
    </div>
  );
}
