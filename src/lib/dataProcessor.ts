import Papa from 'papaparse';
import {
  ColumnSummary,
  ColumnType,
  DatasetAnalysis,
  DatasetInsight,
  DataCleaningOptions,
  CleaningAuditSummary,
  CorrelationCell,
  CorrelationMatrix
} from './types';

/**
 * Format bytes into human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Infer statistical data type of a column
 */
function inferColumnType(name: string, sampleValues: any[], numericCount: number, validCount: number): ColumnType {
  if (validCount === 0) return 'text';

  const isDateName = /date|time|created|updated|shipped|delivery/i.test(name.trim());
  const dateCount = sampleValues.filter(v => {
    if (v instanceof Date) return true;
    if (typeof v === 'number' && isDateName && v > 10000 && v < 100000) return true;
    if (typeof v === 'string' && v.trim().length >= 4) {
      const parsed = Date.parse(v);
      return !isNaN(parsed) && !/^\d+$/.test(v.trim());
    }
    return false;
  }).length;

  if (isDateName || (sampleValues.length > 0 && dateCount / sampleValues.length > 0.70)) {
    return 'datetime';
  }

  if (validCount > 0 && numericCount / validCount > 0.85) {
    return 'numeric';
  }

  if (sampleValues.length <= 30) {
    return 'categorical';
  }

  return 'text';
}

/**
 * Compute detailed column metrics using single-pass iteration
 */
function computeColumnSummary(name: string, data: Record<string, any>[], totalRows: number): ColumnSummary {
  let nullCount = 0;
  let sum = 0;
  let numericCount = 0;
  let min = Infinity;
  let max = -Infinity;
  const freqMap: Record<string, number> = {};
  let freqKeysCount = 0;
  const sampleValues: any[] = [];
  const numericSample: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const v = data[i]?.[name];
    const isNull = v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v));
    if (isNull) {
      nullCount++;
    } else {
      if (sampleValues.length < 5 && !sampleValues.includes(v)) {
        sampleValues.push(v);
      }
      const num = Number(v);
      if (!isNaN(num) && typeof v !== 'boolean') {
        numericCount++;
        sum += num;
        if (num < min) min = num;
        if (num > max) max = num;
        if (numericSample.length < 5000) {
          numericSample.push(num);
        }
      }
      if (freqKeysCount < 100) {
        const strVal = String(v);
        if (!freqMap[strVal]) {
          freqKeysCount++;
        }
        freqMap[strVal] = (freqMap[strVal] || 0) + 1;
      }
    }
  }

  const nullPercentage = Number(((nullCount / totalRows) * 100).toFixed(1));
  const validCount = totalRows - nullCount;
  const colType = inferColumnType(name, sampleValues, numericCount, validCount);
  const isIdName = /(id|_id|uuid|key|code|index|seq|number|num|no|#|item|lineitem|orderid|txid|ref|sku)$/i.test(name.trim());
  const uniqueCount = freqKeysCount >= 100 ? Math.round(validCount * 0.85) : Object.keys(freqMap).length;
  const isIdCol = isIdName || (uniqueCount >= totalRows * 0.85 && (colType === 'numeric' || colType === 'text'));

  const summary: ColumnSummary = {
    name,
    type: colType,
    nullCount,
    nullPercentage,
    uniqueCount,
    isIdColumn: isIdCol,
    sampleValues
  };

  if (colType === 'numeric' && numericCount > 0) {
    summary.min = min === Infinity ? 0 : min;
    summary.max = max === -Infinity ? 0 : max;
    if (!isIdCol) {
      summary.sum = Number(sum.toFixed(2));
      summary.mean = Number((sum / numericCount).toFixed(2));
      if (numericSample.length > 0) {
        numericSample.sort((a, b) => a - b);
        const mid = Math.floor(numericSample.length / 2);
        summary.median = numericSample.length % 2 !== 0 ? numericSample[mid] : Number(((numericSample[mid - 1] + numericSample[mid]) / 2).toFixed(2));
      }
    }
  } else if ((colType === 'categorical' || colType === 'text') && validCount > 0) {
    const sortedCats = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({
        value,
        count,
        percentage: Number(((count / validCount) * 100).toFixed(1))
      }));
    summary.topCategories = sortedCats;
  }

  return summary;
}

