/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#F4EEEC",
          ink: "#1E1E1E",
          purple: "#5D4AA0",
          purpleDark: "#24145C",
        },
      },
      boxShadow: {
        "brand-pill": "0 6px 16px rgba(36,20,92,0.40)",
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
}
