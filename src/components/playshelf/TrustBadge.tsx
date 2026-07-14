import React from "react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export default function TrustBadge({ icon, label, className }: TrustBadgeProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="w-10 h-10 rounded-full bg-sun/15 flex items-center justify-center flex-shrink-0 text-sun-dark">
        {icon}
      </div>
      <span className="text-sm font-semibold text-ink">
        {label}
      </span>
    </div>
  );
}
