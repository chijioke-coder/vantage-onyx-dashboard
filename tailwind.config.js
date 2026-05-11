/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        onyx: "#0A0A0A",
        neonBlue: "#00E5FF",
        neonAmber: "#FFAB00",
      }
    },
  },
  plugins: [],
}
