import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50:  '#f4f7f4',
          100: '#e8f0e8',
          200: '#c8dbc8',
          300: '#9cbd9c',
          400: '#6b9e6b',
          500: '#4a7c59',
          600: '#3a6147',
          700: '#2d4d38',
          800: '#1e3326',
          900: '#0f1a13',
        },
        cream: '#faf8f2',
        forest: '#2d4d38',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
        popIn: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        card: '0 1px 3px rgba(45,58,46,0.08)',
        hover: '0 4px 16px rgba(45,58,46,0.12)',
        modal: '0 20px 60px rgba(45,58,46,0.2)',
      },
    },
  },
  plugins: [],
}

export default config
