'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Key, X, Check, ShieldCheck, Cpu, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const { customApiKey, setCustomApiKey, customApiProvider, setCustomApiProvider, customApiModel, setCustomApiModel } = useData();

  const [tempKey, setTempKey] = useState(customApiKey);
  const [tempProvider, setTempProvider] = useState(customApiProvider || 'auto');
  const [tempModel, setTempModel] = useState(customApiModel || '');
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempKey(customApiKey);
      setTempProvider(customApiProvider || 'auto');
      setTempModel(customApiModel || '');
      setTestResult(null);
    }
  }, [isOpen, customApiKey, customApiProvider, customApiModel]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!tempKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API Key first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isTest: true,
          apiKey: tempKey.trim(),
          provider: tempProvider,
          model: tempModel.trim() || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message || 'API Key is valid and working!' });
      } else {
        setTestResult({ success: false, message: data.error || 'Connection failed. Please check your API key.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Network error testing API connection.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiKey(tempKey.trim());
    setCustomApiProvider(tempProvider);
    setCustomApiModel(tempModel.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const getModelPlaceholder = () => {
    switch (tempProvider) {
      case 'gemini': return 'e.g. gemini-1.5-flash (default)';
      case 'openai': return 'e.g. gpt-4o-mini (default)';
      case 'claude': return 'e.g. claude-3-5-haiku-20241022 (default)';
      case 'groq': return 'e.g. llama-3.3-70b-versatile (default)';
      case 'deepseek': return 'e.g. deepseek-chat (default)';
      default: return 'Leave blank for default model';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-6 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-glass-lg text-slate-100 animate-in fade-in zoom-in-95 duration-200">
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
            <h3 className="text-lg font-bold text-white">AI API Key & Model Settings</h3>
            <p className="text-xs text-slate-400">Connect Google Gemini, OpenAI, Claude, Groq, or DeepSeek</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Adding your own AI API Key unlocks deep LLM reasoning and custom insights for your datasets.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              AI Provider
            </label>
            <select
              value={tempProvider}
              onChange={(e) => setTempProvider(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 focus:border-cyan-500 rounded-xl text-xs text-slate-100 outline-none transition"
            >
              <option value="auto">Auto Detect (by API Key format)</option>
              <option value="gemini">Google Gemini (AIza...)</option>
              <option value="openai">OpenAI (sk-...)</option>
              <option value="claude">Anthropic Claude (sk-ant-...)</option>
              <option value="groq">Groq Llama 3 (gsk_...)</option>
              <option value="deepseek">DeepSeek (ds-...)</option>
            </select>
          </div>

          {/* API Key Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              API Key
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Paste your API key here..."
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 focus:border-cyan-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none transition font-mono"
            />
          </div>

          {/* Model Name (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Model Name <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={tempModel}
              onChange={(e) => setTempModel(e.target.value)}
              placeholder={getModelPlaceholder()}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 focus:border-cyan-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-none transition font-mono"
            />
          </div>

          {/* Test Status Alert */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Your key is stored strictly in your browser&apos;s local storage.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !tempKey.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 rounded-xl transition disabled:opacity-40"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <div className="flex items-center gap-2">
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
                {saved ? 'Saved!' : 'Save Settings'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
