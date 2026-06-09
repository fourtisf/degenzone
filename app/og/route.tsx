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
                width: 64,
                height: 64,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #7C5CFF, #22D3EE)',
              }}
            >
              <div
                style={{
                  width: 57,
                  height: 57,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0E0E15',
                }}
              >
                <svg width="40" height="40" viewBox="0 0 100 100">
                  <rect x="35.8" y="50" width="2.4" height="21" rx="1.2" fill="#A78BFA" />
                  <rect x="32.6" y="56" width="8.8" height="11" rx="2.6" fill="#A78BFA" />
                  <rect x="48.8" y="37" width="2.4" height="28" rx="1.2" fill="#7FA0F4" />
                  <rect x="45.6" y="44" width="8.8" height="16" rx="2.6" fill="#7FA0F4" />
                  <rect x="61.8" y="29" width="2.4" height="30" rx="1.2" fill="#34E0F0" />
                  <rect x="58.6" y="33" width="8.8" height="19" rx="2.6" fill="#34E0F0" />
                </svg>
              </div>
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
