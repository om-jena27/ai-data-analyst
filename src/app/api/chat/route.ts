import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query, datasetSummary, apiKey } = await req.json();

    const activeApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!query || !datasetSummary) {
      return NextResponse.json({ error: 'Missing required query or datasetSummary' }, { status: 400 });
    }

    if (!activeApiKey) {
      // Fallback response signaling client to use local NLP engine
      return NextResponse.json({ useLocalFallback: true });
    }

    // Call Gemini API if GEMINI_API_KEY or key starts with AIza
    if (activeApiKey.startsWith('AIza') || process.env.GEMINI_API_KEY) {
      const prompt = `You are an expert AI Data Analyst. Analyze the dataset schema and answer the user question accurately.

Dataset Summary:
- File Name: ${datasetSummary.fileName}
- Rows: ${datasetSummary.rowCount}, Columns: ${datasetSummary.columnCount}
- Columns Metadata: ${JSON.stringify(datasetSummary.columns.map((c: any) => ({ name: c.name, type: c.type, mean: c.mean, sum: c.sum, topCategories: c.topCategories })))}
- Sample Data (First 5 rows): ${JSON.stringify(datasetSummary.sampleData.slice(0, 5))}

User Question: "${query}"

Provide a concise, professional answer with bullet points or key stats.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return NextResponse.json({ text });
        }
      }
    }

    return NextResponse.json({ useLocalFallback: true });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error', useLocalFallback: true }, { status: 500 });
  }
}
