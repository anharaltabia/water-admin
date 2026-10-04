/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Tajawal', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#0A3D91',
          sky: '#4FA8E0',
          light: '#E8F4FB',
          dark: '#062B66',
          danger: '#DC2626',
          success: '#16A34A',
        },
      },
    },
  },
  plugins: [],
}
