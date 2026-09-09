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

// Phase 1 mock — a funded, active card, matching the state a user lands
// in right after the onboarding wizard (see /onboarding). Wired to real
// balances/activity in Phase 4 (sprout-dashboard-concept.md, section 4).
const FILLED_DEMO_DATA: DashboardData = {
  balance: {
    total: 2840.2,
    currency: "USD",
    split: [
      { asset: "ETH", pct: 62 },
      { asset: "USDG", pct: 28 },
      { asset: "Stocks", pct: 10 },
    ],
  },
  network: { name: "Robinhood Chain", status: "connected", lastTxAt: "4s ago" },
  rewards: { ticker: "AAPL", grownThisMonth: 42.8 },
  spend: { thisMonth: 1214, deltaPct: -8 },
  activity: [
    { id: "1", merchant: "Blue Bottle Coffee", spend: -6.5, grow: 0.1 },
    { id: "2", merchant: "Whole Foods", spend: -84.2, grow: 1.26 },
    { id: "3", merchant: "Uber", spend: -18.4, grow: 0.28 },
  ],
};

export type DashboardLoadState = "loading" | "ready";

// Simulates a network round-trip so loading -> filled is a real
// transition to design/test against, not a permanent skeleton.
export function useDashboardData(): { state: DashboardLoadState; data: DashboardData } {
  const [state, setState] = useState<DashboardLoadState>("loading");
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD_DATA);

  useEffect(() => {
    const t = setTimeout(() => {
      const setup = getCardSetup();
      setData({
        ...FILLED_DEMO_DATA,
        rewards: { ...FILLED_DEMO_DATA.rewards, ticker: setup.growBackTicker },
      });
      setState("ready");
    }, 700);
    return () => clearTimeout(t);
  }, []);

  return { state, data };
}
