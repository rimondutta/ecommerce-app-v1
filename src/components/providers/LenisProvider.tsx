"use client";

import { useEffect } from "react";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Defer smooth-scroll initialisation until after the page is interactive.
    // Loading Lenis + GSAP eagerly during hydration blocks the main thread and
    // delays Time to Interactive — dynamic import pushes this to a later task.
    let rafCallback: ((time: number) => void) | null = null;
    let lenisInstance: any = null;
    let gsapInstance: any = null;

    const init = async () => {
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("@/lib/gsap"),
      ]);

      lenisInstance = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      });

      gsapInstance = gsap;

      // Keep ScrollTrigger in sync with Lenis scroll position
      lenisInstance.on("scroll", ScrollTrigger.update);

      // Single RAF source: GSAP ticker drives Lenis (no autoRaf)
      rafCallback = (time: number) => {
        lenisInstance.raf(time * 1000);
      };
      gsap.ticker.add(rafCallback);
      gsap.ticker.lagSmoothing(0);
    };

    // Use requestIdleCallback to defer even further on capable browsers
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(init);
    } else {
      // Fallback: defer by 200ms on Safari / older browsers
      setTimeout(init, 200);
    }

    return () => {
      if (rafCallback && gsapInstance) gsapInstance.ticker.remove(rafCallback);
      if (lenisInstance) lenisInstance.destroy();
    };
  }, []);

  return <>{children}</>;
}
