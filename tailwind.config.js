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
          navy: '#1E3A8A',  // Personal Mode
          orange: '#F97316', // Business Mode
          light: '#F8FAFC',  // Background
        }
      }
    },
  },
  plugins: [],
}