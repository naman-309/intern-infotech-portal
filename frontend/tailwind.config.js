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
        // Primary Brand Colors extracted from logo: Light Blue & Dark Charcoal
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Primary Light Blue from logo
          600: '#0284c7', // Deep Sky Blue
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        charcoal: {
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a', // Primary Dark Charcoal from logo
          950: '#020617', // Pitch Black
        },
        accent: {
          teal: '#004d61', // Logo underline bar
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
