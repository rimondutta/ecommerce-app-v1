"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function DigitalHUD() {
  const { scrollYProgress } = useScroll();
  const [time, setTime] = useState("");
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

  const progress = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      setCoordinates({ x: e.clientX, y: e.clientY });
    };

    const unsubscribe = scrollYProgress.on("change", (v) => {
      setPercent(Math.round(v * 100));
    });

    const timer = setInterval(updateTime, 1000);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      clearInterval(timer);
      window.removeEventListener("mousemove", handleMouseMove);
      unsubscribe();
    };
  }, [scrollYProgress]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] hidden lg:block">
      {/* Top Left — System Status */}
      <div className="absolute top-32 left-8 flex flex-col gap-1">
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white animate-pulse" />
            <span className="label-tiny text-white/40" style={{ fontSize: '7px' }}>SYSTEM_ACTIVE // {time}</span>
        </div>
        <span className="label-tiny text-white/20" style={{ fontSize: '6px' }}>LAT: 23.8103° N / LONG: 90.4125° E</span>
      </div>

      {/* Bottom Left — Cursor Data */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-1">
        <span className="label-tiny text-white/20" style={{ fontSize: '6px' }}>PTR_X: {coordinates.x}</span>
        <span className="label-tiny text-white/20" style={{ fontSize: '6px' }}>PTR_Y: {coordinates.y}</span>
        <div className="w-12 h-[1px] bg-white/10 mt-2" />
        <span className="label-tiny text-white/40" style={{ fontSize: '7px' }}>BUREAU_OS_V.4.2</span>
      </div>

      {/* Center Right — Scroll Data */}
      <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col items-end gap-4">
        <div className="flex flex-col items-end">
            <span className="label-tiny text-white/20" style={{ fontSize: '6px' }}>INDEX_POS</span>
            <span className="font-mono text-xl text-white/60">{percent.toString().padStart(3, '0')}%</span>
        </div>
        
        <div className="h-32 w-[1px] bg-white/5 relative">
            <motion.div 
                className="absolute top-0 left-0 w-full bg-white/40"
                style={{ height: `${percent}%` }}
            />
        </div>
      </div>
    </div>
  );
}
