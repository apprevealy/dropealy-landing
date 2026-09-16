/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        revealy: {
          purple: '#9333ea',
          violet: '#7c3aed',
          dark: '#0a0512',
        },
      },
      fontFamily: {
        display: ['Manrope', 'Arial', 'Helvetica', 'sans-serif'],
        articulat: ['Manrope', 'Arial', 'Helvetica', 'sans-serif'],
        albert: ['Albert Sans', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
