'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { SAMPLE_DATASETS } from '@/lib/sampleData';
import { GlassCard } from './GlassCard';
import { Play, FileImage, Sparkles } from 'lucide-react';

export const SampleDataSelector: React.FC = () => {
  const { loadSampleDataset, loadSampleImage, currentDataset, activeImage, isAnalyzing, isAnalyzingImage } = useData();

  const isBusy = isAnalyzing || isAnalyzingImage;

  return (
    <div className="mt-8 max-w-5xl mx-auto">
      <div className="text-center mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          Or try a sample dataset or chart image instantly
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sample Datasets */}
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
              onClick={() => !isBusy && loadSampleDataset(sample.id)}
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

        {/* Vision AI Sample Image Card */}
        <GlassCard
          glow={activeImage ? 'cyan' : 'purple'}
          className={`p-4 cursor-pointer text-left transition-all border-dashed border-2 ${
            activeImage
              ? 'border-cyan-500/50 bg-cyan-500/10'
              : 'border-violet-500/40 hover:border-violet-400 bg-violet-500/5'
          }`}
          onClick={() => !isBusy && loadSampleImage()}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Sample Chart Image
              </h4>
            </div>
            <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400">
              <FileImage className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Test Vision AI with a sample quarterly revenue & OpEx chart screenshot. Extracts data into interactive charts!
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
