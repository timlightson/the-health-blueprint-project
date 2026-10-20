"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useCoverMotion } from "./CoverMotion";

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
        src={`/images/labs/cgi/${id}${["stress", "sound", "breath"].includes(id) ? "-v2" : ""}.webp`}
        alt=""
        fill
        sizes={
          featured
            ? "(max-width: 767px) 100vw, 65vw"
            : "(max-width: 767px) 100vw, 50vw"
        }
        priority={featured}
        loading={featured ? "eager" : "lazy"}
        className="lab-art-image"
      />
      {visible && <MovingArtwork id={id} paused={still} />}
    </div>
  );
}

function MovingArtwork({ id, paused }: { id: LabId; paused: boolean }) {
  const layer = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const controller =
    useRef<ReturnType<typeof import("./cgi-cover").createCGICover>>(null);
  useEffect(() => {
    pausedRef.current = paused;
    controller.current?.setPaused(paused);
  }, [paused]);
  useEffect(() => {
    let cancelled = false;
    const canvas = document.createElement("canvas");
    layer.current?.appendChild(canvas);
    // Load the 3D engine only when a cover enters the viewport.
    import("./cgi-cover")
      .then(({ createCGICover }) => {
        if (!cancelled)
          controller.current = createCGICover(canvas, id, pausedRef.current);
      })
      .catch(() => {
        canvas.remove();
      });
    return () => {
      cancelled = true;
      controller.current?.dispose();
      controller.current = null;
      canvas.remove();
    };
  }, [id]);
  return <div ref={layer} className="lab-art-motion" aria-hidden="true" />;
}
