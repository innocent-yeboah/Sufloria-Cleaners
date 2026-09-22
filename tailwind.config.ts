import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0B3D3A",
        lemon: "#C9A227",
        teal: "#0F5C56",
        gold: "#C9A227",
        "gold-light": "#E8C547",
        "gold-dark": "#8B6914",
        cream: "#F4EFE4",
        light: "#F4EFE4",
        dark: "#1A1A1A",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "Georgia", "serif"],
        script: ["var(--font-script)", "cursive"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px rgba(11, 61, 58, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
