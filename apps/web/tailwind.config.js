/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Custom color palette for the game
        primary: '#b6b0ff',
        secondary: '#5b5880',
        game: {
          bg: '#100E12',
          panel: '#1a1a2e',
          card: '#252540',
          accent: '#b6b0ff', // Updated to match primary
          success: '#00ff88',
          warning: '#ffaa00',
          error: '#ff4444',
        },
      },
      fontFamily: {
        sans: ['Orbitron', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        wiggle: 'wiggle 0.3s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
