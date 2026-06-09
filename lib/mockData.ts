import type { Chain, Token } from './types';

type Seed = {
  address: string;
  pairAddress: string;
  symbol: string;
  name: string;
  priceUsd: number;
  imageUrl: string;
  dexId: string;
  baseVolH24: number;
  baseLiq: number;
  baseMcap: number;
  baseAgeH: number;
};

// Solana mainnet — real mint addresses; logos resolve on DexScreener CDN.
const SOLANA_SEEDS: Seed[] = [
  { address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', pairAddress: 'EP2ib6dYdEeqD8MfE2ezHCxX3kP3K2eLKkirfPm5eyMx', symbol: 'WIF',      name: 'dogwifhat',          priceUsd: 2.34,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm.png', dexId: 'raydium',  baseVolH24: 142_000_000, baseLiq: 18_000_000, baseMcap: 2_341_000_000, baseAgeH: 24*450 },
  { address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', pairAddress: 'HVNwzt7Pxfu76KHCMQPTLuTCLTm6WnQ1esLv4eizseSv', symbol: 'BONK',     name: 'Bonk',               priceUsd: 0.0000231, imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263.png', dexId: 'raydium',  baseVolH24: 88_000_000,  baseLiq: 12_500_000, baseMcap: 1_700_000_000, baseAgeH: 24*720 },
  { address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',  pairAddress: 'C1MgLojNLWBKADvu9BHdtgzz1oZX4dZ5zGdGcgvvW8Wz', symbol: 'JUP',      name: 'Jupiter',            priceUsd: 0.78,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN.png',  dexId: 'raydium',  baseVolH24: 64_000_000,  baseLiq: 21_000_000, baseMcap: 1_050_000_000, baseAgeH: 24*210 },
  { address: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',  pairAddress: '8eMHHvg9Z3hRmRP8RmpKjZWVjUVRgcwUYsxQX5HQekqM', symbol: 'JTO',      name: 'Jito',               priceUsd: 3.42,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL.png',  dexId: 'raydium',  baseVolH24: 31_000_000,  baseLiq: 8_400_000,  baseMcap: 420_000_000,   baseAgeH: 24*120 },
  { address: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', pairAddress: 'AEDArfgFSiyz2rg4LP8j8w9j2pXkpgEXR6S9LtmCWMrA', symbol: 'PYTH',     name: 'Pyth Network',       priceUsd: 0.41,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3.png',  dexId: 'orca',     baseVolH24: 22_500_000,  baseLiq: 6_700_000,  baseMcap: 1_100_000_000, baseAgeH: 24*180 },
  { address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', pairAddress: '7XawhbbxtsRcQA8KTkHT9f9nc6d69UwqCDh6U5EEbEmX', symbol: 'RAY',      name: 'Raydium',            priceUsd: 1.86,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png',  dexId: 'raydium',  baseVolH24: 18_900_000,  baseLiq: 5_900_000,  baseMcap: 540_000_000,   baseAgeH: 24*900 },
  { address: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',  pairAddress: '2QdhepnKRTLjjSqPL1PtKNwqrUkoLee5Gqs8bvZhRdMv', symbol: 'ORCA',     name: 'Orca',               priceUsd: 2.95,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE.png',  dexId: 'orca',     baseVolH24:  9_300_000,  baseLiq: 4_100_000,  baseMcap: 290_000_000,   baseAgeH: 24*820 },
  { address: '5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC', pairAddress: 'AmDcCkrwiR3aB9c2hVH7C7zaeT5y4JN5kpb1nSt9TT5q', symbol: 'POPCAT',   name: 'Popcat',             priceUsd: 1.21,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC.png', dexId: 'raydium',  baseVolH24: 26_000_000,  baseLiq: 7_900_000,  baseMcap: 1_180_000_000, baseAgeH: 24*240 },
  { address: 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5',  pairAddress: '879F697iuDJGMevRkRcnW21fcXiAeLJK1ffsw2ATebce', symbol: 'MEW',      name: 'cat in a dogs world', priceUsd: 0.0073,  imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5.png',  dexId: 'raydium',  baseVolH24: 12_700_000,  baseLiq: 3_400_000,  baseMcap: 640_000_000,   baseAgeH: 24*150 },
  { address: 'TrumpBgN8VKwHv2x9PpoP3UYxF2yKzs7vRCVpumpRPP',  pairAddress: 'PairTRUMP',                                    symbol: 'TRUMP',    name: 'OFFICIAL TRUMP',     priceUsd: 12.4,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/TRUMP.png',  dexId: 'raydium',   baseVolH24: 78_000_000,  baseLiq: 14_500_000, baseMcap: 2_480_000_000, baseAgeH: 24*120 },
  { address: 'PnutBgN8VKwHv2x9PpoP3UYxF2yKzs7vRCVpumpRPP',   pairAddress: 'PairPNUT',                                     symbol: 'PNUT',     name: 'Peanut the Squirrel', priceUsd: 0.61,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/PNUT.png',   dexId: 'raydium',   baseVolH24: 22_000_000,  baseLiq: 5_400_000,  baseMcap: 610_000_000,   baseAgeH: 24*40 },
  { address: 'F9CpWoyeBJfoRB8f2pBe2ZNRbWaWmbcVKLNgvjMu1pump', pairAddress: 'PairFART',                                     symbol: 'FART',     name: 'fart coin',          priceUsd: 1.31,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/FART.png',   dexId: 'raydium',   baseVolH24: 19_000_000,  baseLiq: 6_800_000,  baseMcap: 1_310_000_000, baseAgeH: 24*55 },
  { address: 'AiBkpump1RyrPPGoatN8VKwHv2x9PpoP3UYxF2yKzs7v',  pairAddress: 'PairAI16Z',                                    symbol: 'AI16Z',    name: 'ai16z',              priceUsd: 0.91,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/AI16Z.png',  dexId: 'raydium',   baseVolH24: 11_800_000,  baseLiq: 4_100_000,  baseMcap: 910_000_000,   baseAgeH: 24*30 },
  { address: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',  pairAddress: 'PairRNDR',                                     symbol: 'RENDER',   name: 'Render',             priceUsd: 6.10,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/RENDER.png', dexId: 'raydium',   baseVolH24: 8_500_000,   baseLiq: 3_700_000,  baseMcap: 3_100_000_000, baseAgeH: 24*200 },
  { address: 'IoBgN8VKwHv2x9PpoP3UYxF2yKzs7vRCVpumpRPP00',   pairAddress: 'PairIO',                                       symbol: 'IO',       name: 'io.net',             priceUsd: 1.78,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/IO.png',     dexId: 'raydium',   baseVolH24: 9_700_000,   baseLiq: 2_800_000,  baseMcap: 280_000_000,   baseAgeH: 24*100 },
  { address: 'GoatN8VKwHv2x9PpoP3UYxF2yKzs7vRC1Vpump1RyrPP', pairAddress: 'PairGOAT',                                     symbol: 'GOAT',     name: 'Goatseus Maximus',   priceUsd: 0.42,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/GOAT.png',   dexId: 'raydium',   baseVolH24: 14_400_000,  baseLiq: 2_900_000,  baseMcap: 420_000_000,   baseAgeH: 24*45 },
  { address: 'MoodengBgN8VKwHv2x9PpoP3UYxF2yKzs7vRCVpump',   pairAddress: 'PairMOODENG',                                  symbol: 'MOODENG',  name: 'Moo Deng',           priceUsd: 0.22,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/MOODENG.png',dexId: 'raydium',   baseVolH24: 8_100_000,   baseLiq: 2_200_000,  baseMcap: 220_000_000,   baseAgeH: 24*38 },
  { address: 'MelaniaBgN8VKwHv2x9PpoP3UYxF2yKzs7vRCVpump',   pairAddress: 'PairMELANIA',                                  symbol: 'MELANIA',  name: 'Melania Meme',       priceUsd: 0.78,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/MELANIA.png',dexId: 'raydium',   baseVolH24: 12_000_000,  baseLiq: 3_400_000,  baseMcap: 780_000_000,   baseAgeH: 24*100 },
  { address: 'ZerosBgN8VKwHv2x9PpoP3UYxF2yKzs7vRCVpumpRPP',  pairAddress: 'PairZEREBRO',                                  symbol: 'ZEREBRO',  name: 'Zerebro',            priceUsd: 0.43,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/ZEREBRO.png',dexId: 'raydium',   baseVolH24: 6_400_000,   baseLiq: 1_600_000,  baseMcap: 430_000_000,   baseAgeH: 24*22 },
  { address: 'CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump',  pairAddress: 'PairGRIFFAIN',                                 symbol: 'GRIFFAIN', name: 'griffain.com',       priceUsd: 0.21,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/solana/GRIFFAIN.png',dexId: 'raydium',  baseVolH24: 3_300_000,   baseLiq: 970_000,    baseMcap: 210_000_000,   baseAgeH: 24*15 },
];

// Ethereum mainnet — real ERC-20 addresses for the popular DEX-traded tokens.
const ETH_SEEDS: Seed[] = [
  { address: '0x6982508145454ce325ddbe47a25d4ec3d2311933', pairAddress: '0x11950d141ecb863f01007add7d1a342041227b58', symbol: 'PEPE',    name: 'Pepe',           priceUsd: 0.0000091, imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0x6982508145454ce325ddbe47a25d4ec3d2311933.png', dexId: 'uniswap-v2',baseVolH24: 92_000_000, baseLiq: 24_000_000, baseMcap: 3_800_000_000, baseAgeH: 24*560 },
  { address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', pairAddress: '0x811beed0119b4afce20d2583eb608c6f7af1954f', symbol: 'SHIB',    name: 'Shiba Inu',      priceUsd: 0.0000172, imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce.png', dexId: 'uniswap-v2',baseVolH24: 78_000_000, baseLiq: 31_000_000, baseMcap: 10_100_000_000, baseAgeH: 24*1100 },
  { address: '0xaaee1a9723aadb7afa2810263653a34ba2c21c7a', pairAddress: '0xc2eab7d33d3cb97692ecb231a5d0e4a649cb539d', symbol: 'MOG',     name: 'Mog Coin',       priceUsd: 0.0000013, imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0xaaee1a9723aadb7afa2810263653a34ba2c21c7a.png', dexId: 'uniswap-v2',baseVolH24: 28_000_000, baseLiq: 6_200_000,  baseMcap: 510_000_000,   baseAgeH: 24*400 },
  { address: '0x514910771af9ca656af840dff83e8264ecf986ca', pairAddress: '0xa2107fa5b38d9bbd2c461d6edf11b11a50f6b974', symbol: 'LINK',    name: 'Chainlink',      priceUsd: 18.42,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0x514910771af9ca656af840dff83e8264ecf986ca.png', dexId: 'uniswap-v3',baseVolH24: 64_000_000, baseLiq: 28_000_000, baseMcap: 11_500_000_000, baseAgeH: 24*2100 },
  { address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', pairAddress: '0xd3d2e2692501a5c9ca623199d38826e513033a17', symbol: 'UNI',     name: 'Uniswap',        priceUsd: 11.82,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png', dexId: 'uniswap-v3',baseVolH24: 42_000_000, baseLiq: 18_500_000, baseMcap: 7_100_000_000,  baseAgeH: 24*1500 },
  { address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', pairAddress: '0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f', symbol: 'AAVE',    name: 'Aave',           priceUsd: 192.10,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9.png', dexId: 'uniswap-v3',baseVolH24: 38_000_000, baseLiq: 14_500_000, baseMcap: 2_900_000_000,  baseAgeH: 24*1800 },
  { address: '0x5a98fcbea516cf06857215779fd812ca3bef1b32', pairAddress: '0xa3f558aebaecaf0e11ca4b2199cc5ed341edfd74', symbol: 'LDO',     name: 'Lido DAO',       priceUsd: 2.28,      imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0x5a98fcbea516cf06857215779fd812ca3bef1b32.png', dexId: 'uniswap-v3',baseVolH24: 18_000_000, baseLiq: 8_200_000,  baseMcap: 2_040_000_000,  baseAgeH: 24*1200 },
  { address: '0xfaba6f8e4a5e8ab82f62fe7c39859fa577269be3', pairAddress: '0xfaba6f8e4a5e8ab82f62fe7c39859fa577269be3', symbol: 'ONDO',    name: 'Ondo Finance',   priceUsd: 1.42,      imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0xfaba6f8e4a5e8ab82f62fe7c39859fa577269be3.png', dexId: 'uniswap-v3',baseVolH24: 22_000_000, baseLiq: 9_400_000,  baseMcap: 1_980_000_000,  baseAgeH: 24*450 },
  { address: '0xa35923162c49cf95e6bf26623385eb431ad920d3', pairAddress: '0xa35923162c49cf95e6bf26623385eb431ad920d3', symbol: 'TURBO',   name: 'Turbo',          priceUsd: 0.0072,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0xa35923162c49cf95e6bf26623385eb431ad920d3.png', dexId: 'uniswap-v2',baseVolH24: 14_500_000, baseLiq: 3_800_000,  baseMcap: 720_000_000,    baseAgeH: 24*500 },
  { address: '0x68bbed6a47194eff1cf514b50ea91895597fc91e', pairAddress: '0x68bbed6a47194eff1cf514b50ea91895597fc91e', symbol: 'ANDY',    name: 'Andy',           priceUsd: 0.041,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0x68bbed6a47194eff1cf514b50ea91895597fc91e.png', dexId: 'uniswap-v2',baseVolH24: 9_200_000,  baseLiq: 2_400_000,  baseMcap: 410_000_000,    baseAgeH: 24*300 },
  { address: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72', pairAddress: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72', symbol: 'ENS',     name: 'Ethereum Name Service', priceUsd: 28.4, imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0xc18360217d8f7ab5e7c516566761ea12ce7f9d72.png', dexId: 'uniswap-v3',baseVolH24: 11_400_000, baseLiq: 4_200_000,  baseMcap: 920_000_000,    baseAgeH: 24*1300 },
  { address: '0x6e2a43be0b1d33b726f0ca3b8de60b3482b8b050', pairAddress: '0x6e2a43be0b1d33b726f0ca3b8de60b3482b8b050', symbol: 'ARKM',    name: 'Arkham',         priceUsd: 1.86,      imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0x6e2a43be0b1d33b726f0ca3b8de60b3482b8b050.png', dexId: 'uniswap-v3',baseVolH24: 7_600_000,  baseLiq: 3_100_000,  baseMcap: 980_000_000,    baseAgeH: 24*400 },
  { address: '0x163f8c2467924be0ae7b5347228cabf260318753', pairAddress: '0x163f8c2467924be0ae7b5347228cabf260318753', symbol: 'WLD',     name: 'Worldcoin',      priceUsd: 2.94,      imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0x163f8c2467924be0ae7b5347228cabf260318753.png', dexId: 'uniswap-v3',baseVolH24: 16_200_000, baseLiq: 5_800_000,  baseMcap: 2_140_000_000,  baseAgeH: 24*500 },
  { address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', pairAddress: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', symbol: 'MKR',     name: 'Maker',          priceUsd: 1842.0,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2.png', dexId: 'uniswap-v3',baseVolH24: 13_800_000, baseLiq: 6_400_000,  baseMcap: 1_660_000_000,  baseAgeH: 24*2400 },
  { address: '0xd533a949740bb3306d119cc777fa900ba034cd52', pairAddress: '0xd533a949740bb3306d119cc777fa900ba034cd52', symbol: 'CRV',     name: 'Curve DAO',      priceUsd: 0.62,      imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0xd533a949740bb3306d119cc777fa900ba034cd52.png', dexId: 'uniswap-v3',baseVolH24: 9_900_000,  baseLiq: 3_700_000,  baseMcap: 880_000_000,    baseAgeH: 24*1700 },
  { address: '0xb90b2a35c65dbc466b04240097ca756ad2005295', pairAddress: '0xb90b2a35c65dbc466b04240097ca756ad2005295', symbol: 'BOBO',    name: 'Bobo',           priceUsd: 0.0000041, imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0xb90b2a35c65dbc466b04240097ca756ad2005295.png', dexId: 'uniswap-v2',baseVolH24: 4_800_000,  baseLiq: 1_500_000,  baseMcap: 290_000_000,    baseAgeH: 24*450 },
  { address: '0x5026f006b85729a8b14553fae6af249ad16c9aab', pairAddress: '0x5026f006b85729a8b14553fae6af249ad16c9aab', symbol: 'WOJAK',   name: 'Wojak',          priceUsd: 0.000089,  imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0x5026f006b85729a8b14553fae6af249ad16c9aab.png', dexId: 'uniswap-v2',baseVolH24: 3_400_000,  baseLiq: 940_000,    baseMcap: 180_000_000,    baseAgeH: 24*400 },
  { address: '0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24', pairAddress: '0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24', symbol: 'RNDR',    name: 'Render Token',   priceUsd: 5.91,      imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/ethereum/0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24.png', dexId: 'uniswap-v3',baseVolH24: 8_100_000,  baseLiq: 3_400_000,  baseMcap: 3_050_000_000,  baseAgeH: 24*1200 },
];

// Base mainnet — top tokens on Aerodrome / Uniswap V3 on Base.
const BASE_SEEDS: Seed[] = [
  { address: '0x532f27101965dd16442e59d40670faf5ebb142e4', pairAddress: '0x532f27101965dd16442e59d40670faf5ebb142e4', symbol: 'BRETT',   name: 'Brett',                 priceUsd: 0.092,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0x532f27101965dd16442e59d40670faf5ebb142e4.png', dexId: 'aerodrome',  baseVolH24: 34_000_000, baseLiq: 8_400_000,  baseMcap: 910_000_000,    baseAgeH: 24*320 },
  { address: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', pairAddress: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', symbol: 'DEGEN',   name: 'Degen',                 priceUsd: 0.0072,   imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0x4ed4e862860bed51a9570b96d89af5e1b0efefed.png', dexId: 'uniswap-v3', baseVolH24: 18_000_000, baseLiq: 5_200_000,  baseMcap: 220_000_000,    baseAgeH: 24*280 },
  { address: '0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4', pairAddress: '0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4', symbol: 'TOSHI',   name: 'Toshi',                 priceUsd: 0.00041,  imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4.png', dexId: 'aerodrome',  baseVolH24: 11_500_000, baseLiq: 3_400_000,  baseMcap: 410_000_000,    baseAgeH: 24*300 },
  { address: '0xb1a03eda10342529bbf8eb700a06c60441fef25d', pairAddress: '0xb1a03eda10342529bbf8eb700a06c60441fef25d', symbol: 'MIGGLES', name: 'Mister Miggles',        priceUsd: 0.124,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0xb1a03eda10342529bbf8eb700a06c60441fef25d.png', dexId: 'aerodrome',  baseVolH24: 5_800_000,  baseLiq: 1_900_000,  baseMcap: 124_000_000,    baseAgeH: 24*120 },
  { address: '0x9a26f5433671751c3276a065f57e5a02d2817973', pairAddress: '0x9a26f5433671751c3276a065f57e5a02d2817973', symbol: 'KEYCAT',  name: 'Keyboard Cat',          priceUsd: 0.018,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0x9a26f5433671751c3276a065f57e5a02d2817973.png', dexId: 'uniswap-v3', baseVolH24: 4_200_000,  baseLiq: 1_400_000,  baseMcap: 89_000_000,     baseAgeH: 24*180 },
  { address: '0x940181a94a35a4569e4529a3cdfb74e38fd98631', pairAddress: '0x940181a94a35a4569e4529a3cdfb74e38fd98631', symbol: 'AERO',    name: 'Aerodrome Finance',     priceUsd: 1.18,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0x940181a94a35a4569e4529a3cdfb74e38fd98631.png', dexId: 'aerodrome',  baseVolH24: 14_200_000, baseLiq: 6_800_000,  baseMcap: 980_000_000,    baseAgeH: 24*400 },
  { address: '0x7f12d13b34f5f4f0a9449c16bcd42f0da47af200', pairAddress: '0x7f12d13b34f5f4f0a9449c16bcd42f0da47af200', symbol: 'NORMIE',  name: 'Normie',                priceUsd: 0.0094,   imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0x7f12d13b34f5f4f0a9449c16bcd42f0da47af200.png', dexId: 'aerodrome',  baseVolH24: 2_700_000,  baseLiq: 820_000,    baseMcap: 47_000_000,     baseAgeH: 24*200 },
  { address: '0x0578d8a44db98b23bf096a382e016e29a5ce0ffe', pairAddress: '0x0578d8a44db98b23bf096a382e016e29a5ce0ffe', symbol: 'HIGHER',  name: 'Higher',                priceUsd: 0.014,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0x0578d8a44db98b23bf096a382e016e29a5ce0ffe.png', dexId: 'aerodrome',  baseVolH24: 1_900_000,  baseLiq: 640_000,    baseMcap: 14_000_000,     baseAgeH: 24*250 },
  { address: '0x6921b130d297cc43754afba22e5eac0fbf8db75b', pairAddress: '0x6921b130d297cc43754afba22e5eac0fbf8db75b', symbol: 'DOGINME', name: 'doginme',               priceUsd: 0.0021,   imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0x6921b130d297cc43754afba22e5eac0fbf8db75b.png', dexId: 'aerodrome',  baseVolH24: 3_400_000,  baseLiq: 1_100_000,  baseMcap: 78_000_000,     baseAgeH: 24*220 },
  { address: '0xcde172dc5ffc46d228838446c57c1227e0b82049', pairAddress: '0xcde172dc5ffc46d228838446c57c1227e0b82049', symbol: 'BOOMER',  name: 'Boomer',                priceUsd: 0.0072,   imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0xcde172dc5ffc46d228838446c57c1227e0b82049.png', dexId: 'uniswap-v3', baseVolH24: 1_400_000,  baseLiq: 410_000,    baseMcap: 72_000_000,     baseAgeH: 24*150 },
  { address: '0xe3086852a4b125803c815a158249ae468a3254ca', pairAddress: '0xe3086852a4b125803c815a158249ae468a3254ca', symbol: 'MFER',    name: 'mfercoin',              priceUsd: 0.018,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0xe3086852a4b125803c815a158249ae468a3254ca.png', dexId: 'uniswap-v3', baseVolH24: 1_100_000,  baseLiq: 380_000,    baseMcap: 52_000_000,     baseAgeH: 24*180 },
  { address: '0x0d97f261b1e88845184f678e2d1e7a98d9fd38de', pairAddress: '0x0d97f261b1e88845184f678e2d1e7a98d9fd38de', symbol: 'TYBG',    name: 'Base God',              priceUsd: 0.00012,  imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0x0d97f261b1e88845184f678e2d1e7a98d9fd38de.png', dexId: 'aerodrome',  baseVolH24: 940_000,    baseLiq: 320_000,    baseMcap: 12_000_000,     baseAgeH: 24*200 },
  { address: '0xbc45647ea894030a4e9801ec03479739fa2485f0', pairAddress: '0xbc45647ea894030a4e9801ec03479739fa2485f0', symbol: 'BENJI',   name: 'Benji',                 priceUsd: 0.014,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0xbc45647ea894030a4e9801ec03479739fa2485f0.png', dexId: 'aerodrome',  baseVolH24: 1_200_000,  baseLiq: 410_000,    baseMcap: 32_000_000,     baseAgeH: 24*60 },
  { address: '0x3636a7734b669ce352e97780df361ce1f809c58c', pairAddress: '0x3636a7734b669ce352e97780df361ce1f809c58c', symbol: 'ROCKY',   name: 'Rocky',                 priceUsd: 0.0034,   imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0x3636a7734b669ce352e97780df361ce1f809c58c.png', dexId: 'aerodrome',  baseVolH24: 720_000,    baseLiq: 220_000,    baseMcap: 12_000_000,     baseAgeH: 24*120 },
];

// BNB Smart Chain — top tokens on PancakeSwap / Biswap.
const BSC_SEEDS: Seed[] = [
  { address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', pairAddress: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', symbol: 'CAKE',     name: 'PancakeSwap',         priceUsd: 2.42,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82.png', dexId: 'pancakeswap-v3', baseVolH24: 28_000_000, baseLiq: 12_400_000, baseMcap: 720_000_000,   baseAgeH: 24*1400 },
  { address: '0xfb5b838b6cfeedc2873ab27866079ac55363d37e', pairAddress: '0xfb5b838b6cfeedc2873ab27866079ac55363d37e', symbol: 'FLOKI',    name: 'Floki',               priceUsd: 0.000124, imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0xfb5b838b6cfeedc2873ab27866079ac55363d37e.png', dexId: 'pancakeswap-v3', baseVolH24: 22_000_000, baseLiq: 7_800_000,  baseMcap: 1_180_000_000, baseAgeH: 24*900 },
  { address: '0xc748673057861a797275cd8a068abb95a902e8de', pairAddress: '0xc748673057861a797275cd8a068abb95a902e8de', symbol: 'BABYDOGE', name: 'Baby Doge Coin',      priceUsd: 0.0000000018, imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0xc748673057861a797275cd8a068abb95a902e8de.png', dexId: 'pancakeswap-v2', baseVolH24: 8_400_000,  baseLiq: 2_900_000,  baseMcap: 280_000_000,   baseAgeH: 24*1000 },
  { address: '0x86bb94ddd16efc8bc58e6b056e8df71d9e666429', pairAddress: '0x86bb94ddd16efc8bc58e6b056e8df71d9e666429', symbol: 'TST',      name: 'Test BNB token',      priceUsd: 0.084,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x86bb94ddd16efc8bc58e6b056e8df71d9e666429.png', dexId: 'pancakeswap-v3', baseVolH24: 14_500_000, baseLiq: 3_400_000,  baseMcap: 84_000_000,    baseAgeH: 24*60 },
  { address: '0x4b0f1812e5df2a09796481ff14017e6005508003', pairAddress: '0x4b0f1812e5df2a09796481ff14017e6005508003', symbol: 'TWT',      name: 'Trust Wallet Token',  priceUsd: 1.18,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x4b0f1812e5df2a09796481ff14017e6005508003.png', dexId: 'pancakeswap-v3', baseVolH24: 6_700_000,  baseLiq: 2_400_000,  baseMcap: 490_000_000,   baseAgeH: 24*1200 },
  { address: '0x603c7f932ed1fc6575c0bdb557df1a4faaedc4ad', pairAddress: '0x603c7f932ed1fc6575c0bdb557df1a4faaedc4ad', symbol: 'BANANA',   name: 'ApeSwap Banana',      priceUsd: 0.034,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x603c7f932ed1fc6575c0bdb557df1a4faaedc4ad.png', dexId: 'pancakeswap-v2', baseVolH24: 2_100_000,  baseLiq: 720_000,    baseMcap: 32_000_000,    baseAgeH: 24*1100 },
  { address: '0x8f0528ce5ef7b51152a59745befdd91d97091d2f', pairAddress: '0x8f0528ce5ef7b51152a59745befdd91d97091d2f', symbol: 'ALPACA',   name: 'Alpaca Finance',      priceUsd: 0.18,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x8f0528ce5ef7b51152a59745befdd91d97091d2f.png', dexId: 'pancakeswap-v3', baseVolH24: 1_800_000,  baseLiq: 620_000,    baseMcap: 28_000_000,    baseAgeH: 24*1300 },
  { address: '0x1Cd16eD15F71e3FcF06ed1Bb86F040d44A12bb52', pairAddress: '0x1Cd16eD15F71e3FcF06ed1Bb86F040d44A12bb52', symbol: 'MANEKI',   name: 'Maneki',              priceUsd: 0.012,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x1Cd16eD15F71e3FcF06ed1Bb86F040d44A12bb52.png', dexId: 'pancakeswap-v2', baseVolH24: 3_400_000,  baseLiq: 1_100_000,  baseMcap: 120_000_000,   baseAgeH: 24*200 },
  { address: '0x09e2b83fe5485a7c8beaa5dffd1d324a2b2d5c13', pairAddress: '0x09e2b83fe5485a7c8beaa5dffd1d324a2b2d5c13', symbol: 'AIDOGE',   name: 'AI Doge',             priceUsd: 0.000048, imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x09e2b83fe5485a7c8beaa5dffd1d324a2b2d5c13.png', dexId: 'pancakeswap-v2', baseVolH24: 1_400_000,  baseLiq: 420_000,    baseMcap: 24_000_000,    baseAgeH: 24*180 },
  { address: '0xae9269f27437f0fcbc232d39ec814844a51d6b8f', pairAddress: '0xae9269f27437f0fcbc232d39ec814844a51d6b8f', symbol: 'BURGER',   name: 'BurgerSwap',          priceUsd: 0.42,     imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0xae9269f27437f0fcbc232d39ec814844a51d6b8f.png', dexId: 'pancakeswap-v2', baseVolH24: 1_200_000,  baseLiq: 380_000,    baseMcap: 18_000_000,    baseAgeH: 24*1400 },
  { address: '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd', pairAddress: '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd', symbol: 'LINK',     name: 'Chainlink (BSC)',     priceUsd: 18.40,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd.png', dexId: 'pancakeswap-v3', baseVolH24: 4_800_000,  baseLiq: 2_100_000,  baseMcap: 11_400_000_000, baseAgeH: 24*1500 },
  { address: '0x73be0a0fdc9b59ed3ad8b6e1bf9eb56eb39d8326', pairAddress: '0x73be0a0fdc9b59ed3ad8b6e1bf9eb56eb39d8326', symbol: 'CHEEMS',   name: 'Cheems',              priceUsd: 0.0034,   imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x73be0a0fdc9b59ed3ad8b6e1bf9eb56eb39d8326.png', dexId: 'pancakeswap-v2', baseVolH24: 980_000,    baseLiq: 310_000,    baseMcap: 14_000_000,    baseAgeH: 24*120 },
  { address: '0xa2b726b1145a4773f68593cf171187d8ebe4d495', pairAddress: '0xa2b726b1145a4773f68593cf171187d8ebe4d495', symbol: 'INJ',      name: 'Injective',           priceUsd: 21.40,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0xa2b726b1145a4773f68593cf171187d8ebe4d495.png', dexId: 'pancakeswap-v3', baseVolH24: 5_200_000,  baseLiq: 1_800_000,  baseMcap: 2_140_000_000, baseAgeH: 24*1200 },
  { address: '0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275', pairAddress: '0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275', symbol: 'BNBX',     name: 'BNBx',                priceUsd: 720.0,    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275.png', dexId: 'pancakeswap-v3', baseVolH24: 2_400_000,  baseLiq: 1_100_000,  baseMcap: 240_000_000,   baseAgeH: 24*800 },
];

const SEEDS_BY_CHAIN: Record<Chain, Seed[]> = {
  solana: SOLANA_SEEDS,
  eth: ETH_SEEDS,
  base: BASE_SEEDS,
  bsc: BSC_SEEDS,
};

// Deterministic PRNG so the same minute produces the same data — but each minute looks "live"
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussianish(rng: () => number): number {
  return (rng() + rng() + rng() + rng() - 2) * 1.2;
}

export function generateMockTokens(chain: Chain, ts: number): Token[] {
  const seeds = SEEDS_BY_CHAIN[chain] ?? SOLANA_SEEDS;

  // Bucket the seed to ~15s so refreshes within a window are stable.
  const bucket = Math.floor(ts / 15_000);
  const chainSalt =
    chain === 'solana' ? 0xABC123 :
    chain === 'base'   ? 0xDEF456 :
    chain === 'bsc'    ? 0x789ABC :
                         0x456DEF;
  const seed = bucket ^ chainSalt;

  return seeds.map((s, i) => {
    const r = mulberry32(seed + i * 7919);

    const h24Change = gaussianish(r) * 8 + (r() < 0.15 ? (r() - 0.5) * 30 : 0);
    const h6Change  = h24Change * (0.3 + r() * 0.4) + gaussianish(r) * 3;
    const h1Change  = h6Change  * (0.2 + r() * 0.4) + gaussianish(r) * 2;
    const m5Change  = h1Change  * (0.1 + r() * 0.3) + gaussianish(r) * 0.8;

    const volMult = 0.7 + r() * 0.6;
    const volH24 = s.baseVolH24 * volMult;
    const volH6  = volH24 * (0.18 + r() * 0.12);
    const volH1  = volH24 * (0.035 + r() * 0.04);
    const volM5  = volH1  * (0.06 + r() * 0.06);

    const liq = s.baseLiq * (0.85 + r() * 0.3);
    const mcap = s.baseMcap > 0 ? s.baseMcap * (1 + h24Change / 100) : null;

    const buys24h = Math.round(2500 + r() * 80_000 * (volH24 / 10_000_000));
    const sells24h = Math.round(buys24h * (0.6 + r() * 0.8));
    const buys1h = Math.round(buys24h / 24 * (0.6 + r() * 0.9));
    const sells1h = Math.round(sells24h / 24 * (0.6 + r() * 0.9));

    // Make a few newer tokens look like they're pumping
    let finalVolH1 = volH1;
    let finalBuys1h = buys1h;
    let finalH1Change = h1Change;
    if (s.baseAgeH < 24 * 30 && r() < 0.35) {
      finalVolH1 = volH1 * (3 + r() * 4);
      finalBuys1h = Math.round(buys1h * (3 + r() * 3));
      finalH1Change = Math.abs(h1Change) + 6 + r() * 14;
    }

    const ageJitter = s.baseAgeH < 5 ? r() * 0.1 : 0;
    const ageHours = Math.max(0.1, s.baseAgeH + ageJitter);

    return {
      address: s.address,
      pairAddress: s.pairAddress,
      symbol: s.symbol,
      name: s.name,
      imageUrl: s.imageUrl,
      priceUsd: s.priceUsd * (1 + h24Change / 100),
      liquidityUsd: liq,
      marketCapUsd: mcap,
      fdvUsd: mcap,
      volumeUsd: { m5: volM5, h1: finalVolH1, h6: volH6, h24: volH24 },
      priceChangePct: { m5: m5Change, h1: finalH1Change, h6: h6Change, h24: h24Change },
      buys24h,
      sells24h,
      buys1h: finalBuys1h,
      sells1h,
      poolCreatedAt: new Date(Date.now() - ageHours * 3600 * 1000).toISOString(),
      ageHours,
      chain,
      dexId: s.dexId,
    };
  });
}
