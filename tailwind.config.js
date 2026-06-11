/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFF5ED",
          100: "#FFE8D6",
          200: "#FFD1AA",
          300: "#FFB77A",
          400: "#FF9E52",
          500: "#FF8C42",
          600: "#E57230",
          700: "#CC5C20",
          800: "#9E4515",
          900: "#6B2D0D",
        },
        secondary: {
          50: "#F0F5F1",
          100: "#D9E5DC",
          200: "#B3CCBA",
          300: "#86AF91",
          400: "#62946F",
          500: "#4A7C59",
          600: "#3A6347",
          700: "#2D4C37",
          800: "#1F3426",
          900: "#131F17",
        },
        cream: {
          50: "#FEFCFA",
          100: "#FDF8F3",
          200: "#FAF0E6",
          300: "#F5E4D3",
          400: "#EDD4BC",
          500: "#E3C2A3",
        },
        warmgray: {
          50: "#F9F8F7",
          100: "#F0EEEC",
          200: "#E0DDD9",
          300: "#C9C4BD",
          400: "#AAA39B",
          500: "#8B8680",
          600: "#6E6964",
          700: "#57534E",
          800: "#44403C",
          900: "#3D3A36",
        },
      },
      fontFamily: {
        display: ['"Noto Serif SC"', "serif"],
        body: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(61, 58, 54, 0.08)",
        "card-hover": "0 8px 30px -4px rgba(61, 58, 54, 0.12)",
        soft: "0 2px 8px -1px rgba(61, 58, 54, 0.06)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-ring": "pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "50%": { transform: "scale(1.2)", opacity: "0" },
          "100%": { transform: "scale(0.9)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
