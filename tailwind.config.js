/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Trading terminal dark palette
        terminal: {
          950: '#050709',
          900: '#0a0e14',
          850: '#0e131b',
          800: '#131922',
          750: '#18202b',
          700: '#1e2836',
          600: '#283443',
          500: '#364456',
          400: '#4e5d72',
          300: '#718093',
          200: '#a0aec0',
          100: '#e2e8f0',
        },
        bull: {
          DEFAULT: '#00c853',
          light: '#1de985',
          dark: '#009624',
          glow: 'rgba(0, 200, 83, 0.15)',
        },
        bear: {
          DEFAULT: '#ff3b30',
          light: '#ff6b6b',
          dark: '#c8170f',
          glow: 'rgba(255, 59, 48, 0.15)',
        },
        accent: {
          DEFAULT: '#00b4d8',
          light: '#48cae4',
          dark: '#0096c7',
        },
        warning: {
          DEFAULT: '#ffab00',
          light: '#ffd149',
        },
        gold: {
          DEFAULT: '#f5b400',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 180, 216, 0.15)',
        'glow-green': '0 0 20px rgba(0, 200, 83, 0.15)',
        'glow-red': '0 0 20px rgba(255, 59, 48, 0.15)',
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};
