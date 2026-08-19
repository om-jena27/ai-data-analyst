

'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { DynamicChartData } from '@/lib/types';
import { useTheme } from 'next-themes';
import { GlassCard } from './GlassCard';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Activity, Radio, Layers, MousePointerClick } from 'lucide-react';

const COLOR_PALETTE = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#f43f5e'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const GlassTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 backdrop-blur-md text-slate-900 dark:text-white shadow-xl text-xs space-y-1 z-50 pointer-events-none">
        {label && <p className="font-bold text-cyan-600 dark:text-cyan-400 border-b border-slate-200 dark:border-slate-700/80 pb-1 mb-1">{label}</p>}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-slate-600 dark:text-slate-300 font-medium">{entry.name}:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : entry.value}
            </span>
          </div>
        ))}
        <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold pt-1 italic border-t border-slate-200 dark:border-slate-800">
          💡 Click to filter dashboard
        </p>
      </div>
    );
  }
  return null;
};

export interface DynamicChartProps {
  chartData: DynamicChartData;
  onPointClick?: (columnName: string, clickedValue: string) => void;
  selectedColumn?: string;
  selectedValue?: string;
}

export const DynamicChart: React.FC<DynamicChartProps> = ({
  chartData,
  onPointClick,
  selectedColumn,
  selectedValue
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeType, setActiveType] = useState<DynamicChartData['type']>(chartData.type || 'bar');

  const strokeColor = isDark ? '#334155' : '#cbd5e1';
  const textColor = isDark ? '#94a3b8' : '#334155';

  const { title, xAxisKey, yAxisKey, data } = chartData;
  const yKeys = Array.isArray(yAxisKey) ? yAxisKey : [yAxisKey];
  const hasData = data && data.length > 0;
  const isFilterActiveOnThisCol = selectedColumn === xAxisKey;

  const handleChartClick = (state: any) => {
    if (!onPointClick || !xAxisKey) return;
    if (state && state.activePayload && state.activePayload.length) {
      const rawVal = state.activePayload[0].payload[xAxisKey];
      if (rawVal !== undefined && rawVal !== null) {
        onPointClick(xAxisKey, String(rawVal));
      }
    } else if (state && state.activeLabel) {
      onPointClick(xAxisKey, String(state.activeLabel));
    }
  };

  return (
    <GlassCard className="p-5 flex flex-col h-[420px] relative group">
      {/* Header & Chart Type Switcher Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{title}</h4>
            {onPointClick && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold border border-cyan-500/20">
                <MousePointerClick className="w-3 h-3" /> Interactive
              </span>
            )}
          </div>
          {chartData.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">{chartData.description}</p>
          )}
        </div>

        {/* Type selector */}
        <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300/80 dark:border-slate-800 text-[11px] self-start sm:self-auto">
          <button
            onClick={() => setActiveType('bar')}
            title="Bar Chart"
            className={`p-1.5 rounded-lg transition ${activeType === 'bar' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveType('line')}
            title="Line Chart"
            className={`p-1.5 rounded-lg transition ${activeType === 'line' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <LineIcon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveType('area')}
            title="Area Chart"
            className={`p-1.5 rounded-lg transition ${activeType === 'area' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveType('pie')}
            title="Pie / Doughnut Chart"
            className={`p-1.5 rounded-lg transition ${activeType === 'pie' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <PieIcon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveType('scatter')}
            title="Scatter Chart"
            className={`p-1.5 rounded-lg transition ${activeType === 'scatter' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Radio className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveType('radar')}
            title="Radar Chart"
            className={`p-1.5 rounded-lg transition ${activeType === 'radar' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chart Body */}
      <div className="flex-1 w-full min-h-[300px] flex items-center justify-center cursor-pointer">
        {!hasData ? (
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            No numerical data available for this chart layout.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          {activeType === 'line' ? (
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }} onClick={handleChartClick}>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
              <XAxis dataKey={xAxisKey} stroke={textColor} fontSize={11} tickLine={false} />
              <YAxis stroke={textColor} fontSize={11} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {yKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLOR_PALETTE[i % COLOR_PALETTE.length]}
                  strokeWidth={3}
                  dot={{ r: 5, fill: COLOR_PALETTE[i % COLOR_PALETTE.length] }}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          ) : activeType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }} onClick={handleChartClick}>
              <defs>
                {yKeys.map((key, i) => (
                  <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR_PALETTE[i % COLOR_PALETTE.length]} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={COLOR_PALETTE[i % COLOR_PALETTE.length]} stopOpacity={0.05}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
              <XAxis dataKey={xAxisKey} stroke={textColor} fontSize={11} tickLine={false} />
              <YAxis stroke={textColor} fontSize={11} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {yKeys.map((key, i) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLOR_PALETTE[i % COLOR_PALETTE.length]}
                  strokeWidth={2}
                  fill={`url(#grad-${key})`}
                />
              ))}
            </AreaChart>
          ) : activeType === 'pie' ? (
            <PieChart margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <Pie
                data={data}
                dataKey={yKeys[0]}
                nameKey={xAxisKey}
                cx="50%"
                cy="50%"
                outerRadius={105}
                innerRadius={55}
                paddingAngle={4}
                label={({ name, percent }) => `${String(name).slice(0, 10)}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                onClick={(entry: any) => {
                  const val = entry?.[xAxisKey] ?? entry?.name ?? entry?.payload?.[xAxisKey];
                  if (val !== undefined && val !== null && onPointClick && xAxisKey) {
                    onPointClick(xAxisKey, String(val));
                  }
                }}
              >
                {data.map((entry, index) => {
                  const itemVal = String(entry[xAxisKey] || entry.name || '');
                  const isSelected = isFilterActiveOnThisCol && selectedValue?.toLowerCase() === itemVal.toLowerCase();
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                      opacity={selectedValue ? (isSelected ? 1 : 0.4) : 1}
                      stroke={isSelected ? '#ffffff' : 'none'}
                      strokeWidth={isSelected ? 3 : 0}
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<GlassTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            </PieChart>
          ) : activeType === 'scatter' ? (
            <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 20 }} onClick={handleChartClick}>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
              <XAxis dataKey={xAxisKey} name={xAxisKey} stroke={textColor} fontSize={11} tickLine={false} />
              <YAxis dataKey={yKeys[0]} name={yKeys[0]} stroke={textColor} fontSize={11} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Scatter name={title} data={data} fill="#06b6d4" />
            </ScatterChart>
          ) : activeType === 'radar' ? (
            <RadarChart cx="50%" cy="50%" outerRadius={90} data={data.slice(0, 8)} onClick={handleChartClick}>
              <PolarGrid stroke={strokeColor} />
              <PolarAngleAxis dataKey={xAxisKey} stroke={textColor} fontSize={11} />
              <PolarRadiusAxis stroke={textColor} fontSize={10} />
              {yKeys.map((key, i) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={COLOR_PALETTE[i % COLOR_PALETTE.length]}
                  fill={COLOR_PALETTE[i % COLOR_PALETTE.length]}
                  fillOpacity={0.4}
                />
              ))}
              <Tooltip content={<GlassTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            </RadarChart>
          ) : activeType === 'composed' ? (
            <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }} onClick={handleChartClick}>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} strokeOpacity={0.5} />
              <XAxis dataKey={xAxisKey} stroke={textColor} fontSize={11} tickLine={false} />
              <YAxis stroke={textColor} fontSize={11} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey={yKeys[0]} fill="#06b6d4" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => {
                  const itemVal = String(entry[xAxisKey] || '');
                  const isSelected = isFilterActiveOnThisCol && selectedValue?.toLowerCase() === itemVal.toLowerCase();
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isSelected ? '#06b6d4' : COLOR_PALETTE[index % COLOR_PALETTE.length]}
                      opacity={selectedValue ? (isSelected ? 1 : 0.4) : 1}
                      stroke={isSelected ? '#ffffff' : 'none'}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                  );
                })}
              </Bar>
              {yKeys[1] && <Line type="monotone" dataKey={yKeys[1]} stroke="#8b5cf6" strokeWidth={3} />}
            </ComposedChart>
          ) : (
            // Bar Chart (Default)
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }} onClick={handleChartClick}>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} strokeOpacity={0.5} />
              <XAxis dataKey={xAxisKey} stroke={textColor} fontSize={11} tickLine={false} />
              <YAxis stroke={textColor} fontSize={11} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {yKeys.map((key, i) => (
                <Bar key={key} dataKey={key} radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => {
                    const itemVal = String(entry[xAxisKey] || '');
                    const isSelected = isFilterActiveOnThisCol && selectedValue?.toLowerCase() === itemVal.toLowerCase();
                    const baseColor = COLOR_PALETTE[index % COLOR_PALETTE.length];
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={baseColor}
                        opacity={selectedValue ? (isSelected ? 1 : 0.4) : 1}
                        stroke={isSelected ? '#ffffff' : 'none'}
                        strokeWidth={isSelected ? 2.5 : 0}
                      />
                    );
                  })}
                </Bar>
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
      </div>
    </GlassCard>
  );
};

