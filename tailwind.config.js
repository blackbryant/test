/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#409eff',
        'light-blue': '#f0f7ff',
        'brand-blue': '#3b82f6',
      },
      borderRadius: {
        'xl': '15px',
      }
    },
  },
  plugins: [],
}
