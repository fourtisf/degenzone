'use client';

import { useMemo } from 'react';
import { Group } from '@visx/group';
import { Treemap, hierarchy, treemapSquarify } from '@visx/hierarchy';
import { ParentSize } from '@visx/responsive';
import type { SizeAxis, Timeframe, Token } from '@/lib/types';
import { colorForChange, formatPct, intensityForChange, textColorOn } from '@/lib/colors';
import { getAllNarratives } from '@/lib/narratives';

type Props = {
  tokens: Token[];
  timeframe: Timeframe;
  sizeAxis: SizeAxis;
  groupByNarrative: boolean;
  smartMoneyMode: boolean;
  pumpSet: Set<string>;
  whaleSet: Set<string>;
  watchSet: Set<string>;
  onHover: (token: Token | null, x: number, y: number) => void;
  onSelect: (token: Token) => void;
};

type TreeDatum = {
  name: string;
  label?: string;
  emoji?: string;
  value: number;
  token?: Token;
  isSector?: boolean;
  children?: TreeDatum[];
};

function valueFor(t: Token, axis: SizeAxis, tf: Timeframe): number {
  if (axis === 'liquidity') return Math.max(t.liquidityUsd, 1);
  if (axis === 'mcap') return Math.max(t.marketCapUsd ?? t.fdvUsd ?? t.liquidityUsd, 1);
  return Math.max(t.volumeUsd[tf], 1);
}

function tilePrice(p: number): string {
  if (!Number.isFinite(p) || p <= 0) return '—';
  if (p >= 1) return '$' + p.toFixed(2);
  if (p >= 0.01) return '$' + p.toFixed(4);
  if (p >= 0.0001) return '$' + p.toFixed(6);
  return '$' + p.toExponential(1);
}

