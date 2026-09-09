"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SproutLogo } from "@/components/SproutLogo";
import { getOrIssueCard, type CardData } from "@/lib/cardAccess";

export default function CardPage() {
  const [card, setCard] = useState<CardData | null>(null);

  return (
    <div className="flex h-dvh bg-bg relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -right-30 w-140 h-140 rounded-full bg-[radial-gradient(circle,rgba(216,255,77,.10),transparent_70%)]" />

      <Sidebar active="Card" />

      <div className="flex-1 h-full overflow-hidden relative z-10 flex flex-col">
        <DashboardHeader title="Card" cardBalance="$2,840.20" />

        <div className="flex-1 p-7 flex gap-9 overflow-auto">
          <div className="w-100 shrink-0 flex flex-col gap-5">
            <button
              onClick={() => !card && setCard(getOrIssueCard())}
              className="aspect-[1.586/1] rounded-[18px] border border-(--line) p-6.5 flex flex-col justify-between text-left relative overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.01) 55%), linear-gradient(135deg,#20241C 0%,#0D110C 75%)",
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.75">
                  <SproutLogo size={16} className="text-sprout" />
                  <span className="font-display text-[15px]">sprout</span>
                </div>
                <span className="text-[10.5px] text-text-dim border border-(--line) rounded-full px-2.5 py-0.75">
                  Robinhood Chain
                </span>
              </div>

              {card ? (
                <div className="flex flex-col gap-1">
                  <div className="num text-[#E4E4D8] text-base tracking-[2px] font-mono">
                    {card.number}
                  </div>
                  <div className="flex gap-5 text-xs text-text-dim">
                    <span>EXP {card.expiry}</span>
                    <span>CVV {card.cvv}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="text-[#E4E4D8] text-base tracking-[2px] font-mono">
                    •••• •••• •••• ••••
                  </div>
                  <div className="text-xs text-sprout group-hover:underline">
                    Click to reveal &amp; issue card →
                  </div>
                </div>
              )}

              <div className="flex justify-between text-[10.5px] text-text-dim tracking-wide">
                <span>ETH · USDG · STOCKS</span>
                <span>VIRTUAL</span>
              </div>
            </button>

            <div className="bg-surface border border-(--line) rounded-lg p-5 flex justify-between items-center">
              <div>
                <div className="font-display text-sm">Freeze card</div>
                <div className="text-xs text-text-dim mt-0.5">
                  Instantly blocks new transactions
                </div>
              </div>
              <div className="w-11 h-6.5 rounded-full bg-(--line) relative">
                <div className="absolute top-0.75 left-0.75 w-5 h-5 rounded-full bg-text-dim" />
              </div>
            </div>

            <div className="flex gap-2.5">
              <button className="flex-1 py-3 rounded-full bg-sprout text-ink text-[13.5px] font-semibold">
                Top up
              </button>
              <button className="flex-1 py-3 rounded-full border border-(--line) text-[13.5px] text-text-dim">
                Card details
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-5 min-w-0">
            <div className="bg-surface border border-(--line) rounded-lg p-6.5">
              <div className="text-xs text-text-dim uppercase tracking-wide mb-2.5">
                Available balance
              </div>
              <div className="font-display num text-[44px] tracking-tight">
                $2,840.20
              </div>
            </div>

            <div className="bg-ink border border-(--line) rounded-lg p-6.5">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <span className="text-[10.5px] font-semibold text-sprout uppercase tracking-wide">
                    Grow-back · Unique to Sprout
                  </span>
                  <div className="font-display text-xl mt-1.5">
                    Routing to AAPL
                  </div>
                </div>
                <div className="font-display num text-xl text-sprout">
                  +$42.80
                  <span className="text-[11px] text-text-dim"> this month</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-4 py-2 rounded-full bg-sprout text-ink text-xs font-semibold">
                  AAPL
                </span>
                <span className="px-4 py-2 rounded-full border border-(--line) text-xs text-text-dim">
                  ETH
                </span>
                <span className="px-4 py-2 rounded-full border border-(--line) text-xs text-text-dim">
                  SPY ETF
                </span>
              </div>
            </div>

            <div className="bg-surface border border-(--line) rounded-lg p-6 flex-1">
              <div className="text-xs text-text-dim uppercase tracking-wide mb-3.5">
                Recent on this card
              </div>
              <div className="flex flex-col gap-3">
                {[
                  ["Whole Foods", "−$84.20"],
                  ["Uber", "−$18.40"],
                  ["Spotify", "−$11.99"],
                ].map(([merchant, amount]) => (
                  <div key={merchant} className="flex justify-between text-[13.5px]">
                    <span className="text-text-dim">{merchant}</span>
                    <b className="font-medium">{amount}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
