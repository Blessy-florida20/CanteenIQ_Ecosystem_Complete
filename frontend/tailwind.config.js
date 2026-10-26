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
        brand: {
          navy: '#0f172a',
          teal: '#0d9488',
          amber: '#d97706',
          slate: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
