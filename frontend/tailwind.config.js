import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.posix.join(__dirname.replace(/\\/g, '/'), 'index.html'),
    path.posix.join(__dirname.replace(/\\/g, '/'), 'src/**/*.{js,jsx,html}'),
    "./index.html",
    "./src/**/*.{js,jsx,html}",
    "./frontend/index.html",
    "./frontend/src/**/*.{js,jsx,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#05070D', // Base Deep Canvas
          900: '#080B14', // Base Mid Layer
          850: '#0B1020', // Base Surface Layer
        },
        charcoal: {
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a', // Primary Dark Charcoal from logo
          950: '#020617', // Pitch Black
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
          cyan: '#06B6D4',
          sky: '#0ea5e9',
        },
        accent: {
          teal: '#004d61', // Logo underline bar
          cyan: '#06B6D4',
          blue: '#3B82F6',
          violet: '#8B5CF6',
          magenta: '#EC4899',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
        'glass-lg': '0 16px 48px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.16)',
        'glow-indigo': '0 0 40px -10px rgba(99, 102, 241, 0.35)',
        'glow-cyan': '0 0 40px -10px rgba(6, 182, 212, 0.35)',
        'glow-violet': '0 0 40px -10px rgba(139, 92, 246, 0.35)',
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
        'glass-deep': '24px',
      },
    },
  },
  plugins: [],
}
