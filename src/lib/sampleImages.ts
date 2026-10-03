/**
 * High-fidelity Data-URI sample chart images for instant 1-click testing
 */

// SVG 1: Global SaaS Quarterly Revenue & Profit Bar/Line Chart
const sampleChartSvg1 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="cyanBar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#0891b2"/>
    </linearGradient>
    <linearGradient id="purpleBar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#7e22ce"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" rx="16" fill="url(#bgGrad)"/>
  
  <!-- Header -->
  <text x="40" y="50" fill="#f8fafc" font-size="20" font-family="sans-serif" font-weight="bold">Acme Cloud Corp - 2026 Financial Trajectory</text>
  <text x="40" y="74" fill="#94a3b8" font-size="13" font-family="sans-serif">Quarterly Net Revenue vs Operational Expenditure ($ in Thousands)</text>
  
  <!-- Grid Lines -->
  <line x1="80" y1="120" x2="740" y2="120" stroke="#334155" stroke-dasharray="4"/>
  <line x1="80" y1="180" x2="740" y2="180" stroke="#334155" stroke-dasharray="4"/>
  <line x1="80" y1="240" x2="740" y2="240" stroke="#334155" stroke-dasharray="4"/>
  <line x1="80" y1="300" x2="740" y2="300" stroke="#334155" stroke-dasharray="4"/>
  <line x1="80" y1="360" x2="740" y2="360" stroke="#64748b"/>
  
  <!-- Y Axis Labels -->
  <text x="65" y="125" fill="#64748b" font-size="11" font-family="sans-serif" text-anchor="end">$100k</text>
  <text x="65" y="185" fill="#64748b" font-size="11" font-family="sans-serif" text-anchor="end">$75k</text>
  <text x="65" y="245" fill="#64748b" font-size="11" font-family="sans-serif" text-anchor="end">$50k</text>
  <text x="65" y="305" fill="#64748b" font-size="11" font-family="sans-serif" text-anchor="end">$25k</text>
  <text x="65" y="365" fill="#64748b" font-size="11" font-family="sans-serif" text-anchor="end">$0</text>
  
  <!-- Q1 Bars -->
  <rect x="130" y="245" width="45" height="115" rx="6" fill="url(#cyanBar)"/>
  <rect x="180" y="290" width="45" height="70" rx="6" fill="url(#purpleBar)"/>
  <text x="177" y="385" fill="#94a3b8" font-size="12" font-family="sans-serif" text-anchor="middle">Q1 2026</text>
  <text x="152" y="235" fill="#22d3ee" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">$48k</text>
  
  <!-- Q2 Bars -->
  <rect x="290" y="210" width="45" height="150" rx="6" fill="url(#cyanBar)"/>
  <rect x="340" y="278" width="45" height="82" rx="6" fill="url(#purpleBar)"/>
  <text x="337" y="385" fill="#94a3b8" font-size="12" font-family="sans-serif" text-anchor="middle">Q2 2026</text>
  <text x="312" y="200" fill="#22d3ee" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">$62k</text>
  
  <!-- Q3 Bars -->
  <rect x="450" y="190" width="45" height="170" rx="6" fill="url(#cyanBar)"/>
  <rect x="500" y="268" width="45" height="92" rx="6" fill="url(#purpleBar)"/>
  <text x="497" y="385" fill="#94a3b8" font-size="12" font-family="sans-serif" text-anchor="middle">Q3 2026</text>
  <text x="472" y="180" fill="#22d3ee" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">$71k</text>
  
  <!-- Q4 Bars -->
  <rect x="610" y="157" width="45" height="203" rx="6" fill="url(#cyanBar)"/>
  <rect x="660" y="261" width="45" height="99" rx="6" fill="url(#purpleBar)"/>
  <text x="657" y="385" fill="#94a3b8" font-size="12" font-family="sans-serif" text-anchor="middle">Q4 2026</text>
  <text x="632" y="147" fill="#22d3ee" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">$84.5k</text>
  
  <!-- Legend -->
  <rect x="520" y="45" width="12" height="12" rx="3" fill="#22d3ee"/>
  <text x="540" y="56" fill="#f8fafc" font-size="12" font-family="sans-serif">Gross Revenue</text>
  <rect x="645" y="45" width="12" height="12" rx="3" fill="#a855f7"/>
  <text x="665" y="56" fill="#f8fafc" font-size="12" font-family="sans-serif">OpEx</text>
</svg>
`.trim();

export const SAMPLE_CHART_IMAGE_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(sampleChartSvg1)}`;

export const SAMPLE_IMAGES = [
  {
    id: 'sample-quarterly-revenue-chart',
    name: 'Sample SaaS Quarterly Revenue & OpEx Chart',
    fileName: 'saas_quarterly_financials_chart.png',
    description: 'Quarterly breakdown of gross revenue, operational expenditures, and margin expansion for Acme Cloud Corp.',
    dataUrl: SAMPLE_CHART_IMAGE_DATA_URL,
    fileSize: '48.2 KB'
  }
];
