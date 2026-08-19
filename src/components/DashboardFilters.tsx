'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { SlidersHorizontal, Search, RotateCcw } from 'lucide-react';

export const DashboardFilters: React.FC = () => {
  const { currentDataset, filteredDataset, filters, setFilters, clearFilters } = useData();

  if (!currentDataset) return null;

  const catCols = currentDataset.columns.filter(
    c => (c.type === 'categorical' || c.type === 'text') && !c.isIdColumn
  );

  const selectedCatCol = filters.categoryFilter || (catCols[0]?.name || '');
  const targetColInfo = catCols.find(c => c.name === selectedCatCol);
  const categories = targetColInfo?.topCategories || [];

  const isFiltered = Boolean(filters.categoryValue || filters.searchTerm);
  const totalRows = currentDataset.rowCount;
  const filteredRows = filteredDataset?.rowCount || totalRows;

  return (
    <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
          <SlidersHorizontal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Interactive Global Dashboard Slicers</span>
          {isFiltered && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-semibold border border-cyan-500/20">
              Showing {filteredRows.toLocaleString()} of {totalRows.toLocaleString()} rows
            </span>
          )}
        </div>

        {isFiltered && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline self-start sm:self-auto"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Slicers
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {catCols.length > 0 && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
              Slicer Field
            </label>
            <select
              value={selectedCatCol}
              onChange={e => setFilters({ categoryFilter: e.target.value, categoryValue: '' })}
              className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
            >
              {catCols.map(col => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.uniqueCount} unique)
                </option>
              ))}
            </select>
          </div>
        )}

        {targetColInfo && categories.length > 0 && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
              Filter Value
            </label>
            <select
              value={filters.categoryValue || ''}
              onChange={e => setFilters({ categoryFilter: selectedCatCol, categoryValue: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500"
            >
              <option value="">All {selectedCatCol} Values</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.value} ({cat.count.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
            Keyword Search
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.searchTerm || ''}
              onChange={e => setFilters({ searchTerm: e.target.value })}
              placeholder="Search across all fields..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-cyan-500 placeholder-slate-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
