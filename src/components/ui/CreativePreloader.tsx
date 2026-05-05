"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const logs = [
  "INITIALIZING_BUREAU_OS...",
  "ESTABLISHING_SECURE_NODE_CONNECTION...",
  "FETCHING_ARCHIVAL_ASSETS...",
  "CALIBRATING_MOTION_CHOREOGRAPHY...",
  "RENDERING_EDITORIAL_GRIDS...",
  "SYSTEM_READY_V4.2.0"
];

export default function CreativePreloader() {
  const [loading, setLoading] = useState(true);
  const [currentLog, setCurrentLog] = useState(0);

  useEffect(() => {
    if (currentLog < logs.length - 1) {
      const timer = setTimeout(() => {
        setCurrentLog(prev => prev + 1);
      }, 400 + Math.random() * 600);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentLog]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center p-6"
        >
          <div className="w-full max-w-md">
            <div className="flex justify-between items-end mb-4">
                <div className="flex flex-col">
                    <span className="label-tiny text-white/40" style={{ fontSize: '8px' }}>BUREAU_ACCESS_PORTAL</span>
                    <span className="font-serif text-white text-2xl">AVANT GARDE.</span>
                </div>
                <span className="font-mono text-white/60 text-xs">{Math.round((currentLog / (logs.length - 1)) * 100)}%</span>
            </div>
            
            <div className="h-[1px] w-full bg-white/5 relative mb-12">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentLog / (logs.length - 1)) * 100}%` }}
                    className="absolute inset-0 bg-white"
                />
            </div>

            <div className="space-y-2 h-32">
                {logs.slice(0, currentLog + 1).map((log, i) => (
                    <motion.div 
                        key={log}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className={`w-1 h-1 ${i === currentLog ? 'bg-white animate-pulse' : 'bg-white/20'}`} />
                        <span className="font-mono text-[10px] text-white/40 tracking-widest">{log}</span>
                    </motion.div>
                ))}
            </div>

            <div className="mt-20 pt-12 border-t border-white/5 flex justify-between items-center">
                <span className="label-tiny text-white/10" style={{ fontSize: '7px' }}>© 2026 BUREAU_OS</span>
                <span className="label-tiny text-white/10" style={{ fontSize: '7px' }}>ENCRYPTED_SESSION_ID: 0x8F2A...</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
