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
    <div className="h-[72px] shrink-0 flex items-center justify-between px-8 bg-black/72 backdrop-blur-[20px] backdrop-saturate-150 border-b border-(--line) [box-shadow:inset_0_1px_0_0_rgba(255,255,255,.08)]">
      <div className="font-display text-[17px]">{title}</div>
      <div className="flex items-center gap-3">
        {cardBalance ? (
          <div className="font-display num text-[15px] px-1">{cardBalance}</div>
        ) : null}
        <ThemeToggle />
        <ConnectButton showBalance={false} chainStatus="icon" />
      </div>
    </div>
  );
}
