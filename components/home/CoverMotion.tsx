"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const CoverMotionContext = createContext({
  paused: false,
  reduced: false,
  register: (): (() => void) => () => {},
});

export function CoverMotionProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(0);
  const register = useCallback(() => {
    setVisible((count) => count + 1);
    return () => setVisible((count) => count - 1);
  }, []);
  const value = useMemo(
    () => ({ paused, reduced, register }),
    [paused, reduced, register],
  );

  return (
    <CoverMotionContext.Provider value={value}>
      {children}
      {visible > 0 && !reduced && (
        <button
          type="button"
          className="cover-motion-control"
          onClick={() => setPaused((value) => !value)}
          aria-label={
            paused ? "Play cover animations" : "Pause cover animations"
          }
          title={paused ? "Play cover animations" : "Pause cover animations"}
        >
          {paused ? (
            <Play size={17} aria-hidden="true" />
          ) : (
            <Pause size={17} aria-hidden="true" />
          )}
          <span>{paused ? "Play artwork" : "Pause artwork"}</span>
        </button>
      )}
    </CoverMotionContext.Provider>
  );
}

export function useCoverMotion() {
  return useContext(CoverMotionContext);
}
