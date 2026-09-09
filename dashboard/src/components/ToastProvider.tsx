"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  leaving: boolean;
};

type ToastContextValue = {
  push: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const VISIBLE_MS = 3200;
const EXIT_MS = 280;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((title: string, description?: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, title, description, leaving: false }]);

    setTimeout(() => {
      setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, EXIT_MS);
    }, VISIBLE_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto min-w-70 max-w-90 bg-surface/95 backdrop-blur-md border border-(--line) rounded-md px-4 py-3.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,.65)] transition-all"
            style={{
              transitionDuration: `${EXIT_MS}ms`,
              transitionTimingFunction: "var(--ease-in-out-quart)",
              opacity: t.leaving ? 0 : 1,
              transform: t.leaving ? "translateX(8px)" : "translateX(0)",
              animation: t.leaving
                ? undefined
                : `toast-in var(--motion-base) var(--ease-out-expo)`,
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-sprout/15 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-sprout" />
              </span>
              <div className="font-display text-[13.5px]">{t.title}</div>
            </div>
            {t.description ? (
              <div className="text-xs text-text-dim mt-1 ml-7.5 leading-relaxed">
                {t.description}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
