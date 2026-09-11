/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1C1B2E',
        bg: '#F5F3FF',
        periwinkle: {
          DEFAULT: '#5B5FEF',
          deep: '#3A3DB0',
          pale: '#E7E5FF',
        },
        marigold: {
          DEFAULT: '#FFB238',
          deep: '#E0910D',
          pale: '#FFF3D6',
        },
        coral: {
          DEFAULT: '#FF5C5C',
          pale: '#FFE3E1',
        },
        grass: {
          DEFAULT: '#2FBF86',
          pale: '#DFF7EC',
          dark: '#08281C',
        },
        card: {
          DEFAULT: '#FFFFFF',
          marigold: '#FFF3D6',
          grass: '#DFF7EC',
          coral: '#FFE3E1',
        },
        line: '#E4E1F5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Baloo 2"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'neo': '6px 6px 0px rgba(28,27,46,0.9)',
        'neo-sm': '4px 4px 0px rgba(28,27,46,0.9)',
        'neo-xs': '2px 2px 0px rgba(28,27,46,0.9)',
        'neo-lg': '8px 8px 0px rgba(28,27,46,0.9)',
      },
      borderRadius: {
        'neo': '22px',
        'neo-lg': '28px',
      }
    },
  },
  plugins: [],
}
