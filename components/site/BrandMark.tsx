// ─── The Health Blueprint logo ────────────────────────────────────────────────
// A deep navy circle with a bold white medical cross. One source of truth so the
// nav, footer, favicon, and social card can never drift apart.

/** Brand navy, sampled from the logo. Change here to retune the whole brand. */
export const BRAND_NAVY = "#1E3A5C";

/** Geometry, on a 64x64 grid: chunky cross, ~53% of the diameter. */
const ARM = 34;
const THICK = 14;

export function BrandMark({ size = 30, navy = BRAND_NAVY }: { size?: number; navy?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <circle cx="32" cy="32" r="32" fill={navy} />
      <rect x={(64 - THICK) / 2} y={(64 - ARM) / 2} width={THICK} height={ARM} rx="1" fill="#fff" />
      <rect x={(64 - ARM) / 2} y={(64 - THICK) / 2} width={ARM} height={THICK} rx="1" fill="#fff" />
    </svg>
  );
}

/** Stacked lockup: mark above the wordmark. For splash / share art. */
export function BrandLockup({ markSize = 96 }: { markSize?: number }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <BrandMark size={markSize} />
      <div
        className="text-center font-bold leading-none"
        style={{ color: BRAND_NAVY, letterSpacing: "-0.01em", fontSize: markSize * 0.32, textTransform: "uppercase" }}
      >
        The Health
        <br />
        Blueprint
      </div>
    </div>
  );
}
