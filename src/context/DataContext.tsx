'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { askAiAnalyst } from '@/lib/aiEngine';
import { parseUploadedFile, executeDataCleaning, exportToCsv, analyzeDataArray } from '@/lib/dataProcessor';
import { SAMPLE_DATASETS } from '@/lib/sampleData';
import { analyzeImageFile, askImageQuestion } from '@/lib/imageAnalyzer';
import { SAMPLE_IMAGES } from '@/lib/sampleImages';
import {
  ChatMessage,
  DatasetAnalysis,
  DataCleaningOptions,
  CleaningAuditSummary,
  DataFilterState,
  AppTab,
  ImageAnalysisResult
} from '@/lib/types';

interface DataContextType {
  originalDataset: DatasetAnalysis | null;
  currentDataset: DatasetAnalysis | null;
  filteredDataset: DatasetAnalysis | null;
  activeImage: ImageAnalysisResult | null;
  imageChatHistory: ChatMessage[];
  isAnalyzing: boolean;
  isAnalyzingImage: boolean;
  error: string | null;
  chatHistory: ChatMessage[];
  customApiKey: string;
  customApiProvider: string;
  customApiModel: string;
  activeTab: AppTab;
  filters: DataFilterState;
  isCleaningModalOpen: boolean;
  setIsCleaningModalOpen: (open: boolean) => void;
  setActiveTab: (tab: AppTab) => void;
  setCustomApiKey: (key: string) => void;
  setCustomApiProvider: (provider: string) => void;
  setCustomApiModel: (model: string) => void;
  uploadFile: (file: File) => Promise<void>;
  uploadImageFile: (file: File) => Promise<void>;
  loadSampleDataset: (sampleId: string) => void;
  loadSampleImage: (sampleId?: string) => Promise<void>;
  convertImageToDataset: () => void;
  exportImageTableToCsv: () => void;
  sendChatMessage: (query: string) => Promise<void>;
  sendImageChatMessage: (query: string) => Promise<void>;
  clearDataset: () => void;
  clearActiveImage: () => void;
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
  const [activeImage, setActiveImage] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [imageChatHistory, setImageChatHistory] = useState<ChatMessage[]>([]);
  const [customApiKey, setCustomApiKeyState] = useState<string>('');
  const [customApiProvider, setCustomApiProviderState] = useState<string>('auto');
  const [customApiModel, setCustomApiModelState] = useState<string>('');
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
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

  const uploadImageFile = async (file: File) => {
    setIsAnalyzingImage(true);
    setError(null);
    try {
      const result = await analyzeImageFile(file, customApiKey, customApiProvider, customApiModel);
      setActiveImage(result);
      setActiveTab('vision');
      setImageChatHistory([
        {
          id: `img-msg-${Date.now()}`,
          sender: 'ai',
          text: `Successfully analyzed **${result.fileName}** (${result.detectedVisuals?.dimensions || 'Resolution OK'}, ${result.fileSize}).\n\n${result.summary}\n\nYou can inspect the extracted metrics, switch chart types, view the data table, or ask any question!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error('Image Upload Error:', err);
      setError(err.message || 'Failed to analyze uploaded image');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|svg|gif|bmp)$/i.test(file.name)) {
      return uploadImageFile(file);
    }

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

  const loadSampleImage = async (sampleId?: string) => {
    const target = SAMPLE_IMAGES[0];
    if (target) {
      setIsAnalyzingImage(true);
      setError(null);
      try {
        const res = await fetch(target.dataUrl);
        const blob = await res.blob();
        const file = new File([blob], target.fileName, { type: 'image/svg+xml' });
        await uploadImageFile(file);
      } catch (e: any) {
        setError(e.message || 'Failed to load sample image');
        setIsAnalyzingImage(false);
      }
    }
  };

  const convertImageToDataset = () => {
    if (!activeImage || !activeImage.extractedTable || activeImage.extractedTable.dataObjects.length === 0) {
      setError('No structured tabular data available to convert into a dataset.');
      return;
    }
    try {
      const cleanFileName = activeImage.fileName.replace(/\.[^/.]+$/, "") + '_extracted.csv';
      const analysis = analyzeDataArray(activeImage.extractedTable.dataObjects, cleanFileName, activeImage.fileSize);
      setOriginalDataset(analysis);
      setCurrentDataset(analysis);
      setFiltersState({});
      setActiveTab('dashboard');
      setChatHistory([
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: `Successfully promoted extracted image data from **${activeImage.fileName}** to a live interactive dataset (${analysis.rowCount} rows, ${analysis.columnCount} columns)!\n\nAll dashboard charts, correlations, and cleaning tools are now active.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setError(`Failed to convert image data: ${err.message}`);
    }
  };

  const exportImageTableToCsv = () => {
    if (!activeImage?.extractedTable) return;
    const { headers, rows } = activeImage.extractedTable;
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeImage.fileName.replace(/\.[^/.]+$/, "")}_extracted.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendImageChatMessage = async (query: string) => {
    if (!query.trim() || !activeImage) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-img-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp
    };
    setImageChatHistory(prev => [...prev, userMsg]);
    setIsAnalyzingImage(true);
    try {
      const reply = await askImageQuestion(activeImage, query, customApiKey, customApiProvider, customApiModel);
      const aiMsg: ChatMessage = {
        id: `ai-img-${Date.now()}`,
        sender: 'ai',
        text: reply.text,
        chart: reply.chart,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setImageChatHistory(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setImageChatHistory(prev => [
        ...prev,
        {
          id: `ai-img-err-${Date.now()}`,
          sender: 'ai',
          text: `Error analyzing image query: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const clearActiveImage = () => {
    setActiveImage(null);
    setImageChatHistory([]);
    if (currentDataset) {
      setActiveTab('dashboard');
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
        activeImage,
        imageChatHistory,
        isAnalyzing,
        isAnalyzingImage,
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
        uploadImageFile,
        loadSampleDataset,
        loadSampleImage,
        convertImageToDataset,
        exportImageTableToCsv,
        sendChatMessage,
        sendImageChatMessage,
        clearDataset,
        clearActiveImage,
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
