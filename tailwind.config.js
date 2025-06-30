// file: tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff", // Putih
        primary: "#111827", // Abu-abu gelap untuk teks
        secondary: "#6b7280", // Abu-abu lebih terang
        accent: "#3b82f6", // Biru sebagai aksen
      },
    },
  },
  plugins: [],
};
export default config;
