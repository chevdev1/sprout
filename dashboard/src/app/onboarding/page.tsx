"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SproutLogo } from "@/components/SproutLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/components/ToastProvider";
import { setFlowStage, saveCardSetup, type CardSetup } from "@/lib/cardAccess";
import { primeAudio, playWelcomeChime } from "@/lib/sound";

const STEP_LABELS = ["Card & funding", "Grow-back", "Review", "Ready"] as const;

const FUNDING_OPTIONS: { asset: CardSetup["fundingAsset"]; amount: string }[] = [
  { asset: "ETH", amount: "1.20 ETH" },
  { asset: "USDG", amount: "$2,000.00" },
  { asset: "Tokenized stocks", amount: "$2,000.00" },
];

const TICKER_OPTIONS = ["AAPL", "ETH", "SPY ETF", "NVDA", "Other RWA…"];

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEP_LABELS.map((_, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "active" : "pending";
        return (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors duration-[var(--motion-fast)] ${
                state === "done"
                  ? "bg-(--fill-sprout) text-ink font-bold"
                  : state === "active"
                    ? "bg-ink border border-sprout text-sprout"
                    : "border border-(--line) text-text-dim"
              }`}
            >
              {state === "done" ? "✓" : n}
            </div>
            {n < STEP_LABELS.length && (
              <div
                className={`w-11 h-px transition-colors duration-[var(--motion-fast)] ${
                  n < step ? "bg-sprout" : "bg-(--line)"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChoiceChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4.5 py-2.25 rounded-full text-[13.5px] transition-colors duration-[var(--motion-fast)] ${
        active
          ? "bg-(--fill-sprout) text-ink font-semibold"
          : "border border-(--line) text-text-dim hover:text-text hover:border-sprout/40"
      }`}
    >
      {label}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [setup, setSetup] = useState<CardSetup>({
    fundingAsset: "ETH",
    fundingAmount: "1.20 ETH",
    growBackTicker: "AAPL",
    growBackRate: "1.5%",
  });

  function selectFunding(asset: CardSetup["fundingAsset"], amount: string) {
    setSetup((s) => ({ ...s, fundingAsset: asset, fundingAmount: amount }));
  }

  useEffect(() => {
    if (step === 4) playWelcomeChime();
  }, [step]);

  function confirmAndSign() {
    primeAudio(); // must fire inside the click gesture, not the setTimeout below
    setConfirming(true);
    setTimeout(() => {
      saveCardSetup(setup);
      setFlowStage("onboarded");
      toast.push("Card is ready", "Funded and grow-back is live");
      setConfirming(false);
      setStep(4);
    }, 1100);
  }

  return (
    <div className="min-h-dvh bg-bg relative overflow-hidden flex flex-col items-center px-4">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-175 h-175 rounded-full bg-[radial-gradient(circle,var(--glow-b),transparent_70%)]" />

      <div className="w-full max-w-160 h-18 shrink-0 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <SproutLogo size={20} className="text-sprout" />
          <span className="font-display text-base">sprout</span>
        </div>
        {step < 4 && <ThemeToggle />}
      </div>

      {step < 4 && (
        <div className="mt-2 relative z-10">
          <Stepper step={step} />
        </div>
      )}

      {/* Step 1 — card type + funding */}
      {step === 1 && (
        <div className="w-full max-w-150 mt-8 bg-surface border border-(--line) rounded-lg p-6 sm:p-10 relative z-10 [animation:fade-up_var(--motion-base)_var(--ease-out-expo)]">
          <div className="text-[11px] font-semibold text-sprout-deep uppercase tracking-wide mb-2.5">
            Step 1 of 4
          </div>
          <h1 className="font-display text-2xl tracking-tight mb-2">
            Choose your card, then fund it.
          </h1>
          <p className="text-sm text-text-dim leading-relaxed mb-7 max-w-[46ch]">
            Virtual is instant. Physical ships once your virtual card is active.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-2.5">
            <div className="flex-1 p-4.5 rounded-md border-[1.5px] border-sprout bg-sprout/6">
              <div className="flex justify-between items-start">
                <span className="font-display text-[15px]">Virtual</span>
                <span className="text-[10.5px] font-semibold text-ink bg-(--fill-sprout) px-2 py-0.75 rounded-full">
                  $5 one-time
                </span>
              </div>
              <div className="text-xs text-text-dim mt-2">
                Instant · ready to use now
              </div>
            </div>
            <div className="flex-1 p-4.5 rounded-md border border-(--line) opacity-50">
              <div className="flex justify-between items-start">
                <span className="font-display text-[15px] text-text-dim">
                  Physical
                </span>
                <span className="text-[10.5px] font-semibold text-text-dim border border-(--line) px-2 py-0.75 rounded-full">
                  At cost
                </span>
              </div>
              <div className="text-xs text-text-dim mt-2">
                Ships after virtual is active
              </div>
            </div>
          </div>
          <div className="text-[11.5px] text-text-dim mb-6 leading-relaxed">
            Availability and final card terms are set at launch.
          </div>

          <div className="text-xs text-text-dim mb-3">Fund with</div>
          <div className="flex gap-2 mb-7 flex-wrap">
            {FUNDING_OPTIONS.map((opt) => (
              <ChoiceChip
                key={opt.asset}
                label={opt.asset}
                active={setup.fundingAsset === opt.asset}
                onClick={() => selectFunding(opt.asset, opt.amount)}
              />
            ))}
          </div>
          <div className="px-4.5 py-4 rounded-md border border-(--line) bg-surface flex justify-between items-center mb-8">
            <span className="text-[13px] text-text-dim">Amount</span>
            <span className="font-display num text-xl">{setup.fundingAmount}</span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-7 py-3.25 rounded-full bg-(--fill-sprout) text-ink text-sm font-semibold"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — grow-back ticker */}
      {step === 2 && (
        <div className="w-full max-w-160 mt-8 bg-surface border border-(--line) rounded-lg p-6 sm:p-10 relative z-10 [animation:fade-up_var(--motion-base)_var(--ease-out-expo)]">
          <div className="text-[11px] font-semibold text-sprout-deep uppercase tracking-wide mb-2.5">
            Step 2 of 4 · Unique to Sprout
          </div>
          <h1 className="font-display text-2xl tracking-tight mb-2">
            Set your grow-back ticker.
          </h1>
          <p className="text-sm text-text-dim leading-relaxed mb-7 max-w-[48ch]">
            A slice of every purchase routes here automatically. Change it any
            time from your dashboard.
          </p>

          <div className="text-xs text-text-dim mb-3">Route to</div>
          <div className="flex gap-2 flex-wrap mb-8">
            {TICKER_OPTIONS.map((ticker) => (
              <ChoiceChip
                key={ticker}
                label={ticker}
                active={setup.growBackTicker === ticker}
                onClick={() => setSetup((s) => ({ ...s, growBackTicker: ticker }))}
              />
            ))}
          </div>

          <div className="flex justify-between text-[13px] text-text-dim mb-3.5">
            <span>Grow-back rate</span>
            <b className="text-text font-semibold">{setup.growBackRate}</b>
          </div>
          <div className="w-full h-1 rounded-full bg-(--line) relative mb-2">
            <div className="absolute left-0 top-0 h-1 w-1/4 rounded-full bg-sprout" />
            <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-sprout shadow-[0_0_0_5px_rgba(216,255,77,.15)]" />
          </div>
          <div className="flex justify-between text-[11px] text-text-dim mb-8">
            <span>0.5%</span>
            <span>5%</span>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(1)}
              className="text-[13px] text-text-dim hover:text-text transition-colors duration-[var(--motion-fast)]"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-7 py-3.25 rounded-full bg-(--fill-sprout) text-ink text-sm font-semibold"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — review */}
      {step === 3 && (
        <div className="w-full max-w-160 mt-8 bg-surface border border-(--line) rounded-lg p-6 sm:p-10 relative z-10 [animation:fade-up_var(--motion-base)_var(--ease-out-expo)]">
          <div className="text-[11px] font-semibold text-sprout-deep uppercase tracking-wide mb-2.5">
            Step 3 of 4
          </div>
          <h1 className="font-display text-2xl tracking-tight mb-6">
            Review &amp; confirm.
          </h1>

          <div className="flex flex-col gap-0 mb-6">
            {[
              ["Card type", "Virtual"],
              ["Funding", setup.fundingAmount],
              ["Grow-back", `${setup.growBackRate} → ${setup.growBackTicker}`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between text-[13.5px] py-3 border-b border-(--line)"
              >
                <span className="text-text-dim">{label}</span>
                <b className="font-medium">{value}</b>
              </div>
            ))}
          </div>

          <div className="text-xs text-text-dim uppercase tracking-wide mb-3">
            Fees
          </div>
          <div className="border border-(--line) rounded-md overflow-hidden mb-8">
            <div className="flex justify-between px-4 py-3.25 bg-surface text-xs text-text-dim">
              <span>Item</span>
              <span>Cost</span>
            </div>
            {[
              ["Card issuance", "$5.00 · Paid ✓", true],
              ["Spend fee, per transaction", "1.0%", false],
              ["Grow-back routing", "No added fee", true],
              ["Monthly balance fee", "None", true],
            ].map(([label, value, highlight]) => (
              <div
                key={label as string}
                className="flex justify-between px-4 py-3.25 border-t border-(--line) text-[13px]"
              >
                <span>{label}</span>
                <b className={highlight ? "text-sprout-deep font-semibold" : "font-semibold"}>
                  {value}
                </b>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(2)}
              className="text-[13px] text-text-dim hover:text-text transition-colors duration-[var(--motion-fast)]"
            >
              Back
            </button>
            <button
              onClick={confirmAndSign}
              disabled={confirming}
              className="px-7 py-3.25 rounded-full bg-(--fill-sprout) text-ink text-sm font-semibold disabled:opacity-50"
            >
              {confirming ? "Signing…" : "Confirm & sign"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — full-screen welcome takeover, card is actually issued now */}
      {step === 4 && (
        <div className="fixed inset-0 z-20 bg-bg flex flex-col items-center justify-center overflow-hidden px-6">
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-(--ring-color) [animation:welcome-ring_1.8s_var(--ease-out-expo)_infinite]" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-(--ring-color) [animation:welcome-ring_1.8s_var(--ease-out-expo)_.6s_infinite]" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-160 h-160 rounded-full bg-[radial-gradient(circle,var(--glow-strong),transparent_68%)]" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="text-[11px] font-semibold text-sprout-deep uppercase tracking-wide mb-3.5 [animation:fade-up_var(--motion-base)_var(--ease-out-expo)_backwards]">
              Card issued
            </span>
            <h1 className="font-display text-[28px] sm:text-[38px] tracking-tight mb-2 [animation:fade-up_var(--motion-base)_var(--ease-out-expo)_80ms_backwards]">
              Welcome to Sprout.
            </h1>
            <p className="text-sm text-text-dim mb-10 [animation:fade-up_var(--motion-base)_var(--ease-out-expo)_160ms_backwards]">
              Your card is funded and grow-back is live.
            </p>

            <div
              className="w-full max-w-100 aspect-[1.586/1] rounded-[18px] border border-(--line-on-ink) p-6.5 flex flex-col justify-between mb-9 [animation:fade-up_var(--motion-slow)_var(--ease-out-expo)_240ms_backwards]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.01) 55%), linear-gradient(135deg,#20241C 0%,#0D110C 75%)",
                boxShadow:
                  "0 30px 60px -20px var(--card-glow), 0 20px 50px -20px rgba(0,0,0,.6)",
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.75">
                  <SproutLogo size={16} className="text-sprout" />
                  <span className="font-display text-(--paper) text-[15px]">sprout</span>
                </div>
                <span className="text-[10.5px] text-(--mist-on-ink) border border-(--line-on-ink) rounded-full px-2.5 py-0.75">
                  Robinhood Chain
                </span>
              </div>
              <div className="text-[#E4E4D8] text-base tracking-[2px] font-mono">
                •••• •••• •••• ••••
              </div>
              <div className="flex justify-between text-[10.5px] text-(--mist-on-ink) tracking-wide">
                <span>ETH · USDG · STOCKS</span>
                <span>VIRTUAL</span>
              </div>
            </div>

            <button
              onClick={() => router.replace("/")}
              className="px-7.5 py-3.5 rounded-full bg-(--fill-sprout) text-ink text-[14.5px] font-semibold [animation:fade-up_var(--motion-base)_var(--ease-out-expo)_340ms_backwards]"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
