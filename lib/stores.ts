import { useSyncExternalStore } from "react";
import type { Session } from "@/lib/api";

type Store<T> = {
  get: () => T;
  set: (value: T | null) => void;
  subscribe: (listener: () => void) => () => void;
};

function localStore<T>(key: string, parse: (raw: string) => T | null, fallback: T): Store<T> {
  const listeners = new Set<() => void>();
  let cache: { raw: string | null; value: T } | null = null;

  const get = () => {
    const raw = localStorage.getItem(key);
    if (cache?.raw !== raw) cache = { raw, value: raw === null ? fallback : (parse(raw) ?? fallback) };
    return cache.value;
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === key) listeners.forEach((l) => l());
  };

  return {
    get,
    set(value) {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      if (listeners.size === 0) window.addEventListener("storage", onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
  };
}

function parseJson<T>(raw: string, isValid: (value: unknown) => value is T): T | null {
  try {
    const value: unknown = JSON.parse(raw);
    return isValid(value) ? value : null;
  } catch {
    return null;
  }
}

const isSession = (v: unknown): v is Session =>
  typeof v === "object" && v !== null && typeof (v as Session).address === "string" && typeof (v as Session).token === "string";

export const sessionStore = localStore<Session | null>("xelio_session", (raw) => parseJson(raw, isSession), null);

export function useSession(): Session | null {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get, () => null);
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
const readStores = new Map<string, Store<readonly string[]>>();
const NONE: readonly string[] = [];

export function readStore(address: string): Store<readonly string[]> {
  let store = readStores.get(address);
  if (!store) {
    store = localStore(`xelio_read:${address}`, (raw) => parseJson(raw, isStringArray), NONE);
    readStores.set(address, store);
  }
  return store;
}

export function useReadIds(address: string): readonly string[] {
  const store = readStore(address);
  return useSyncExternalStore(store.subscribe, store.get, () => NONE);
}

export type Theme = "light" | "dark";
const themeListeners = new Set<() => void>();

export const themeStore = {
  get: (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark"),
  set(theme: Theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("xelio_theme", theme);
    themeListeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    themeListeners.add(listener);
    return () => void themeListeners.delete(listener);
  },
};

export function useTheme(): Theme {
  return useSyncExternalStore(themeStore.subscribe, themeStore.get, () => "dark");
}

const clockListeners = new Set<() => void>();
let clockNow = 0;
let clockTimer: ReturnType<typeof setInterval> | undefined;

const clock = {
  get: () => (clockNow ||= Date.now()),
  subscribe(listener: () => void) {
    clockListeners.add(listener);
    clockTimer ??= setInterval(() => {
      clockNow = Date.now();
      clockListeners.forEach((l) => l());
    }, 1000);
    return () => {
      clockListeners.delete(listener);
      if (clockListeners.size === 0) {
        clearInterval(clockTimer);
        clockTimer = undefined;
      }
    };
  },
};

/** A wall clock that ticks once a second. Returns 0 during server render. */
export function useNow(): number {
  return useSyncExternalStore(clock.subscribe, clock.get, () => 0);
}
