"use client";

import { useEffect } from "react";

if (typeof window !== "undefined") {
  // 1. Filter out known noisy extension console errors
  const originalConsoleError = console.error;
  console.error = function (...args: unknown[]) {
    const errorString = args
      .map((a) => {
        if (typeof a === "string") return a;
        if (a && typeof a === "object") {
          try {
            return JSON.stringify(a);
          } catch {
            return String(a);
          }
        }
        return String(a);
      })
      .join(" ");

    if (
      errorString.includes("bis_skin_checked") ||
      errorString.includes("bis_status") ||
      errorString.includes("cz-shortcut-listen") ||
      errorString.includes("chrome-extension://") ||
      errorString.includes("moz-extension://") ||
      errorString.includes("reading 'M_ID'") ||
      errorString.includes("M_ID")
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // 2. Prevent Chrome extension unhandled rejections from bubbling into Next.js dev server overlay
  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const reason = event?.reason;
      const stack = typeof reason === "object" && reason ? String((reason as { stack?: string }).stack || "") : "";
      const msg = typeof reason === "object" && reason ? String((reason as { message?: string }).message || "") : String(reason || "");

      if (
        stack.includes("chrome-extension://") ||
        stack.includes("moz-extension://") ||
        stack.includes("safari-extension://") ||
        msg.includes("M_ID") ||
        msg.includes("reading 'M_ID'")
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  // 3. Prevent third-party extension uncaught errors from bubbling
  window.addEventListener(
    "error",
    (event) => {
      const filename = event?.filename || "";
      const msg = event?.message || "";
      const stack = event?.error?.stack || "";

      if (
        filename.includes("chrome-extension://") ||
        filename.includes("moz-extension://") ||
        stack.includes("chrome-extension://") ||
        msg.includes("M_ID") ||
        msg.includes("reading 'M_ID'")
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

export default function ExtensionHydrationFix() {
  useEffect(() => {
    if (typeof document !== "undefined") {
      const clean = () => {
        document.querySelectorAll("[bis_skin_checked]").forEach((el) => {
          el.removeAttribute("bis_skin_checked");
        });
      };
      clean();
      const timer = setTimeout(clean, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
}