export default function Heatmap(props: Props) {
  const { tokens, timeframe, sizeAxis, groupByNarrative, smartMoneyMode, pumpSet, whaleSet, watchSet, onHover, onSelect } = props;

  const root = useMemo(() => {
    if (groupByNarrative) {
      // 2-level hierarchy: root → sectors → tokens
      const narratives = getAllNarratives();
      const byNarrative = new Map<string, Token[]>();
      for (const t of tokens) {
        const key = t.narrativeId ?? 'other';
        if (!byNarrative.has(key)) byNarrative.set(key, []);
        byNarrative.get(key)!.push(t);
      }
      const sectors: TreeDatum[] = narratives
        .filter((n) => byNarrative.has(n.id))
        .map((n) => ({
          name: n.id,
          label: n.label,
          emoji: n.emoji,
          isSector: true,
          value: 0,
          children: byNarrative.get(n.id)!.map((t) => ({
            name: t.symbol,
            value: valueFor(t, sizeAxis, timeframe),
            token: t,
          })),
        }));
      const data: TreeDatum = { name: 'root', value: 0, children: sectors };
      return hierarchy<TreeDatum>(data)
        .sum((d) => d.value || 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    }

    // Flat hierarchy
    const data: TreeDatum = {
      name: 'root',
      value: 0,
      children: tokens.map((t) => ({
        name: t.symbol,
        value: valueFor(t, sizeAxis, timeframe),
        token: t,
      })),
    };
    return hierarchy<TreeDatum>(data)
      .sum((d) => d.value || 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  }, [tokens, timeframe, sizeAxis, groupByNarrative]);

  return (
    <ParentSize>
      {({ width, height }) => {
        if (width < 50 || height < 50) return null;
        return (
          <svg width={width} height={height}>
            <rect width={width} height={height} fill="#07070A" />

            <Treemap<TreeDatum>
              top={0}
              left={0}
              root={root}
              size={[width, height]}
              tile={treemapSquarify}
              round
              paddingInner={1}
              paddingOuter={groupByNarrative ? 4 : 0}
              paddingTop={groupByNarrative ? 22 : 0}
            >
              {(treemap) => (
                <Group>
                  {/* Sector containers */}
                  {groupByNarrative &&
                    treemap.descendants()
                      .filter((n) => n.depth === 1 && n.data.isSector)
                      .map((node, i) => {
                        const w = node.x1 - node.x0;
                        const h = node.y1 - node.y0;
                        if (w < 60 || h < 30) return null;
                        return (
                          <Group key={`sec-${node.data.name}-${i}`} top={node.y0} left={node.x0}>
                            <rect width={w} height={h} fill="#0F0F14" rx={4} stroke="#1F1F2A" />
                            <text
                              x={8}
                              y={14}
                              fontSize={11}
                              fontWeight={600}
                              fill="#A1A1AA"
                              letterSpacing="0.01em"
                            >
                              <tspan>{node.data.emoji}</tspan>
                              <tspan dx={5}>{node.data.label}</tspan>
                            </text>
                            <text
                              x={w - 8}
                              y={14}
                              fontSize={10}
                              fontWeight={500}
                              fill="#52525B"
                              textAnchor="end"
                              fontFamily="var(--font-geist-mono), monospace"
                            >
                              {node.children?.length ?? 0}
                            </text>
                          </Group>
                        );
                      })}

                  {/* Token tiles */}
                  {treemap
                    .descendants()
                    .filter((n) => n.data.token)
                    .map((node, i) => {
                      const t = node.data.token!;
                      const w = node.x1 - node.x0;
                      const h = node.y1 - node.y0;
                      const change = t.priceChangePct[timeframe];
                      const fill = colorForChange(change);
                      const text = textColorOn(change);
                      const intensity = intensityForChange(change);
                      const isPump = pumpSet.has(t.address);
                      const isWhale = whaleSet.has(t.address);
                      const isWatch = watchSet.has(t.address);
                      const smart = smartMoneyMode && (t.smartScore ?? 0) > 0.5;

                      const shortSide = Math.min(w, h);
                      const showSymbol = shortSide >= 26;
                      const showPct = shortSide >= 46 && h >= 42;
                      const showPrice = shortSide >= 80 && h >= 80;
                      const showLogo = shortSide >= 100 && h >= 90;

                      const symFont = Math.max(11, Math.min(30, shortSide * 0.19));
                      const pctFont = Math.max(10, Math.min(17, shortSide * 0.11));
                      const priceFont = Math.max(9, Math.min(12, shortSide * 0.07));

                      const clipId = `clip-${i}`;
                      const borderColor =
                        smart ? '#06B6D4' : isWhale ? '#E6B800' : isWatch ? '#FFB800' : 'rgba(0,0,0,0.4)';
                      const borderWidth = smart || isWhale || isWatch ? 1.5 : 0;

                      return (
                        <Group key={`${t.address}-${i}`} top={node.y0} left={node.x0} className="tile-group">
                          <clipPath id={clipId}>
                            <rect width={w} height={h} rx={2} />
                          </clipPath>

                          <rect
                            width={w}
                            height={h}
                            fill={fill}
                            stroke={borderColor}
                            strokeWidth={borderWidth}
                            rx={2}
                            className="tile-rect"
                            style={{ cursor: 'pointer', transition: 'fill 600ms ease' }}
                            onMouseMove={(e) => {
                              const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement | null)?.getBoundingClientRect();
                              const x = rect ? e.clientX - rect.left : e.clientX;
                              const y = rect ? e.clientY - rect.top : e.clientY;
                              onHover(t, x, y);
                            }}
                            onMouseLeave={() => onHover(null, 0, 0)}
                            onClick={() => onSelect(t)}
                          />

                          {/* Extreme-move accent — only when |pct| > 50% */}
                          {intensity > 0.4 && (
                            <rect
                              x={0.5}
                              y={0.5}
                              width={Math.max(0, w - 1)}
                              height={Math.max(0, h - 1)}
                              fill="none"
                              stroke={change > 0 ? '#22C55E' : '#EF4444'}
                              strokeWidth={intensity * 1.5}
                              strokeOpacity={0.45 + intensity * 0.3}
                              rx={2}
                              style={{ pointerEvents: 'none' }}
                            />
                          )}

                          {/* Smart money glow */}
                          {smart && (
                            <rect
                              x={1.5}
                              y={1.5}
                              width={Math.max(0, w - 3)}
                              height={Math.max(0, h - 3)}
                              fill="none"
                              stroke="#06B6D4"
                              strokeWidth={1}
                              strokeOpacity={0.4}
                              rx={2}
                              style={{ pointerEvents: 'none' }}
                            />
                          )}

                          {/* Pump pulse */}
                          {isPump && (
                            <rect
                              width={w}
                              height={h}
                              fill="none"
                              stroke="#FFB800"
                              strokeWidth={1.5}
                              rx={2}
                              className="pump-tile"
                              style={{ pointerEvents: 'none' }}
                            />
                          )}

                          <g clipPath={`url(#${clipId})`} style={{ pointerEvents: 'none' }}>
                            {showLogo && t.imageUrl && (
                              <image
                                href={t.imageUrl}
                                x={w / 2 - shortSide * 0.11}
                                y={h * 0.18}
                                width={shortSide * 0.22}
                                height={shortSide * 0.22}
                                opacity={0.2}
                                preserveAspectRatio="xMidYMid slice"
                              />
                            )}
                            {showSymbol && (
                              <text
                                x={w / 2}
                                y={showPct ? (showPrice ? h * 0.48 : h * 0.5 - 1) : h * 0.5 + symFont * 0.32}
                                fontSize={symFont}
                                fontWeight={700}
                                fill={text}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                letterSpacing="-0.02em"
                                style={{ userSelect: 'none' }}
                              >
                                {t.symbol.length > 10 ? t.symbol.slice(0, 9) + '…' : t.symbol}
                              </text>
                            )}
                            {showPct && (
                              <text
                                x={w / 2}
                                y={h * (showPrice ? 0.62 : 0.5) + pctFont * 0.6 + 2}
                                fontSize={pctFont}
                                fontWeight={500}
                                fill={text}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontFamily="var(--font-geist-mono), monospace"
                                opacity={0.95}
                                style={{ userSelect: 'none' }}
                              >
                                {formatPct(change)}
                              </text>
                            )}
                            {showPrice && (
                              <text
                                x={w / 2}
                                y={h * 0.78}
                                fontSize={priceFont}
                                fontWeight={400}
                                fill={text}
                                opacity={0.55}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontFamily="var(--font-geist-mono), monospace"
                                style={{ userSelect: 'none' }}
                              >
                                {tilePrice(t.priceUsd)}
                              </text>
                            )}

                            {/* Watch star */}
                            {isWatch && shortSide >= 34 && (
                              <g transform={`translate(${w - 10}, 8)`}>
                                <path
                                  d="M0 -3.5 L1 -1 L3.5 -1 L1.5 0.4 L2.2 2.8 L0 1.4 L-2.2 2.8 L-1.5 0.4 L-3.5 -1 L-1 -1 Z"
                                  fill="#FFB800"
                                />
                              </g>
                            )}

                            {/* Smart money indicator — small circle top-left */}
                            {smart && shortSide >= 40 && (
                              <g transform={`translate(8, 8)`}>
                                <circle r="3.5" fill="#06B6D4" opacity={0.95} />
                                <circle r="3.5" fill="none" stroke="#06B6D4" strokeOpacity={0.4} strokeWidth={3} />
                              </g>
                            )}
                          </g>
                        </Group>
                      );
                    })}
                </Group>
              )}
            </Treemap>
          </svg>
        );
      }}
    </ParentSize>
  );
}
