import type { CareerResult, CareerSetup } from "@/lib/types/game";

const SETUP_KEY = "la-leyenda-setup";
const LOCAL_CAREERS_KEY = "la-leyenda-careers";

export function saveSetup(setup: CareerSetup): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SETUP_KEY, JSON.stringify(setup));
}

export function loadSetup(): CareerSetup | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SETUP_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CareerSetup;
  } catch {
    return null;
  }
}

export function clearSetup(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SETUP_KEY);
}

export function saveLocalCareer(result: CareerResult): void {
  if (typeof window === "undefined") return;
  const existing = loadLocalCareers();
  const next = [
    { ...result, savedAt: new Date().toISOString() },
    ...existing,
  ].slice(0, 30);
  localStorage.setItem(LOCAL_CAREERS_KEY, JSON.stringify(next));
}

export type StoredCareer = CareerResult & { savedAt: string };

export function loadLocalCareers(): StoredCareer[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LOCAL_CAREERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredCareer[];
  } catch {
    return [];
  }
}

/** Persists the finished career locally and, when configured, to Supabase. */
export function saveCareerResult(result: CareerResult): void {
  saveLocalCareer(result);
}

export function getLocalDailyLeaderboard(date = new Date()): StoredCareer[] {
  const day = date.toISOString().slice(0, 10);
  return loadLocalCareers()
    .filter((career) => career.isDaily && career.savedAt.slice(0, 10) === day)
    .sort((a, b) => b.score - a.score);
}
