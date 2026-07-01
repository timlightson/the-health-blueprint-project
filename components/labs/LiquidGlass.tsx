"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * LiquidGlass — Apple visionOS / iOS 26 style glass. Single source of truth.
 *
 * Two tiers:
 *
 * "lens"  — physically refracts the backdrop at the panel's bezel using an SVG
 *           <feDisplacementMap>, with per-channel chromatic aberration so the
 *           rim splits into a faint rainbow fringe, plus a cursor-tracked
 *           specular highlight. For hero panels and exhibit frames. GPU-heavy;
 *           budget ~10 mounted per page.
 *
 * "frost" — no displacement. Real glass optics without the lens: bright
 *           specular top edge, sheen gradient, saturation boost, hairline
 *           border, faint inner bottom shade. Cheap; use freely for pills,
 *           chips, bars, small cards.
 *
 * The displacement map (a normal-map of a rounded-rect bezel) is generated on
 * a canvas at the element's exact measured size, so refraction lines up with
 * the corners at any panel size. Where SVG-filter backdrops aren't supported
 * (Safari/Firefox), lens degrades automatically to the frost look.
 */

type Tier = "lens" | "frost";

type Props = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** glass tier — "lens" refracts, "frost" is the cheap premium fallback */
  tier?: Tier;
  /** corner radius in px (kept in sync with the generated map) */
  radius?: number;
  /** width of the refracting bezel band in px */
  bezel?: number;
  /** displacement intensity — higher bends the backdrop more */
  scale?: number;
  /** gaussian blur applied to the backdrop, px */
  blur?: number;
  brightness?: number;
  saturate?: number;
  /** chromatic aberration — px of RGB channel separation at the rim */
  aberration?: number;
  /** translucent white fill for legibility (0–1) */
  tint?: number;
  as?: "div" | "section" | "aside" | "header";
};

function buildDisplacementMap(
  w: number,
  h: number,
  radius: number,
  bezel: number,
): string {
  // Render the map at a capped resolution — it is smooth, so feImage can
  // stretch a small map up to the exact element size with no visible loss.
  const cap = 320;
  const ds = Math.min(1, cap / Math.max(w, h));
  const mw = Math.max(8, Math.round(w * ds));
  const mh = Math.max(8, Math.round(h * ds));
  const r = Math.max(0.5, radius * ds);
  const bz = Math.max(1, bezel * ds);

  const cv = document.createElement("canvas");
  cv.width = mw;
  cv.height = mh;
  const ctx = cv.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(mw, mh);
  const data = img.data;

  const hw = mw / 2;
  const hh = mh / 2;
  // signed distance to a rounded rectangle (negative inside)
  const sdf = (x: number, y: number) => {
    const qx = Math.abs(x - hw) - (hw - r);
    const qy = Math.abs(y - hh) - (hh - r);
    const ax = Math.max(qx, 0);
    const ay = Math.max(qy, 0);
    return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
  };

  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const d = sdf(x + 0.5, y + 0.5);
      const inward = -d; // distance from edge, positive inside
      let dx = 0;
      let dy = 0;
      if (inward >= 0 && inward < bz) {
        // outward normal via central differences of the SDF
        const gx = sdf(x + 1, y) - sdf(x - 1, y);
        const gy = sdf(x, y + 1) - sdf(x, y - 1);
        const len = Math.hypot(gx, gy) || 1;
        const nx = gx / len;
        const ny = gy / len;
        // smoothstep ramp: full bend at the very edge, none past the bezel
        const t = 1 - inward / bz;
        const ease = t * t * (3 - 2 * t);
        dx = nx * ease;
        dy = ny * ease;
      }
      const i = (y * mw + x) * 4;
      // Negative sign → convex lens: the rim samples the backdrop from further
      // inside, magnifying it outward like a real bevel of glass (Apple look).
      data[i] = Math.round((0.5 - dx * 0.5) * 255); // R → x displacement
      data[i + 1] = Math.round((0.5 - dy * 0.5) * 255); // G → y displacement
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv.toDataURL();
}

// Shared frost optics — also the lens fallback on non-Chromium browsers.
const FROST_SHADOW =
  "0 12px 32px -14px rgba(20,30,60,0.32), 0 3px 10px -6px rgba(20,30,60,0.16), inset 0 1.5px 1px -0.5px rgba(255,255,255,0.95), inset 1px 0 1px -0.5px rgba(255,255,255,0.55), inset 0 -10px 22px -14px rgba(20,30,60,0.14), inset 0 -1.5px 2px 0 rgba(255,255,255,0.5)";
const LENS_SHADOW =
  "0 14px 38px -14px rgba(20,30,60,0.38), 0 3px 10px -6px rgba(20,30,60,0.18), inset 0 1.5px 1px -0.5px rgba(255,255,255,0.95), inset 1px 0 1px -0.5px rgba(255,255,255,0.6), inset 0 -12px 26px -14px rgba(20,30,60,0.16), inset 0 -1.5px 2px 0 rgba(255,255,255,0.5)";
const SHEEN =
  "linear-gradient(180deg, rgba(255,255,255,0.30), rgba(255,255,255,0.07) 26%, rgba(255,255,255,0.01) 52%, rgba(255,255,255,0.10) 100%)";

