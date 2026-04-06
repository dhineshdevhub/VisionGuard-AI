/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        card: '#ffffff',
        muted: '#f1f5f9',
        border: '#e2e8f0',
        accent: {
          DEFAULT: '#0891b2', // cyan-600
          light: '#ecfeff',
          deep: '#155e75',
          glow: 'rgba(8, 145, 178, 0.1)',
        },
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1e40af',
        },
        emergency: {
          DEFAULT: '#dc2626',
          muted: '#ef4444',
          dark: '#991b1b',
        }
      },
      boxShadow: {
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(8, 145, 178, 0.1)',
        'glow-red': '0 0 20px rgba(220, 38, 38, 0.15)',
      },
      borderWidth: {
        '1': '1px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scanline 2s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        }
      }
    },
  },
  plugins: [],
}
