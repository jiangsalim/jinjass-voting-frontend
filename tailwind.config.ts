import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1F3F',
          dark: '#06162E',
          light: '#132D52',
        },
        teal: {
          DEFAULT: '#00C2BA',
          dark: '#00A8A0',
        },
        charcoal: '#374151',
        'gray-light': '#F8F9FA',
        'gray-medium': '#9CA3AF',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;