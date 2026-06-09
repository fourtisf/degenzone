import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// 1200x630 — Twitter/FB/LinkedIn safe Open Graph card.
// Note: Satori (next/og renderer) has limited CSS — stick to simple gradients
// and solid colors. No rgba() inside linear-gradient, no backdrop-filter.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#07070A',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: 64,
          position: 'relative',
        }}
      >
        {/* Violet ambient blob */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: -200,
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: '#7C5CFF',
            opacity: 0.22,
            display: 'flex',
          }}
        />
        {/* Cyan ambient blob */}
        <div
          style={{
            position: 'absolute',
            bottom: -250,
            right: -200,
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: '#22D3EE',
            opacity: 0.16,
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #7C5CFF, #22D3EE)',
              }}
            >
              <svg width="34" height="34" viewBox="0 0 28 28">
                <path d="M16 5 L10 15.5 H14 L12 23 L19 11.5 H15 Z" fill="#0A0A0F" />
              </svg>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', display: 'flex' }}>
              DegenZone
            </div>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 78,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                display: 'flex',
                gap: 22,
              }}
            >
              <span>The</span>
              <span style={{ color: '#22D3EE' }}>unfair edge</span>
            </div>
            <div
              style={{
                fontSize: 78,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: '#A1A1AA',
                display: 'flex',
              }}
            >
              for Solana traders.
            </div>
            <div
              style={{
                fontSize: 26,
                marginTop: 22,
                color: '#A1A1AA',
                maxWidth: 920,
                lineHeight: 1.35,
                display: 'flex',
              }}
            >
              Real-time treemap · smart-money overlay · pump detection · time machine.
            </div>
          </div>

          {/* Footer chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Chip color="#14F195" label="Solana" />
            <Chip color="#0052FF" label="Base" />
            <Chip color="#F0B90B" label="BSC" />
            <Chip color="#627EEA" label="Ethereum" />
            <div
              style={{
                marginLeft: 'auto',
                fontSize: 22,
                color: '#71717A',
                fontFamily: 'ui-monospace, monospace',
                display: 'flex',
              }}
            >
              degenzone.com
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

function Chip({ color, label }: { color: string; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 999,
        background: '#0F0F14',
        fontSize: 18,
        color: '#FAFAFA',
        fontWeight: 600,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          background: color,
          display: 'flex',
        }}
      />
      {label}
    </div>
  );
}
