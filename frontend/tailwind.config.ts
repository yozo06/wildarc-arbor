export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0',
          300: '#86efac', 400: '#4ade80', 500: '#22c55e',
          600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d'
        },
        brand: {
          forest:        '#2A5934',
          'forest-light':'#EAF3DE',
          'forest-mid':  '#639922',
          gold:          '#D8A419',
          earth:         '#8B5E3C',
          offwhite:      '#F7F5EE',
          night:         '#1C2B1F',
          muted:         '#6B7B6F',
        }
      }
    }
  },
  plugins: []
}
