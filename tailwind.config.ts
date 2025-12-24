import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep Sea Color Palette
        primary: {
          DEFAULT: '#005f73',
          50: '#f0f9fb',
          100: '#e0f3f7',
          200: '#b3dce7',
          300: '#86c5d8',
          400: '#4a9fb8',
          500: '#005f73',
          600: '#005566',
          700: '#004559',
          800: '#003d4d',
          900: '#003540',
        },
        secondary: {
          DEFAULT: '#0a9396',
          50: '#f0faf9',
          100: '#d4f4f2',
          200: '#a8e9e6',
          300: '#7cddd9',
          400: '#42d2cd',
          500: '#0a9396',
          600: '#088588',
          700: '#067776',
          800: '#056965',
          900: '#045757',
        },
        accent: {
          DEFAULT: '#ee9b00',
          50: '#fef9f0',
          100: '#fdf3e1',
          200: '#fbe7c3',
          300: '#f9dba5',
          400: '#f4c487',
          500: '#ee9b00',
          600: '#e08c00',
          700: '#c27d00',
          800: '#9d6300',
          900: '#7d4f00',
        },
        ocean: {
          mist: '#f8fdff',
          abyss: '#001219',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        // Custom sizes for design system
        'h1': ['3.5rem', { lineHeight: '1.1', fontWeight: '900', letterSpacing: '-0.02em' }],
        'h2': ['2.5rem', { lineHeight: '1.2', fontWeight: '900', letterSpacing: '-0.01em' }],
        'h3': ['2rem', { lineHeight: '1.3', fontWeight: '900', letterSpacing: '-0.01em' }],
        'h4': ['1.5rem', { lineHeight: '1.4', fontWeight: '800', letterSpacing: '0' }],
      },
      borderRadius: {
        // Design system rounded corners
        'full': '9999px',
        '48': '48px',
        '56': '56px',
        '32': '32px',
        '24': '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'deep': '0 20px 50px rgba(0, 95, 115, 0.2)',
        'deeper': '0 30px 70px rgba(0, 95, 115, 0.35)',
      },
      letterSpacing: {
        'widest': '0.2em',
        'ultra': '0.3em',
      },
      animation: {
        'slide-in-from-bottom': 'slide-in-from-bottom 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'zoom-in-95': 'zoom-in-95 0.5s ease-out',
      },
      keyframes: {
        'slide-in-from-bottom': {
          'from': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in': {
          'from': {
            opacity: '0',
          },
          'to': {
            opacity: '1',
          },
        },
        'zoom-in-95': {
          'from': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};

export default config;
