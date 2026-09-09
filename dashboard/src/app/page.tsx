import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { GrowBackIcon } from "@/components/NavIcons";

// Mock data for Phase 1 — wired to real balances/activity in Phase 4
// (see sprout-dashboard-concept.md, section 4).
const MOCK = {
  balance: "$2,840.20",
  allocation: [
    { asset: "ETH", pct: 62 },
    { asset: "USDG", pct: 28 },
    { asset: "Stocks", pct: 10 },
  ],
  growBack: { ticker: "AAPL", rate: "1.5%", grownThisMonth: "+$42.80" },
  monthSpend: { amount: "$1,214", deltaLabel: "↓ 8% vs last month" },
  network: { name: "Robinhood Chain", lastTx: "4s ago" },
  activity: [
    { merchant: "Blue Bottle Coffee", spend: "−$6.50", grow: "+$0.10" },
    { merchant: "Whole Foods", spend: "−$84.20", grow: "+$1.26" },
    { merchant: "Uber", spend: "−$18.40", grow: "+$0.28" },
  ],
};

export default function OverviewPage() {
  return (
    <div className="flex h-dvh bg-bg relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -right-30 w-140 h-140 rounded-full bg-[radial-gradient(circle,rgba(216,255,77,.10),transparent_70%)]" />

      <Sidebar active="Overview" />

      <div className="flex-1 h-full overflow-hidden relative z-10 flex flex-col">
        <DashboardHeader title="Overview" cardBalance={MOCK.balance} />

        <div className="flex-1 p-7 grid grid-cols-4 grid-rows-2 gap-4 overflow-auto">
          {/* Balance — spans 2 cols */}
          <div className="col-span-2 row-span-1 bg-surface border border-(--line) rounded-lg p-6.5 flex flex-col justify-between">
            <div className="text-xs text-text-dim uppercase tracking-wide">
              Card balance
            </div>
            <div>
              <div className="font-display num text-4xl tracking-tight">
                {MOCK.balance}
              </div>
              <div className="flex gap-3.5 mt-2.5 text-xs text-text-dim">
                {MOCK.allocation.map((a) => (
                  <span key={a.asset}>
                    {a.asset} · {a.pct}%
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2.5">
              <button className="px-4 py-2.5 rounded-full bg-sprout text-ink text-sm font-semibold">
                Top up
              </button>
              <button className="px-4 py-2.5 rounded-full border border-(--line) text-sm text-text-dim">
                Freeze card
              </button>
            </div>
          </div>

          {/* Grow-back — highlight widget, spans both rows */}
          <div className="col-span-1 row-span-2 bg-ink border border-(--line) rounded-lg p-6 flex flex-col gap-3.5">
            <span className="text-[10.5px] font-semibold text-sprout uppercase tracking-wide">
              Unique to Sprout
            </span>
            <div className="w-9 h-9 rounded-sm bg-sprout/14 flex items-center justify-center">
              <GrowBackIcon className="text-sprout w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs text-text-dim">Routing to</div>
              <div className="font-display text-[22px] mt-0.5">
                {MOCK.growBack.ticker}
              </div>
            </div>
            <div className="h-px bg-(--line)" />
            <div>
              <div className="text-xs text-text-dim">Grown this month</div>
              <div className="font-display num text-[26px] text-sprout mt-0.5">
                {MOCK.growBack.grownThisMonth}
              </div>
            </div>
            <div className="mt-auto text-xs text-sprout">Change ticker →</div>
          </div>

          {/* This month spend */}
          <div className="col-span-1 row-span-1 bg-surface border border-(--line) rounded-lg p-5.5 flex flex-col justify-between">
            <div className="text-xs text-text-dim uppercase tracking-wide">
              This month
            </div>
            <div>
              <div className="font-display num text-[28px]">
                {MOCK.monthSpend.amount}
              </div>
              <div className="text-xs text-sprout-deep mt-1">
                {MOCK.monthSpend.deltaLabel}
              </div>
            </div>
          </div>

          {/* Network status */}
          <div className="col-span-1 row-span-1 bg-surface border border-(--line) rounded-lg p-5.5 flex flex-col justify-between">
            <div className="text-xs text-text-dim uppercase tracking-wide">
              Network
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.75 h-1.75 rounded-full bg-sprout" />
              <div className="font-display text-base">{MOCK.network.name}</div>
            </div>
            <div className="text-xs text-text-dim">
              Last tx confirmed · {MOCK.network.lastTx}
            </div>
          </div>

          {/* Recent activity — spans 2 cols */}
          <div className="col-span-2 row-span-1 bg-surface border border-(--line) rounded-lg p-5.5 flex flex-col">
            <div className="text-xs text-text-dim uppercase tracking-wide mb-3.5">
              Recent activity
            </div>
            <div className="flex flex-col gap-3">
              {MOCK.activity.map((row) => (
                <div key={row.merchant} className="flex justify-between text-[13.5px]">
                  <span className="text-text-dim">{row.merchant}</span>
                  <b className="font-medium">
                    {row.spend}{" "}
                    <span className="text-sprout [text-shadow:0_0_10px_rgba(216,255,77,.5)]">
                      {row.grow}
                    </span>
                  </b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
