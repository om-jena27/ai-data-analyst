'use client';

import React, { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { GlassCard } from './GlassCard';
import { computeCorrelationMatrix } from '@/lib/dataProcessor';
import { CorrelationCell, CorrelationMatrix } from '@/lib/types';
import { Activity, Info } from 'lucide-react';

export const CorrelationHeatmap: React.FC = () => {
  const { filteredDataset, currentDataset } = useData();
  const ds = filteredDataset || currentDataset;

  const matrix = useMemo<CorrelationMatrix>(() => {
    if (!ds) return { columns: [], cells: [] };
    return computeCorrelationMatrix(ds.columns, ds.data);
  }, [ds]);

  if (!ds || matrix.columns.length < 2) return null;

  const { columns, cells } = matrix;

  const getCell = (colA: string, colB: string) => {
    return cells.find((c: CorrelationCell) => (c.colA === colA && c.colB === colB) || (c.colA === colB && c.colB === colA));
  };

  const getCellBg = (val: number) => {
    if (val === 1.0) return 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold';
    if (val >= 0.7) return 'bg-cyan-500 text-slate-950 font-bold shadow-sm';
    if (val >= 0.3) return 'bg-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-semibold';
    if (val > 0) return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400';
    if (val <= -0.7) return 'bg-rose-500 text-white font-bold shadow-sm';
    if (val <= -0.3) return 'bg-rose-500/30 text-rose-700 dark:text-rose-300 font-semibold';
    return 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400';
  };

  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Pearson Correlation Matrix</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Pairwise statistical correlation coefficients (-1.0 to +1.0) across numeric columns
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500 inline-block" /> Strong Positive (+1.0)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Strong Inverse (-1.0)
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-950/40">
        <table className="w-full text-center border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left text-slate-400 font-mono text-[11px] min-w-[120px]">Metrics</th>
              {columns.map(col => (
                <th key={col} className="p-2 font-bold text-slate-700 dark:text-slate-300 min-w-[90px] truncate max-w-[110px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns.map(rowCol => (
              <tr key={rowCol}>
                <td className="p-2 font-bold text-left text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {rowCol}
                </td>
                {columns.map(colCol => {
                  const cell = getCell(rowCol, colCol);
                  const val = cell ? cell.coefficient : 0;
                  return (
                    <td key={colCol} className="p-1.5">
                      <div
                        title={`${rowCol} vs ${colCol}: ${val > 0 ? '+' : ''}${val}`}
                        className={`py-2 px-1 rounded-xl text-center text-xs transition duration-150 ${getCellBg(val)}`}
                      >
                        {val > 0 && val !== 1.0 ? `+${val}` : val}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};

