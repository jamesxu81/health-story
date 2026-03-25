/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        app: '90rem',
      },
      colors: {
        primary: '#0f172a',
        secondary: '#64748b',
        accent: '#06b6d4',
        /** VitalCare-style palette (healthcare_records_app.html) */
        vital: {
          teal: '#1D9E75',
          'teal-hover': '#0F6E56',
          'teal-light': '#E1F5EE',
          'teal-mid': '#5DCAA5',
          coral: '#D85A30',
          'coral-light': '#FAECE7',
          purple: '#7F77DD',
          'purple-light': '#EEEDFE',
          amber: '#BA7517',
          'amber-light': '#FAEEDA',
          blue: '#378ADD',
          'blue-light': '#E6F1FB',
          red: '#E24B4A',
          'red-light': '#FCEBEB',
          green: '#639922',
          'green-light': '#EAF3DE',
          canvas: '#F8F7F4',
          ink: '#2C2C2A',
          muted: '#888780',
          'muted-2': '#B4B2A9',
        },
      },
      screens: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      minHeight: {
        'touch-target': '44px',
      },
      minWidth: {
        'touch-target': '44px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