/**
 * Generate AI Insights automatically based on column stats
 */
function generateDatasetInsights(columns: ColumnSummary[], totalRows: number, data: Record<string, any>[]): DatasetInsight[] {
  const insights: DatasetInsight[] = [];
  let insightId = 1;

  // 1. Missing Data Check
  const highNullCols = columns.filter(c => c.nullPercentage > 15);
  if (highNullCols.length > 0) {
    insights.push({
      id: `ins-${insightId++}`,
      title: 'Missing Data Detected',
      description: `Columns (${highNullCols.map(c => c.name).join(', ')}) contain over 15% missing entries. Data cleaning or imputation recommended.`,
      type: 'quality',
      importance: 'high'
    });
  }

  // 2. High Dominant Category Check
  columns.forEach(col => {
    if (col.topCategories && col.topCategories.length > 0) {
      const top = col.topCategories[0];
      if (top.percentage >= 65 && totalRows > 10) {
        insights.push({
          id: `ins-${insightId++}`,
          title: `Dominant Pattern in ${col.name}`,
          description: `"${top.value}" accounts for ${top.percentage}% of all records in ${col.name}.`,
          type: 'distribution',
          importance: 'medium'
        });
      }
    }
  });

  // 3. Numeric Extreme Variance & Outliers
  const numericCols = columns.filter(c => c.type === 'numeric' && c.min !== undefined && c.max !== undefined && c.mean !== undefined);
  numericCols.forEach(col => {
    if (col.max! > col.mean! * 5 && col.min! >= 0) {
      insights.push({
        id: `ins-${insightId++}`,
        title: `Outliers Detected in ${col.name}`,
        description: `Maximum value (${col.max}) is over 5x higher than the mean (${col.mean}), indicating potential high-value outliers or skewness.`,
        type: 'anomaly',
        importance: 'high'
      });
    }
  });

  // 4. Time series detection
  const dateCol = columns.find(c => c.type === 'datetime');
  const numCol = numericCols[0];
  if (dateCol && numCol) {
    insights.push({
      id: `ins-${insightId++}`,
      title: 'Temporal Trend Ready',
      description: `Dataset contains time-series column (${dateCol.name}) paired with metric (${numCol.name}), enabling trend forecasting and period analysis.`,
      type: 'trend',
      importance: 'info'
    });
  }

  // 5. Correlation Check (between first two numeric columns)
  if (numericCols.length >= 2 && data.length > 5) {
    const colA = numericCols[0];
    const colB = numericCols[1];
    insights.push({
      id: `ins-${insightId++}`,
      title: `Multi-Metric Analysis Available`,
      description: `Strong opportunity to evaluate relationship between key metrics: ${colA.name} vs ${colB.name}.`,
      type: 'correlation',
      importance: 'info'
    });
  }

  return insights;
}

/**
 * Calculate dataset quality score (0 to 100)
 */
function calculateQualityScore(columns: ColumnSummary[], totalRows: number): number {
  if (totalRows === 0 || columns.length === 0) return 0;
  const avgNullPct = columns.reduce((acc, c) => acc + c.nullPercentage, 0) / columns.length;
  const rawScore = 100 - avgNullPct * 1.5;
  return Math.max(10, Math.min(100, Math.round(rawScore)));
}

/**
 * Process Raw Array of Objects into DatasetAnalysis with memory-safe sampling
 */
export function analyzeDataArray(data: Record<string, any>[], fileName: string, fileSizeStr: string): DatasetAnalysis {
  if (!data || data.length === 0) {
    throw new Error('File contains no valid rows or empty data.');
  }

  const totalRows = data.length;

  // Memory-safe column header extraction (inspect first 500 rows instead of flatMap over all rows)
  const colNamesSet = new Set<string>();
  const sampleLimit = Math.min(totalRows, 500);
  for (let i = 0; i < sampleLimit; i++) {
    if (data[i]) {
      Object.keys(data[i]).forEach(k => colNamesSet.add(k));
    }
  }
  const colNames = Array.from(colNamesSet);

  const columns: ColumnSummary[] = colNames.map(colName => {
    return computeColumnSummary(colName, data, totalRows);
  });

  const insights = generateDatasetInsights(columns, totalRows, data);
  const qualityScore = calculateQualityScore(columns, totalRows);

  return {
    fileName,
    fileSize: fileSizeStr,
    rowCount: totalRows,
    columnCount: columns.length,
    columns,
    data,
    insights,
    qualityScore
  };
}

