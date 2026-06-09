export default function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Premium dark medallion — rim-light gradient + glass + ascending candlesticks. */}
      <defs>
        <radialGradient id="dz-base" cx="50%" cy="34%" r="75%">
          <stop offset="0%" stopColor="#20202C" />
          <stop offset="100%" stopColor="#0A0A0F" />
        </radialGradient>
        <linearGradient id="dz-rim" x1="14" y1="86" x2="86" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="dz-gly" x1="34" y1="68" x2="66" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#67E8F9" />
        </linearGradient>
        <linearGradient id="dz-glass" x1="0" y1="6" x2="0" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="49" fill="url(#dz-base)" />
      <circle cx="50" cy="50" r="47.6" fill="none" stroke="url(#dz-rim)" strokeWidth="3.5" />
      <ellipse cx="50" cy="27" rx="32" ry="14" fill="url(#dz-glass)" />
      <g fill="url(#dz-gly)" transform="translate(50 50) scale(1.12) translate(-50 -50)">
        <rect x="35.8" y="50" width="2.4" height="21" rx="1.2" />
        <rect x="32.6" y="56" width="8.8" height="11" rx="2.6" />
        <rect x="48.8" y="37" width="2.4" height="28" rx="1.2" />
        <rect x="45.6" y="44" width="8.8" height="16" rx="2.6" />
        <rect x="61.8" y="29" width="2.4" height="30" rx="1.2" />
        <rect x="58.6" y="33" width="8.8" height="19" rx="2.6" />
      </g>
    </svg>
  );
}
