"use client";

import { useEffect } from "react";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // 1. Accessibility & Device Feature Detection
    // Do not intercept native scrolling on mobile touch screens or when user prefers reduced motion
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isFinePointer || prefersReducedMotion) {
      // Retain 100% native browser momentum scrolling for touch devices
      return;
    }

    let rafCallback: ((time: number) => void) | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lenisInstance: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gsapInstance: any = null;
    let isCleanedUp = false;

    const init = async () => {
      if (isCleanedUp) return;

      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("@/lib/gsap"),
      ]);

      if (isCleanedUp) return;

      lenisInstance = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 0, // Disable touch manipulation in Lenis entirely
      });

      gsapInstance = gsap;

      // Keep ScrollTrigger in sync with Lenis scroll position
      lenisInstance.on("scroll", ScrollTrigger.update);

      // Single RAF source: GSAP ticker drives Lenis
      rafCallback = (time: number) => {
        lenisInstance?.raf(time * 1000);
      };
      gsap.ticker.add(rafCallback);
      gsap.ticker.lagSmoothing(0);
    };

    // Defer initialization to avoid blocking initial hydration and paint
    if ("requestIdleCallback" in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(init);
    } else {
      setTimeout(init, 200);
    }

    return () => {
      isCleanedUp = true;
      if (rafCallback && gsapInstance) {
        gsapInstance.ticker.remove(rafCallback);
      }
      if (lenisInstance) {
        lenisInstance.destroy();
      }
    };
  }, []);

  return <>{children}</>;
}
