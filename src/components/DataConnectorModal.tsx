'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { GlassCard } from './GlassCard';
import {
  Globe,
  FileSpreadsheet,
  Link as LinkIcon,
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

interface DataConnectorModalProps {}

export const DataConnectorModal: React.FC<DataConnectorModalProps> = () => {
  const { connectRemoteUrl, isAnalyzing, isConnectorModalOpen, setIsConnectorModalOpen } = useData();
  const isOpen = isConnectorModalOpen;
  const onClose = () => setIsConnectorModalOpen(false);

  const [activeConnectorTab, setActiveConnectorTab] = useState<'sheets' | 'url'>('sheets');
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Sample public dataset links for instant 1-click verification
  const SAMPLE_SHEET_URL =
    'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing';
  const SAMPLE_CSV_URL =
    'https://raw.githubusercontent.com/datasets/gdp/master/data/gdp.csv';

  const handleConnect = async (urlToConnect?: string) => {
    const targetUrl = (urlToConnect || inputUrl).trim();
    if (!targetUrl) {
      setErrorMsg('Please enter a valid link or URL.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await connectRemoteUrl(targetUrl);
      setLoading(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to dataset');
      setLoading(false);
    }
  };

  const handleUseSample = (type: 'sheets' | 'url') => {
    const url = type === 'sheets' ? SAMPLE_SHEET_URL : SAMPLE_CSV_URL;
    setInputUrl(url);
    handleConnect(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-xl p-6 relative border-cyan-500/30 shadow-glow-cyan animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 via-violet-600 to-emerald-400 text-slate-950 shadow-md">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Connect Live Data Source
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stream live data directly from Google Sheets or public web URLs
            </p>
          </div>
        </div>

        {/* Connector Sub-Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 mb-5">
          <button
            onClick={() => {
              setActiveConnectorTab('sheets');
              setErrorMsg(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition ${
              activeConnectorTab === 'sheets'
                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200 dark:border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Google Sheets</span>
          </button>

          <button
            onClick={() => {
              setActiveConnectorTab('url');
              setErrorMsg(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition ${
              activeConnectorTab === 'url'
                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200 dark:border-cyan-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-violet-400" />
            <span>Public CSV / JSON URL</span>
          </button>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {activeConnectorTab === 'sheets'
                ? 'Paste Google Sheets Link'
                : 'Paste Web Dataset URL (.csv, .json)'}
            </label>
            <div className="relative">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder={
                  activeConnectorTab === 'sheets'
                    ? 'https://docs.google.com/spreadsheets/d/...'
                    : 'https://example.com/data.csv or https://api.example.com/items'
                }
                className="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          {/* Context Instructions */}
          {activeConnectorTab === 'sheets' ? (
            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-cyan-600 dark:text-cyan-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Google Sheets Sharing Requirement</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                In Google Sheets, click <b>Share</b> in the top right, and set General Access to:{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  &quot;Anyone with the link can view&quot;
                </span>
                . DataPulse AI streams the data server-side securely without requiring Google credentials.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <span className="font-semibold text-violet-500 dark:text-violet-400">Supported Formats:</span>
              <p className="text-[11px] leading-relaxed">
                Any publicly reachable HTTPS URL pointing to raw <b>CSV</b> text or <b>JSON</b> arrays (e.g. GitHub raw links, Kaggle exports, or REST API endpoints).
              </p>
            </div>
          )}

          {/* 1-Click Instant Sample Test Option */}
          <div className="pt-1 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Want to test right now?</span>
            <button
              type="button"
              onClick={() => handleUseSample(activeConnectorTab)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {activeConnectorTab === 'sheets'
                  ? 'Load Sample Google Sheet'
                  : 'Load Sample Open CSV'}
              </span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleConnect()}
              disabled={loading || !inputUrl.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-glow-cyan transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Streaming & Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Connect & Load Dataset</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
