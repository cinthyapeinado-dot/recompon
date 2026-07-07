import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: {
          100: "rgba(38, 221, 255, 0.12)",
          200: "rgba(38, 221, 255, 0.18)",
          300: "rgba(38, 221, 255, 0.26)",
          400: "#26ddff",
          500: "#0d98ff"
        },
        sand: {
          50: "#11151b",
          100: "#171c24",
          200: "#232a34",
          300: "#303948"
        },
        ink: {
          50: "#6e798a",
          100: "#d4e0ef",
          200: "#f1f8ff"
        },
        graphite: {
          950: "#090b10",
          900: "#0d1015",
          850: "#11151b",
          800: "#171c24",
          700: "#232a34",
          600: "#303948"
        },
        fog: {
          100: "#f1f8ff",
          200: "#d4e0ef",
          300: "#99a6b8",
          400: "#6e798a"
        },
        accent: {
          300: "#71ecff",
          400: "#26ddff",
          500: "#0d98ff",
          600: "#0a57f8"
        },
        mint: {
          300: "#9adfff",
          400: "#53bfff",
          500: "#178fff"
        },
        danger: {
          400: "#ff7d7d",
          500: "#ff5f74"
        }
      },
      boxShadow: {
        glow: "0 22px 44px rgba(13, 152, 255, 0.2)",
        shell: "0 26px 64px rgba(0, 0, 0, 0.36)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(18px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        pulseline: {
          "0%, 100%": {
            transform: "translateX(-10%)"
          },
          "50%": {
            transform: "translateX(10%)"
          }
        },
        orbit: {
          "0%": {
            transform: "translate3d(-18px, 10px, 0)"
          },
          "50%": {
            transform: "translate3d(14px, -12px, 0)"
          },
          "100%": {
            transform: "translate3d(-18px, 10px, 0)"
          }
        }
      },
      animation: {
        "fade-up": "fade-up 260ms ease-out both",
        pulseline: "pulseline 4s ease-in-out infinite",
        orbit: "orbit 3.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;
