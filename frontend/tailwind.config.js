/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        primary: '#3b82f6',
        'primary-hover': '#2563eb',
        gpt: '#10a37f',
        'gpt-light': '#d1fae5',
        claude: '#d97706',
        'claude-light': '#fef3c7',
        human: '#8b5cf6',
        'human-light': '#ede9fe',
        text: '#1e293b',
        'text-secondary': '#64748b',
        border: '#e2e8f0',
        'border-dark': '#cbd5e1',
      },
    },
  },
  plugins: [],
}
