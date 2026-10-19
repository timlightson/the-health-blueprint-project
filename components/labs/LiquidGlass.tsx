import type { CSSProperties, ReactNode } from "react";

/** Shared lab surface. Legacy optical props are retained for existing callers. */
type Props = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  tier?: "lens" | "frost";
  radius?: number;
  bezel?: number;
  scale?: number;
  blur?: number;
  brightness?: number;
  saturate?: number;
  aberration?: number;
  tint?: number;
  as?: "div" | "section" | "aside" | "header";
};

export default function LiquidGlass({
  children,
  className = "",
  style,
  radius = 24,
  as: Tag = "div",
}: Props) {
  return (
    <Tag
      className={`lab-surface ${className}`}
      style={{ borderRadius: radius, ...style }}
    >
      {children}
    </Tag>
  );
}
