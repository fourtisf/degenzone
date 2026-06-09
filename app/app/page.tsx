'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Zap, Gem, Sparkles, Star, ChevronDown, TrendingUp, TrendingDown, Activity,
  Brain, Layers, History, Wallet, Volume2, VolumeX, ArrowLeft, Download, Link2, Check,
} from 'lucide-react';
import Heatmap from '@/components/Heatmap';
import SidePanel from '@/components/SidePanel';
import TimeMachine from '@/components/TimeMachine';
import WalletPanel from '@/components/WalletPanel';
import Logo from '@/components/Logo';
import ChainIcon from '@/components/ChainIcon';
import SearchBar, { type SearchBarHandle } from '@/components/SearchBar';
import type { Chain, SizeAxis, Timeframe, Token, TokenResponse } from '@/lib/types';
import { colorForChange, formatPct, formatUsd } from '@/lib/colors';
import { alerts, unlockAudio } from '@/lib/audio';

const CHAINS: { id: Chain; label: string }[] = [
  { id: 'solana', label: 'Solana' },
  { id: 'base',   label: 'Base' },
  { id: 'bsc',    label: 'BSC' },
  { id: 'eth',    label: 'Ethereum' },
];

const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: 'm5',  label: '5m' },
  { id: 'h1',  label: '1h' },
  { id: 'h6',  label: '6h' },
  { id: 'h24', label: '24h' },
];

const SIZE_AXES: { id: SizeAxis; label: string }[] = [
  { id: 'volume', label: 'Volume' },
  { id: 'liquidity', label: 'Liquidity' },
  { id: 'mcap', label: 'M.Cap' },
];

const MIN_LIQ_OPTIONS = [10000, 50000, 100000, 500000, 1000000];

const REFRESH_MS = 15_000;
const WATCHLIST_KEY = 'dh.watchlist.v1';
const SETTINGS_KEY = 'dh.settings.v1';

type Tooltip = { token: Token; x: number; y: number } | null;
type RightPanel = 'token' | 'time' | 'wallet' | null;

