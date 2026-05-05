"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      {/* Right Side Vertical Progress */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 h-64 w-[1px] bg-white/5 z-[60] hidden lg:block">
        <motion.div 
          className="absolute top-0 left-0 w-full bg-white/40 origin-top"
          style={{ scaleY }}
        />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="label-tiny text-[8px] text-white/20 rotate-90 origin-center whitespace-nowrap">SCROLL_PROGRESS</span>
        </div>
      </div>

      {/* Top Horizontal Progress (Mobile) */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-white/20 origin-left z-[100] lg:hidden"
        style={{ scaleX: scrollYProgress }}
      />
    </>
  );
}
