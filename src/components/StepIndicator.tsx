import React from 'react';
import type { AppStep } from '../types';
import { FileText, Database, GitMerge, Eye, Download } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: AppStep;
  completedSteps: AppStep[];
}

const steps: { id: AppStep; label: string; icon: React.ReactNode }[] = [
  { id: 'upload-pdf', label: 'Upload PDF', icon: <FileText size={20} /> },
  { id: 'upload-data', label: 'Upload Data', icon: <Database size={20} /> },
  { id: 'map-fields', label: 'Map Fields', icon: <GitMerge size={20} /> },
  { id: 'preview', label: 'Preview', icon: <Eye size={20} /> },
  { id: 'generate', label: 'Generate', icon: <Download size={20} /> },
];

export default function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full py-6 px-4">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = index < currentIndex;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCurrent ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300 scale-110' : ''}
                    ${isCompleted || isPast ? 'bg-green-500 text-white' : ''}
                    ${!isCurrent && !isCompleted && !isPast ? 'bg-gray-200 text-gray-400' : ''}
                  `}
                >
                  {step.icon}
                </div>
                <span
                  className={`text-xs font-medium text-center hidden sm:block ${
                    isCurrent ? 'text-indigo-600' : isCompleted || isPast ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                    index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
