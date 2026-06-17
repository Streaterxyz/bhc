"use client";

/**
 * Theme provider for the /app tools workspace. The marketing site is
 * dark-only; the tools support a light/dark toggle.
 *
 * FOUC-free: the server layout reads the `app-theme` cookie and passes it
 * as `initial`, so the wrapper renders with the correct theme on first
 * paint — no flash. The toggle persists to both cookie (for SSR) and
 * localStorage.
 */

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type AppTheme = "light" | "dark";

const ThemeCtx = createContext<{
  theme: AppTheme;
  toggle: () => void;
} | null>(null);

export function AppThemeProvider({
  initial,
  children,
}: {
  initial: AppTheme;
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<AppTheme>(initial);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next: AppTheme = t === "dark" ? "light" : "dark";
      document.cookie = `app-theme=${next}; path=/; max-age=31536000; samesite=lax`;
      try {
        localStorage.setItem("app-theme", next);
      } catch {
        /* private mode — cookie is enough */
      }
      return next;
    });
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <div
        data-app-theme={theme}
        className="app-root min-h-screen bg-bg-base text-fg-primary transition-colors duration-300"
      >
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx)
    throw new Error("useAppTheme must be used within an AppThemeProvider");
  return ctx;
}
