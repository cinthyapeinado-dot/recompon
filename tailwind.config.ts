import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#fcf6f6",
          100: "#f8ecee",
          200: "#f2d7dc",
          300: "#e9bac4",
          400: "#db98aa",
          500: "#c67d92"
        },
        sand: {
          50: "#f9f4ef",
          100: "#f2e7dc",
          200: "#e7d6c5",
          300: "#d7bca2"
        },
        ink: {
          50: "#6e655f",
          100: "#302b27",
          200: "#1e1a17"
        }
      },
      boxShadow: {
        soft: "0 16px 40px rgba(28, 20, 16, 0.08)",
        lift: "0 22px 50px rgba(214, 164, 174, 0.18)"
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
        float: {
          "0%, 100%": {
            transform: "translateY(0px)"
          },
          "50%": {
            transform: "translateY(-6px)"
          }
        }
      },
      animation: {
        "fade-up": "fade-up 500ms ease-out both",
        float: "float 4s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;
