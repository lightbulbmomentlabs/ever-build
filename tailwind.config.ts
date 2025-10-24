import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Palette
        'charcoal-blue': '#2C3E50',
        'steel-gray': '#95A5A6',
        'everbuild-orange': '#E67E22',
        'concrete-white': '#F4F4F4',
        // Secondary Palette
        'blueprint-teal': '#1ABC9C',
        'sandstone-tan': '#D7BFAE',
        'olive-green': '#7F8C6B',
        // Feedback Colors
        'success-green': '#27AE60',
        'warning-amber': '#F39C12',
        'error-red': '#C0392B',
      },
    },
  },
  plugins: [],
};

export default config;
