'use client';

import { useEffect, useState } from 'react';
import type { Candle, Chain, OhlcvResponse } from '@/lib/types';
import { colorForChange, formatUsd } from '@/lib/colors';

type Props = {
  chain: Chain;
  pair: string;
  price: number;
  height?: number;
};

export default function Sparkline({ chain, pair, price, height = 88 }: Props) {
  const [data, setData] = useState<Candle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState<{ c: Candle; x: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    setHover(null);

    const params = new URLSearchParams({
      chain,
      pair,
      timeframe: 'hour',
      aggregate: '1',
      limit: '48',
      price: String(price),
    });

    fetch(`/api/ohlcv?${params.toString()}`)
      .then((r) => r.json() as Promise<OhlcvResponse>)
      .then((res) => {
        if (cancelled) return;
        if (res?.candles?.length) setData(res.candles);
        else setError('no data');
      })
      .catch((e) => {
        if (!cancelled) setError(String(e?.message ?? e));
      });

    return () => {
      cancelled = true;
    };
  }, [chain, pair, price]);

  if (error) {
    return (
      <div
        className="w-full rounded bg-line/40 flex items-center justify-center text-xs text-zinc-500"
        style={{ height }}
      >
        chart unavailable
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full rounded bg-line/40 animate-pulse" style={{ height }} />
    );
  }

  const width = 320;
  const padX = 4;
  const padY = 6;
  const closes = data.map((c) => c.c);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = Math.max(max - min, max * 0.0001);
  const first = closes[0];
  const last = closes[closes.length - 1];
  const totalPct = first > 0 ? ((last - first) / first) * 100 : 0;
  const stroke = colorForChange(totalPct);

  const x = (i: number) => padX + (i / Math.max(closes.length - 1, 1)) * (width - 2 * padX);
  const y = (v: number) => padY + (1 - (v - min) / range) * (height - 2 * padY);

  const line = closes.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area =
    `M ${x(0).toFixed(1)} ${(height - padY).toFixed(1)} ` +
    closes.map((v, i) => `L ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ') +
    ` L ${x(closes.length - 1).toFixed(1)} ${(height - padY).toFixed(1)} Z`;

  const gradId = `spark-grad-${pair.slice(0, 8)}`;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full block"
        style={{ height }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const rel = ((e.clientX - rect.left) / rect.width) * width;
          const idx = Math.max(0, Math.min(closes.length - 1, Math.round(((rel - padX) / (width - 2 * padX)) * (closes.length - 1))));
          setHover({ c: data[idx], x: x(idx) });
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradId})`} />
        <path d={line} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        {hover && (
          <>
            <line x1={hover.x} y1={padY} x2={hover.x} y2={height - padY} stroke="#52525B" strokeWidth={0.5} strokeDasharray="2 2" />
            <circle cx={hover.x} cy={y(hover.c.c)} r={3} fill={stroke} stroke="#0A0A0F" strokeWidth={1} />
          </>
        )}
      </svg>
      <div className="flex justify-between items-baseline text-[10px] text-zinc-500 mt-1 px-0.5">
        <span>48h</span>
        {hover ? (
          <span className="tabular-nums">
            {formatUsd(hover.c.c, { compact: false })} ·{' '}
            <span style={{ color: stroke }}>
              {(((hover.c.c - first) / first) * 100).toFixed(2)}%
            </span>
          </span>
        ) : (
          <span className="tabular-nums" style={{ color: stroke }}>
            {totalPct >= 0 ? '+' : ''}
            {totalPct.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}
