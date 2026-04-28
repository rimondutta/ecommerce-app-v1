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
      const { gsap, ScrollTrigger } = await import("@/lib/gsap");

      const lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });

      // Sync Lenis scroll position with GSAP's ScrollTrigger
      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(lenis.raf);
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
