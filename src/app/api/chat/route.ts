import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, datasetSummary, apiKey, provider = 'auto', model, isTest } = body;

    const activeApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!activeApiKey) {
      if (isTest) {
        return NextResponse.json({ success: false, error: 'No API Key provided.' }, { status: 400 });
      }
      return NextResponse.json({ useLocalFallback: true });
    }

    // Determine target provider
    let targetProvider = provider;
    if (targetProvider === 'auto') {
      if (activeApiKey.startsWith('AIza')) {
        targetProvider = 'gemini';
      } else if (activeApiKey.startsWith('sk-ant-')) {
        targetProvider = 'claude';
      } else if (activeApiKey.startsWith('gsk_')) {
        targetProvider = 'groq';
      } else if (activeApiKey.startsWith('ds-')) {
        targetProvider = 'deepseek';
      } else if (activeApiKey.startsWith('sk-')) {
        targetProvider = 'openai';
      } else {
        targetProvider = process.env.GEMINI_API_KEY ? 'gemini' : 'openai';
      }
    }

    // Handle Connection Test Mode
    if (isTest) {
      const testResult = await runConnectionTest(activeApiKey, targetProvider, model);
      return NextResponse.json(testResult);
    }

    if (!query || !datasetSummary) {
      return NextResponse.json({ error: 'Missing required query or datasetSummary' }, { status: 400 });
    }

    const systemPrompt = `You are an expert AI Data Analyst. Analyze the dataset schema and answer the user question accurately.

Dataset Summary:
- File Name: ${datasetSummary.fileName}
- Rows: ${datasetSummary.rowCount}, Columns: ${datasetSummary.columnCount}
- Columns Metadata: ${JSON.stringify(datasetSummary.columns.map((c: any) => ({ name: c.name, type: c.type, mean: c.mean, sum: c.sum, topCategories: c.topCategories })))}
- Sample Data (First 5 rows): ${JSON.stringify(datasetSummary.sampleData?.slice(0, 5) || [])}

User Question: "${query}"

Guidelines:
- Provide a clear, structured, and professional analysis with bullet points or key stats.
- If relevant to the user query, you may include visual chart data or table breakdowns. If so, include a single JSON block at the end of your response formatted exactly like this:
\`\`\`json
{
  "chart": {
    "type": "bar", // 'bar' | 'line' | 'pie'
    "title": "Chart Title",
    "xAxisKey": "category",
    "yAxisKey": "value",
    "data": [{"category": "A", "value": 100}]
  }
}
\`\`\``;

    // 1. Google Gemini API
    if (targetProvider === 'gemini') {
      const targetModel = model || 'gemini-1.5-flash';
      let geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${activeApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        }
      );

      // Fallback model check for Gemini if selected model fails
      if (!geminiRes.ok && targetModel !== 'gemini-2.0-flash') {
        geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }]
            })
          }
        );
      }

      if (!geminiRes.ok) {
        const errJson = await geminiRes.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `Gemini API returned HTTP status ${geminiRes.status}`;
        return NextResponse.json({ error: `Google Gemini API Error: ${errMsg}`, provider: 'gemini' }, { status: 400 });
      }

      const data = await geminiRes.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText) {
        const parsed = parseStructuredResponse(rawText);
        return NextResponse.json({ ...parsed, providerUsed: 'Google Gemini' });
      }
    }

    // 2. OpenAI API
    if (targetProvider === 'openai') {
      const targetModel = model || 'gpt-4o-mini';
      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeApiKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'system', content: systemPrompt }]
        })
      });

      if (!openAiRes.ok) {
        const errJson = await openAiRes.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `OpenAI API returned HTTP status ${openAiRes.status}`;
        return NextResponse.json({ error: `OpenAI API Error: ${errMsg}`, provider: 'openai' }, { status: 400 });
      }

      const data = await openAiRes.json();
      const rawText = data.choices?.[0]?.message?.content;
      if (rawText) {
        const parsed = parseStructuredResponse(rawText);
        return NextResponse.json({ ...parsed, providerUsed: `OpenAI (${targetModel})` });
      }
    }

    // 3. Anthropic Claude API
    if (targetProvider === 'claude') {
      const targetModel = model || 'claude-3-5-haiku-20241022';
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': activeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: targetModel,
          max_tokens: 1024,
          messages: [{ role: 'user', content: systemPrompt }]
        })
      });

      if (!claudeRes.ok) {
        const errJson = await claudeRes.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `Anthropic API returned HTTP status ${claudeRes.status}`;
        return NextResponse.json({ error: `Anthropic API Error: ${errMsg}`, provider: 'claude' }, { status: 400 });
      }

      const data = await claudeRes.json();
      const rawText = data.content?.[0]?.text;
      if (rawText) {
        const parsed = parseStructuredResponse(rawText);
        return NextResponse.json({ ...parsed, providerUsed: `Anthropic (${targetModel})` });
      }
    }

    // 4. Groq / DeepSeek / Custom OpenAI Compatible API
    if (targetProvider === 'groq' || targetProvider === 'deepseek' || targetProvider === 'custom') {
      const endpoint = targetProvider === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : targetProvider === 'deepseek'
        ? 'https://api.deepseek.com/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const defaultModel = targetProvider === 'groq' ? 'llama-3.3-70b-versatile' : targetProvider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';
      const targetModel = model || defaultModel;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeApiKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'system', content: systemPrompt }]
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `API returned HTTP status ${res.status}`;
        return NextResponse.json({ error: `${targetProvider.toUpperCase()} API Error: ${errMsg}`, provider: targetProvider }, { status: 400 });
      }

      const data = await res.json();
      const rawText = data.choices?.[0]?.message?.content;
      if (rawText) {
        const parsed = parseStructuredResponse(rawText);
        return NextResponse.json({ ...parsed, providerUsed: `${targetProvider.toUpperCase()} (${targetModel})` });
      }
    }

    return NextResponse.json({ useLocalFallback: true });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error processing AI query', useLocalFallback: true },
      { status: 500 }
    );
  }
}

