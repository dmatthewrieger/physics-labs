/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        paper: "#f7f9fc",
        marine: "#0f766e",
        field: "#2563eb",
        ember: "#d97706",
        berry: "#be123c"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(23, 32, 38, 0.09)"
      }
    }
  },
  plugins: []
};
