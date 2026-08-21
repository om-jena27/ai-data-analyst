'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { UploadCloud, FileSpreadsheet, FileJson, Sparkles, Loader2, FolderOpen } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const FileUploader: React.FC = () => {
  const { uploadFile, isAnalyzing, error, setError } = useData();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processSelectedFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processSelectedFile(file);
      e.target.value = '';
    }
  };

  const processSelectedFile = async (file: File) => {
    setError(null);
    await uploadFile(file);
  };

  return (
    <GlassCard glow="cyan" className="p-8 text-center max-w-2xl mx-auto border-dashed border-2">
      <label
        htmlFor="main-dataset-upload-input"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`block cursor-pointer p-8 rounded-2xl transition-all duration-300 ${
          isDragOver
            ? 'bg-cyan-500/10 border-cyan-400 scale-[1.01]'
            : 'hover:bg-slate-500/5'
        }`}
      >
        {/* Native Hidden Input linked by ID */}
        <input
          id="main-dataset-upload-input"
          type="file"
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls,.json"
          className="sr-only"
        />

        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-violet-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan">
            {isAnalyzing ? (
              <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
            ) : (
              <UploadCloud className="w-10 h-10 text-cyan-400" />
            )}
          </div>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
          {isAnalyzing ? 'Analyzing Heavy Dataset...' : 'Upload Dataset for Instant AI Analysis'}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
          Drag & drop your dataset here, or click anywhere inside to browse your files. Supports <b>CSV</b>, <b>Excel (.xlsx, .xls)</b>, and <b>JSON</b>.
        </p>

        {/* Action Button */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-bold text-xs shadow-glow-cyan transition duration-200">
            <FolderOpen className="w-4 h-4" />
            <span>Select File From Computer</span>
          </span>
        </div>

        {/* Supported Format Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>CSV / Excel</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
            <FileJson className="w-4 h-4 text-violet-400" />
            <span>JSON Data</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Large Datasets (50MB+ Ready)</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}
      </label>
    </GlassCard>
  );
};
