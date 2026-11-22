/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        night: {
          950: '#07040F',
          900: '#0C071A',
          800: '#140D29',
        },
        accent: {
          purple: '#7C3AED',
          violet: '#8B5CF6',
          cyan: '#06B6D4',
          electric: '#22D3EE',
        },
      },
      boxShadow: {
        'neon-purple': '0 0 28px rgba(124, 58, 237, 0.45)',
        'neon-cyan': '0 0 24px rgba(6, 182, 212, 0.4)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
};
