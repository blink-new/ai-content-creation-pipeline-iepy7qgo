/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          '50': '#f2f0ff',
          '100': '#e5e1ff',
          '200': '#cdc9ff', 
          '300': '#afa5ff',
          '400': '#9175ff',
          '500': '#794eff',
          '600': '#6a2bfb',
          '700': '#5e20e9',
          '800': '#4c1bc8',
          '900': '#3f1ca0',
          DEFAULT: '#794eff',
          foreground: '#ffffff'
        },
        secondary: {
          '50': '#eefffd',
          '100': '#c6fffb',
          '200': '#8ffffb',
          '300': '#4afdfc',
          '400': '#19e5eb',
          '500': '#02cbd7',
          '600': '#00a3b5',
          '700': '#038293',
          '800': '#0a6777',
          '900': '#0d5664',
          DEFAULT: '#02cbd7',
          foreground: '#ffffff'
        },
        destructive: {
          DEFAULT: '#ff6b6b',
          foreground: '#ffffff'
        },
        muted: {
          DEFAULT: '#f6f9fc',
          foreground: '#7f8c9f'
        },
        accent: {
          DEFAULT: '#f6f9fc',
          foreground: '#7f8c9f'
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a'
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a'
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        animaker: {
          'purple': '#794eff',
          'purple-light': '#9175ff',
          'purple-dark': '#5e20e9',
          'teal': '#02cbd7',
          'teal-light': '#19e5eb',
          'teal-dark': '#00a3b5',
          'gray': '#f6f9fc',
          'gray-100': '#f6f9fc',
          'gray-200': '#eef1f4',
          'gray-300': '#e4e8ec',
          'gray-400': '#d0d6de',
          'gray-500': '#7f8c9f',
          'text': '#1a1a1a',
          'text-light': '#7f8c9f',
        },
      },
      fontFamily: {
        sans: [
          'Nunito Sans',
          'sans-serif'
        ],
        display: ['Poppins', 'sans-serif'],
        heading: ['Poppins', 'sans-serif']
      },
      backgroundImage: {
        'funky-gradient': 'linear-gradient(135deg, #FF5EAE 0%, #FFD86B 50%, #5EE2FF 100%)',
        'funky-radial': 'radial-gradient(circle at 20% 80%, #FFD86B 0%, #FF5EAE 60%, #A259FF 100%)',
        'animaker-gradient': 'linear-gradient(135deg, #794eff 0%, #02cbd7 100%)',
        'animaker-light': 'linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)',
      },
      boxShadow: {
        funky: '0 8px 32px 0 rgba(255,94,174,0.15), 0 1.5px 8px 0 rgba(162,89,255,0.10)',
        'animaker': '0 8px 24px rgba(149, 157, 165, 0.15)',
        'animaker-hover': '0 12px 30px rgba(149, 157, 165, 0.25)',
        'animaker-card': '0 2px 8px rgba(149, 157, 165, 0.1)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        funky: '2rem',
        'animaker': '12px',
        'animaker-lg': '16px',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shine': 'shine 1.2s linear infinite',
        'scale': 'scale 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce-subtle 2s ease infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': {
            opacity: '0'
          },
          '100%': {
            opacity: '1'
          }
        },
        'slide-up': {
          '0%': {
            transform: 'translateY(10px)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1'
          }
        },
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        shine: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'scale': {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        'pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}