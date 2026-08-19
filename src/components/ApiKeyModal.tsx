'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Key, X, Check, ShieldCheck } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const { customApiKey, setCustomApiKey } = useData();
  const [tempKey, setTempKey] = useState(customApiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiKey(tempKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-glass-lg text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI API Key Settings</h3>
            <p className="text-xs text-slate-400">Optional: Connect Gemini or OpenAI API</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          The app works out of the box with our built-in high performance NLP Data Engine. Adding a Gemini or OpenAI API key enables full LLM reasoning.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              API Key (Gemini or OpenAI)
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="AIzaSy... or sk-..."
              className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700 focus:border-cyan-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Your key is stored locally in your browser and never sent to external servers.</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 rounded-xl shadow-glow-cyan transition"
            >
              {saved ? <Check className="w-4 h-4" /> : null}
              {saved ? 'Saved!' : 'Save Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
