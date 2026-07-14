"use client";

import React, { createContext, useContext } from "react";
import {
  Loader,
  MessageCircle,
  Waves,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import {
  DynamicContainer,
  DynamicDescription,
  DynamicDiv,
  DynamicIsland,
  DynamicIslandProvider,
  DynamicTitle,
  SizePresets,
  useDynamicIslandSize,
  useScheduledAnimations,
} from "@/components/ui/dynamic-island";

const DynamicAction = () => {
  const { state: blobState, setSize } = useDynamicIslandSize();

  // Auto-cycle through states on load for a delightful intro
  useScheduledAnimations([
    { size: "compact", delay: 800 },
    { size: "large", delay: 2500 },
    { size: "long", delay: 2000 },
    { size: "compact", delay: 2000 },
    { size: "default", delay: 3000 },
  ]);

  // Click to expand to "compact" promo or collapse back
  const handleClick = () => {
    if (blobState.size === "default") {
      setSize("compact");
    } else if (blobState.size === "compact") {
      setSize("long");
    } else {
      setSize("default");
    }
  };

  // ─── Default: tiny black pill (iPhone notch idle) ───
  const renderDefaultState = () => (
    <DynamicContainer className="flex items-center justify-center h-full w-full">
      <div className="flex items-center gap-1.5 px-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
      </div>
    </DynamicContainer>
  );

  // ─── Compact: brand name + indicator ───
  const renderCompactState = () => (
    <DynamicContainer className="flex items-center justify-center h-full w-full">
      <div className="relative w-full flex items-center justify-between px-4">
        <DynamicDescription className="my-auto text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-sun" />
          <span>Toy Hourse</span>
        </DynamicDescription>

        <DynamicDescription className="text-neutral-400 text-[10px] font-medium tracking-tight">
          toy store
        </DynamicDescription>
      </div>
    </DynamicContainer>
  );

  // ─── Large: loading or status update ───
  const renderLargeState = () => (
    <DynamicContainer className="flex items-center justify-center h-full w-full">
      <div className="relative flex w-full items-center justify-between gap-4 px-4">
        <ShoppingBag className="h-5 w-5 text-sun" />
        <DynamicTitle className="my-auto text-sm font-bold tracking-tight text-white">
          Free shipping on $50+
        </DynamicTitle>
      </div>
    </DynamicContainer>
  );

  // ─── Long: promo banner ───
  const renderLongState = () => (
    <DynamicContainer className="flex items-center justify-center h-full w-full">
      <DynamicDiv className="relative flex w-full items-center justify-between gap-4 px-4">
        <div>
          <Waves className="text-cyan-400 h-4 w-4" />
        </div>
        <DynamicTitle className="my-auto text-xs font-bold tracking-tight text-white truncate">
          🎁 Use code PLAY50 for 50% off!
        </DynamicTitle>
      </DynamicDiv>
    </DynamicContainer>
  );

  // ─── Fallback ───
  const renderOtherStates = () => (
    <DynamicContainer className="flex items-center justify-center h-full w-full">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
    </DynamicContainer>
  );

  function renderState() {
    switch (blobState.size) {
      case "default":
        return renderDefaultState();
      case "compact":
        return renderCompactState();
      case "large":
        return renderLargeState();
      case "long":
        return renderLongState();
      default:
        return renderOtherStates();
    }
  }

  return (
    <div
      className="cursor-pointer"
      onClick={handleClick}
    >
      <DynamicIsland id="dynamic-blob">{renderState()}</DynamicIsland>
    </div>
  );
};

export default function DynamicIslandHeader() {
  return (
    <DynamicIslandProvider initialSize={"default"}>
      <DynamicAction />
    </DynamicIslandProvider>
  );
}

// ─── Fade-in utilities (reusable) ───

const FadeInStaggerContext = createContext(false);
const viewport = { once: true, margin: "0px 0px -200px" };

export function FadeIn(props: any) {
  let shouldReduceMotion = useReducedMotion();
  let isInStaggerGroup = useContext(FadeInStaggerContext);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5 }}
      {...(isInStaggerGroup
        ? {}
        : {
            initial: "hidden",
            whileInView: "visible",
            viewport,
          })}
      {...props}
    />
  );
}

export function FadeInStagger({ faster = false, ...props }: { faster?: boolean; [key: string]: any }) {
  return (
    <FadeInStaggerContext.Provider value={true}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        transition={{ staggerChildren: faster ? 0.12 : 0.2 }}
        {...props}
      />
    </FadeInStaggerContext.Provider>
  );
}
