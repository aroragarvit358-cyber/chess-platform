/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chess: {
          darkBg: '#302e2b',
          panelBg: '#262421',
          sidebarBg: '#21201d',
          subtleBg: '#272522',
          border: '#3d3b38',
          boardLight: '#ebecd0',
          boardDark: '#779556',
          highlightLast: 'rgba(245, 246, 130, 0.5)',
          highlightSelected: 'rgba(129, 182, 76, 0.5)',
          greenBtn: '#81b64c',
          greenBtnHover: '#a3d160',
          accentOrange: '#f59e0b',
          accentRed: '#e11d48',
          accentBlue: '#38bdf8'
        }
      }
    },
  },
  plugins: [],
}
