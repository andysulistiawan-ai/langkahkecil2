/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Light mode defaults
        surface: {
          DEFAULT: '#f8f9fa',
          dim: '#d9dadb',
          bright: '#f8f9fa',
          lowest: '#ffffff',
          low: '#f3f4f5',
          container: '#edeeef',
          high: '#e7e8e9',
          highest: '#e1e3e4',
          variant: '#e1e3e4',
        },
        primary: {
          DEFAULT: '#00677d',
          on: '#ffffff',
          container: '#00add0',
          'on-container': '#003b49',
          fixed: '#b3ebff',
          'fixed-dim': '#53d6fa',
          'on-fixed': '#001f27',
          'on-fixed-variant': '#004e5f',
          inverse: '#53d6fa',
        },
        secondary: {
          DEFAULT: '#006e08',
          on: '#ffffff',
          container: '#71fc62',
          'on-container': '#007309',
          fixed: '#76ff66',
          'fixed-dim': '#56e24b',
        },
        tertiary: {
          DEFAULT: '#ae3100',
          on: '#ffffff',
          container: '#ff7549',
          'on-container': '#681a00',
          fixed: '#ffdbd0',
          'fixed-dim': '#ffb59f',
        },
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      boxShadow: {
        card: '0px 2px 8px rgba(0,0,0,0.04)',
        elevated: '0px 4px 16px rgba(0,0,0,0.08)',
        fab: '0px 6px 20px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
