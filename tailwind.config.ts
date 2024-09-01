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
      },
      animation: {
        slideInDown: 'slideInDown 1s ease var(--slidein-delay, 0) forwards',
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
            border: '2px solid white',
          },
        },
      }

      addUtilities(newUtilities, ['responsive', 'hover'])
    },
  ],
}
export default config
