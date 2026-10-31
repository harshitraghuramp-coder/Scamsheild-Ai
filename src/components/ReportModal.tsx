import React from 'react';
import { AnalysisResult } from '../types';
import { AnalysisReportCard } from './AnalysisReportCard';
import { X } from 'lucide-react';

interface ReportModalProps {
  result: AnalysisResult | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-cyan-500/30 bg-[#070B14] p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer z-10"
          title="Close Report Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <AnalysisReportCard result={result} showReset={false} />
      </div>
    </div>
  );
};
