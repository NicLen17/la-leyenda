"use client";

import { useSyncExternalStore } from "react";

import { loadLocalCareers, type StoredCareer } from "@/lib/game/storage";

const EMPTY: StoredCareer[] = [];

// getSnapshot must return a stable reference, so the parsed list is cached and
// only rebuilt when the raw localStorage string actually changes.
let cachedRaw: string | null = null;
let cachedValue: StoredCareer[] = EMPTY;

function getSnapshot(): StoredCareer[] {
  const raw = localStorage.getItem("la-leyenda-careers");
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = loadLocalCareers();
  }
  return cachedValue;
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

/** Reads saved careers without a hydration mismatch: empty on the server. */
export function useLocalCareers(): StoredCareer[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
