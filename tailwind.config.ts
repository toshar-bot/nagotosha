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
        bg: '#f7f1e7',
        surface: '#fffaf1',
        raised: '#ffffff',
        border: '#e4d4bd',
        accent: '#c9412d',
        gold: '#b8872f',
      },
      fontFamily: {
        sans: ['-apple-system','BlinkMacSystemFont','"Hiragino Sans"','"Noto Sans JP"','sans-serif'],
      },
      animation: {
        'shake': 'shake 0.12s ease-in-out infinite',
        'pack-burst': 'pack-burst 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards',
        'card-rise': 'card-rise 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'flash': 'flash 0.4s ease-out forwards',
        'glow-breathe': 'glow-breathe 2.5s ease-in-out infinite',
        'toshar-float': 'toshar-float 3s ease-in-out infinite',
        'fade-up': 'fade-up 0.4s ease-out forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-border': 'pulse-border 2s ease-in-out infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '15%': { transform: 'translateX(-7px) rotate(-4deg)' },
          '30%': { transform: 'translateX(7px) rotate(4deg)' },
          '45%': { transform: 'translateX(-5px) rotate(-2deg)' },
          '60%': { transform: 'translateX(5px) rotate(2deg)' },
          '75%': { transform: 'translateX(-3px) rotate(-1deg)' },
          '90%': { transform: 'translateX(3px) rotate(1deg)' },
        },
        'pack-burst': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '40%': { transform: 'scale(1.35)', opacity: '0.7' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },
        'card-rise': {
          '0%': { transform: 'translateY(90px) scale(0.75)', opacity: '0' },
          '60%': { transform: 'translateY(-12px) scale(1.04)', opacity: '1' },
          '80%': { transform: 'translateY(4px) scale(0.98)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        flash: {
          '0%': { opacity: '0' },
          '40%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'glow-breathe': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'toshar-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-border': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
