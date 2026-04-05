/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0c',
        card: '#16161e',
        border: '#23232e',
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        emergency: '#ef4444',
      }
    },
  },
  plugins: [],
}
