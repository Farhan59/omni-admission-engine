/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'omni-blue': '#1D4ED8',
        'omni-dark': '#0F172A',
      }
    },
  },
  plugins: [],
}
