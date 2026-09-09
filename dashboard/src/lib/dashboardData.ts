"use client";

import { useEffect, useState } from "react";
import { getCardSetup } from "./cardAccess";

export type AssetSplit = { asset: string; pct: number };
export type Transaction = { id: string; merchant: string; spend: number; grow: number };

export type DashboardData = {
  balance: { total: number; currency: string; split: AssetSplit[] | null };
  network: { name: string; status: "connected" | "pending" | "down"; lastTxAt: string | null };
  rewards: { ticker: string | null; grownThisMonth: number };
  spend: { thisMonth: number; deltaPct: number | null };
  activity: Transaction[];
};

export const EMPTY_DASHBOARD_DATA: DashboardData = {
  balance: { total: 0, currency: "USD", split: null },
  network: { name: "Robinhood Chain", status: "pending", lastTxAt: null },
  rewards: { ticker: null, grownThisMonth: 0 },
  spend: { thisMonth: 0, deltaPct: null },
  activity: [],
};

export type DashboardLoadState = "loading" | "ready";

// Phase 1: a freshly-issued card genuinely has no balance or history —
// the onboarding wizard only chose a funding asset and a grow-back
// ticker, it didn't move real money. So "ready" resolves to the real
// empty state, not a fabricated funded demo, with only the one thing
// that's actually true carried over from the user's own choice: the
// grow-back ticker. Wired to real balances/activity in Phase 4
// (sprout-dashboard-concept.md, section 4).
export function useDashboardData(): { state: DashboardLoadState; data: DashboardData } {
  const [state, setState] = useState<DashboardLoadState>("loading");
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD_DATA);

  useEffect(() => {
    const t = setTimeout(() => {
      const setup = getCardSetup();
      setData({
        ...EMPTY_DASHBOARD_DATA,
        rewards: { ...EMPTY_DASHBOARD_DATA.rewards, ticker: setup.growBackTicker },
      });
      setState("ready");
    }, 700);
    return () => clearTimeout(t);
  }, []);

  return { state, data };
}