/**
 * Parse uploaded file (CSV, Excel, JSON)
 */
export async function parseUploadedFile(file: File): Promise<DatasetAnalysis> {
  const fileName = file.name;
  const fileSizeStr = formatBytes(file.size);
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (extension === 'csv' || extension === 'txt') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        fastMode: true,
        complete: (results) => {
          try {
            const parsed = analyzeDataArray(results.data as Record<string, any>[], fileName, fileSizeStr);
            resolve(parsed);
          } catch (err: any) {
            reject(err);
          }
        },
        error: (err) => {
          reject(new Error(`CSV Parse Error: ${err.message}`));
        }
      });
    });
  } else if (extension === 'xlsx' || extension === 'xls') {
    const XLSX = await import('xlsx');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
    return analyzeDataArray(jsonData, fileName, fileSizeStr);
  } else if (extension === 'json') {
    const text = await file.text();
    let jsonData = JSON.parse(text);
    if (!Array.isArray(jsonData)) {
      if (typeof jsonData === 'object' && jsonData !== null) {
        // try to find first array property
        const arrayKey = Object.keys(jsonData).find(k => Array.isArray(jsonData[k]));
        if (arrayKey) {
          jsonData = jsonData[arrayKey];
        } else {
          jsonData = [jsonData];
        }
      }
    }
    return analyzeDataArray(jsonData, fileName, fileSizeStr);
  } else {
    throw new Error(`Unsupported file format .${extension}. Please upload CSV, Excel (.xlsx/.xls), or JSON.`);
  }
}

/**
 * Execute User Data Cleaning Transformations
 */
export function executeDataCleaning(
  analysis: DatasetAnalysis,
  options: DataCleaningOptions
): { cleanedAnalysis: DatasetAnalysis; audit: CleaningAuditSummary } {
  const originalRowCount = analysis.rowCount;
  const qualityScoreBefore = analysis.qualityScore;

  let rows: Record<string, any>[] = analysis.data.map(r => ({ ...r }));
  let columns = [...analysis.columns];
  let duplicatesRemoved = 0;
  let missingValuesImputed = 0;
  let columnsDropped: string[] = [];
  let outliersRemoved = 0;

  // 1. Trim Whitespace
  if (options.trimWhitespace) {
    rows = rows.map(row => {
      const cleanedRow: Record<string, any> = {};
      Object.entries(row).forEach(([k, v]) => {
        if (typeof v === 'string') {
          cleanedRow[k] = v.trim().replace(/\s+/g, ' ');
        } else {
          cleanedRow[k] = v;
        }
      });
      return cleanedRow;
    });
  }

  // 2. Drop High-Null Columns (>40% missing)
  if (options.dropHighNullColumns) {
    const highNullCols = columns.filter(c => c.nullPercentage > 40).map(c => c.name);
    if (highNullCols.length > 0) {
      columnsDropped = highNullCols;
      rows = rows.map(row => {
        const cleanedRow = { ...row };
        highNullCols.forEach(colName => delete cleanedRow[colName]);
        return cleanedRow;
      });
    }
  }

  // 3. Impute Missing Values (Mean for numeric, Mode/Unknown for text)
  if (options.imputeMissingValues) {
    const colSummaryMap = new Map(columns.map(c => [c.name, c]));
    rows = rows.map(row => {
      const cleanedRow = { ...row };
      Object.keys(cleanedRow).forEach(colName => {
        const val = cleanedRow[colName];
        const isNull = val === null || val === undefined || val === '' || (typeof val === 'number' && isNaN(val));

        if (isNull) {
          missingValuesImputed++;
          const colInfo = colSummaryMap.get(colName);
          if (colInfo?.type === 'numeric' && colInfo.mean !== undefined) {
            cleanedRow[colName] = colInfo.mean;
          } else if (colInfo?.topCategories && colInfo.topCategories.length > 0) {
            cleanedRow[colName] = colInfo.topCategories[0].value;
          } else {
            cleanedRow[colName] = 'Unknown';
          }
        }
      });
      return cleanedRow;
    });
  }

  // 4. Remove Duplicate Rows
  if (options.removeDuplicates) {
    const seen = new Set<string>();
    const deduplicatedRows: Record<string, any>[] = [];

    rows.forEach(row => {
      const rowKey = Object.values(row).join('|');
      if (!seen.has(rowKey)) {
        seen.add(rowKey);
        deduplicatedRows.push(row);
      } else {
        duplicatesRemoved++;
      }
    });

    rows = deduplicatedRows;
  }

  // 5. Remove Extreme Outliers (>3 Std Dev)
  if (options.removeOutliers) {
    const numericCols = columns.filter(c => c.type === 'numeric' && !c.isIdColumn && c.mean !== undefined);
    
    if (numericCols.length > 0) {
      // Calculate standard deviation for each numeric column
      const stdDevMap: Record<string, { mean: number; stdDev: number }> = {};
      numericCols.forEach(col => {
        const vals = rows.map(r => Number(r[col.name])).filter(n => !isNaN(n));
        const mean = col.mean || (vals.reduce((a, b) => a + b, 0) / vals.length);
        const variance = vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / vals.length;
        stdDevMap[col.name] = { mean, stdDev: Math.sqrt(variance) };
      });

      const initialCount = rows.length;
      rows = rows.filter(row => {
        return numericCols.every(col => {
          const val = Number(row[col.name]);
          if (isNaN(val)) return true;
          const { mean, stdDev } = stdDevMap[col.name];
          if (stdDev === 0) return true;
          return Math.abs(val - mean) <= 3 * stdDev;
        });
      });

      outliersRemoved = initialCount - rows.length;
    }
  }

  const cleanedAnalysis = analyzeDataArray(rows, `Cleaned_${analysis.fileName}`, analysis.fileSize);

  const audit: CleaningAuditSummary = {
    originalRowCount,
    cleanedRowCount: cleanedAnalysis.rowCount,
    duplicatesRemoved,
    missingValuesImputed,
    columnsDropped,
    outliersRemoved,
    qualityScoreBefore,
    qualityScoreAfter: cleanedAnalysis.qualityScore
  };

  return { cleanedAnalysis, audit };
}

