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
        background: '#040508',
        surface: '#0d0f14',
        card: '#13161c',
        muted: '#1b2028',
        border: '#2a2f3a',
        accent: {
          DEFAULT: '#00f2ff', // Neon cyan
          muted: '#00c8ff',
          deep: '#005f73',
          glow: 'rgba(0, 242, 255, 0.15)',
        },
        primary: {
          DEFAULT: '#3062ff',
          dark: '#1a3eb3',
        },
        emergency: {
          DEFAULT: '#ff2d4a',
          muted: '#ef4444',
          dark: '#991b1b',
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 242, 255, 0.15)',
        'glow-red': '0 0 30px rgba(255, 45, 74, 0.2)',
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
