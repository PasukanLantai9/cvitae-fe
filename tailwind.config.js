// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Tambahkan Poppins ke font sans-serif atau buat key baru
        sans: ['Poppins', 'sans-serif'], // Mengganti font sans default dengan Poppins
        // atau
        // poppins: ['Poppins', 'sans-serif'], // Membuat utilitas font-poppins
      },
      colors: { // Contoh jika Anda ingin menggunakan warna hex langsung di config
        'brand-blue': '#2859A6',
        'brand-blue-dark': '#1e4a8a',
      }
    },
  },
  plugins: [],
}