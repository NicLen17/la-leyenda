"use client";

import { useSyncExternalStore } from "react";

const EMPTY = () => null;

/**
 * Returns a ticking timestamp on the client and `null` during SSR, so values
 * derived from the current date never cause a hydration mismatch.
 */
export function useClientClock(intervalMs = 30_000): number | null {
  return useSyncExternalStore(
    (onStoreChange) => {
      const id = window.setInterval(onStoreChange, intervalMs);
      return () => window.clearInterval(id);
    },
    () => Math.floor(Date.now() / intervalMs),
    EMPTY,
  );
}
