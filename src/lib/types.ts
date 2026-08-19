export type ColumnType = 'numeric' | 'categorical' | 'datetime' | 'text';

export interface CategoryFrequency {
  value: string;
  count: number;
  percentage: number;
}

export interface ColumnSummary {
  name: string;
  type: ColumnType;
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  isIdColumn?: boolean;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  sum?: number;
  sampleValues: (string | number)[];
  topCategories?: CategoryFrequency[];
}

export interface DatasetInsight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'distribution' | 'quality';
  importance: 'high' | 'medium' | 'info';
}

export interface DatasetAnalysis {
  fileName: string;
  fileSize: string;
  rowCount: number;
  columnCount: number;
  columns: ColumnSummary[];
  data: Record<string, any>[];
  insights: DatasetInsight[];
  qualityScore: number;
}

export interface DynamicChartData {
  type: 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'radar' | 'composed';
  title: string;
  description?: string;
  xAxisKey: string;
  yAxisKey: string | string[];
  data: Record<string, any>[];
  colors?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  chart?: DynamicChartData;
  table?: {
    headers: string[];
    rows: any[][];
  };
  sqlQuery?: string;
}

export interface DataCleaningOptions {
  removeDuplicates: boolean;
  imputeMissingValues: boolean;
  dropHighNullColumns: boolean;
  trimWhitespace: boolean;
  removeOutliers: boolean;
}

export interface CleaningAuditSummary {
  originalRowCount: number;
  cleanedRowCount: number;
  duplicatesRemoved: number;
  missingValuesImputed: number;
  columnsDropped: string[];
  outliersRemoved: number;
  qualityScoreBefore: number;
  qualityScoreAfter: number;
}

export interface CorrelationCell {
  colA: string;
  colB: string;
  coefficient: number; // -1.0 to +1.0
}

export interface CorrelationMatrix {
  columns: string[];
  cells: CorrelationCell[];
}

export interface DataFilterState {
  categoryFilter?: string;
  categoryValue?: string;
  searchTerm?: string;
}
