/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        surface: {
          DEFAULT: '#05070a', // deep pitch black
          card:    '#0c0f16', // obsidian black card
          border:  '#1b2130', // subtle clean dark border
          muted:   '#64748b',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #134e4a 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
      boxShadow: {
        card:  '0 4px 24px rgba(0,0,0,0.4)',
        glow:  '0 0 20px rgba(20,184,166,0.3)',
      },
    },
  },
  plugins: [],
};
