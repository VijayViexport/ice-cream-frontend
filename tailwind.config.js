/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF4F0',
          100: '#FFE8DE',
          200: '#FFD1BD',
          300: '#FFB89B',
          400: '#FF9F7A',
          500: '#FF8659',
          600: '#E6754D',
          700: '#CC6541',
          800: '#B35435',
          900: '#994329',
        },
        secondary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
      },
      fontSize: {
        // Professional typography scale using 1.25 (Major Third) ratio
        // Base: 16px, optimal for B2B e-commerce readability
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],      // 12px - Small labels, captions
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],     // 14px - Secondary text, metadata
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],            // 16px - Body text (primary)
        'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],          // 18px - Large body text, lead paragraphs
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],     // 20px - Small headings (h5, h6)
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],     // 24px - Section headings (h4)
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],   // 30px - Sub-page headings (h3)
        '4xl': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.02em' }],   // 36px - Page headings (h2)
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],       // 48px - Hero headings (h1)
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],    // 60px - Display text (marketing)
        '7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],     // 72px - Large display
      },
      fontWeight: {
        normal: '400',      // Body text
        medium: '500',      // Emphasized text, buttons
        semibold: '600',    // Subheadings, important UI elements
        bold: '700',        // Headings
        extrabold: '800',   // Strong emphasis, hero text
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '0',
        wide: '0.01em',
        wider: '0.02em',
        widest: '0.05em',
      },
      lineHeight: {
        none: '1',
        tight: '1.25',      // Headings
        snug: '1.375',      // Subheadings
        normal: '1.5',      // Default
        relaxed: '1.6',     // Body text
        loose: '1.75',      // Spacious content
      },
      boxShadow: {
        'level1': '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        'level2': '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
        'level3': '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
