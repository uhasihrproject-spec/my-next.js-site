/**
 * The one true VaultX logo mark.
 *
 * A 4-square grid in a rounded blue tile. Used everywhere a brand mark
 * appears — navbar, footer, dashboards, balance cards, mockups, email.
 *
 *   <Logo size={24} />               // just the mark
 *   <Logo size={24} withWord />      // mark + "VaultX" wordmark
 *
 * The mark scales perfectly because its inner SVG uses a fixed viewBox.
 */
export default function Logo({
  size = 24,
  withWord = false,
  wordSize,
  wordClassName = "",
  className = "",
  gap = 8,
}: {
  size?: number;
  withWord?: boolean;
  wordSize?: number;
  wordClassName?: string;
  className?: string;
  gap?: number;
}) {
  const inner = Math.round(size * 0.5);
  const radius = Math.max(4, Math.round(size * 0.22));
  const tile = (
    <span
      className="bg-blue-500 inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <svg width={inner} height={inner} viewBox="0 0 12 12" fill="none" aria-hidden>
        <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="0.7" fill="#fff" />
        <rect x="7"   y="0.5" width="4.5" height="4.5" rx="0.7" fill="#fff" opacity="0.55" />
        <rect x="0.5" y="7"   width="4.5" height="4.5" rx="0.7" fill="#fff" opacity="0.55" />
        <rect x="7"   y="7"   width="4.5" height="4.5" rx="0.7" fill="#fff" opacity="0.30" />
      </svg>
    </span>
  );

  if (!withWord) {
    return <span className={`inline-flex ${className}`}>{tile}</span>;
  }

  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap }}>
      {tile}
      <span
        className={`font-medium tracking-wide ${wordClassName}`}
        style={{ fontSize: wordSize ?? Math.round(size * 0.62) }}
      >
        VaultX
      </span>
    </span>
  );
}
