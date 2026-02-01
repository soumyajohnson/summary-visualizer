// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        // Canvas / background
        canvas: {
          dark: "#0B1220",     // deep navy
          grid: "#111A2E",     // subtle grid contrast
        },

        // Primary node (blue / purple)
        node: {
          primary: "#5B6CFF",   // main blue-purple
          primaryDark: "#4A55E8",
        },

        // Decision / action (orange)
        action: {
          DEFAULT: "#FF9F1C",
          dark: "#F08A00",
        },

        // Human / terminal (pink)
        human: {
          DEFAULT: "#FF5C8A",
          dark: "#E94A75",
        },

        // Start / success (green)
        success: {
          DEFAULT: "#22C55E",
          soft: "#4ADE80",
        },

        // Lines / connectors
        wire: {
          orange: "#FF9F1C",
          pink: "#FF5C8A",
          yellow: "#FFC857",
        },

        // Text
        ink: {
          light: "#FFFFFF",
          muted: "#C7D2FE",
        },
      },
    },
  },
  plugins: [],
};

export default config;
