import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: "rgb(var(--brand) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 16px 50px rgba(20, 22, 30, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
