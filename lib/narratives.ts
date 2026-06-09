// Curated narrative mapping for top Solana / EVM tokens.
// Lowercase symbols only; matched against token.symbol.toLowerCase().
// Sectors are ordered roughly by how often they trade as a group.

export type Narrative = {
  id: string;
  label: string;
  color: string;        // tile-stroke color for the sector header
  emoji: string;        // displayed in sector label
  symbols: string[];    // primary match list
  patterns?: RegExp[];  // fallback matchers
};

export const NARRATIVES: Narrative[] = [
  {
    id: 'dog',
    label: 'Dog memes',
    color: '#F59E0B',
    emoji: '🐕',
    symbols: ['bonk', 'wif', 'mumu', 'neiro', 'billy', 'gigi', 'shib', 'doge', 'sneko', 'doginme', 'pups'],
    patterns: [/dog/i, /shib/i, /inu$/i],
  },
  {
    id: 'cat',
    label: 'Cat memes',
    color: '#A78BFA',
    emoji: '🐈',
    symbols: ['popcat', 'mew', 'michi', 'kat', 'smol', 'gato', 'meow'],
    patterns: [/^cat/i, /kitty/i],
  },
  {
    id: 'frog',
    label: 'Frog & misc memes',
    color: '#22C55E',
    emoji: '🐸',
    symbols: ['fwog', 'pepe', 'retard', 'retardio', 'wojak', 'chill', 'goon', 'gigachad', 'giga', 'sus', 'mog'],
    patterns: [/pepe/i],
  },
  {
    id: 'ai',
    label: 'AI agents',
    color: '#06B6D4',
    emoji: '🤖',
    symbols: ['ai16z', 'griffain', 'alch', 'zerebro', 'swarms', 'tank', 'goat', 'seeder', 'agent', 'eliza', 'arc'],
    patterns: [/^ai/i, /agent/i, /\bai\b/i],
  },
  {
    id: 'trump',
    label: 'Politics & people',
    color: '#EF4444',
    emoji: '🇺🇸',
    symbols: ['trump', 'melania', 'libra', 'mother', 'kanye', 'biden', 'elon'],
  },
  {
    id: 'food',
    label: 'Food & life memes',
    color: '#FB923C',
    emoji: '🍕',
    symbols: ['fart', 'moodeng', 'gme', 'bubble', 'particle', 'prtcl', 'banana', 'pizza', 'sushi', 'taco'],
  },
  {
    id: 'pumpfun',
    label: 'Pump.fun graduates',
    color: '#F472B6',
    emoji: '⚡',
    symbols: [],
    patterns: [/pump$/i],
  },
  {
    id: 'defi',
    label: 'DeFi & infra',
    color: '#3B82F6',
    emoji: '🏦',
    symbols: [
      'jup', 'jto', 'ray', 'orca', 'drift', 'tnsr', 'pyth', 'render', 'io', 'zeus', 'meta',
      'jlp', 'uni', 'aave', 'comp', 'crv', 'mkr', 'snx', 'sushi', 'cake', 'lqty', 'mantra',
    ],
  },
  {
    id: 'l1',
    label: 'Layer-1 / Wrapped',
    color: '#14F195',
    emoji: '⛓',
    symbols: ['sol', 'wsol', 'eth', 'weth', 'bnb', 'wbnb', 'usdc', 'usdt', 'dai', 'wbtc', 'btc', 'wsteth', 'cbeth'],
  },
];

const FALLBACK: Narrative = {
  id: 'other',
  label: 'Other',
  color: '#6B7280',
  emoji: '✦',
  symbols: [],
};

export function getNarrative(symbol: string, age?: number | null): Narrative {
  const s = symbol.toLowerCase();

  // Symbol exact match
  for (const n of NARRATIVES) {
    if (n.symbols.includes(s)) return n;
  }

  // Pattern match
  for (const n of NARRATIVES) {
    if (n.patterns) {
      for (const p of n.patterns) {
        if (p.test(symbol)) return n;
      }
    }
  }

  // Fresh tokens (<48h old) bucket into "Pump.fun graduates" if no match
  if (age != null && age < 48) {
    const pf = NARRATIVES.find((n) => n.id === 'pumpfun');
    if (pf) return pf;
  }

  return FALLBACK;
}

export function getAllNarratives(): Narrative[] {
  return [...NARRATIVES, FALLBACK];
}
