import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: {
          100: "rgba(83, 213, 255, 0.12)",
          200: "rgba(83, 213, 255, 0.18)",
          300: "rgba(83, 213, 255, 0.26)",
          400: "#35c8ff",
          500: "#179cff"
        },
        sand: {
          50: "#11161d",
          100: "#161c24",
          200: "#202833",
          300: "#2a3441"
        },
        ink: {
          50: "#7b8798",
          100: "#d7dfea",
          200: "#f5f7fb"
        },
        graphite: {
          950: "#05070b",
          900: "#0b0f14",
          850: "#11161d",
          800: "#161c24",
          700: "#202833",
          600: "#2a3441"
        },
        fog: {
          100: "#f5f7fb",
          200: "#d7dfea",
          300: "#a4afbe",
          400: "#7b8798"
        },
        accent: {
          300: "#65d7ff",
          400: "#35c8ff",
          500: "#179cff",
          600: "#1172e6"
        },
        mint: {
          300: "#71f1cd",
          400: "#45e4b7",
          500: "#21c98f"
        },
        danger: {
          400: "#ff7d7d",
          500: "#ff5f74"
        }
      },
      boxShadow: {
        glow: "0 20px 40px rgba(23, 156, 255, 0.18)",
        shell: "0 24px 60px rgba(0, 0, 0, 0.32)"
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
