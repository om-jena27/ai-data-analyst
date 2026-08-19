'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { GlassCard } from './GlassCard';
import dynamic from 'next/dynamic';
import { Send, Bot, User, Sparkles, Loader2, Table as TableIcon } from 'lucide-react';

const DynamicChart = dynamic(
  () => import('./DynamicChart').then((mod) => mod.DynamicChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 rounded-xl bg-slate-900/40 animate-pulse border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-semibold">
        Loading Chart...
      </div>
    ),
  }
);

export const AiChatAssistant: React.FC = () => {
  const { currentDataset, chatHistory, sendChatMessage, isAnalyzing } = useData();
  const [inputQuery, setInputQuery] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isAnalyzing]);

  if (!currentDataset) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isAnalyzing) return;
    const q = inputQuery;
    setInputQuery('');
    await sendChatMessage(q);
  };

  const handleSuggestionClick = async (prompt: string) => {
    if (isAnalyzing) return;
    await sendChatMessage(prompt);
  };

  const numCol = currentDataset.columns.find(c => c.type === 'numeric' && !c.isIdColumn)?.name || currentDataset.columns.find(c => c.type === 'numeric')?.name || 'metric';
  const catCol = currentDataset.columns.find(c => (c.type === 'categorical' || c.type === 'text') && !c.isIdColumn)?.name || 'category';

  const quickPrompts = [
    `What is the total ${numCol}?`,
    `Show average ${numCol} by ${catCol}`,
    `Show top 5 records by ${numCol}`,
    `What is the distribution of ${catCol}?`,
    `Are there any missing or outlier values?`
  ];

  return (
    <GlassCard className="p-6 flex flex-col h-[700px] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 text-white shadow-glow-cyan">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Data Analyst Assistant</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Querying <span className="font-semibold text-cyan-600 dark:text-cyan-400">{currentDataset.fileName}</span> in natural language
            </p>
          </div>
        </div>
      </div>

      {/* Suggestion Prompt Chips */}
      <div className="py-3 flex flex-wrap gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800/60 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 self-center flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Ideas:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestionClick(prompt)}
            disabled={isAnalyzing}
            className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-cyan-500 dark:hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition text-[11px] whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 h-fit">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-medium rounded-tr-none shadow-md'
                  : 'bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none space-y-3'
              }`}
            >
              {/* Message text with basic markdown formatting */}
              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {/* Render dynamic chart inside chat if available */}
              {msg.chart && (
                <div className="mt-3">
                  <DynamicChart chartData={msg.chart} />
                </div>
              )}

              {/* Render inline table inside chat if available */}
              {msg.table && (
                <div className="mt-3 rounded-xl border border-slate-300 dark:border-slate-800 overflow-x-auto bg-slate-50 dark:bg-slate-950/60 p-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-2">
                    <TableIcon className="w-3.5 h-3.5 text-cyan-400" /> Data Table Preview
                  </div>
                  <table className="w-full text-left text-[11px]">
                    <thead className="border-b border-slate-300 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                      <tr>
                        {msg.table.headers.map((h, i) => (
                          <th key={i} className="p-1.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {msg.table.rows.map((r, ri) => (
                        <tr key={ri} className="border-b border-slate-200/50 dark:border-slate-800/40">
                          {r.map((cell, ci) => (
                            <td key={ci} className="p-1.5">{String(cell)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <span className="block text-[10px] opacity-60 text-right mt-1 font-mono">
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 h-fit">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex gap-3 justify-start">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing dataset & calculating statistics...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question about your dataset (e.g., 'What is the highest revenue category?')..."
          className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-cyan-500 transition"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isAnalyzing}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 font-bold text-xs hover:from-cyan-300 hover:to-teal-200 disabled:opacity-40 transition shadow-glow-cyan flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span>Ask</span>
        </button>
      </form>
    </GlassCard>
  );
};
