/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:    { DEFAULT: '#1E3A5F', light: '#2a5180', dark: '#162b47' },
        secondary:  { DEFAULT: '#4F81BD', light: '#6b97c9', dark: '#3a6ba1' },
        accent:     { DEFAULT: '#A7D3F4', light: '#c3e2f9', dark: '#8abfe8' },
        success:    '#5CB85C',
        warning:    '#F0AD4E',
        danger:     '#D9534F',
        slate:      { DEFAULT: '#2C3E50', light: '#3d566e' },
        bgpage:     '#F8FAFC',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px rgba(30,58,95,0.08)',
        'card-hover': '0 8px 28px rgba(30,58,95,0.14)',
        sidebar: '4px 0 24px rgba(30,58,95,0.10)',
      },
      borderRadius: {
        xl2: '1rem',
        xl3: '1.25rem',
      },
    },
  },
  plugins: [],
}