export default function LiquidGlass({
  children,
  className,
  style,
  tier = "lens",
  radius = 24,
  bezel = 18,
  scale = 46,
  blur = 1.5,
  brightness = 1.1,
  saturate = 1.7,
  aberration = 2.8,
  tint = 0.1,
  as = "div",
}: Props) {
  const rawId = useId().replace(/[:]/g, "");
  const filterId = `lg-${rawId}`;
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [map, setMap] = useState<string>("");
  const [supported, setSupported] = useState(false);
  const reduced = useReducedMotion();
  const isLens = tier === "lens";

  // Detect Chromium-style SVG-backdrop support once.
  useEffect(() => {
    if (!isLens) return;
    const ok =
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      (CSS.supports("backdrop-filter", "url(#x)") ||
        CSS.supports("-webkit-backdrop-filter", "url(#x)"));
    setSupported(!!ok);
  }, [isLens]);

  // Track exact pixel size. Debounced so width/height animations don't thrash
  // the (relatively expensive) map rebuild — it settles to the final size.
  useEffect(() => {
    if (!isLens) return;
    const el = ref.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout> | null = null;
    const commit = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    commit();
    const schedule = () => {
      if (t) clearTimeout(t);
      t = setTimeout(commit, 90);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    return () => {
      if (t) clearTimeout(t);
      ro.disconnect();
    };
  }, [isLens]);

  // Rebuild the displacement map whenever the exact size or shape changes.
  useEffect(() => {
    if (!isLens || !supported || size.w < 4 || size.h < 4) return;
    const effRadius = Math.min(radius, Math.min(size.w, size.h) / 2);
    const effBezel = Math.min(bezel, Math.min(size.w, size.h) / 2);
    setMap(buildDisplacementMap(size.w, size.h, effRadius, effBezel));
  }, [isLens, supported, size.w, size.h, radius, bezel]);

  // Cursor-tracked specular highlight (lens only, skipped for reduced motion).
  const onPointerMove =
    isLens && !reduced
      ? (e: React.PointerEvent) => {
          const el = ref.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          el.style.setProperty("--lg-mx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
          el.style.setProperty("--lg-my", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
          el.style.setProperty("--lg-spec", "1");
        }
      : undefined;
  const onPointerLeave =
    isLens && !reduced
      ? () => {
          ref.current?.style.setProperty("--lg-spec", "0");
        }
      : undefined;

  const active = isLens && supported && !!map && size.w > 4 && size.h > 4;
  const backdrop = active
    ? `url(#${filterId}) blur(${blur}px) brightness(${brightness}) saturate(${saturate})`
    : `blur(20px) saturate(1.8)`;

  const Tag = as;

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        position: "relative",
        borderRadius: `${radius}px`,
        background: `${SHEEN}, rgba(255,255,255,${isLens ? tint : Math.max(tint, 0.3)})`,
        backdropFilter: backdrop,
        WebkitBackdropFilter: backdrop as string,
        boxShadow: active ? LENS_SHADOW : FROST_SHADOW,
        border: "1px solid rgba(255,255,255,0.5)",
        ...style,
      }}
    >
      {active && (
        <svg
          aria-hidden="true"
          width="0"
          height="0"
          style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
        >
          <defs>
            <filter
              id={filterId}
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
              x="0"
              y="0"
              width={size.w}
              height={size.h}
            >
              <feImage
                href={map}
                x="0"
                y="0"
                width={size.w}
                height={size.h}
                preserveAspectRatio="none"
                result="dmap"
              />
              {/* Chromatic aberration: refract each channel at a slightly
                  different strength, then recombine. Where the rim bends the
                  backdrop, the channels split into a faint rainbow fringe —
                  the optical tell of real glass. */}
              <feDisplacementMap in="SourceGraphic" in2="dmap" xChannelSelector="R" yChannelSelector="G" scale={scale + aberration} result="dR" />
              <feColorMatrix in="dR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="cR" />
              <feDisplacementMap in="SourceGraphic" in2="dmap" xChannelSelector="R" yChannelSelector="G" scale={scale} result="dG" />
              <feColorMatrix in="dG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="cG" />
              <feDisplacementMap in="SourceGraphic" in2="dmap" xChannelSelector="R" yChannelSelector="G" scale={scale - aberration} result="dB" />
              <feColorMatrix in="dB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cB" />
              <feBlend mode="screen" in="cR" in2="cG" result="rg" />
              <feBlend mode="screen" in="rg" in2="cB" />
            </filter>
          </defs>
        </svg>
      )}
      {/* Cursor specular — a soft moving glint on the glass surface */}
      {isLens && !reduced && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            zIndex: 1,
            opacity: "var(--lg-spec, 0)" as unknown as number,
            transition: "opacity 0.45s ease",
            background:
              "radial-gradient(240px circle at var(--lg-mx, 50%) var(--lg-my, 0%), rgba(255,255,255,0.22), rgba(255,255,255,0.0) 62%)",
          }}
        />
      )}
      {children}
    </Tag>
  );
}
