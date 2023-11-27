/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      backgroundColor: {
        button: "#2c2f38",
        modal: "#1C1D2D",
      },
    },
  },
  plugins: [],
};
