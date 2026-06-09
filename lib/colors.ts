// 15-stop diverging scale. Saturates beyond ±50% so extreme values still differentiate
// from moderate moves, but a +800% tile doesn't look identical to a +15% tile.
const STOPS: Array<[number, string]> = [
  [-Infinity, '#5C0F0F'],
  [-50,       '#7F1D1D'],
  [-25,       '#991B1B'],
  [-15,       '#B91C1C'],
  [-8,        '#DC2626'],
  [-4,        '#EF4444'],
  [-1.5,      '#7F3F3F'],
  [-0.3,      '#374151'],
  [0.3,       '#3F7F3F'],
  [1.5,       '#1F8E47'],
  [4,         '#16A34A'],
  [8,         '#15803D'],
  [15,        '#166534'],
  [25,        '#14532D'],
  [50,        '#0F3F22'],
];

export function colorForChange(pct: number | null | undefined): string {
  if (pct == null || Number.isNaN(pct)) return '#374151';
  let last = STOPS[0][1];
  for (const [t, c] of STOPS) {
    if (pct < t) return last;
    last = c;
  }
  return last;
}

export function intensityForChange(pct: number | null | undefined): number {
  if (pct == null || Number.isNaN(pct)) return 0;
  const a = Math.abs(pct);
  if (a < 25) return 0;
  if (a < 50) return 0.35;
  if (a < 100) return 0.6;
  return 1;
}

export function textColorOn(pct: number | null | undefined): string {
  if (pct == null || Number.isNaN(pct)) return '#E5E7EB';
  return Math.abs(pct) < 0.3 ? '#E5E7EB' : '#FFFFFF';
}

export function formatUsd(n: number | null | undefined, opts?: { compact?: boolean }): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const compact = opts?.compact ?? true;
  if (!compact) return `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  if (abs >= 1)   return `$${n.toFixed(2)}`;
  if (abs >= 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toPrecision(3)}`;
}

export function formatPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const sign = n > 0 ? '+' : '';
  // Compact display for extreme values so they don't blow out tiles
  const a = Math.abs(n);
  if (a >= 1000) return `${sign}${(n / 1000).toFixed(1)}K%`;
  if (a >= 100) return `${sign}${n.toFixed(0)}%`;
  return `${sign}${n.toFixed(2)}%`;
}

export function formatAge(hours: number | null | undefined): string {
  if (hours == null || !Number.isFinite(hours)) return '—';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  if (hours < 24 * 30) return `${(hours / 24).toFixed(1)}d`;
  return `${(hours / (24 * 30)).toFixed(1)}mo`;
}
