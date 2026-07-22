import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: { DEFAULT: '#6366f1', soft: '#eef2ff' },
      },
    },
  },
  plugins: [],
} satisfies Config;
