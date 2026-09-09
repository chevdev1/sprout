"use client";

import { useEffect, useState } from "react";

const DUR_MS = 600;
// Matches --ease-out (cubic-bezier(0.23,1,0.32,1)) closely enough for a
// numeric tween, where the easing only needs to feel right, not match
// a bezier curve exactly.
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// Tweens a number up from 0 the first time `active` becomes true (the
// loading -> ready transition), then just tracks `target` directly on
// any later change so re-renders don't re-trigger the count-up.
export function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (!active) return;
    if (hasRun) {
      setValue(target);
      return;
    }
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      setHasRun(true);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR_MS);
      setValue(target * easeOut(t));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setHasRun(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return hasRun ? target : value;
}
