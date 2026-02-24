import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#faf9f6",
        ink: "#0f172a",
        sage: {
          100: "#d7e2d5",
          300: "#8ea28b",
          500: "#6f886c"
        },
        blush: {
          100: "#f7e6e3",
          300: "#ddb8b2",
          500: "#bb8f88"
        },
        gold: {
          300: "#e7c76d",
          500: "#d4a437",
          600: "#b88922"
        }
      },
      boxShadow: {
        card: "0 20px 50px rgba(15, 23, 42, 0.08)",
        soft: "0 2px 8px rgba(15, 23, 42, 0.12)"
      },
      borderRadius: {
        xl2: "1rem"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"]
      },
      backgroundImage: {
        "hero-warm": "linear-gradient(135deg, #dd9c55 0%, #f4ca77 45%, #f7dfb2 100%)",
        "paper-glow": "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.85), rgba(250,249,246,0.9) 50%, rgba(250,249,246,0.65) 100%)"
      }
    }
  },
  plugins: []
};

export default config;
