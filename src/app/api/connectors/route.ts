import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url, type = 'auto' } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'A valid URL is required.' }, { status: 400 });
    }

    const trimmedUrl = url.trim();

    // 1. Google Sheets Detection & Handling
    const isGoogleSheets = /docs\.google\.com\/spreadsheets/i.test(trimmedUrl);

    let fetchUrl = trimmedUrl;
    let defaultFileName = 'google_sheet_data.csv';

    if (isGoogleSheets) {
      // Check if it's already an export or published CSV URL
      if (trimmedUrl.includes('output=csv') || trimmedUrl.includes('format=csv')) {
        fetchUrl = trimmedUrl;
      } else {
        // Extract spreadsheet ID
        const idMatch = trimmedUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (!idMatch || !idMatch[1]) {
          return NextResponse.json(
            { error: 'Invalid Google Sheets URL format. Could not locate spreadsheet ID.' },
            { status: 400 }
          );
        }
        const sheetId = idMatch[1];

        // Extract gid if present
        const gidMatch = trimmedUrl.match(/[#&?]gid=([0-9]+)/);
        const gid = gidMatch && gidMatch[1] ? gidMatch[1] : '0';

        fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
        defaultFileName = `google_sheet_${sheetId.slice(0, 8)}.csv`;
      }
    } else {
      // For general URLs, derive file name from path
      try {
        const parsed = new URL(trimmedUrl);
        const segments = parsed.pathname.split('/').filter(Boolean);
        if (segments.length > 0) {
          defaultFileName = segments[segments.length - 1];
        }
      } catch (e) {
        defaultFileName = 'remote_dataset.csv';
      }
    }

    // Fetch the target resource server-side to avoid CORS restrictions
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'DataPulseAI/1.0 (+https://github.com/om-jena27/ai-data-analyst)',
        Accept: 'text/csv, application/json, text/plain, */*'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Resource not found (HTTP 404). Please verify the link.' },
          { status: 404 }
        );
      }
      if (response.status === 403 || response.status === 401) {
        return NextResponse.json(
          {
            error:
              'Access denied. For Google Sheets, make sure link sharing is set to "Anyone with the link can view".'
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `Remote server responded with HTTP status ${response.status}.` },
        { status: 400 }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    const textData = await response.text();

    // Check if Google returned an HTML login page instead of CSV
    if (isGoogleSheets && textData.includes('<!DOCTYPE html') && textData.includes('ServiceLogin')) {
      return NextResponse.json(
        {
          error:
            'This Google Sheet is private. Please click "Share" in Google Sheets and select "Anyone with the link can view".'
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: textData,
      contentType,
      fileName: defaultFileName,
      sourceUrl: trimmedUrl
    });
  } catch (error: any) {
    console.error('Connector Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch remote dataset.' },
      { status: 500 }
    );
  }
}
