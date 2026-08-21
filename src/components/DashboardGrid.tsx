'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useData } from '@/context/DataContext';
import { DynamicChartData } from '@/lib/types';
import { BarChart3, Filter, X, MousePointerClick } from 'lucide-react';

const DynamicChart = dynamic(
  () => import('./DynamicChart').then((mod) => mod.DynamicChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] rounded-2xl bg-slate-900/40 animate-pulse border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-semibold">
        Loading Visualization...
      </div>
    ),
  }
);

export const DashboardGrid: React.FC = () => {
  const { currentDataset, filteredDataset, filters, setFilters, clearFilters } = useData();
  const ds = filteredDataset || currentDataset;

  const handlePointClick = (columnName: string, clickedValue: string) => {
    if (
      filters.categoryFilter === columnName &&
      filters.categoryValue?.toLowerCase() === clickedValue.toLowerCase()
    ) {
      clearFilters();
    } else {
      setFilters({
        categoryFilter: columnName,
        categoryValue: clickedValue
      });
    }
  };

  const charts = useMemo(() => {
    if (!ds) return [];

    const { columns, data } = ds;

    // Filter non-ID columns for meaningful metric calculations
    const nonIdNumericCols = columns.filter(c => c.type === 'numeric' && !c.isIdColumn);
    const allNumericCols = columns.filter(c => c.type === 'numeric');
    const numericCols = nonIdNumericCols.length > 0 ? nonIdNumericCols : allNumericCols;

    const catCols = columns.filter(c => (c.type === 'categorical' || c.type === 'text') && !c.isIdColumn);
    const dateCol = columns.find(c => c.type === 'datetime');
    const labelCol = catCols[0] || columns.find(c => c.type === 'text') || columns[0];

    const generatedCharts: DynamicChartData[] = [];

    // Chart 1: Bar Chart - Primary Metric by Primary Category
    if (catCols.length > 0 && numericCols.length > 0) {
      const catCol = catCols[0];
      const numCol = numericCols[0];

      const grouped: Record<string, number> = {};
      data.forEach(row => {
        const k = String(row[catCol.name] || 'Unknown');
        const v = Number(row[numCol.name]) || 0;
        grouped[k] = (grouped[k] || 0) + v;
      });

      const chartData = Object.entries(grouped)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({
          [catCol.name]: name,
          [numCol.name]: Math.round(value)
        }));

      generatedCharts.push({
        type: 'bar',
        title: `Total ${numCol.name} by ${catCol.name}`,
        description: `Sum of ${numCol.name} grouped by top ${catCol.name} categories.`,
        xAxisKey: catCol.name,
        yAxisKey: numCol.name,
        data: chartData
      });
    } else if (catCols.length > 0) {
      // Fallback: Category Frequency Count
      const catCol = catCols[0];
      const freqMap: Record<string, number> = {};
      data.forEach(row => {
        const k = String(row[catCol.name] || 'Unknown');
        freqMap[k] = (freqMap[k] || 0) + 1;
      });

      const chartData = Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({
          [catCol.name]: name,
          'Record Count': count
        }));

      generatedCharts.push({
        type: 'bar',
        title: `Record Volume by ${catCol.name}`,
        description: `Distribution of dataset entries across top ${catCol.name} values.`,
        xAxisKey: catCol.name,
        yAxisKey: 'Record Count',
        data: chartData
      });
    }

    // Chart 2: Area / Line Trend Chart - Metric Progression
    if (numericCols.length > 0) {
      const numCol = numericCols[0];
      const tCol = dateCol || catCols[0] || labelCol;

      const chartData = data
        .slice(0, 30)
        .map((row, idx) => ({
          [tCol.name]: String(row[tCol.name] || `Row #${idx + 1}`),
          [numCol.name]: Number(row[numCol.name]) || 0
        }));

      generatedCharts.push({
        type: dateCol ? 'line' : 'area',
        title: `${numCol.name} Trend & Sequential Progression`,
        description: `Sequential movement of ${numCol.name} across records.`,
        xAxisKey: tCol.name,
        yAxisKey: numCol.name,
        data: chartData
      });
    }

    // Chart 3: Pie / Doughnut Share Chart
    const firstCat = catCols[0];
    if (firstCat && firstCat.topCategories && firstCat.topCategories.length > 0) {
      const topCats = firstCat.topCategories;
      const chartData = topCats.map(c => ({
        name: c.value,
        count: c.count
      }));

      generatedCharts.push({
        type: 'pie',
        title: `${firstCat.name} Distribution & Market Share`,
        description: `Proportional percentage breakdown of values in ${firstCat.name}.`,
        xAxisKey: 'name',
        yAxisKey: 'count',
        data: chartData
      });
    }

    // Chart 4: Scatter Correlation Plot (if 2 numeric columns exist or numeric vs index)
    if (numericCols.length >= 2) {
      const colX = numericCols[0];
      const colY = numericCols[1];

      const chartData = data
        .filter(r => r[colX.name] !== undefined && r[colY.name] !== undefined)
        .slice(0, 40)
        .map(r => ({
          [colX.name]: Number(r[colX.name]) || 0,
          [colY.name]: Number(r[colY.name]) || 0,
          name: String(r[labelCol.name] || 'Record')
        }));

      generatedCharts.push({
        type: 'scatter',
        title: `Correlation Analysis: ${colX.name} vs ${colY.name}`,
        description: `Scatter relationship mapping ${colX.name} against ${colY.name}.`,
        xAxisKey: colX.name,
        yAxisKey: colY.name,
        data: chartData
      });
    } else if (catCols.length >= 2) {
      // Fallback Scatter/Distribution for Secondary Category
      const secondCat = catCols[1];
      const freqMap: Record<string, number> = {};
      data.forEach(r => {
        const k = String(r[secondCat.name] || 'N/A');
        freqMap[k] = (freqMap[k] || 0) + 1;
      });

      const chartData = Object.entries(freqMap).map(([name, count]) => ({
        name,
        count
      }));

      generatedCharts.push({
        type: 'pie',
        title: `${secondCat.name} Secondary Breakdown`,
        description: `Category distribution for ${secondCat.name}.`,
        xAxisKey: 'name',
        yAxisKey: 'count',
        data: chartData
      });
    }

    // Chart 5: Composed Overlay Chart (Dual Metrics or Metric + Avg)
    if (catCols.length > 0 && numericCols.length >= 2) {
      const catCol = catCols[0];
      const col1 = numericCols[0];
      const col2 = numericCols[1];

      const chartData = data.slice(0, 8).map(row => ({
        [catCol.name]: String(row[catCol.name] || 'N/A'),
        [col1.name]: Number(row[col1.name]) || 0,
        [col2.name]: Number(row[col2.name]) || 0
      }));

      generatedCharts.push({
        type: 'composed',
        title: `Dual-Metric Comparison (${col1.name} & ${col2.name})`,
        description: `Combined Bar & Line overlay comparing ${col1.name} and ${col2.name}.`,
        xAxisKey: catCol.name,
        yAxisKey: [col1.name, col2.name],
        data: chartData
      });
    }

    // Chart 6: Radar / Multi-Attribute Performance Matrix
    if (catCols.length > 0 && numericCols.length > 0) {
      const catCol = catCols[0];
      const numCol = numericCols[0];

      const chartData = data.slice(0, 6).map(row => ({
        [catCol.name]: String(row[catCol.name] || 'N/A'),
        [numCol.name]: Number(row[numCol.name]) || 0
      }));

      generatedCharts.push({
        type: 'radar',
        title: `${numCol.name} Radar Performance Matrix`,
        description: `Multi-dimensional radar visualization across top categories.`,
        xAxisKey: catCol.name,
        yAxisKey: numCol.name,
        data: chartData
      });
    }

    // Chart 7: Leaderboard Ranking Bar Chart (Top 5 Records)
    if (numericCols.length > 0) {
      const numCol = numericCols[0];
      const nameCol = labelCol;

      const topRecords = [...data]
        .filter(r => r[numCol.name] !== undefined)
        .sort((a, b) => Number(b[numCol.name]) - Number(a[numCol.name]))
        .slice(0, 5)
        .map(r => ({
          [nameCol.name]: String(r[nameCol.name] || 'Record'),
          [numCol.name]: Number(r[numCol.name]) || 0
        }));

      generatedCharts.push({
        type: 'bar',
        title: `Top 5 Highest Performing Records by ${numCol.name}`,
        description: `Leaderboard ranking of top entries sorted by ${numCol.name}.`,
        xAxisKey: nameCol.name,
        yAxisKey: numCol.name,
        data: topRecords
      });
    }

    // Chart 8: Statistical Profile & Metric Ranges Summary (8th Visualization to complete the 2x4 grid!)
    if (numericCols.length > 0) {
      const statData = numericCols.slice(0, 5).map(col => {
        const mean = col.mean !== undefined ? Math.round(col.mean) : 0;
        const max = col.max !== undefined ? col.max : 0;
        return {
          Metric: col.name,
          Average: mean,
          Maximum: max
        };
      });

      generatedCharts.push({
        type: 'composed',
        title: `Key Numerical Metrics Summary (Average vs Maximum)`,
        description: `Comparison of average vs max peak values across dataset attributes.`,
        xAxisKey: 'Metric',
        yAxisKey: ['Average', 'Maximum'],
        data: statData
      });
    } else {
      // Fallback 8th Chart: Overview Data Quality & Row Counts
      generatedCharts.push({
        type: 'bar',
        title: `Dataset Column Field Completeness`,
        description: `Total valid entries recorded per dataset attribute column.`,
        xAxisKey: 'Column',
        yAxisKey: 'ValidRows',
        data: columns.map(c => ({
          Column: c.name,
          ValidRows: data.length - c.nullCount
        }))
      });
    }

    return generatedCharts;
  }, [ds]);

  if (!ds) return null;

  return (
    <div className="space-y-6">
      {/* Active Cross-Filter Alert Banner */}
      {filters.categoryFilter && filters.categoryValue && (
        <div className="flex items-center justify-between p-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-teal-500/10 to-transparent border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-300">
              <Filter className="w-4 h-4" />
            </div>
            <span>
              Active Interactive Cross-Filter: <strong className="text-slate-900 dark:text-white font-bold">{filters.categoryFilter}</strong> = <span className="underline font-bold text-cyan-600 dark:text-cyan-400">"{filters.categoryValue}"</span>
            </span>
          </div>
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-800 dark:text-cyan-200 font-bold transition shadow-sm"
          >
            <X className="w-4 h-4" /> Reset Interactive Filter
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Interactive Visual Dashboard Suite</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {charts.length} automated charts generated • <span className="text-cyan-600 dark:text-cyan-400 font-bold">Click any bar, slice, or data point</span> to dynamically filter all other charts
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 w-fit flex items-center gap-1.5">
          <MousePointerClick className="w-3.5 h-3.5" /> Interactive Cross-Filtering Ready
        </span>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart, idx) => (
          <DynamicChart
            key={idx}
            chartData={chart}
            onPointClick={handlePointClick}
            selectedColumn={filters.categoryFilter}
            selectedValue={filters.categoryValue}
          />
        ))}
      </div>
    </div>
  );
};
