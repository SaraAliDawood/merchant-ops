import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        brand: {
          DEFAULT: '#4f46e5',
          soft: '#eef2ff',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
