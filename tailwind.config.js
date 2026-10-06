/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'Jost', 'Poppins', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        admin: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        primary: {
          50: '#f2f7f4',
          100: '#e1ece6',
          200: '#c3dacd',
          300: '#9ebfae',
          400: '#68977d',
          500: '#3d7758',
          600: '#2d5f45',
          700: '#244c38',
          800: '#1d3d2e',
          900: '#162f23',
        },
        brand: {
          50: '#faf6ed',
          100: '#f4ead1',
          200: '#edd8a7',
          300: '#dfbe73',
          400: '#d1a64b',
          500: '#be9037',
          600: '#a7792c',
          700: '#855b25',
        },
      },
    },
  },
  plugins: [],
};
