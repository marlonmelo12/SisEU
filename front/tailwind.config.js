/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b3ff',
          300: '#4d94ff',
          400: '#1a75ff',
          500: '#0056e0', // Azul institucional UFC
          600: '#0047b8',
          700: '#003890',
          800: '#002968',
          900: '#001a40',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
