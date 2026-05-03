"use client";

import dynamic from "next/dynamic";

const GlobalBackground = dynamic(() => import("@/components/3d/GlobalBackground"), { ssr: false });

export default function GlobalBackgroundWrapper() {
  return <GlobalBackground />;
}
