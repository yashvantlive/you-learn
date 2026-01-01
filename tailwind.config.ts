import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        primary: {
          DEFAULT: "#7c3aed", // Violet-600
          hover: "#6d28d9",   // Violet-700
          foreground: "#ffffff"
        },
        secondary: {
          DEFAULT: "#64748b", // Slate-500
          foreground: "#ffffff"
        },
        destructive: "#e11d48", // Rose-600
        border: "#e2e8f0",      // Slate-200
      },
      borderRadius: {
        lg: "1rem",     // Cards
        md: "0.75rem",  // Buttons
      },
      container: {
        center: true,
        padding: "1rem",
        screens: {
          "2xl": "1280px",
        },
      },
    },
  },
  plugins: [],
};
export default config;