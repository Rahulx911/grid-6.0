/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Specify the files where Tailwind classes will be used
  ],
  theme: {
    extend: {
      colors: {
        flipkartBlue: '#2874f0',
        flipkartLight: '#f1f3f6',
      },
    },
  },
  plugins: [],
};
