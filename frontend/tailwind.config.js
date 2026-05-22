/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0B0F19",
          card: "#151D30",
          border: "#24324F",
          text: "#E2E8F0",
        },
        neon: {
          blue: "#06B6D4", // Cyan
          purple: "#6366F1", // Indigo
          pink: "#D946EF", // Fuchsia
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
