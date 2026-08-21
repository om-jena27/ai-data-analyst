import { ChatMessage, DatasetAnalysis, DynamicChartData } from './types';

/**
 * Smart Client-Side NLP Data Query Engine
 * Accurately calculates aggregations, top metrics, and builds dynamic charts from natural language questions
 */
export function queryDatasetLocally(userQuery: string, dataset: DatasetAnalysis): { text: string; chart?: DynamicChartData; table?: { headers: string[]; rows: any[][] } } {
  const queryLower = userQuery.toLowerCase();
  const { data, columns, rowCount } = dataset;

  const nonIdNumericCols = columns.filter(c => c.type === 'numeric' && !c.isIdColumn);
  const allNumericCols = columns.filter(c => c.type === 'numeric');
  const numericCols = nonIdNumericCols.length > 0 ? nonIdNumericCols : allNumericCols;

  const catCols = columns.filter(c => (c.type === 'categorical' || c.type === 'text') && !c.isIdColumn);
  const dateCol = columns.find(c => c.type === 'datetime');

  // Helper to find column mentioned in query
  const findMentionedCol = (cols: typeof columns) => {
    return cols.find(c => queryLower.includes(c.name.toLowerCase()));
  };

  const mentionedNumCol = findMentionedCol(numericCols) || numericCols[0];
  const mentionedCatCol = findMentionedCol(catCols) || catCols[0];

  // 1. Total / Sum Queries ("total revenue", "sum of profit", "how much total")
  if (queryLower.includes('total') || queryLower.includes('sum') || queryLower.includes('overall')) {
    const numCol = findMentionedCol(numericCols) || numericCols.find(c => c.sum !== undefined) || numericCols[0];
    if (numCol && numCol.sum !== undefined) {
      const formattedSum = numCol.sum.toLocaleString(undefined, { maximumFractionDigits: 2 });
      
      // If category also mentioned, group by category
      if (mentionedCatCol && numCol) {
        const grouped: Record<string, number> = {};
        data.forEach(row => {
          const key = String(row[mentionedCatCol.name] || 'Unknown');
          const val = Number(row[numCol.name]) || 0;
          grouped[key] = (grouped[key] || 0) + val;
        });

        const chartData = Object.entries(grouped)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, value]) => ({
            [mentionedCatCol.name]: name,
            [numCol.name]: Math.round(value)
          }));

        return {
          text: `The total **${numCol.name}** across all ${rowCount.toLocaleString()} records is **${formattedSum}**.\n\nHere is the breakdown by **${mentionedCatCol.name}**:`,
          chart: {
            type: 'bar',
            title: `Total ${numCol.name} by ${mentionedCatCol.name}`,
            xAxisKey: mentionedCatCol.name,
            yAxisKey: numCol.name,
            data: chartData
          },
          table: {
            headers: [mentionedCatCol.name, `Total ${numCol.name}`],
            rows: chartData.map(d => [d[mentionedCatCol.name], d[numCol.name].toLocaleString()])
          }
        };
      }

      return {
        text: `The overall **${numCol.name}** calculated across ${rowCount.toLocaleString()} records is **${formattedSum}** (Mean: ${numCol.mean}, Min: ${numCol.min}, Max: ${numCol.max}).`
      };
    }
  }

  // 2. Average / Mean Queries ("average salary", "mean profit", "avg rating")
  if (queryLower.includes('average') || queryLower.includes('avg') || queryLower.includes('mean')) {
    const numCol = findMentionedCol(numericCols) || numericCols[0];
    if (numCol && numCol.mean !== undefined) {
      if (mentionedCatCol) {
        const groupedSums: Record<string, number> = {};
        const groupedCounts: Record<string, number> = {};
        data.forEach(row => {
          const key = String(row[mentionedCatCol.name] || 'Unknown');
          const val = Number(row[numCol.name]) || 0;
          groupedSums[key] = (groupedSums[key] || 0) + val;
          groupedCounts[key] = (groupedCounts[key] || 0) + 1;
        });

        const chartData = Object.keys(groupedSums)
          .slice(0, 10)
          .map(key => ({
            [mentionedCatCol.name]: key,
            [`Avg_${numCol.name}`]: Number((groupedSums[key] / groupedCounts[key]).toFixed(2))
          }));

        return {
          text: `The overall average **${numCol.name}** is **${numCol.mean}**.\n\nBelow is the average **${numCol.name}** broken down by **${mentionedCatCol.name}**:`,
          chart: {
            type: 'bar',
            title: `Average ${numCol.name} by ${mentionedCatCol.name}`,
            xAxisKey: mentionedCatCol.name,
            yAxisKey: `Avg_${numCol.name}`,
            data: chartData
          }
        };
      }

      return {
        text: `The average **${numCol.name}** is **${numCol.mean}** (Median: ${numCol.median}).`
      };
    }
  }

  // 3. Highest / Top / Ranking Queries ("top 5", "highest revenue", "best performing")
  if (queryLower.includes('top') || queryLower.includes('highest') || queryLower.includes('best') || queryLower.includes('max')) {
    const numCol = findMentionedCol(numericCols) || numericCols[0];
    const catCol = findMentionedCol(catCols) || catCols[0] || columns[0];

    if (numCol) {
      const sample = data.length > 20000 ? data.slice(0, 20000) : data;
      const sortedRows = [...sample]
        .filter(r => r[numCol.name] !== null && r[numCol.name] !== undefined)
        .sort((a, b) => Number(b[numCol.name]) - Number(a[numCol.name]))
        .slice(0, 5);

      const chartData = sortedRows.map(r => ({
        [catCol.name]: String(r[catCol.name] || 'N/A'),
        [numCol.name]: Number(r[numCol.name])
      }));

      return {
        text: `Here are the **Top 5 records** ordered by **${numCol.name}**:`,
        chart: {
          type: 'bar',
          title: `Top 5 Records by ${numCol.name}`,
          xAxisKey: catCol.name,
          yAxisKey: numCol.name,
          data: chartData
        },
        table: {
          headers: [catCol.name, numCol.name],
          rows: sortedRows.map(r => [r[catCol.name], r[numCol.name]])
        }
      };
    }
  }

  // 4. Trend / Time-Series Queries ("trend", "over time", "monthly", "by date")
  if ((queryLower.includes('trend') || queryLower.includes('time') || queryLower.includes('date') || queryLower.includes('month')) && (dateCol || catCols[0]) && numericCols[0]) {
    const tCol = dateCol || catCols[0];
    const numCol = mentionedNumCol || numericCols[0];

    const sortedData = [...data]
      .filter(r => r[tCol.name] !== undefined)
      .slice(0, 30)
      .map(r => ({
        [tCol.name]: String(r[tCol.name]),
        [numCol.name]: Number(r[numCol.name]) || 0
      }));

    return {
      text: `Analyzed temporal trend for **${numCol.name}** over **${tCol.name}**:`,
      chart: {
        type: 'line',
        title: `${numCol.name} Trend over ${tCol.name}`,
        xAxisKey: tCol.name,
        yAxisKey: numCol.name,
        data: sortedData
      }
    };
  }

  // 5. Distribution / Proportion Queries ("pie chart", "distribution", "breakdown", "percentage")
  if (queryLower.includes('distribution') || queryLower.includes('pie') || queryLower.includes('breakdown') || queryLower.includes('share')) {
    const catCol = mentionedCatCol || catCols[0];
    if (catCol && catCol.topCategories) {
      const chartData = catCol.topCategories.map(c => ({
        name: c.value,
        value: c.count
      }));

      return {
        text: `Distribution of records across **${catCol.name}**:`,
        chart: {
          type: 'pie',
          title: `${catCol.name} Distribution`,
          xAxisKey: 'name',
          yAxisKey: 'value',
          data: chartData
        },
        table: {
          headers: [catCol.name, 'Count', 'Share %'],
          rows: catCol.topCategories.map(c => [c.value, c.count, `${c.percentage}%`])
        }
      };
    }
  }

  // 6. Generic Summary Fallback
  const colOverview = columns.map(c => {
    const isIdStr = c.isIdColumn ? ' (Key / ID)' : '';
    const statsStr = c.mean !== undefined && !c.isIdColumn ? `, mean=${c.mean}` : '';
    return `- **${c.name}** (${c.type}${isIdStr}): ${c.nullCount} missing, ${c.uniqueCount} unique values${statsStr}`;
  }).join('\n');

  const metricName = numericCols[0]?.name || 'Quantity';
  const categoryName = catCols[0]?.name || 'Category';

  return {
    text: `Based on your dataset **${dataset.fileName}** (${rowCount.toLocaleString()} rows, ${columns.length} columns):\n\n${colOverview}\n\n*Tip: Try asking specific questions like "What is the total ${metricName}?", "Show average ${metricName} by ${categoryName}", or "Show top 5 records by ${metricName}".*`
  };
}

