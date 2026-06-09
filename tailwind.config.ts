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

        // Brand — electric violet → cyan ("premium terminal")
        brand: '#7C5CFF',          // primary violet
        'brand-soft': '#A78BFA',   // soft violet — glows & halos
        'brand-2': '#22D3EE',      // cyan — gradient partner
        accent: '#22D3EE',         // cyan — brand highlights / eyebrows / focus

        // Semantic signals — independent of brand so they never collide
        smart: '#22D3EE',          // cyan — smart-money accumulation
        pump: '#FFB800',           // amber — pump alert (warm, pops vs violet)
        gold: '#FFB800',           // amber — watchlist stars
        mega: '#FF2D87',           // pink — mega pump
        whale: '#E6B800',          // gold — whale activity

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
