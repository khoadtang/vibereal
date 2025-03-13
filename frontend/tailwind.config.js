/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b3ff',
          300: '#4d94ff',
          400: '#1a75ff',
          500: '#0066ff',
          600: '#0052cc',
          700: '#003d99',
          800: '#002966',
          900: '#001433',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#333',
            a: {
              color: '#0066ff',
              '&:hover': {
                color: '#004cc2',
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
} 