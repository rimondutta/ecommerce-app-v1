"use client";

import { useEffect, useRef, ReactNode } from "react";

interface MagneticElementProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/**
 * MagneticElement — makes children magnetically attracted to the cursor.
 * Adds a premium interactive feel to buttons and links.
 */
export default function MagneticElement({
  children,
  strength = 0.3,
  className = "",
}: MagneticElementProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let gsapModule: typeof import("@/lib/gsap") | null = null;

    const loadGsap = async () => {
      gsapModule = await import("@/lib/gsap");
    };
    loadGsap();

    const onMouseMove = (e: MouseEvent) => {
      if (!gsapModule) return;
      const { gsap } = gsapModule;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.6,
        ease: "power3.out",
      });
    };

    const onMouseLeave = () => {
      if (!gsapModule) return;
      const { gsap } = gsapModule;
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.4)",
      });
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}
