// Lightweight Solana JSON-RPC client. Free public endpoints, no API key.
// Rotates through multiple providers on failure; backs off when rate-limited.

const ENDPOINTS = [
  process.env.SOLANA_RPC_URL, // user-supplied (Helius etc.) takes priority
  'https://solana-rpc.publicnode.com',
  'https://api.mainnet-beta.solana.com',
  'https://rpc.ankr.com/solana',
].filter(Boolean) as string[];

let endpointIdx = 0;
const failures = new Map<string, number>();

async function call<T>(method: string, params: any[]): Promise<T> {
  const start = endpointIdx;
  for (let attempt = 0; attempt < ENDPOINTS.length; attempt++) {
    const url = ENDPOINTS[(start + attempt) % ENDPOINTS.length];
    if ((failures.get(url) ?? 0) > 3) continue; // cooled down for now
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: ctrl.signal,
        cache: 'no-store',
      });
      clearTimeout(t);
      if (!res.ok) {
        failures.set(url, (failures.get(url) ?? 0) + 1);
        continue;
      }
      const data: any = await res.json();
      if (data.error) {
        failures.set(url, (failures.get(url) ?? 0) + 1);
        continue;
      }
      failures.set(url, 0);
      endpointIdx = (start + attempt) % ENDPOINTS.length;
      return data.result as T;
    } catch {
      failures.set(url, (failures.get(url) ?? 0) + 1);
      continue;
    }
  }
  throw new Error(`All Solana RPCs failed for ${method}`);
}

// ---- Public methods we use ----

export type TokenAccountValue = {
  mint: string;
  uiAmount: number;
  decimals: number;
  owner: string;
  tokenAccount: string;
};

export async function getTokenAccountsByOwner(walletAddr: string): Promise<TokenAccountValue[]> {
  const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
  type Resp = {
    value: Array<{
      pubkey: string;
      account: {
        data: { parsed: { info: { mint: string; owner: string; tokenAmount: { uiAmount: number; decimals: number } } } };
      };
    }>;
  };
  const res = await call<Resp>('getTokenAccountsByOwner', [
    walletAddr,
    { programId: TOKEN_PROGRAM },
    { encoding: 'jsonParsed' },
  ]);
  const out: TokenAccountValue[] = [];
  for (const acct of res.value) {
    const info = acct.account?.data?.parsed?.info;
    if (!info) continue;
    if (!info.tokenAmount?.uiAmount || info.tokenAmount.uiAmount <= 0) continue;
    out.push({
      mint: info.mint,
      uiAmount: info.tokenAmount.uiAmount,
      decimals: info.tokenAmount.decimals ?? 0,
      owner: info.owner,
      tokenAccount: acct.pubkey,
    });
  }
  return out;
}

export type SignatureInfo = {
  signature: string;
  slot: number;
  blockTime: number | null;
  err: any;
};

export async function getSignaturesForAddress(walletAddr: string, opts: { until?: string; limit?: number } = {}): Promise<SignatureInfo[]> {
  const params: any[] = [walletAddr, { limit: opts.limit ?? 25 }];
  if (opts.until) params[1].until = opts.until;
  const res = await call<SignatureInfo[]>('getSignaturesForAddress', params);
  return res ?? [];
}

export type ParsedTokenBalance = {
  accountIndex: number;
  mint: string;
  owner: string;
  uiTokenAmount: { uiAmount: number | null; decimals: number };
};

export type ParsedTransaction = {
  blockTime: number | null;
  meta: {
    err: any;
    preTokenBalances?: ParsedTokenBalance[];
    postTokenBalances?: ParsedTokenBalance[];
  } | null;
  transaction: {
    message: { accountKeys: any[] };
    signatures: string[];
  };
};

export async function getParsedTransaction(signature: string): Promise<ParsedTransaction | null> {
  return await call<ParsedTransaction>('getParsedTransaction', [
    signature,
    { maxSupportedTransactionVersion: 0, encoding: 'jsonParsed' },
  ]);
}

export type HolderConcentration = {
  // Share of total supply held by the largest token accounts (0-1).
  // Note: largest accounts can include DEX liquidity pools, so this is an
  // upper bound on true wallet concentration.
  top1: number;
  top10: number;
  accountsSampled: number;
};

export async function getHolderConcentration(mint: string, supply: number): Promise<HolderConcentration | null> {
  if (!(supply > 0)) return null;
  type Resp = {
    value: Array<{ uiAmount: number | null; amount: string; decimals: number }>;
  };
  let res: Resp;
  try {
    res = await call<Resp>('getTokenLargestAccounts', [mint]);
  } catch {
    return null; // supplementary signal — don't fail the whole scan
  }
  const accts = res?.value;
  if (!accts || accts.length === 0) return null;
  const amounts = accts
    .map((a) => (a.uiAmount != null ? a.uiAmount : Number(a.amount) / 10 ** (a.decimals || 0)))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => b - a);
  if (amounts.length === 0) return null;
  const top1 = amounts[0] / supply;
  const top10 = amounts.slice(0, 10).reduce((s, n) => s + n, 0) / supply;
  return {
    top1: Math.min(top1, 1),
    top10: Math.min(top10, 1),
    accountsSampled: amounts.length,
  };
}

export type MintInfo = {
  mint: string;
  decimals: number;
  supply: number;
  mintAuthority: string | null;   // null => mint authority renounced
  freezeAuthority: string | null; // null => cannot freeze holders
  isInitialized: boolean;
};

export async function getMintInfo(mint: string): Promise<MintInfo | null> {
  type Resp = {
    value: {
      data: {
        parsed: {
          type: string;
          info: {
            decimals: number;
            supply: string;
            mintAuthority: string | null;
            freezeAuthority: string | null;
            isInitialized: boolean;
          };
        };
        program: string;
      } | null;
    } | null;
  };
  const res = await call<Resp>('getAccountInfo', [mint, { encoding: 'jsonParsed' }]);
  const parsed = res?.value?.data?.parsed;
  if (!parsed || parsed.type !== 'mint') return null;
  const info = parsed.info;
  const supply = Number(info.supply) / 10 ** (info.decimals || 0);
  return {
    mint,
    decimals: info.decimals,
    supply: Number.isFinite(supply) ? supply : 0,
    mintAuthority: info.mintAuthority ?? null,
    freezeAuthority: info.freezeAuthority ?? null,
    isInitialized: info.isInitialized,
  };
}
