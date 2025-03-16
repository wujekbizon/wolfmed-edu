import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
      },
      keyframes: {
        slideInDown: {
          from: {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        gradient: {
          '0%': { opacity: '0' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '0.2' },
        },
        gradientPosition: {
          '0%, 100%': {
            'background-position': '0% 50%',
            transform: 'scale(1)',
          },
          '50%': {
            'background-position': '100% 50%',
            transform: 'scale(1.1)',
          },
        },
        gradientScale: {
          '0%, 100%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.1)',
          },
        },
        gradientRotate: {
          '0%': {
            opacity: '0',
            'background-image':
              'linear-gradient(45deg, rgba(255,91,91,0.2) 0%, rgba(147,51,234,0.1) 50%, rgba(255,91,91,0.2) 100%)',
          },
          '33%': {
            opacity: '1',
            'background-image':
              'linear-gradient(60deg, rgba(59,130,246,0.1) 0%, rgba(255,91,91,0.2) 50%, rgba(147,51,234,0.1) 100%)',
          },
          '66%': {
            opacity: '1',
            'background-image':
              'linear-gradient(45deg, rgba(255,91,91,0.2) 0%, rgba(59,130,246,0.1) 50%, rgba(255,91,91,0.2) 100%)',
          },
          '100%': {
            opacity: '0',
            'background-image':
              'linear-gradient(45deg, rgba(255,91,91,0.2) 0%, rgba(147,51,234,0.1) 50%, rgba(255,91,91,0.2) 100%)',
          },
        },
        radialPulse: {
          '0%, 100%': {
            opacity: '0.2',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.3',
            transform: 'scale(1.1)',
          },
        },
      },
      animation: {
        slideInDown: 'slideInDown 1s ease var(--slidein-delay, 0) forwards',
        fadeInUp: 'fadeInUp 0.5s ease-out forwards',
        scaleIn: 'scaleIn 0.5s ease-out forwards',
        gradient: 'gradient 8s ease-in-out infinite alternate',
        gradientPosition: 'gradientPosition 5s ease-in-out infinite',
        gradientScale: 'gradientScale 8s ease-in-out infinite',
        gradientRotate: 'gradientRotate 6s ease infinite',
        radialPulse: 'radialPulse 8s ease-in-out infinite',
      },
      backgroundSize: {
        '70%': '70%',
        '80%': '80%',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({
      addUtilities,
    }: {
      addUtilities: (
        newUtilities: {
          '.scrollbar-thin': {
            scrollbarWidth: string
            scrollbarColor: string
          }
          '.scrollbar-webkit': {
            '&::-webkit-scrollbar': {
              width: string
            }
            '&::-webkit-scrollbar-track': {
              background: string
              borderRadius: string
            }
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: string
              borderRadius: string
              border: string
            }
          }
        },
        []: string[]
      ) => void
    }) {
      const newUtilities = {
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#fcf2f1 white',
        },
        '.scrollbar-webkit': {
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#ffa5a5',
            borderRadius: '20px',
            border: '1px solid white',
          },
        },
      }

      addUtilities(newUtilities, ['responsive', 'hover'])
    },
  ],
}
export default config
