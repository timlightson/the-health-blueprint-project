"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Keeps decorative motion off the main thread until a scene is near the
 * viewport. The class using this hook still renders its final state when the
 * user prefers reduced motion.
 */
export function useMotionPresence<T extends HTMLElement>(rootMargin = "180px") {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin, threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, motionActive: visible && !reduced, reduced };
}
