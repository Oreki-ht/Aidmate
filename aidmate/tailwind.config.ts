import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-roboto-mono)', 'monospace'],
        secondary: ['var(--font-open-sans)', 'sans-serif'],
      },
      colors: {
        // New color palette
        primary: {
          DEFAULT: "#007BFF",
          light: "#3395FF",
          dark: "#0056b3",
        },
        accent: {
          DEFAULT: "#FF4C4C",
          light: "#FF7373",
          dark: "#E53E3E",
        },
        mint: {
          DEFAULT: "#2ECC71",
          light: "#4DD787",
          dark: "#27AE60",
        },
        surface: {
          DEFAULT: "#F4F6F8",
          dark: "#E8EDF2",
        },
        charcoal: {
          DEFAULT: "#2C3E50",
          light: "#4A6178",
          dark: "#1A2530",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;