'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import {
  Globe,
  FileSpreadsheet,
  Link as LinkIcon,
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const DataConnectorModal: React.FC = () => {
  const { connectRemoteUrl, isConnectorModalOpen, setIsConnectorModalOpen } = useData();
  const isOpen = isConnectorModalOpen;
  const onClose = () => setIsConnectorModalOpen(false);

  const [activeTab, setActiveTab] = useState<'sheets' | 'url'>('sheets');
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const SAMPLE_SHEET_URL =
    'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing';
  const SAMPLE_CSV_URL =
    'https://raw.githubusercontent.com/datasets/gdp/master/data/gdp.csv';

  const handleConnect = async (urlOverride?: string) => {
    const target = (urlOverride || inputUrl).trim();
    if (!target) { setErrorMsg('Please enter a valid link or URL.'); return; }
    setLoading(true);
    setErrorMsg(null);
    try {
      await connectRemoteUrl(target);
      setLoading(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to dataset.');
      setLoading(false);
    }
  };

  const handleSample = () => {
    const url = activeTab === 'sheets' ? SAMPLE_SHEET_URL : SAMPLE_CSV_URL;
    setInputUrl(url);
    handleConnect(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Gradient top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-violet-500 to-emerald-400" />

        <div className="p-6 space-y-5">

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 via-violet-600 to-emerald-400 shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Connect Live Data Source</h3>
              <p className="text-xs text-slate-400 mt-0.5">Stream data from Google Sheets or a public URL</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-xl bg-slate-800 border border-white/10">
            <button
              onClick={() => { setActiveTab('sheets'); setErrorMsg(null); setInputUrl(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'sheets'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Google Sheets
            </button>
            <button
              onClick={() => { setActiveTab('url'); setErrorMsg(null); setInputUrl(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'url'
                  ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-4 h-4 text-violet-400" />
              Public CSV / JSON URL
            </button>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              {activeTab === 'sheets' ? 'Paste Google Sheets Link' : 'Paste Dataset URL (.csv or .json)'}
            </label>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              placeholder={
                activeTab === 'sheets'
                  ? 'https://docs.google.com/spreadsheets/d/...'
                  : 'https://example.com/data.csv'
              }
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
            />
          </div>

          {/* Info Box */}
          {activeTab === 'sheets' ? (
            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Google Sheets Sharing Requirement
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                In Google Sheets, click <span className="text-white font-semibold">Share</span> → set General Access to{' '}
                <span className="text-cyan-300 font-semibold">"Anyone with the link can view"</span>.
                DataPulse AI streams the data server-side without Google credentials.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 space-y-1">
              <span className="text-violet-400 text-xs font-semibold">Supported Formats</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Any publicly reachable HTTPS URL pointing to raw <span className="text-white font-semibold">CSV</span> or{' '}
                <span className="text-white font-semibold">JSON</span> arrays — GitHub raw links, Kaggle exports, open APIs.
              </p>
            </div>
          )}

          {/* Try Sample */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Want to test right now?</span>
            <button
              onClick={handleSample}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {activeTab === 'sheets' ? 'Load Sample Google Sheet' : 'Load Sample CSV'}
            </button>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/10 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConnect()}
              disabled={loading || !inputUrl.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 disabled:opacity-40 text-slate-950 text-xs font-bold shadow-lg transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Streaming & Analyzing…
                </>
              ) : (
                <>
                  Connect & Load Dataset
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
