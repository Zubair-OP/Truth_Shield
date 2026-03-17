/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        truth: {
          bg: '#0F172A',
          card: '#1E293B',
          accent: '#2563EB',
          authentic: '#16A34A',
          warning: '#EA580C',
          danger: '#DC2626',
          text: '#F1F5F9',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(37, 99, 235, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(37, 99, 235, 0.65)' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        riseIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        spinSlow: 'spinSlow 4s linear infinite',
        riseIn: 'riseIn 0.6s ease forwards',
      },
    },
  },
  plugins: [],
};