/**
 * Connection Ping Test Runner
 */
async function runConnectionTest(apiKey: string, provider: string, model?: string) {
  try {
    if (provider === 'gemini') {
      const targetModel = model || 'gemini-1.5-flash';
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, respond with "OK"' }] }]
        })
      });
      if (res.ok) {
        return { success: true, message: `Connected successfully to Google Gemini (${targetModel})!` };
      }
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.error?.message || `Google Gemini HTTP ${res.status}` };
    }

    if (provider === 'claude') {
      const targetModel = model || 'claude-3-5-haiku-20241022';
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: targetModel,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Ping' }]
        })
      });
      if (res.ok) {
        return { success: true, message: `Connected successfully to Anthropic Claude (${targetModel})!` };
      }
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.error?.message || `Anthropic Claude HTTP ${res.status}` };
    }

    // OpenAI / Groq / DeepSeek / Custom
    const endpoint = provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : provider === 'deepseek'
      ? 'https://api.deepseek.com/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    const defaultModel = provider === 'groq' ? 'llama-3.3-70b-versatile' : provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';
    const targetModel = model || defaultModel;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: targetModel,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Ping' }]
      })
    });

    if (res.ok) {
      return { success: true, message: `Connected successfully to ${provider.toUpperCase()} (${targetModel})!` };
    }

    const err = await res.json().catch(() => ({}));
    return { success: false, error: err?.error?.message || `${provider.toUpperCase()} HTTP ${res.status}` };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection failed' };
  }
}

/**
 * Extract text and optional embedded JSON chart/table from AI response
 */
function parseStructuredResponse(rawText: string) {
  let text = rawText;
  let chart = undefined;
  let table = undefined;

  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = rawText.match(jsonBlockRegex);

  if (match && match[1]) {
    try {
      const parsedJson = JSON.parse(match[1]);
      if (parsedJson.chart) chart = parsedJson.chart;
      if (parsedJson.table) table = parsedJson.table;
      // Strip json block from visible text for clean rendering
      text = rawText.replace(jsonBlockRegex, '').trim();
    } catch (e) {
      console.warn('Failed to parse embedded JSON chart block:', e);
    }
  }

  return { text, chart, table };
}
