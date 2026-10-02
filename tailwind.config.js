/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        chango: ['Chango', 'cursive'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        background: '#0B0B0C', // Deep black for background
        primary: '#6028E9', // Purple
      }
    },
  },
  plugins: [],
}
