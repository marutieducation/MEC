
module.exports = {
  content: [
    "./src/pages*.{js,ts,jsx,tsx,mdx}",
    "./src/app*.{js,ts,jsx,tsx,mdx}",
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
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        }
      },
    },
  },
  plugins: [],
};