/**
 * Main AI Query Handler (tries API route, falls back gracefully to Local NLP Engine)
 */
export async function askAiAnalyst(
  userQuery: string,
  dataset: DatasetAnalysis,
  apiKey?: string,
  provider?: string,
  model?: string
): Promise<ChatMessage> {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: userQuery,
        datasetSummary: {
          fileName: dataset.fileName,
          rowCount: dataset.rowCount,
          columnCount: dataset.columnCount,
          columns: dataset.columns,
          sampleData: dataset.data.slice(0, 10)
        },
        apiKey: apiKey || undefined,
        provider: provider || 'auto',
        model: model || undefined
      })
    });

    const json = await response.json().catch(() => ({}));

    if (response.ok && json.text) {
      const providerSuffix = json.providerUsed ? `\n\n*(Powered by ${json.providerUsed})*` : '';
      return {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: json.text + providerSuffix,
        timestamp,
        chart: json.chart,
        table: json.table,
        sqlQuery: json.sqlQuery
      };
    }

    // If API key was provided but request returned an error, alert user
    if (apiKey && json.error) {
      const localResult = queryDatasetLocally(userQuery, dataset);
      return {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **AI API Error**: ${json.error}\n\n*Falling back to built-in local NLP Data Engine:*\n\n${localResult.text}`,
        timestamp,
        chart: localResult.chart,
        table: localResult.table
      };
    }
  } catch (e: any) {
    console.warn('API Route failed, falling back to local NLP engine:', e);
  }

  // Fallback to client-side smart engine
  const localResult = queryDatasetLocally(userQuery, dataset);
  return {
    id: `msg-${Date.now()}`,
    sender: 'ai',
    text: localResult.text,
    timestamp,
    chart: localResult.chart,
    table: localResult.table
  };
}
