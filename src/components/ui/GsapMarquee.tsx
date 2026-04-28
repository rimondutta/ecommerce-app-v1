"use client";

import { useEffect, useRef, ReactNode } from "react";

interface GsapMarqueeProps {
  children: ReactNode;
  speed?: number;
  direction?: "left" | "right";
  className?: string;
}

/**
 * GSAP-powered infinite marquee with scroll-velocity acceleration.
 * The marquee speeds up when the user scrolls faster.
 */
export default function GsapMarquee({
  children,
  speed = 1,
  direction = "left",
  className = "",
}: GsapMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !trackRef.current) return;

    const initMarquee = async () => {
      const { gsap, ScrollTrigger } = await import("@/lib/gsap");

      const track = trackRef.current!;
      // Clone children for seamless loop
      const content = track.innerHTML;
      track.innerHTML += content;

      const totalWidth = track.scrollWidth / 2;
      const directionMultiplier = direction === "left" ? -1 : 1;

      // Base marquee tween
      const marquee = gsap.to(track, {
        x: directionMultiplier * totalWidth * -1,
        ease: "none",
        repeat: -1,
        duration: totalWidth / (50 * speed),
        modifiers: {
          x: gsap.utils.unitize((x: number) => {
            return parseFloat(String(x)) % totalWidth;
          }),
        },
      });

      // Speed up on scroll velocity
      const scrollVelocity = { value: 1 };
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const velocity = Math.abs(self.getVelocity() / 1000);
          const clampedVelocity = gsap.utils.clamp(1, 5, velocity + 1);

          gsap.to(scrollVelocity, {
            value: clampedVelocity,
            duration: 0.5,
            overwrite: true,
            onUpdate: () => {
              marquee.timeScale(scrollVelocity.value);
            },
          });
        },
      });

      return () => {
        marquee.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    };

    let cleanup: (() => void) | undefined;
    initMarquee().then((fn) => {
      cleanup = fn;
    });

    return () => {
      cleanup?.();
    };
  }, [speed, direction]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={trackRef} className="flex whitespace-nowrap will-change-transform">
        {children}
      </div>
    </div>
  );
}
