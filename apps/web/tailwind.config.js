/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'Consolas', 'Menlo', 'monospace'],
      },
      colors: {
        neo: {
          bg: '#f4f4f6',
          canvas: '#ececf0',
          yellow: '#facc15',
          amber: '#fbbf24',
          orange: '#fb923c',
          red: '#f87171',
          rose: '#fb7185',
          blue: '#60a5fa',
          cyan: '#38bdf8',
          emerald: '#34d399',
          purple: '#c084fc',
          pink: '#f472b6',
        },
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo': '3.5px 3.5px 0px 0px #000000',
        'neo-lg': '5px 5px 0px 0px #000000',
        'neo-xl': '7px 7px 0px 0px #000000',
        'neo-blue': '3.5px 3.5px 0px 0px #2563eb',
        'neo-amber': '3.5px 3.5px 0px 0px #d97706',
        'neo-rose': '3.5px 3.5px 0px 0px #e11d48',
        'neo-emerald': '3.5px 3.5px 0px 0px #059669',
      },
    },
  },
  plugins: [],
};
