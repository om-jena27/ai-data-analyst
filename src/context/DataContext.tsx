'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { askAiAnalyst } from '@/lib/aiEngine';
import { parseUploadedFile, executeDataCleaning, exportToCsv, analyzeDataArray } from '@/lib/dataProcessor';
import { SAMPLE_DATASETS } from '@/lib/sampleData';
import { ChatMessage, DatasetAnalysis, DataCleaningOptions, CleaningAuditSummary, DataFilterState } from '@/lib/types';

interface DataContextType {
  originalDataset: DatasetAnalysis | null;
  currentDataset: DatasetAnalysis | null;
  filteredDataset: DatasetAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  chatHistory: ChatMessage[];
  customApiKey: string;
  customApiProvider: string;
  customApiModel: string;
  activeTab: 'dashboard' | 'table' | 'chat' | 'insights';
  filters: DataFilterState;
  isCleaningModalOpen: boolean;
  setIsCleaningModalOpen: (open: boolean) => void;
  setActiveTab: (tab: 'dashboard' | 'table' | 'chat' | 'insights') => void;
  setCustomApiKey: (key: string) => void;
  setCustomApiProvider: (provider: string) => void;
  setCustomApiModel: (model: string) => void;
  uploadFile: (file: File) => Promise<void>;
  loadSampleDataset: (sampleId: string) => void;
  sendChatMessage: (query: string) => Promise<void>;
  clearDataset: () => void;
  setError: (err: string | null) => void;
  setFilters: (filters: DataFilterState) => void;
  clearFilters: () => void;
  applyDataCleaning: (options: DataCleaningOptions) => CleaningAuditSummary | null;
  resetToOriginal: () => void;
  exportData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [originalDataset, setOriginalDataset] = useState<DatasetAnalysis | null>(null);
  const [currentDataset, setCurrentDataset] = useState<DatasetAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [customApiKey, setCustomApiKeyState] = useState<string>('');
  const [customApiProvider, setCustomApiProviderState] = useState<string>('auto');
  const [customApiModel, setCustomApiModelState] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'chat' | 'insights'>('dashboard');
  const [filters, setFiltersState] = useState<DataFilterState>({});
  const [isCleaningModalOpen, setIsCleaningModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('ai_analyst_api_key');
    if (savedKey) setCustomApiKeyState(savedKey);
    const savedProvider = localStorage.getItem('ai_analyst_api_provider');
    if (savedProvider) setCustomApiProviderState(savedProvider);
    const savedModel = localStorage.getItem('ai_analyst_api_model');
    if (savedModel) setCustomApiModelState(savedModel);
  }, []);

  const setCustomApiKey = (key: string) => {
    setCustomApiKeyState(key);
    localStorage.setItem('ai_analyst_api_key', key);
  };

  const setCustomApiProvider = (provider: string) => {
    setCustomApiProviderState(provider);
    localStorage.setItem('ai_analyst_api_provider', provider);
  };

  const setCustomApiModel = (model: string) => {
    setCustomApiModelState(model);
    localStorage.setItem('ai_analyst_api_model', model);
  };

  const uploadFile = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await parseUploadedFile(file);
      setOriginalDataset(analysis);
      setCurrentDataset(analysis);
      setFiltersState({});
      setActiveTab('dashboard');
      setChatHistory([
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: `Successfully uploaded and analyzed **${analysis.fileName}** (${analysis.rowCount.toLocaleString()} rows, ${analysis.columnCount} columns, Quality Score: ${analysis.qualityScore}/100).\n\nFeel free to ask questions or click **Clean Data** to apply transformations!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error('File Upload Error:', err);
      setError(err.message || 'Failed to parse uploaded file');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleDataset = (sampleId: string) => {
    const target = SAMPLE_DATASETS.find(s => s.id === sampleId);
    if (target) {
      setIsAnalyzing(true);
      setTimeout(() => {
        try {
          const analysis = target.generate();
          setOriginalDataset(analysis);
          setCurrentDataset(analysis);
          setFiltersState({});
          setActiveTab('dashboard');
          setChatHistory([
            {
              id: `msg-${Date.now()}`,
              sender: 'ai',
              text: `Loaded sample dataset **${analysis.fileName}**. Automated summary & dynamic visualizations are ready!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setIsAnalyzing(false);
        }
      }, 300);
    }
  };

  // Filtered dataset computed dynamically from active filters
  const filteredDataset = useMemo(() => {
    if (!currentDataset) return null;
    let rows = [...currentDataset.data];

    const { categoryFilter, categoryValue, searchTerm } = filters;

    // 1. Category Filter Slicer
    if (categoryFilter && categoryValue) {
      rows = rows.filter(r => String(r[categoryFilter] || '').toLowerCase() === categoryValue.toLowerCase());
    }

    // 2. Global Text Search
    if (searchTerm && searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      rows = rows.filter(r =>
        Object.values(r).some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(lower))
      );
    }

    if (rows.length === currentDataset.rowCount) {
      return currentDataset;
    }

    return analyzeDataArray(rows, currentDataset.fileName, currentDataset.fileSize);
  }, [currentDataset, filters]);

  const setFilters = (newFilters: DataFilterState) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFiltersState({});
  };

  const applyDataCleaning = (options: DataCleaningOptions): CleaningAuditSummary | null => {
    if (!currentDataset) return null;

    const { cleanedAnalysis, audit } = executeDataCleaning(currentDataset, options);
    setCurrentDataset(cleanedAnalysis);
    setFiltersState({});

    setChatHistory(prev => [
      ...prev,
      {
        id: `clean-msg-${Date.now()}`,
        sender: 'ai',
        text: `🧹 **Data Cleaning Complete!**\n- Original Rows: **${audit.originalRowCount.toLocaleString()}** → Cleaned Rows: **${audit.cleanedRowCount.toLocaleString()}**\n- Duplicates Removed: **${audit.duplicatesRemoved}**\n- Missing Values Imputed: **${audit.missingValuesImputed}**\n- Outliers Removed: **${audit.outliersRemoved}**\n- Quality Score: **${audit.qualityScoreBefore}/100** → **${audit.qualityScoreAfter}/100**`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    return audit;
  };

  const resetToOriginal = () => {
    if (originalDataset) {
      setCurrentDataset(originalDataset);
      setFiltersState({});
    }
  };

  const exportData = () => {
    const ds = filteredDataset || currentDataset;
    if (ds && ds.data.length > 0) {
      exportToCsv(ds.data, ds.fileName);
    }
  };

  const sendChatMessage = async (query: string) => {
    const datasetToQuery = filteredDataset || currentDataset;
    if (!query.trim() || !datasetToQuery) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsAnalyzing(true);

    try {
      const aiReply = await askAiAnalyst(query, datasetToQuery, customApiKey, customApiProvider, customApiModel);
      setChatHistory(prev => [...prev, aiReply]);
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `Sorry, I encountered an issue analyzing your query: ${err.message}`,
          timestamp
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearDataset = () => {
    setOriginalDataset(null);
    setCurrentDataset(null);
    setFiltersState({});
    setChatHistory([]);
  };

  return (
    <DataContext.Provider
      value={{
        originalDataset,
        currentDataset,
        filteredDataset,
        isAnalyzing,
        error,
        chatHistory,
        customApiKey,
        customApiProvider,
        customApiModel,
        activeTab,
        filters,
        isCleaningModalOpen,
        setIsCleaningModalOpen,
        setActiveTab,
        setCustomApiKey,
        setCustomApiProvider,
        setCustomApiModel,
        uploadFile,
        loadSampleDataset,
        sendChatMessage,
        clearDataset,
        setError,
        setFilters,
        clearFilters,
        applyDataCleaning,
        resetToOriginal,
        exportData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
