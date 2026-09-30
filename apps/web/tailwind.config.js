/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rift: {
          bg: '#050805',
          surface: '#0a100a',
          surfaceHover: '#111a11',
          primary: '#22c55e',
          primaryGlow: 'rgba(34, 197, 94, 0.5)',
          secondary: '#4d6b4d',
          textMuted: '#9dbf9d',
          textWarm: '#e2f0e2',
        },
        rarity: {
          common: '#9ca3af',
          uncommon: '#22c55e',
          rare: '#3b82f6',
          epic: '#a855f7',
          legendary: '#f59e0b',
          mythic: '#ef4444',
        }
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
