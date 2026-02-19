/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'music-bg': '#0f1117',
        'music-card': '#1a1d27',
        'music-border': '#2a2d3a',
        'music-accent': '#6366f1',
        'music-accent-light': '#818cf8',
      }
    },
  },
  plugins: [],
}
