"use client";

import React from "react";
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  Navigation,
  Sparkles,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderProgressBarProps {
  fulfillmentStatus?: string;
  courierStatus?: string;
  compact?: boolean;
}

const TRACK_STEPS = [
  { key: "placed", label: "Placed", icon: Sparkles },
  { key: "processing", label: "Packed", icon: PackageCheck },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Navigation },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

function resolveStepIndex(fulfillmentStatus?: string, courierStatus?: string): number {
  const f = (fulfillmentStatus || "unfulfilled").toLowerCase();
  const c = (courierStatus || "").toLowerCase();

  if (f === "delivered" || c === "delivered") return 4;
  if (c === "out_for_delivery") return 3;
  if (f === "shipped" || c === "in_transit" || c === "picked_up") return 2;
  if (f === "processing") return 1;
  return 0;
}

/**
 * 5-step visual fulfillment pipeline aligned with backend `getTrackingSteps`.
 */
export default function OrderProgressBar({
  fulfillmentStatus,
  courierStatus,
  compact = false,
}: OrderProgressBarProps) {
  const isCancelled = (fulfillmentStatus || "").toLowerCase() === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-rose-800">
        <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
        <span className="text-xs font-semibold">
          This order was cancelled. Need help? Reach out to our support team.
        </span>
      </div>
    );
  }

  const activeIdx = resolveStepIndex(fulfillmentStatus, courierStatus);
  const progressWidth = `${(activeIdx / (TRACK_STEPS.length - 1)) * 100}%`;

  return (
    <div className={cn("relative w-full", compact ? "py-1" : "py-2")}>
      {/* Connecting Track Line (desktop & horizontal view) */}
      <div className="relative flex items-start justify-between">
        <div
          className={cn(
            "absolute left-[10%] right-[10%] h-[3px] rounded-full bg-[#EDE4D8]",
            compact ? "top-3.5" : "top-4"
          )}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#5428D8] via-[#7C3AED] to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: progressWidth }}
          />
        </div>

        {TRACK_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-1 flex-col items-center text-center px-1"
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border transition-all duration-300",
                  compact ? "w-7 h-7" : "w-8 h-8 sm:w-9 sm:h-9",
                  isCompleted
                    ? idx === 4 && activeIdx === 4
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.28)]"
                      : "bg-[#5428D8] border-[#5428D8] text-white shadow-[0_4px_12px_rgba(84,40,216,0.25)]"
                    : "bg-white border-[#E4D9CB] text-[#A39688]",
                  isCurrent && activeIdx < 4 && "ring-4 ring-[#5428D8]/15"
                )}
              >
                <Icon className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} strokeWidth={2.2} />
              </div>
              <span
                className={cn(
                  "mt-2 font-semibold leading-tight",
                  compact ? "text-[10px]" : "text-[11px] sm:text-xs",
                  isCompleted ? "text-[#2C2416]" : "text-[#9A8F83]"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
