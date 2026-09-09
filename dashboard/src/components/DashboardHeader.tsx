"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ThemeToggle } from "./ThemeToggle";

export function DashboardHeader({
  title,
  cardBalance,
}: {
  title: string;
  /** Mock until the real card-balance API exists (Phase 4). */
  cardBalance?: string;
}) {
  return (
    <div className="h-[72px] shrink-0 flex items-center justify-between gap-3 px-4 sm:px-8 bg-(--glass) backdrop-blur-[20px] backdrop-saturate-150 border-b border-(--line) [box-shadow:inset_0_1px_0_0_rgba(255,255,255,.08)]">
      <div className="flex items-center gap-3 min-w-0">
        <a
          href="/"
          aria-label="Back to sprout.cash"
          title="Back to sprout.cash"
          className="w-8 h-8 rounded-full border border-(--line) flex items-center justify-center text-text-dim shrink-0 hover:text-sprout hover:border-sprout/40 active:scale-[0.97] transition-[color,border-color,transform] duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2"
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 11.5 12 4l9 7.5" />
            <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1v-9" />
          </svg>
        </a>
        <div className="font-display text-[17px] truncate">{title}</div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {cardBalance ? (
          <div className="hidden sm:block font-display num text-[15px] px-1">
            {cardBalance}
          </div>
        ) : null}
        <ThemeToggle />
        <ConnectButton showBalance={false} chainStatus="icon" />
      </div>
    </div>
  );
}
