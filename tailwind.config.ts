import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Layered surfaces — depth without flat black
        canvas: '#07070A',
        'surface-1': '#0F0F14',
        'surface-2': '#16161D',
        'surface-3': '#1D1D26',

        // Border hierarchy
        'border-subtle': '#15151E',
        'border-line': '#1F1F2A',
        'border-strong': '#2A2A38',
        line: '#1F1F2A',           // alias for legacy classes

        panel: '#0F0F14',          // alias for SidePanel
        // Brand
        brand: '#FF6B35',
        'brand-soft': '#FFB800',
        accent: '#FFB800',
        mega: '#FF2D87',
        whale: '#E6B800',

        // Chain brand colors
        'chain-solana': '#14F195',
        'chain-solana-alt': '#9945FF',
        'chain-base': '#0052FF',
        'chain-bsc': '#F0B90B',
        'chain-eth': '#627EEA',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      },
      borderRadius: {
        DEFAULT: '4px',
      },
      animation: {
        'pulse-pump': 'pulse-pump 1.6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-pump': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,184,0,0.55)' },
          '50%': { boxShadow: '0 0 0 6px rgba(255,184,0,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'inset-line': 'inset 0 0 0 1px #1F1F2A',
      },
    },
  },
  plugins: [],
};
export default config;
