/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e8834a',
          hover: '#d9733a',
          light: '#f09b68',
          dark: '#b85822'
        },
        surface: {
          base: '#09090b',
          card: '#0f1117',
          border: '#27272a'
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
};