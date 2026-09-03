"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const initLenis = async () => {
      const { ScrollTrigger } = await import("@/lib/gsap");

      const lenis = new Lenis({
        duration: 1.0,          // Reduced from 1.4 — less inertia = snappier feel
        easing: (t) => 1 - Math.pow(1 - t, 3), // cubic ease-out — lighter than the pow2 exponential
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.9,   // Slightly reduced for control
        touchMultiplier: 2,
      });

      // Sync Lenis scroll position with GSAP ScrollTrigger using Lenis's own RAF
      lenis.on("scroll", ScrollTrigger.update);

      // Use Lenis's built-in requestAnimationFrame instead of the GSAP ticker.
      // This prevents the GSAP ticker from running lenis.raf() every frame
      // even when the user isn't scrolling.
      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      let rafId = requestAnimationFrame(raf);

      return () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    };

    let cleanup: (() => void) | undefined;
    initLenis().then((fn) => {
      cleanup = fn;
    });

    return () => {
      cleanup?.();
    };
  }, []);

  return <>{children}</>;
}
