/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'selector', // Use 'selector' strategy for class-based dark mode
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
