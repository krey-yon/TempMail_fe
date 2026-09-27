"use client";

import { MoonStars, Sun } from "@phosphor-icons/react";
import { themeStore, useTheme } from "@/lib/stores";

export function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : MoonStars;
  return (
    <button
      type="button"
      onClick={() => themeStore.set(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="grid size-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-raised hover:text-ink"
    >
      <Icon size={18} weight="regular" />
    </button>
  );
}
