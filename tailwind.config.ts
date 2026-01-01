import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    // Custom responsive breakpoints for all device types
    screens: {
      'xs': '360px',   // Small phones (iPhone SE, Galaxy S8)
      'sm': '640px',   // Phones landscape / large phones
      'md': '768px',   // Tablets portrait (iPad Mini)
      'lg': '1024px',  // Tablets landscape / small laptops
      'xl': '1280px',  // Desktop / laptops
      '2xl': '1536px', // Large desktop
      '3xl': '1920px', // Full HD+ / 4K displays
    },
    extend: {
      // Safe area insets for iOS notch/home indicator
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
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
        // Semantic Theme Colors
        theme: {
          bg: {
            light: '#f8fdff',
            dark: '#001219',
          },
          text: {
            light: '#001219',
            dark: '#f8fdff',
            muted: {
              light: '#4b5563', // gray-600
              dark: '#9ca3af',  // gray-400
            }
          },
          border: {
            light: '#e5e7eb', // gray-200
            dark: '#1f2937',  // gray-800
          },
          card: {
            light: '#ffffff',
            dark: '#001a24',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        // Custom sizes for design system (Existing)
        'h1': ['3.5rem', { lineHeight: '1.1', fontWeight: '900', letterSpacing: '-0.02em' }],
        'h2': ['2.5rem', { lineHeight: '1.2', fontWeight: '900', letterSpacing: '-0.01em' }],
        'h3': ['2rem', { lineHeight: '1.3', fontWeight: '900', letterSpacing: '-0.01em' }],
        'h4': ['1.5rem', { lineHeight: '1.4', fontWeight: '800', letterSpacing: '0' }],

        // Extra small for mobile labels/badges
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }], // 10px - very small labels

        // GLOBAL FONT SIZE OVERRIDES (Removed to fix mobile responsiveness)
        // 'xs': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px (was 12px)
        // 'sm': ['1rem', { lineHeight: '1.5rem' }],        // 16px (was 14px)
        // 'base': ['1.125rem', { lineHeight: '1.75rem' }], // 18px (was 16px)
        // 'lg': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px (was 18px)
        // 'xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px (was 20px)
        // '2xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px (was 24px)
        // '3xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px (was 30px)
        // '4xl': ['3rem', { lineHeight: '1' }],             // 48px (was 36px)
        // '5xl': ['3.75rem', { lineHeight: '1' }],          // 60px (was 48px)
        // '6xl': ['4.5rem', { lineHeight: '1' }],           // 72px (was 60px)
        // '7xl': ['6rem', { lineHeight: '1' }],             // 96px (was 72px)
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
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        'glass-hover': '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        'glass-deep': '0 20px 50px 0 rgba(0, 0, 0, 0.2)',
        'deep': '0 20px 50px rgba(0, 95, 115, 0.2)',
        'deeper': '0 30px 70px rgba(0, 95, 115, 0.35)',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '40px',
        '3xl': '60px',
      },
      letterSpacing: {
        'widest': '0.2em',
        'ultra': '0.3em',
      },
      animation: {
        'slide-in-from-bottom': 'slide-in-from-bottom 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'zoom-in-95': 'zoom-in-95 0.5s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
};

export default config;
