export default function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Gradient badge + energy bolt — violet → cyan brand mark. */}
      <defs>
        <linearGradient id="dz-logo" x1="2" y1="26" x2="26" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7C5CFF" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="24" height="24" rx="6.5" fill="url(#dz-logo)" />
      <path d="M16 5 L10 15.5 H14 L12 23 L19 11.5 H15 Z" fill="#0A0A0F" opacity="0.9" />
    </svg>
  );
}
