// ...existing code...

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f1ff',
          100: '#cce3ff',
          500: '#0d6efd',
          600: '#0a58ca',
        },
      },
    },
  },
  plugins: [],
}

