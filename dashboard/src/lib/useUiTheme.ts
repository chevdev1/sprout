"use client";

import { useEffect, useState } from "react";

// Dispatched by ThemeToggle right after it flips document.documentElement's
// dataset.theme — same-tab toggles don't fire the native "storage" event
// (that only fires in OTHER tabs), so anything that needs to react to a
// same-tab theme change (RainbowKit's theme prop) needs this instead.
export const THEME_CHANGE_EVENT = "sprout-theme-change";

export function useUiTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const read = () => {
      setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    };
    read();
    window.addEventListener("storage", read);
    window.addEventListener(THEME_CHANGE_EVENT, read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener(THEME_CHANGE_EVENT, read);
    };
  }, []);

  return theme;
}
