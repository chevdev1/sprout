"use client";

import type { CSSProperties } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Skeleton } from "@/components/Skeleton";
import { SproutLogo } from "@/components/SproutLogo";
import { useDashboardData } from "@/lib/dashboardData";
import { useCountUp } from "@/lib/useCountUp";

function stagger(index: number): CSSProperties {
  return { "--stagger-index": Math.min(index, 6) } as CSSProperties;
}

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function OverviewPage() {
  const { state, data } = useDashboardData();
  const loading = state === "loading";
  const balance = useCountUp(data.balance.total, !loading);

  return (
    <div className="flex h-dvh bg-bg relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -right-30 w-140 h-140 rounded-full bg-[radial-gradient(circle,rgba(216,255,77,.10),transparent_70%)]" />

      <Sidebar active="Overview" />

      <div className="flex-1 h-full overflow-hidden relative z-10 flex flex-col">
        <DashboardHeader title="Overview" />

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 xl:max-w-[1440px] xl:mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-start">
              {/* Card balance — hero */}
              <div
                className="stagger-card md:col-span-2 lg:col-span-6 lg:min-h-52 bg-surface border border-(--line) rounded-lg p-6.5 flex flex-col justify-between gap-5"
                style={stagger(0)}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-(--mist-on-ink)">
                  Card balance
                </div>

                {loading ? (
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-11 w-48" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ) : (
                  <div>
                    <div className="font-display num text-[clamp(36px,5vw,52px)] leading-none tracking-tight">
                      {money(balance)}
                    </div>
                    {data.balance.split && (
                      <div className="flex gap-3.5 mt-3 text-xs text-(--mist-on-ink) flex-wrap">
                        {data.balance.split.map((a) => (
                          <span key={a.asset}>
                            {a.asset} · {a.pct}%
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!loading && data.balance.total === 0 ? (
                  <div>
                    <p className="text-sm text-(--mist-on-ink) mb-3.5">
                      Top up your card to start spending.
                    </p>
                    <button className="min-h-11 px-5 py-2.5 rounded-full bg-sprout text-ink text-sm font-semibold hover:bg-sprout-deep active:scale-[0.97] transition-[background-color,transform] duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2">
                      Top up
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2.5 flex-wrap">
                    <button className="min-h-11 px-5 py-2.5 rounded-full bg-sprout text-ink text-sm font-semibold hover:bg-sprout-deep active:scale-[0.97] transition-[background-color,transform] duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2">
                      Top up
                    </button>
                    <button className="min-h-11 px-5 py-2.5 rounded-full border border-(--line) text-sm text-text-dim hover:border-sprout/40 hover:text-text active:scale-[0.97] transition-[border-color,color,transform] duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2">
                      Freeze card
                    </button>
                  </div>
                )}
              </div>

              {/* Grow-back / rewards */}
              <div
                className="stagger-card lg:col-span-3 bg-ink border border-(--line-on-ink) rounded-lg p-6 flex flex-col gap-3.5 hover:border-sprout/30 transition-colors duration-[var(--dur-hover)]"
                style={stagger(1)}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-sm bg-sprout/14 flex items-center justify-center shrink-0">
                    <SproutLogo size={14} className="text-sprout" />
                  </span>
                  <span className="text-[10.5px] font-semibold text-sprout uppercase tracking-[0.06em]">
                    Unique to Sprout
                  </span>
                </div>

                {loading ? (
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ) : data.rewards.ticker ? (
                  <div>
                    <div className="text-xs text-(--mist-on-ink)">Routing to</div>
                    <div className="font-display text-(--paper) text-[22px] mt-0.5">
                      {data.rewards.ticker}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-display text-(--paper) text-[15px]">
                      Ticker not selected
                    </div>
                    <p className="text-xs text-(--mist-on-ink) mt-1 leading-relaxed">
                      Choose the stock your rewards will grow into.
                    </p>
                  </div>
                )}

                <div className="h-px bg-(--line-on-ink)" />

                {loading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <div>
                    <div className="text-xs text-(--mist-on-ink)">Grown this month</div>
                    <div className="font-display num text-[26px] text-sprout mt-0.5">
                      {data.rewards.ticker ? `+${money(data.rewards.grownThisMonth)}` : money(0)}
                    </div>
                  </div>
                )}

                <button className="min-h-11 mt-auto -mx-2 px-2 text-left text-xs text-sprout hover:underline active:scale-[0.97] transition-transform duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2 rounded-sm w-fit">
                  {data.rewards.ticker ? "Change ticker →" : "Choose ticker →"}
                </button>
              </div>

              {/* This month spend */}
              <div
                className="stagger-card lg:col-span-3 bg-surface border border-(--line) rounded-lg p-5.5 flex flex-col gap-3 hover:border-sprout/30 transition-colors duration-[var(--dur-hover)]"
                style={stagger(2)}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-(--mist-on-ink)">
                  This month
                </div>
                {loading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <div>
                    <div className="font-display num text-[28px] leading-tight">
                      {data.spend.thisMonth === 0 ? "$0" : money(data.spend.thisMonth)}
                    </div>
                    {data.spend.deltaPct !== null ? (
                      <div className="text-xs text-sprout-deep mt-1.5 pb-1">
                        {data.spend.deltaPct <= 0 ? "↓" : "↑"} {Math.abs(data.spend.deltaPct)}%
                        vs last month
                      </div>
                    ) : (
                      <p className="text-xs text-(--mist-on-ink) mt-1.5 pb-1">
                        Counted from your first purchase.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Network status */}
              <div
                className="stagger-card md:col-span-2 lg:col-span-4 bg-surface border border-(--line) rounded-lg p-5.5 flex flex-col gap-3 hover:border-sprout/30 transition-colors duration-[var(--dur-hover)]"
                style={stagger(3)}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-(--mist-on-ink)">
                  Network
                </div>
                {loading ? (
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3.5 w-40" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.75 h-1.75 rounded-full shrink-0 ${
                          data.network.status === "connected"
                            ? "bg-sprout [animation:pulse-dot_2s_ease-in-out_infinite]"
                            : "bg-(--mist-on-ink)"
                        }`}
                      />
                      <div className="font-display text-base truncate">{data.network.name}</div>
                    </div>
                    <div className="text-xs text-text-dim">
                      {data.network.lastTxAt
                        ? `Last tx confirmed · ${data.network.lastTxAt}`
                        : "Awaiting your first transaction"}
                    </div>
                  </>
                )}
              </div>

              {/* Recent activity */}
              <div
                className="stagger-card md:col-span-2 lg:col-span-8 bg-surface border border-(--line) rounded-lg p-5.5 flex flex-col gap-3.5"
                style={stagger(4)}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-(--mist-on-ink)">
                  Recent activity
                </div>
                {loading ? (
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-4.5 w-full" />
                    <Skeleton className="h-4.5 w-full" />
                    <Skeleton className="h-4.5 w-full" />
                  </div>
                ) : data.activity.length === 0 ? (
                  <div className="py-2">
                    <div className="font-display text-[15px]">No transactions yet</div>
                    <p className="text-xs text-text-dim mt-1">
                      Purchases show up here right after you pay.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {data.activity.map((row) => (
                      <div
                        key={row.id}
                        className="flex justify-between items-baseline gap-3 text-[13.5px]"
                      >
                        <span className="text-text-dim truncate min-w-0">{row.merchant}</span>
                        <b className="font-medium shrink-0 whitespace-nowrap">
                          {money(row.spend)}{" "}
                          <span className="text-sprout [text-shadow:0_0_10px_rgba(216,255,77,.5)]">
                            +{money(row.grow)}
                          </span>
                        </b>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
