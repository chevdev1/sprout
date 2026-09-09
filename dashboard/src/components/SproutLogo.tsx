// Same leaf-mark path used inline across the landing page (nav-brand,
// footer-brand, mini-card lockup) — site/index.html.
export function SproutLogo({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <path
        fill="currentColor"
        d="M50 88 C22 84 8 46 30 14 C40 36 46 62 50 88 Z M50 88 C78 84 92 46 70 14 C60 36 54 62 50 88 Z"
      />
    </svg>
  );
}