export default function AppPage() {
  const [chain, setChain] = useState<Chain>('solana');
  const [timeframe, setTimeframe] = useState<Timeframe>('h24');
  const [sizeAxis, setSizeAxis] = useState<SizeAxis>('volume');
  const [minLiq, setMinLiq] = useState<number>(50000);
  const [groupByNarrative, setGroupByNarrative] = useState<boolean>(false);
  const [smartMoneyMode, setSmartMoneyMode] = useState<boolean>(true);
  const [pumpMode, setPumpMode] = useState<boolean>(true);
  const [freshMode, setFreshMode] = useState<boolean>(false);
  const [whaleMode, setWhaleMode] = useState<boolean>(true);
  const [watchOnly, setWatchOnly] = useState<boolean>(false);
  const [audioOn, setAudioOn] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [shared, setShared] = useState<boolean>(false);

  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number>(0);
  const [source, setSource] = useState<string>('');
  const [now, setNow] = useState(Date.now());

  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [selected, setSelected] = useState<Token | null>(null);
  const [tooltip, setTooltip] = useState<Tooltip>(null);

  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [walletAddr, setWalletAddr] = useState<string>('');
  const [walletHoldings, setWalletHoldings] = useState<Set<string>>(new Set());

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchRef = useRef<SearchBarHandle>(null);
  const prevPumpSet = useRef<Set<string>>(new Set());

  const urlHydrated = useRef(false);

  // Live clock
  useEffect(() => {
    clockRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, []);

  // Hydrate view state from the URL once, so shared links open the same view.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const oneOf = <T extends string>(key: string, allowed: readonly T[]): T | null => {
      const v = p.get(key);
      return v && (allowed as readonly string[]).includes(v) ? (v as T) : null;
    };
    const c = oneOf<Chain>('chain', ['solana', 'base', 'bsc', 'eth']); if (c) setChain(c);
    const tf = oneOf<Timeframe>('tf', ['m5', 'h1', 'h6', 'h24']); if (tf) setTimeframe(tf);
    const sz = oneOf<SizeAxis>('size', ['volume', 'liquidity', 'mcap']); if (sz) setSizeAxis(sz);
    const ml = Number(p.get('minliq')); if (MIN_LIQ_OPTIONS.includes(ml)) setMinLiq(ml);
    const bool = (key: string, set: (v: boolean) => void) => {
      const v = p.get(key); if (v === '1') set(true); else if (v === '0') set(false);
    };
    bool('sectors', setGroupByNarrative);
    bool('smart', setSmartMoneyMode);
    bool('pump', setPumpMode);
    bool('fresh', setFreshMode);
    bool('whale', setWhaleMode);
    const q = p.get('q'); if (q) setSearch(q);
    urlHydrated.current = true;
  }, []);

  // Mirror view state back into the URL (replace, no history spam).
  useEffect(() => {
    if (!urlHydrated.current) return;
    const p = new URLSearchParams();
    p.set('chain', chain);
    p.set('tf', timeframe);
    p.set('size', sizeAxis);
    p.set('minliq', String(minLiq));
    p.set('sectors', groupByNarrative ? '1' : '0');
    p.set('smart', smartMoneyMode ? '1' : '0');
    p.set('pump', pumpMode ? '1' : '0');
    p.set('fresh', freshMode ? '1' : '0');
    p.set('whale', whaleMode ? '1' : '0');
    if (search.trim()) p.set('q', search.trim());
    window.history.replaceState(null, '', `${window.location.pathname}?${p.toString()}`);
  }, [chain, timeframe, sizeAxis, minLiq, groupByNarrative, smartMoneyMode, pumpMode, freshMode, whaleMode, search]);

  // Load persisted state
  useEffect(() => {
    try {
      const w = window.localStorage.getItem(WATCHLIST_KEY);
      if (w) {
        const arr = JSON.parse(w);
        if (Array.isArray(arr)) setWatchlist(new Set(arr));
      }
      const s = window.localStorage.getItem(SETTINGS_KEY);
      if (s) {
        const cfg = JSON.parse(s);
        if (cfg.audioOn != null) setAudioOn(!!cfg.audioOn);
        if (cfg.smartMoneyMode != null) setSmartMoneyMode(!!cfg.smartMoneyMode);
      }
    } catch {}
  }, []);

  // Persist settings
  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ audioOn, smartMoneyMode }));
    } catch {}
  }, [audioOn, smartMoneyMode]);

  const toggleWatch = useCallback((address: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(address)) next.delete(address);
      else next.add(address);
      try {
        window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  const fetchTokens = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const params = new URLSearchParams({
          chain,
          timeframe,
          minLiq: String(minLiq),
        });
        if (freshMode) params.set('maxAge', '48');
        const r = await fetch(`/api/tokens?${params.toString()}`, { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data: TokenResponse = await r.json();
        setTokens(data.tokens ?? []);
        setFetchedAt(data.fetchedAt);
        setSource(data.source);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? 'failed to load');
      } finally {
        setLoading(false);
      }
    },
    [chain, timeframe, minLiq, freshMode]
  );

  useEffect(() => {
    fetchTokens(false);
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => fetchTokens(true), REFRESH_MS);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [fetchTokens]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA';
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); searchRef.current?.focus(); return;
      }
      if (e.key === '/' && !isInput) { e.preventDefault(); searchRef.current?.focus(); return; }
      if (isInput) return;
      if (e.key === '1') setTimeframe('m5');
      if (e.key === '2') setTimeframe('h1');
      if (e.key === '3') setTimeframe('h6');
      if (e.key === '4') setTimeframe('h24');
      if (e.key === 's' || e.key === 'S') {
        setSizeAxis((s) => (s === 'volume' ? 'liquidity' : s === 'liquidity' ? 'mcap' : 'volume'));
      }
      if (e.key === 'g' || e.key === 'G') setGroupByNarrative((v) => !v);
      if (e.key === 'm' || e.key === 'M') setSmartMoneyMode((v) => !v);
      if (e.key === 'p' || e.key === 'P') setPumpMode((v) => !v);
      if (e.key === 'f' || e.key === 'F') setFreshMode((v) => !v);
      if (e.key === 'w' || e.key === 'W') setWhaleMode((v) => !v);
      if (e.key === 't' || e.key === 'T') setRightPanel((r) => (r === 'time' ? null : 'time'));
      if (e.key === 'Escape') {
        if (rightPanel) setRightPanel(null);
        else { setSelected(null); setSearch(''); }
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [rightPanel]);

  const visibleTokens = useMemo(() => {
    let list = tokens;
    if (watchOnly) list = list.filter((t) => watchlist.has(t.address));
    if (walletHoldings.size > 0) list = list.filter((t) => walletHoldings.has(t.address));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      // Only match contract address when the user pasted something address-shaped
      // (≥ 16 chars). Short queries like 'pump' shouldn't match every pump.fun
      // mint whose address ends with 'pump'.
      const matchAddr = q.length >= 16 || q.startsWith('0x');
      list = list.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          (matchAddr && t.address.toLowerCase().includes(q))
      );
    }
    return list;
  }, [tokens, search, watchOnly, watchlist, walletHoldings]);

  const pumpSet = useMemo(() => {
    if (!pumpMode || visibleTokens.length === 0) return new Set<string>();
    const vols = visibleTokens.map((t) => t.volumeUsd.h1).filter((v) => v > 0);
    if (vols.length < 5) return new Set<string>();
    const mean = vols.reduce((a, b) => a + b, 0) / vols.length;
    const variance = vols.reduce((a, b) => a + (b - mean) ** 2, 0) / vols.length;
    const std = Math.sqrt(variance) || mean * 0.2;
    const set = new Set<string>();
    for (const t of visibleTokens) {
      if (t.liquidityUsd < 25_000) continue;
      if (t.ageHours != null && t.ageHours < 0.08) continue;
      const z = (t.volumeUsd.h1 - mean) / Math.max(std, mean * 0.2);
      const baseline = t.volumeUsd.h24 / 24;
      const burst = baseline > 0 ? t.volumeUsd.h1 / baseline : 0;
      const accel = t.priceChangePct.h1 - t.priceChangePct.h6 / 6;
      const buyShare = t.buys1h + t.sells1h > 0 ? t.buys1h / (t.buys1h + t.sells1h) : 0.5;
      if (z > 1.5 && burst > 3 && accel > 0 && buyShare > 0.55) set.add(t.address);
    }
    return set;
  }, [visibleTokens, pumpMode]);

  // Audio alerts: ring when a NEW token enters the pump set
  useEffect(() => {
    if (!audioOn) { prevPumpSet.current = new Set(pumpSet); return; }
    for (const addr of pumpSet) {
      if (!prevPumpSet.current.has(addr)) {
        const t = visibleTokens.find((x) => x.address === addr);
        if (t && Math.abs(t.priceChangePct.h1) > 30) alerts.megaPump();
        else alerts.pump();
        break; // one ring per cycle
      }
    }
    prevPumpSet.current = new Set(pumpSet);
  }, [pumpSet, audioOn, visibleTokens]);

  const whaleSet = useMemo(() => {
    if (!whaleMode || visibleTokens.length === 0) return new Set<string>();
    const set = new Set<string>();
    for (const t of visibleTokens) {
      const txCount1h = t.buys1h + t.sells1h;
      if (txCount1h < 5) continue;
      const avgTradeUsd = t.volumeUsd.h1 / txCount1h;
      if (avgTradeUsd > 5000 && t.priceChangePct.h1 > 2) set.add(t.address);
    }
    return set;
  }, [visibleTokens, whaleMode]);

  const stats = useMemo(() => {
    if (visibleTokens.length === 0) return { count: 0, up: 0, down: 0, avgChange: 0, totalVol: 0, topMover: null as Token | null, smartCount: 0 };
    let up = 0, down = 0, sumChange = 0, totalVol = 0, smartCount = 0;
    let topMover: Token | null = null;
    for (const t of visibleTokens) {
      const c = t.priceChangePct[timeframe];
      if (c > 0) up++; else if (c < 0) down++;
      sumChange += c;
      totalVol += t.volumeUsd[timeframe];
      if ((t.smartScore ?? 0) > 0.5) smartCount++;
      if (!topMover || Math.abs(c) > Math.abs(topMover.priceChangePct[timeframe])) topMover = t;
    }
    return { count: visibleTokens.length, up, down, avgChange: sumChange / visibleTokens.length, totalVol, topMover, smartCount };
  }, [visibleTokens, timeframe]);

  const watchCount = watchlist.size;
  const secondsAgo = fetchedAt ? Math.max(0, Math.round((now - fetchedAt) / 1000)) : 0;

  function toggleAudio() {
    if (!audioOn) { unlockAudio(); setAudioOn(true); }
    else setAudioOn(false);
  }

  function shareView() {
    navigator.clipboard?.writeText(window.location.href).then(
      () => { setShared(true); setTimeout(() => setShared(false), 1400); },
      () => {},
    );
  }

  function exportCsv() {
    if (visibleTokens.length === 0) return;
    const cols = [
      'symbol', 'name', 'address', 'chain', 'priceUsd',
      `change_${timeframe}_pct`, `volume_${timeframe}_usd`,
      'liquidityUsd', 'marketCapUsd', 'buys1h', 'sells1h', 'ageHours', 'smartScore', 'narrativeId',
    ];
    const esc = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = visibleTokens.map((t) => [
      t.symbol, t.name, t.address, chain, t.priceUsd,
      t.priceChangePct[timeframe], t.volumeUsd[timeframe],
      t.liquidityUsd, t.marketCapUsd ?? '', t.buys1h, t.sells1h,
      t.ageHours ?? '', t.smartScore ?? '', t.narrativeId ?? '',
    ].map(esc).join(','));
    const csv = [cols.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `degenzone-${chain}-${timeframe}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-canvas text-white overflow-hidden">
      {/* Header */}
      <header className="h-12 px-4 flex items-center gap-4 border-b border-border-line shrink-0 bg-surface-1/40 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 shrink-0 group" title="Back to landing">
          <ArrowLeft size={14} className="text-zinc-500 group-hover:text-white transition hidden md:block" />
          <Logo size={22} />
          <span className="font-bold text-[15px] tracking-tight">DegenZone</span>
        </Link>

        <nav className="flex items-center gap-0.5 shrink-0 bg-surface-2 rounded p-0.5">
          {CHAINS.map((c) => (
            <button
              key={c.id}
              onClick={() => setChain(c.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition ${
                chain === c.id ? 'bg-surface-3 text-white shadow-inset-line' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ChainIcon chain={c.id} size={13} />
              <span className="hidden md:inline">{c.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex-1 flex justify-center">
          <SearchBar ref={searchRef} value={search} onChange={setSearch} resultCount={search ? visibleTokens.length : undefined} />
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 shrink-0">
          <button
            onClick={toggleAudio}
            className={`w-7 h-7 rounded flex items-center justify-center transition border ${
              audioOn ? 'text-accent border-accent/40 bg-accent/10' : 'text-zinc-500 border-border-line hover:text-white hover:bg-surface-2'
            }`}
            title={audioOn ? 'Audio alerts on' : 'Audio alerts off'}
            aria-label="Toggle audio"
          >
            {audioOn ? <Volume2 size={13} strokeWidth={2.5} /> : <VolumeX size={13} strokeWidth={2.5} />}
          </button>
          {source === 'demo' && process.env.NEXT_PUBLIC_SHOW_DEMO_BADGE === '1' && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-accent/15 text-accent border border-accent/30 tracking-wider">
              demo
            </span>
          )}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-2 border border-border-line">
            <span className="w-1.5 h-1.5 rounded-full live-dot" />
            <span className="text-[11px] tabular-nums font-mono">{fetchedAt ? `${secondsAgo}s` : '—'}</span>
          </div>
        </div>
      </header>

      {/* KPI strip */}
      <div className="h-10 px-4 flex items-center gap-5 border-b border-border-line shrink-0 bg-surface-1/30 overflow-x-auto scrollbar-thin">
        <KPI icon={<Activity size={11} strokeWidth={2.5} />} label="24h Volume" value={formatUsd(stats.totalVol)} />
        <KPI icon={<TrendingUp size={11} strokeWidth={2.5} className="text-emerald-500" />} label="Up" value={stats.count > 0 ? `${stats.up} / ${stats.count}` : '—'} accent="emerald" />
        <KPI icon={<TrendingDown size={11} strokeWidth={2.5} className="text-red-500" />} label="Down" value={stats.count > 0 ? `${stats.down} / ${stats.count}` : '—'} accent="red" />
        <KPI icon={<Brain size={11} strokeWidth={2.5} className="text-cyan-400" />} label="Smart money" value={String(stats.smartCount)} accent="cyan" />
        <KPI icon={<Zap size={11} strokeWidth={2.5} className="text-accent" />} label="Pump signals" value={String(pumpSet.size)} highlight={pumpSet.size > 0} />
        <KPI icon={<Gem size={11} strokeWidth={2.5} className="text-whale" />} label="Whale activity" value={String(whaleSet.size)} />
        {stats.topMover && (
          <KPI icon={<Sparkles size={11} strokeWidth={2.5} />} label={`Top mover · ${TIMEFRAMES.find((t) => t.id === timeframe)?.label}`}
               value={(
                 <span className="flex items-center gap-1.5">
                   <span>{stats.topMover.symbol}</span>
                   <span className="text-[10px] tabular-nums font-mono px-1 py-0.5 rounded" style={{ background: colorForChange(stats.topMover.priceChangePct[timeframe]) }}>
                     {formatPct(stats.topMover.priceChangePct[timeframe])}
                   </span>
                 </span>
               )}/>
        )}
      </div>

      {/* Filter bar */}
      <div className="px-4 py-2 border-b border-border-line flex flex-wrap gap-x-3 gap-y-2 items-center text-sm shrink-0 bg-surface-1/20">
        <FilterGroup label="Time">
          {TIMEFRAMES.map((t) => (
            <SegBtn key={t.id} active={timeframe === t.id} onClick={() => setTimeframe(t.id)}>{t.label}</SegBtn>
          ))}
        </FilterGroup>
        <FilterGroup label="Size">
          {SIZE_AXES.map((s) => (
            <SegBtn key={s.id} active={sizeAxis === s.id} onClick={() => setSizeAxis(s.id)}>{s.label}</SegBtn>
          ))}
        </FilterGroup>
        <FilterGroup label="View">
          <SegBtn active={!groupByNarrative} onClick={() => setGroupByNarrative(false)}>Tokens</SegBtn>
          <SegBtn active={groupByNarrative} onClick={() => setGroupByNarrative(true)}>Sectors</SegBtn>
        </FilterGroup>
        <FilterGroup label="Min Liq">
          <div className="relative">
            <select value={minLiq} onChange={(e) => setMinLiq(Number(e.target.value))}
              className="appearance-none bg-surface-2 hover:bg-surface-3 text-[11px] font-semibold pl-2 pr-6 py-1 rounded outline-none border border-border-line focus:border-border-strong transition cursor-pointer">
              {MIN_LIQ_OPTIONS.map((v) => <option key={v} value={v}>{formatUsd(v)}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </FilterGroup>

        <div className="flex items-center gap-1 ml-auto">
          <Toggle active={smartMoneyMode} onToggle={() => setSmartMoneyMode((v) => !v)} icon={<Brain size={11} strokeWidth={2.5} />} label="Smart" />
          <Toggle active={pumpMode} onToggle={() => setPumpMode((v) => !v)} icon={<Zap size={11} strokeWidth={2.5} />} label="Pump" />
          <Toggle active={freshMode} onToggle={() => setFreshMode((v) => !v)} icon={<Sparkles size={11} strokeWidth={2.5} />} label="Fresh" />
          <Toggle active={whaleMode} onToggle={() => setWhaleMode((v) => !v)} icon={<Gem size={11} strokeWidth={2.5} />} label="Whale" />
          <Toggle active={watchOnly} onToggle={() => setWatchOnly((v) => !v)} icon={<Star size={11} strokeWidth={2.5} fill={watchOnly ? '#FFB800' : 'none'} />} label={watchCount ? `Watchlist · ${watchCount}` : 'Watchlist'} disabled={watchCount === 0} />
          <span className="w-px h-5 bg-border-line mx-1" />
          <Toggle active={rightPanel === 'time'} onToggle={() => setRightPanel(rightPanel === 'time' ? null : 'time')} icon={<History size={11} strokeWidth={2.5} />} label="Time" />
          <Toggle active={rightPanel === 'wallet'} onToggle={() => setRightPanel(rightPanel === 'wallet' ? null : 'wallet')} icon={<Wallet size={11} strokeWidth={2.5} />} label="Wallet" />
          <span className="w-px h-5 bg-border-line mx-1" />
          <Toggle active={shared} onToggle={shareView} icon={shared ? <Check size={11} strokeWidth={2.5} /> : <Link2 size={11} strokeWidth={2.5} />} label={shared ? 'Copied' : 'Share'} />
          <Toggle active={false} onToggle={exportCsv} icon={<Download size={11} strokeWidth={2.5} />} label="CSV" disabled={visibleTokens.length === 0} />
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative">
          {loading && tokens.length === 0 ? (
            <LoadingState chain={chain} />
          ) : error && tokens.length === 0 ? (
            <ErrorState error={error} onRetry={() => fetchTokens(false)} />
          ) : visibleTokens.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <Heatmap
              tokens={visibleTokens}
              timeframe={timeframe}
              sizeAxis={sizeAxis}
              groupByNarrative={groupByNarrative}
              smartMoneyMode={smartMoneyMode}
              pumpSet={pumpSet}
              whaleSet={whaleSet}
              watchSet={new Set([...Array.from(watchlist), ...Array.from(walletHoldings)])}
              onHover={(t, x, y) => (t ? setTooltip({ token: t, x, y }) : setTooltip(null))}
              onSelect={(t) => { setSelected(t); setRightPanel('token'); }}
            />
          )}

          {visibleTokens.length > 0 && (
            <div className="absolute bottom-2 right-3 pointer-events-none hidden lg:block">
              <div className="bg-surface-1/80 backdrop-blur-md rounded px-2 py-1 border border-border-line/60 font-mono text-[10px] text-zinc-600">
                <kbd className="text-zinc-400">⌘K</kbd> search · <kbd className="text-zinc-400">G</kbd> sectors · <kbd className="text-zinc-400">M</kbd> smart · <kbd className="text-zinc-400">T</kbd> time · <kbd className="text-zinc-400">ESC</kbd> close
              </div>
            </div>
          )}

          {tooltip && <TileTooltip tooltip={tooltip} timeframe={timeframe} pumpSet={pumpSet} whaleSet={whaleSet} watchlist={watchlist} />}
        </div>

        {rightPanel === 'token' && selected && (
          <SidePanel token={selected} watched={watchlist.has(selected.address)} isPump={pumpSet.has(selected.address)} isWhale={whaleSet.has(selected.address)} onToggleWatch={toggleWatch} onClose={() => { setSelected(null); setRightPanel(null); }} />
        )}
        {rightPanel === 'time' && (
          <TimeMachine chain={chain} current={visibleTokens} onClose={() => setRightPanel(null)} />
        )}
        {rightPanel === 'wallet' && (
          <WalletPanel wallet={walletAddr} setWallet={setWalletAddr} onLoad={setWalletHoldings} onClose={() => { setRightPanel(null); setWalletHoldings(new Set()); }} />
        )}
      </main>
    </div>
  );
}

function TileTooltip({ tooltip, timeframe, pumpSet, whaleSet, watchlist }: { tooltip: { token: Token; x: number; y: number }; timeframe: Timeframe; pumpSet: Set<string>; whaleSet: Set<string>; watchlist: Set<string> }) {
  return (
    <div className="absolute pointer-events-none bg-surface-3 border border-border-line rounded px-3 py-2 text-xs shadow-2xl z-10 min-w-[210px]"
      style={{ left: Math.min(tooltip.x + 12, (typeof window !== 'undefined' ? window.innerWidth - 240 : 1000)), top: tooltip.y + 12 }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-bold tracking-tight">{tooltip.token.symbol}</span>
        <span className="text-zinc-500 text-[10px] truncate">{tooltip.token.name}</span>
      </div>
      <div className="font-mono tabular-nums text-zinc-100 text-[13px]">{formatUsd(tooltip.token.priceUsd, { compact: false })}</div>
      <div className="font-semibold tabular-nums text-[12px] font-mono" style={{ color: colorForChange(tooltip.token.priceChangePct[timeframe]) }}>
        {formatPct(tooltip.token.priceChangePct[timeframe])}<span className="text-zinc-500 ml-1">· {timeframe}</span>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-zinc-500 font-mono tabular-nums">
        <span>MC</span><span className="text-right text-zinc-300">{formatUsd(tooltip.token.marketCapUsd)}</span>
        <span>Liq</span><span className="text-right text-zinc-300">{formatUsd(tooltip.token.liquidityUsd)}</span>
        <span>Vol 24h</span><span className="text-right text-zinc-300">{formatUsd(tooltip.token.volumeUsd.h24)}</span>
        <span>Age</span><span className="text-right text-zinc-300">{tooltip.token.ageHours != null ? `${Math.round(tooltip.token.ageHours)}h` : '—'}</span>
      </div>
      {((tooltip.token.smartScore ?? 0) > 0.5 || pumpSet.has(tooltip.token.address) || whaleSet.has(tooltip.token.address) || watchlist.has(tooltip.token.address)) && (
        <div className="mt-2 pt-1.5 border-t border-border-line flex flex-wrap gap-1">
          {(tooltip.token.smartScore ?? 0) > 0.5 && (
            <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-cyan-400/15 text-cyan-400 border border-cyan-400/30">smart</span>
          )}
          {pumpSet.has(tooltip.token.address) && (
            <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">pump</span>
          )}
          {whaleSet.has(tooltip.token.address) && (
            <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-whale/15 text-whale border border-whale/30">whale</span>
          )}
          {watchlist.has(tooltip.token.address) && (
            <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">watchlist</span>
          )}
        </div>
      )}
    </div>
  );
}

function KPI({ icon, label, value, highlight, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; highlight?: boolean; accent?: 'emerald' | 'red' | 'cyan' }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="text-zinc-500">{icon}</div>
      <div className="flex flex-col leading-none">
        <span className="text-[9px] uppercase tracking-wider text-zinc-500">{label}</span>
        <span className={`text-[13px] font-semibold tabular-nums mt-0.5 ${
          highlight ? 'text-accent' :
          accent === 'emerald' ? 'text-emerald-400' :
          accent === 'red' ? 'text-red-400' :
          accent === 'cyan' ? 'text-cyan-400' : 'text-zinc-100'
        }`}>{value}</span>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">{label}</span>
      <div className="flex items-center gap-0.5 bg-surface-2 rounded p-0.5">{children}</div>
    </div>
  );
}

function SegBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-2 py-0.5 text-[11px] font-semibold rounded transition ${
      active ? 'bg-surface-3 text-white shadow-inset-line' : 'text-zinc-500 hover:text-zinc-300'
    }`}>{children}</button>
  );
}

