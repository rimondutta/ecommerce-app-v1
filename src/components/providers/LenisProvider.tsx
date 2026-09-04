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
        autoRaf: true,
      });

      // Sync Lenis scroll position with GSAP ScrollTrigger
      lenis.on("scroll", ScrollTrigger.update);

      // Tell GSAP to use Lenis's ticker for ScrollTrigger updates
      import("gsap").then((gsap) => {
        gsap.default.ticker.add((time) => {
          lenis.raf(time * 1000);
        });
        gsap.default.ticker.lagSmoothing(0);
      }).catch(() => { });

      return () => {
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
