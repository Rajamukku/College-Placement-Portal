/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Parul University Core Colors
        'pu-blue': '#003366',
        'pu-orange': '#FF6600',
        
        // UI Enhancement Palette
        'primary': '#003366',      // PU Blue
        'secondary': '#FF6600',   // PU Orange
        'accent': '#00BFFF',      // Deep Sky Blue for highlights
        'background': '#F7F9FC',  // Light, clean background
        'surface': '#FFFFFF',     // For cards and modals
        'text-primary': '#1F2937',  // Dark gray for text
        'text-secondary': '#6B7280',// Lighter gray for subtitles
        
        // Status Colors
        'success': '#10B981',     // Green
        'warning': '#F59E0B',     // Amber
        'danger': '#EF4444',      // Red
        'info': '#3B82F6',        // Blue
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'), // For styling the resume preview
  ],
}