function Toggle({ active, onToggle, icon, label, disabled }: { active: boolean; onToggle: () => void; icon: React.ReactNode; label: string; disabled?: boolean }) {
  return (
    <button onClick={onToggle} disabled={disabled}
      className={`px-2 py-1 text-[11px] font-semibold rounded transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed border ${
        active ? 'bg-surface-3 text-white border-border-strong' : 'text-zinc-500 hover:text-zinc-300 hover:bg-surface-2 border-transparent'
      }`} title={`Toggle ${label}`}>{icon}<span>{label}</span></button>
  );
}

function LoadingState({ chain }: { chain: Chain }) {
  return (
    <div className="absolute inset-0 grid grid-cols-4 gap-1 p-1 opacity-40">
      {Array.from({ length: 16 }).map((_, i) => <div key={i} className="skeleton rounded" style={{ aspectRatio: '1.4 / 1' }} />)}
      <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
        Loading {chain.toUpperCase()} tokens…
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="text-3xl mb-2">⚠</div>
        <div className="mb-2 text-zinc-300">Couldn&apos;t load data</div>
        <div className="text-xs text-zinc-600 font-mono mb-3">{error}</div>
        <button onClick={onRetry} className="px-3 py-1.5 text-xs rounded border border-border-line hover:border-border-strong hover:bg-surface-2 transition">Retry</button>
      </div>
    </div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
      <div className="text-center">
        <div className="mb-1 text-zinc-400">No tokens match</div>
        <div className="text-xs text-zinc-600">{search ? `No results for "${search}"` : 'Loosen the filters and try again.'}</div>
      </div>
    </div>
  );
}
