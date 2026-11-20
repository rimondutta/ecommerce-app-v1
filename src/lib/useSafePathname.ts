"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const notify = () => {
    queueMicrotask(callback);
  };

  window.addEventListener("popstate", notify);

  const origPush = history.pushState;
  const origReplace = history.replaceState;

  history.pushState = function (...args) {
    const res = origPush.apply(this, args);
    notify();
    return res;
  };

  history.replaceState = function (...args) {
    const res = origReplace.apply(this, args);
    notify();
    return res;
  };

  return () => {
    window.removeEventListener("popstate", notify);
    history.pushState = origPush;
    history.replaceState = origReplace;
  };
}

function getSnapshot(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname;
}

function getServerSnapshot(): string {
  return "";
}

/**
 * Safe, zero-warning pathname hook for React 19 + Next.js 16.
 * Bypasses Next.js dev-mode internal conditional use() calls that trigger
 * "This library called use() to suspend in a previous render..." warnings.
 */
export function useSafePathname(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
