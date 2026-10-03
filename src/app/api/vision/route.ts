import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, fileName, fileSize = 'Unknown', userQuery, apiKey, provider = 'auto', model } = body;

    if (!image) {
      return NextResponse.json({ error: 'Missing required image parameter' }, { status: 400 });
    }

    const activeApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    // Parse image data URL / base64
    let mimeType = 'image/png';
    let base64Data = image;

    const dataUrlMatch = image.match(/^data:([a-zA-Z0-9\/\-+.]+);base64,(.+)$/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1];
      base64Data = dataUrlMatch[2];
    }

    if (!activeApiKey) {
      return NextResponse.json({ useLocalFallback: true, message: 'No API key provided' });
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

    const promptText = `You are DataPulse AI's elite Multimodal Visual Data Analyst.
Examine this uploaded image carefully:
- File name: ${fileName || 'uploaded-image'}
- File size: ${fileSize}
${userQuery ? `- User's specific focus question: "${userQuery}"` : ''}

Analyze the visual content, graphics, charts, numbers, and labels in this image.
Identify if it is a chart (bar, line, pie, scatter), data table, dashboard screenshot, financial invoice/receipt, infographic, or general visual.

You must respond ONLY with a valid, clean JSON object matching this exact schema:
{
  "imageType": "chart" | "table" | "infographic" | "receipt" | "diagram" | "general",
  "summary": "Concise 2-3 sentence executive breakdown of the visual data and core narrative.",
  "keyInsights": [
    "Key observation or trend #1",
    "Key observation or trend #2",
    "Key observation or anomaly #3"
  ],
  "metrics": [
    {
      "label": "Metric Name",
      "value": "Value with units (e.g. $12.4M or 84.5%)",
      "change": "+14.2% YoY (if discernable)",
      "trend": "up" | "down" | "neutral"
    }
  ],
  "extractedTable": {
    "headers": ["Category / X-Axis", "Metric 1", "Metric 2"],
    "rows": [
      ["Row 1 Label", 120, 45],
      ["Row 2 Label", 180, 52]
    ],
    "dataObjects": [
      { "Category / X-Axis": "Row 1 Label", "Metric 1": 120, "Metric 2": 45 },
      { "Category / X-Axis": "Row 2 Label", "Metric 1": 180, "Metric 2": 52 }
    ]
  },
  "chart": {
    "type": "bar" | "line" | "pie" | "area",
    "title": "Interactive Chart Title Recreated from Image",
    "xAxisKey": "Category / X-Axis",
    "yAxisKey": "Metric 1",
    "data": [
      { "Category / X-Axis": "Row 1 Label", "Metric 1": 120 },
      { "Category / X-Axis": "Row 2 Label", "Metric 1": 180 }
    ]
  }
}

Important formatting requirements:
- Ensure the JSON is valid and strict. Do NOT include text outside the JSON block.
- For extractedTable and chart, capture actual numerical data points and categories present in the image. If there are multiple series, capture them accurately.
- If it's a general photo without numbers, extract meaningful categorical observations and distributions into the table and chart.`;

    // 1. Google Gemini Multimodal
    if (targetProvider === 'gemini') {
      const targetModel = model || 'gemini-1.5-flash';
      let geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${activeApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptText },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      // Fallback model check for Gemini if model fails
      if (!geminiRes.ok && targetModel !== 'gemini-2.0-flash') {
        geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: promptText },
                    {
                      inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                      }
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json'
              }
            })
          }
        );
      }

      if (!geminiRes.ok) {
        const errJson = await geminiRes.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `Gemini API returned HTTP status ${geminiRes.status}`;
        return NextResponse.json({ error: `Google Gemini Vision Error: ${errMsg}`, provider: 'gemini' }, { status: 400 });
      }

      const data = await geminiRes.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = parseVisionJsonResponse(rawText);
        return NextResponse.json({ success: true, analysis: parsed, providerUsed: `Google Gemini (${targetModel})` });
      }
    }

    // 2. OpenAI GPT-4o / GPT-4o-mini Vision
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
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: promptText },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ]
        })
      });

      if (!openAiRes.ok) {
        const errJson = await openAiRes.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `OpenAI API returned HTTP status ${openAiRes.status}`;
        return NextResponse.json({ error: `OpenAI Vision Error: ${errMsg}`, provider: 'openai' }, { status: 400 });
      }

      const data = await openAiRes.json();
      const rawText = data.choices?.[0]?.message?.content;
      if (rawText) {
        const parsed = parseVisionJsonResponse(rawText);
        return NextResponse.json({ success: true, analysis: parsed, providerUsed: `OpenAI (${targetModel})` });
      }
    }

    // 3. Anthropic Claude Vision
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
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mimeType,
                    data: base64Data
                  }
                },
                { type: 'text', text: promptText }
              ]
            }
          ]
        })
      });

      if (!claudeRes.ok) {
        const errJson = await claudeRes.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `Claude API returned HTTP status ${claudeRes.status}`;
        return NextResponse.json({ error: `Anthropic Vision Error: ${errMsg}`, provider: 'claude' }, { status: 400 });
      }

      const data = await claudeRes.json();
      const rawText = data.content?.[0]?.text;
      if (rawText) {
        const parsed = parseVisionJsonResponse(rawText);
        return NextResponse.json({ success: true, analysis: parsed, providerUsed: `Anthropic (${targetModel})` });
      }
    }

    // 4. Groq Vision
    if (targetProvider === 'groq') {
      const targetModel = model || 'llama-3.2-11b-vision-preview';
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeApiKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: promptText },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`
                  }
                }
              ]
            }
          ]
        })
      });

      if (!groqRes.ok) {
        const errJson = await groqRes.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `Groq API returned HTTP status ${groqRes.status}`;
        return NextResponse.json({ error: `Groq Vision Error: ${errMsg}`, provider: 'groq' }, { status: 400 });
      }

      const data = await groqRes.json();
      const rawText = data.choices?.[0]?.message?.content;
      if (rawText) {
        const parsed = parseVisionJsonResponse(rawText);
        return NextResponse.json({ success: true, analysis: parsed, providerUsed: `Groq (${targetModel})` });
      }
    }

    return NextResponse.json({ useLocalFallback: true });
  } catch (error: any) {
    console.error('Vision API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing image analysis', useLocalFallback: true },
      { status: 500 }
    );
  }
}

/**
 * Safely parse JSON from LLM response (handling markdown code blocks if present)
 */
function parseVisionJsonResponse(rawText: string): any {
  let cleaned = rawText.trim();

  // Strip ```json ... ``` wrapper if present
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt fallback heuristic cleanup
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const slice = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(slice);
    }
    throw new Error('Could not parse structured JSON from vision model response.');
  }
}
