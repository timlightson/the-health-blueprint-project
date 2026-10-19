"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useCoverMotion } from "./CoverMotion";
import { animateCover } from "./animated-cover";
import type { LabId } from "@/components/labs/labs-meta";

/** Conceptual editorial artwork. Scientific values belong to the live models. */
export default function BlueprintArt({
  id,
  hovered = false,
  reduced = false,
  featured = false,
}: {
  id: LabId;
  hovered?: boolean;
  reduced?: boolean;
  featured?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const { paused, reduced: prefersReducedMotion, register } = useCoverMotion();
  const still = reduced || prefersReducedMotion || paused;

  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setVisible(entries[0].isIntersecting);
      },
      { threshold: 0.01 },
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (visible) return register();
  }, [visible, register]);

  return (
    <div
      ref={root}
      className={`lab-art lab-art-${id} ${hovered ? "is-active" : ""} ${still ? "is-still" : ""}`}
      aria-hidden="true"
    >
      <Image
        src={`/images/labs/${id}.webp`}
        alt=""
        fill
        sizes={
          featured
            ? "(max-width: 767px) 100vw, 65vw"
            : "(max-width: 767px) 100vw, 50vw"
        }
        priority={featured}
        className="lab-art-image"
        onLoad={(event) => setSource(event.currentTarget)}
      />
      {visible && !still && source && <MovingArtwork id={id} source={source} />}
    </div>
  );
}

function MovingArtwork({
  id,
  source,
}: {
  id: LabId;
  source: HTMLImageElement;
}) {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!layer.current) return;
    // Each effect owns a fresh canvas, including React Strict Mode remounts.
    const canvas = document.createElement("canvas");
    layer.current.appendChild(canvas);
    const stop = animateCover(canvas, source, id);
    return () => {
      stop?.();
      canvas.remove();
    };
  }, [id, source]);
  return <div ref={layer} className="lab-art-motion" aria-hidden="true" />;
}
