import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#F3EBE0",
          50: "#FDFAF6",
          100: "#F8F2EA",
          200: "#F0E5D4",
          300: "#E8D9C0",
        },
        primary: {
          DEFAULT: "#C4522A",
          50: "#FDF1EB",
          100: "#FAD9CB",
          200: "#F5B39B",
          300: "#EF8D6B",
          hover: "#A84520",
        },
        warm: {
          200: "#E8D9C8",
          300: "#D4C4B0",
          400: "#C0AE98",
          500: "#9A8470",
          600: "#7A6456",
          700: "#5A4840",
          800: "#3C2E28",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Noto Sans TC"',
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 16px rgba(60,46,40,0.08)",
        "card-lg": "0 8px 32px rgba(60,46,40,0.12)",
      },
      animation: {
        "pulse-slow": "pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in": "fadeIn 0.35s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "wave": "wave 1.4s linear infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        wave: {
          "0%,100%": { transform: "scaleY(0.5)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
