/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8edf5',
          100: '#c5d0e6',
          200: '#9fb0d4',
          300: '#7890c2',
          400: '#5b78b5',
          500: '#3d60a8',
          600: '#2d4f90',
          700: '#1f3a72',
          800: '#142754',
          900: '#0F2147',
          950: '#080f22',
        },
        gold: {
          300: '#e8d5a3',
          400: '#d4b97a',
          500: '#C9A96E',
          600: '#b8913a',
          700: '#9a7520',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
