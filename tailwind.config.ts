import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        glass: {
          dark: "rgba(15, 23, 42, 0.75)",
          light: "rgba(255, 255, 255, 0.65)",
          borderDark: "rgba(255, 255, 255, 0.12)",
          borderLight: "rgba(0, 0, 0, 0.08)",
        },
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          cyan: '#06b6d4',
          violet: '#8b5cf6',
          emerald: '#10b981',
        }
      },
      backgroundImage: {
        'radial-dark': 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.12) 0%, rgba(139, 92, 246, 0.08) 35%, rgba(15, 23, 42, 1) 100%)',
        'radial-light': 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.15) 0%, rgba(139, 92, 246, 0.10) 40%, rgba(248, 250, 252, 1) 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.18)',
        'glass-lg': '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.4)',
        'glow-purple': '0 0 20px -3px rgba(139, 92, 246, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
};

export default config;
