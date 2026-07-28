import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0A0A12",
        surface: "#141420",
        elevated: "#1B1B2B",
        border: "#28283C",
        muted: "#8D8CA3",
        ink: "#F3F2F8",
        violet: "#8B5CF6",
        pink: "#EC4899",
        cyan: "#22D3EE",
        gold: "#FBBF24",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "signature-gradient": "linear-gradient(115deg, #8B5CF6 0%, #EC4899 50%, #22D3EE 100%)",
        "signature-gradient-soft": "linear-gradient(115deg, rgba(139,92,246,0.18) 0%, rgba(236,72,153,0.18) 50%, rgba(34,211,238,0.18) 100%)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(139,92,246,0.45)",
      },
      keyframes: {
        spin_slow: { to: { transform: "rotate(360deg)" } },
        pulse_bar: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        fade_up: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        spin_slow: "spin_slow 8s linear infinite",
        pulse_bar: "pulse_bar 1.1s ease-in-out infinite",
        fade_up: "fade_up 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
