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
        'surface-light': '#f1f5f9',
        primary: '#6366f1',
        'primary-hover': '#4f46e5',
        'primary-light': '#818cf8',
        gpt: '#10b981',
        'gpt-light': '#d1fae5',
        'gpt-dark': '#059669',
        claude: '#f59e0b',
        'claude-light': '#fef3c7',
        'claude-dark': '#d97706',
        bedrock: '#8b5cf6',
        'bedrock-light': '#ede9fe',
        'bedrock-dark': '#7c3aed',
        human: '#3b82f6',
        'human-light': '#dbeafe',
        'human-dark': '#2563eb',
        text: '#0f172a',
        'text-secondary': '#475569',
        'text-muted': '#64748b',
        border: '#e2e8f0',
        'border-light': '#f1f5f9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
