"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "sprout-theme";
const TRANSITION_MS = 480;

function readTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(readTheme());
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setTheme(e.newValue === "dark" ? "dark" : "light");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.add("theme-transition");
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable (private mode, etc.) — theme still
      // applies for this page load, just won't persist.
    }
    setTheme(next);
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, TRANSITION_MS);
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={theme === "dark"}
      className="relative w-9 h-9 rounded-full border border-(--line) bg-surface-2 flex items-center justify-center text-text-dim hover:border-sprout/40 hover:text-sprout transition-colors duration-[var(--motion-fast)] shrink-0"
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute transition-[opacity,transform] duration-[var(--motion-base)]"
        style={{
          opacity: theme === "dark" ? 0 : 1,
          transform: theme === "dark" ? "rotate(70deg) scale(.4)" : "rotate(0) scale(1)",
        }}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12h2.5M19 12h2.5M4.2 19.8L6 18M18 6l1.8-1.8" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="currentColor"
        className="absolute transition-[opacity,transform] duration-[var(--motion-base)]"
        style={{
          opacity: theme === "dark" ? 1 : 0,
          transform: theme === "dark" ? "rotate(0) scale(1)" : "rotate(-70deg) scale(.4)",
        }}
      >
        <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a6.8 6.8 0 0 0 11 11Z" />
      </svg>
    </button>
  );
}
