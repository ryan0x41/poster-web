/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./views/**/*.ejs", // If you're using EJS
      "./public/**/*.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };