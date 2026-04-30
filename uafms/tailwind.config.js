/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary-color)",
          dark: "var(--primary-dark)",
          light: "var(--primary-light)",
        },
        heading: "var(--heading-color)",
        body: "var(--body-color)",
        muted: "var(--muted-color)",
        surface: "var(--surface-color)",
        bg: "var(--bg-color)",
        border: "var(--border-color)",
        success: "#1DB954",
        warning: "#F5A623",
        danger: "#E53935",
        info: "#1565C0",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        'ticker': 'ticker 60s linear infinite',
        'pulse-slow': 'pulse-slow 8s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.05)' },
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(79, 70, 229, 0.4)',
        'glow-lg': '0 0 40px rgba(79, 70, 229, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
};