/**
 * Compute Pearson Correlation Matrix for numeric attributes
 */
export function computeCorrelationMatrix(columns: ColumnSummary[], data: Record<string, any>[]): CorrelationMatrix {
  const numericCols = columns.filter(c => c.type === 'numeric' && !c.isIdColumn).map(c => c.name);

  if (numericCols.length < 2) {
    return { columns: [], cells: [] };
  }

  const colsToUse = numericCols.slice(0, 6); // Limit to top 6 numeric columns for clean grid
  const cells: CorrelationCell[] = [];

  for (let i = 0; i < colsToUse.length; i++) {
    for (let j = 0; j < colsToUse.length; j++) {
      const colA = colsToUse[i];
      const colB = colsToUse[j];

      if (i === j) {
        cells.push({ colA, colB, coefficient: 1.0 });
        continue;
      }

      // Collect valid numeric pairs
      const pairs: [number, number][] = [];
      data.forEach(r => {
        const valA = Number(r[colA]);
        const valB = Number(r[colB]);
        if (!isNaN(valA) && !isNaN(valB)) {
          pairs.push([valA, valB]);
        }
      });

      if (pairs.length < 3) {
        cells.push({ colA, colB, coefficient: 0 });
        continue;
      }

      const meanA = pairs.reduce((acc, p) => acc + p[0], 0) / pairs.length;
      const meanB = pairs.reduce((acc, p) => acc + p[1], 0) / pairs.length;

      let num = 0;
      let denA = 0;
      let denB = 0;

      pairs.forEach(([x, y]) => {
        const diffA = x - meanA;
        const diffB = y - meanB;
        num += diffA * diffB;
        denA += diffA * diffA;
        denB += diffB * diffB;
      });

      const den = Math.sqrt(denA * denB);
      const r = den === 0 ? 0 : Number((num / den).toFixed(2));
      cells.push({ colA, colB, coefficient: r });
    }
  }

  return { columns: colsToUse, cells };
}

/**
 * Export data array to CSV file download
 */
export function exportToCsv(data: Record<string, any>[], fileName: string) {
  const csvStr = Papa.unparse(data);
  const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
