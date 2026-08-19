# 📊 DataPulse AI — Next-Gen AI Data Analyst & Interactive Dashboard

> An instant, browser-powered AI Data Analyst and interactive visual dashboard suite. Upload heavy CSV, Excel, or JSON datasets to get automated executive summaries, 8 dynamic interactive charts, cross-filtering analytics, automated data cleaning, Pearson correlation heatmaps, and conversational AI insights.

🌐 **Live Application**: [https://ai-data-analyst-beige.vercel.app](https://ai-data-analyst-beige.vercel.app)

---

## ✨ Features

- ⚡ **Multi-Format Heavy Dataset Parser**: Seamlessly parses CSV, Excel (.xlsx, .xls), and JSON files entirely on the client side with instant statistical summaries.
- 📊 **8 Automated Dynamic Visualizations**: Automatically generates Bar, Line, Area, Pie/Doughnut, Scatter, Radar, and Composed charts using Recharts with glassmorphism tooltips.
- 👆 **Interactive Cross-Filtering**: Click any bar, pie slice, or data point on any chart to dynamically filter all other dashboard charts, KPI summary cards, correlation heatmaps, and data tables.
- 🧹 **Automated Data Cleaning Suite**: Interactive modal allowing users to:
  - Eliminate exact duplicate records.
  - Impute missing numeric values (column mean) & text categories (dominant value).
  - Trim text whitespace & normalize casing.
  - Drop high-null columns (>40% missing).
  - Filter extreme statistical outliers (>3σ).
  - View live Quality Score audit previews ( ightarrow 100/100$).
- 📈 **Pearson Correlation Heatmap**: Automatic pairwise statistical correlation matrix (-1.0 to +1.0) with positive (cyan) and inverse (rose) color indicators.
- 🤖 **Conversational AI Intelligence**: Ask plain-English questions about your dataset powered by Google Gemini AI with intelligent fallback to local statistical heuristics.
- 📥 **One-Click CSV Export**: Download cleaned and filtered data subsets directly to your machine.
- 🌓 **Adaptive Light & Dark Glassmorphism UI**: Beautiful high-contrast interface optimized for both Light and Dark themes.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Glassmorphic design
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Parsing**: [Papaparse](https://www.papaparse.com/) & [SheetJS (XLSX)](https://sheetjs.com/)
- **AI Integration**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)

---

## 🚀 Live Demo & Installation

### Live Web App
Experience the live application online at:
👉 **[https://ai-data-analyst-beige.vercel.app](https://ai-data-analyst-beige.vercel.app)**

---

### Local Quick Start

### Prerequisites
- Node.js 18+ and npm installed.

### 1. Clone the Repository
`ash
git clone https://github.com/om-jena27/ai-data-analyst.git
cd ai-data-analyst
`

### 2. Install Dependencies
`ash
npm install
`

### 3. Run Development Server
`ash
npm run dev
`

Open [https://ai-data-analyst-beige.vercel.app](https://ai-data-analyst-beige.vercel.app) or local server at `http://localhost:3000` to view the app!

---

## 🔑 Environment Variables (Optional)

Create a .env.local file in the root directory to provide a default Gemini API Key for conversational AI:

`env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
`

*(Note: Users can also input their own custom Gemini API Key directly inside the app UI).*

---

## 📂 Project Structure

`
ai-data-analyst/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts        # Gemini AI API route
│   │   ├── globals.css              # Custom Tailwind & Glassmorphism styles
│   │   ├── layout.tsx               # Root layout & theme provider
│   │   └── page.tsx                 # Main dashboard application page
│   ├── components/
│   │   ├── AiChatAssistant.tsx      # AI Chat sidebar interface
│   │   ├── CorrelationHeatmap.tsx   # Pearson correlation matrix component
│   │   ├── DashboardFilters.tsx     # Global slicers & search controls
│   │   ├── DashboardGrid.tsx        # Grid container for dynamic charts
│   │   ├── DataCleaningModal.tsx    # Data cleaning suite modal
│   │   ├── DataOverviewTable.tsx    # Interactive data preview table
│   │   ├── DynamicChart.tsx         # Recharts wrapper with click handlers
│   │   ├── ExecutiveSummary.tsx     # KPI metrics & AI automated summary
│   │   ├── FileUploader.tsx         # Drag & drop file upload zone
│   │   └── Navbar.tsx               # Top glassmorphic header navigation
│   ├── context/
│   │   └── DataContext.tsx          # Centralized React state management
│   └── lib/
│       ├── aiEngine.ts              # Gemini AI query integration
│       ├── dataProcessor.ts         # Statistical engine & cleaning functions
│       └── sampleData.ts            # Pre-built sample datasets
└── package.json
`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
