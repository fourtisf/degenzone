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
      {/* Three ascending bars — cool to hot — the visual mnemonic of a heatmap. */}
      <rect x="3"  y="18" width="5" height="7"  rx="1.25" fill="#15803D" />
      <rect x="10" y="12" width="5" height="13" rx="1.25" fill="#F59E0B" />
      <rect x="17" y="5"  width="5" height="20" rx="1.25" fill="#DC2626" />
      {/* Hot-tip highlight */}
      <rect x="17" y="5" width="5" height="3" rx="1.25" fill="#FFB800" />
    </svg>
  );
}
