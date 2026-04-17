import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0a0a0b',
          charcoal: '#111113',
          graphite: '#1c1c20',
          'graphite-light': '#252529',
          border: '#2e2e34',
          'border-light': '#3d3d45',
          copper: '#b87333',
          'copper-light': '#d4924a',
          'copper-glow': '#e8a86a',
          text: '#f0ece8',
          'text-secondary': '#9a9494',
          'text-muted': '#5a5560',
        },
      },
      maxWidth: { site: '1280px' },
    },
  },
  plugins: [],
}

export default config
