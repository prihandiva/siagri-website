import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        // SIAGRI Design System - sesuai Rancangan Antarmuka
        primary: {
          DEFAULT: "#1B5E20",  // Hijau tua - sidebar, tombol utama
          dark:    "#0d3d11",  // Hover sidebar
          mid:    "#2E7D32",  // Hijau medium
          light:  "#4CAF50",  // Hijau terang - hover state
          50:     "#f0fdf0",
          100:    "#dcfce7",
          200:    "#bbf7d0",
          500:    "#22c55e",
          600:    "#16a34a",
          700:    "#15803d",
          800:    "#166534",
          900:    "#1B5E20",
        },
        accent: {
          yellow: "#F59E0B",  // Kuning - highlight
          blue:   "#3B82F6",  // Biru - info
          purple: "#8B5CF6",  // Ungu - secondary info
          red:    "#EF4444",  // Merah - error/danger
        },
        sidebar: {
          bg:     "#1B5E20",  // Background sidebar
          active: "#2E7D32",  // Item aktif
          hover:  "#15501a",  // Hover item
          text:   "#FFFFFF",  // Teks
          muted:  "#a7c9a8",  // Teks sub
        },
      },
      backgroundImage: {
        "gradient-siagri": "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
