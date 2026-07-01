"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * LiquidGlass — Apple visionOS / iOS 26 style refracting glass.
 *
 * Unlike a plain `backdrop-filter: blur()`, this physically bends the
 * background at the panel's bezel using an SVG <feDisplacementMap>. A
 * displacement map (a normal-map of a rounded-rectangle bezel) is generated on
 * a canvas at the element's EXACT measured pixel size, so the refraction lines
 * up perfectly with the corners no matter how the panel is sized. The element,
 * its <filter> region and the <feImage> map all share identical dimensions —
 * that is what "exact dimensions" buys you.
 *
 * The technique (Chromium): backdrop-filter: url(#filter) blur() brightness()
 * saturate(). Where SVG-filter backdrops aren't supported, it degrades to a
 * translucent frosted card (still readable, just without live refraction).
 */

type Props = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
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

export default function LiquidGlass({
  children,
  className,
  style,
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

  // Detect Chromium-style SVG-backdrop support once.
  useEffect(() => {
    const ok =
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      (CSS.supports("backdrop-filter", "url(#x)") ||
        CSS.supports("-webkit-backdrop-filter", "url(#x)"));
    setSupported(!!ok);
  }, []);

  // Track exact pixel size. Debounced so width/height animations don't thrash
  // the (relatively expensive) map rebuild — it settles to the final size.
  useEffect(() => {
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
  }, []);

  // Rebuild the displacement map whenever the exact size or shape changes.
  useEffect(() => {
    if (!supported || size.w < 4 || size.h < 4) return;
    const effRadius = Math.min(radius, Math.min(size.w, size.h) / 2);
    const effBezel = Math.min(bezel, Math.min(size.w, size.h) / 2);
    setMap(buildDisplacementMap(size.w, size.h, effRadius, effBezel));
  }, [supported, size.w, size.h, radius, bezel]);

  const active = supported && !!map && size.w > 4 && size.h > 4;
  const backdrop = active
    ? `url(#${filterId}) blur(${blur}px) brightness(${brightness}) saturate(${saturate})`
    : `blur(20px) saturate(1.6)`;

  const Tag = as;

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      style={{
        position: "relative",
        borderRadius: `${radius}px`,
        background: `rgba(255,255,255,${tint})`,
        backdropFilter: backdrop,
        WebkitBackdropFilter: backdrop as string,
        boxShadow:
          "0 14px 38px -14px rgba(20,30,60,0.38), 0 3px 10px -6px rgba(20,30,60,0.18), inset 0 1.5px 1px -0.5px rgba(255,255,255,0.95), inset 1px 0 1px -0.5px rgba(255,255,255,0.6), inset 0 -12px 26px -14px rgba(20,30,60,0.16), inset 0 -1.5px 2px 0 rgba(255,255,255,0.5)",
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
      {children}
    </Tag>
  );
}
