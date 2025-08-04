/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB", // Vibrant blue for accents and CTAs
        secondary: "#10B981", // Emerald green for success states
        background: {
          DEFAULT: "#FFFFFF", // Clean white
          light: "#F3F4F6", // Light gray for sections
        },
        text: {
          primary: "#1F2937", // Dark gray for primary text
          secondary: "#6B7280", // Medium gray for secondary text
        },
        accent: "#F59E0B", // Amber for warnings/notifications
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      fontSize: {
        h1: ["3rem", { lineHeight: "1.2" }], // 48px
        h2: ["2.25rem", { lineHeight: "1.2" }], // 36px
        h3: ["1.5rem", { lineHeight: "1.2" }], // 24px
        h4: ["1.25rem", { lineHeight: "1.2" }], // 20px
        body: ["1rem", { lineHeight: "1.5" }], // 16px
        small: ["0.875rem", { lineHeight: "1.5" }], // 14px
      },
      fontWeight: {
        poppins: {
          regular: "400",
          medium: "500",
          semibold: "600",
          bold: "700",
        },
      },
    },
  },
  plugins: [],
};
