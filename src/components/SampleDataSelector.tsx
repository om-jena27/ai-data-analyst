'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { SAMPLE_DATASETS } from '@/lib/sampleData';
import { GlassCard } from './GlassCard';
import { Play } from 'lucide-react';

export const SampleDataSelector: React.FC = () => {
  const { loadSampleDataset, currentDataset, isAnalyzing } = useData();

  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          Or try a sample dataset instantly
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SAMPLE_DATASETS.map((sample) => {
          const isSelected = currentDataset?.fileName.toLowerCase().includes(sample.id);

          return (
            <GlassCard
              key={sample.id}
              glow={isSelected ? 'cyan' : 'none'}
              className={`p-4 cursor-pointer text-left transition-all ${
                isSelected
                  ? 'border-cyan-500/50 bg-cyan-500/10'
                  : 'hover:border-slate-400 dark:hover:border-slate-600'
              }`}
              onClick={() => !isAnalyzing && loadSampleDataset(sample.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {sample.name}
                </h4>
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {sample.description}
              </p>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
