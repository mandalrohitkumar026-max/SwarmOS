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
        background: '#090d16',
        surface: '#0f172a',
        'surface-subtle': '#1e293b',
        'surface-glass': 'rgba(15, 23, 42, 0.75)',
        'surface-border': '#334155',
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        tactical: {
          cyan: '#00f0ff',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#a855f7',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
