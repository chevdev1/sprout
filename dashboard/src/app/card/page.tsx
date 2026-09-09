"use client";

import { useState, type CSSProperties } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SproutLogo } from "@/components/SproutLogo";
import { getOrIssueCard, type CardData } from "@/lib/cardAccess";
import { useToast } from "@/components/ToastProvider";

function stagger(index: number): CSSProperties {
  return { "--stagger-index": index } as CSSProperties;
}

export default function CardPage() {
  const [card, setCard] = useState<CardData | null>(null);
  const [frozen, setFrozen] = useState(false);
  const toast = useToast();

  function reveal() {
    if (card) return;
    setCard(getOrIssueCard());
    toast.push("Card revealed", "Your number, expiry and CVV are ready to use");
  }

  function toggleFreeze() {
    setFrozen((f) => {
      const next = !f;
      toast.push(
        next ? "Card frozen" : "Card unfrozen",
        next ? "New transactions are blocked" : "Your card is active again"
      );
      return next;
    });
  }

  return (
    <div className="flex h-dvh bg-bg relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -right-30 w-140 h-140 rounded-full bg-[radial-gradient(circle,rgba(216,255,77,.10),transparent_70%)]" />

      <Sidebar active="Card" />

      <div className="flex-1 h-full overflow-hidden relative z-10 flex flex-col">
        <DashboardHeader title="Card" cardBalance="$2,840.20" />

        <div className="flex-1 p-4 sm:p-7 pb-20 md:pb-7 flex flex-col md:flex-row gap-6 md:gap-9 overflow-auto">
          <div className="w-full md:w-100 shrink-0 flex flex-col gap-5">
            <button
              onClick={reveal}
              className={`stagger-card aspect-[1.586/1] rounded-[18px] border p-6.5 flex flex-col justify-between text-left relative overflow-hidden group transition-[border-color,box-shadow] duration-[var(--dur-hover)] ${
                frozen
                  ? "border-red-500/50 shadow-[inset_0_0_0_1px_rgba(239,68,68,.3),0_0_36px_-10px_rgba(239,68,68,.45)]"
                  : "border-(--line-on-ink)"
              }`}
              style={{
                ...stagger(0),
                background:
                  "linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.01) 55%), linear-gradient(135deg,#20241C 0%,#0D110C 75%)",
              }}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-red-500/10 transition-opacity duration-[var(--dur-hover)] ${
                  frozen ? "opacity-100" : "opacity-0"
                }`}
              />
              {frozen && (
                <span className="reveal-in pointer-events-none absolute top-3.5 right-3.5 text-[9.5px] font-semibold tracking-[0.08em] uppercase text-red-400 border border-red-500/40 bg-red-500/10 rounded-full px-2 py-0.75">
                  Frozen
                </span>
              )}

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.75">
                  <SproutLogo size={16} className="text-sprout" />
                  <span className="font-display text-(--paper) text-[15px]">sprout</span>
                </div>
                <span className="text-[10.5px] text-(--mist-on-ink) border border-(--line-on-ink) rounded-full px-2.5 py-0.75">
                  Robinhood Chain
                </span>
              </div>

              {card ? (
                <div className="reveal-in flex flex-col gap-1">
                  <div className="num text-[#E4E4D8] text-base tracking-[2px] font-mono">
                    {card.number}
                  </div>
                  <div className="flex gap-5 text-xs text-(--mist-on-ink)">
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

              <div className="flex justify-between text-[10.5px] text-(--mist-on-ink) tracking-wide">
                <span>ETH · USDG · STOCKS</span>
                <span>VIRTUAL</span>
              </div>
            </button>

            <div
              className="stagger-card bg-surface border border-(--line) rounded-lg p-5 flex justify-between items-center"
              style={stagger(1)}
            >
              <div>
                <div className="font-display text-sm">Freeze card</div>
                <div className="text-xs text-text-dim mt-0.5">
                  {frozen ? "New transactions are blocked" : "Instantly blocks new transactions"}
                </div>
              </div>
              <button
                onClick={toggleFreeze}
                role="switch"
                aria-checked={frozen}
                aria-label="Freeze card"
                className={`min-w-11 w-11 h-6.5 rounded-full relative shrink-0 transition-colors duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2 ${
                  frozen ? "bg-red-500/80" : "bg-(--line)"
                }`}
              >
                <span
                  className={`absolute top-0.75 left-0.75 w-5 h-5 rounded-full bg-white transition-transform duration-[var(--dur-hover)] ${
                    frozen ? "translate-x-4.5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="stagger-card flex gap-2.5" style={stagger(2)}>
              <button className="flex-1 min-h-11 py-3 rounded-full bg-sprout text-ink text-[13.5px] font-semibold hover:bg-sprout-deep active:scale-[0.97] transition-[background-color,transform] duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2">
                Top up
              </button>
              <button className="flex-1 min-h-11 py-3 rounded-full border border-(--line) text-[13.5px] text-text-dim hover:border-sprout/40 hover:text-text active:scale-[0.97] transition-[border-color,color,transform] duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2">
                Card details
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-5 min-w-0">
            <div
              className="stagger-card bg-surface border border-(--line) rounded-lg p-6.5"
              style={stagger(3)}
            >
              <div className="text-xs text-text-dim uppercase tracking-wide mb-2.5">
                Available balance
              </div>
              <div className="font-display num text-[44px] tracking-tight">
                $2,840.20
              </div>
            </div>

            <div
              className="stagger-card bg-ink border border-(--line-on-ink) rounded-lg p-6.5 hover:border-sprout/30 transition-colors duration-[var(--dur-hover)]"
              style={stagger(4)}
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <span className="text-[10.5px] font-semibold text-sprout uppercase tracking-wide">
                    Grow-back · Unique to Sprout
                  </span>
                  <div className="font-display text-(--paper) text-xl mt-1.5">
                    Routing to AAPL
                  </div>
                </div>
                <div className="font-display num text-xl text-sprout">
                  +$42.80
                  <span className="text-[11px] text-(--mist-on-ink)"> this month</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-4 py-2 rounded-full bg-sprout text-ink text-xs font-semibold">
                  AAPL
                </span>
                <span className="px-4 py-2 rounded-full border border-(--line-on-ink) text-xs text-(--mist-on-ink)">
                  ETH
                </span>
                <span className="px-4 py-2 rounded-full border border-(--line-on-ink) text-xs text-(--mist-on-ink)">
                  SPY ETF
                </span>
              </div>
            </div>

            <div
              className="stagger-card bg-surface border border-(--line) rounded-lg p-6 flex-1"
              style={stagger(5)}
            >
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
