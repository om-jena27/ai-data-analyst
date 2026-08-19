'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { executeDataCleaning } from '@/lib/dataProcessor';
import { DataCleaningOptions } from '@/lib/types';
import { Sparkles, X, Check, ShieldCheck, RotateCcw } from 'lucide-react';

export const DataCleaningModal: React.FC = () => {
  const {
    currentDataset,
    originalDataset,
    isCleaningModalOpen,
    setIsCleaningModalOpen,
    applyDataCleaning,
    resetToOriginal
  } = useData();

  const [options, setOptions] = useState<DataCleaningOptions>({
    removeDuplicates: true,
    imputeMissingValues: true,
    dropHighNullColumns: false,
    trimWhitespace: true,
    removeOutliers: false
  });

  const previewAudit = useMemo(() => {
    if (!currentDataset) return null;
    return executeDataCleaning(currentDataset, options).audit;
  }, [currentDataset, options]);

  if (!isCleaningModalOpen || !currentDataset) return null;

  const isDataModified = Boolean(
    originalDataset && currentDataset.rowCount !== originalDataset.rowCount
  );

  const handleApply = () => {
    applyDataCleaning(options);
    setIsCleaningModalOpen(false);
  };

  const toggle = (key: keyof DataCleaningOptions) =>
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));

  const optionsList: { key: keyof DataCleaningOptions; label: string; desc: string }[] = [
    {
      key: 'removeDuplicates',
      label: 'Remove Duplicate Records',
      desc: 'Detects and eliminates exact identical row entries across all dataset columns.'
    },
    {
      key: 'imputeMissingValues',
      label: 'Impute Missing / Null Values',
      desc: 'Fills missing numeric entries with column mean and text entries with dominant category.'
    },
    {
      key: 'trimWhitespace',
      label: 'Trim Text Whitespace',
      desc: 'Strips leading/trailing spaces and standardizes multi-space text values.'
    },
    {
      key: 'dropHighNullColumns',
      label: 'Drop Columns with >40% Missing Data',
      desc: 'Removes columns where over 40% of records are empty to preserve quality.'
    },
    {
      key: 'removeOutliers',
      label: 'Filter Extreme Outliers (>3σ)',
      desc: 'Filters rows with numeric values exceeding 3 standard deviations from the mean.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Data Cleaning Suite</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Clean:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {currentDataset.fileName}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCleaningModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Select Cleaning Transformations
          </h4>

          {optionsList.map(({ key, label, desc }) => (
            <label
              key={key}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
            >
              <input
                type="checkbox"
                checked={options[key]}
                onChange={() => toggle(key)}
                className="mt-0.5 w-4 h-4 rounded accent-cyan-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">{label}</span>
                <span className="text-slate-500 dark:text-slate-400">{desc}</span>
              </div>
            </label>
          ))}

          {/* Live Audit Preview */}
          {previewAudit && (
            <div className="mt-4 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-cyan-700 dark:text-cyan-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Transformation Audit Preview
                </span>
                <span>
                  Quality: {previewAudit.qualityScoreBefore}/100 → {previewAudit.qualityScoreAfter}/100
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-700 dark:text-slate-300 font-medium">
                <div>
                  Rows:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {previewAudit.cleanedRowCount.toLocaleString()}
                  </strong>
                </div>
                <div>
                  Duplicates:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {previewAudit.duplicatesRemoved}
                  </strong>
                </div>
                <div>
                  Nulls:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {previewAudit.missingValuesImputed}
                  </strong>
                </div>
                <div>
                  Outliers:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {previewAudit.outliersRemoved}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {isDataModified ? (
            <button
              onClick={() => {
                resetToOriginal();
                setIsCleaningModalOpen(false);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Original Raw Dataset
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsCleaningModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold rounded-xl text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Apply Cleaning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

