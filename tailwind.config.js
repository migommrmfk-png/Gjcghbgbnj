/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Amiri', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        quran: ['Amiri', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'var(--theme-primary)',
          dark: 'var(--theme-primary-dark)',
          light: 'var(--theme-primary-light)',
        },
        gold: {
          DEFAULT: 'var(--theme-gold)',
          dark: 'var(--theme-gold-dark)',
          light: 'var(--theme-gold-light)',
        },
        accent: 'var(--theme-accent)',
      }
    },
  },
  plugins: [],
}
