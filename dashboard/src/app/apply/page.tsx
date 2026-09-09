"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SproutLogo } from "@/components/SproutLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { setFlowStage } from "@/lib/cardAccess";
import { useToast } from "@/components/ToastProvider";
import { primeAudio } from "@/lib/sound";

// Phase 1 mock: no real charge yet — Phase 3 wires this to an actual
// on-chain payment + server-verified session before granting access.
export default function ApplyPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const toast = useToast();
  const [status, setStatus] = useState<"idle" | "paying" | "done">("idle");

  function handlePay() {
    primeAudio(); // must fire inside the click gesture, not the setTimeout below
    setStatus("paying");
    setTimeout(() => {
      setFlowStage("paid");
      setStatus("done");
      toast.push("Payment confirmed", "$5.00 received — setting up your card");
      router.replace("/welcome");
    }, 1400);
  }

  return (
    <div className="min-h-dvh flex items-center justify-center relative overflow-hidden bg-bg p-6">
      <div className="pointer-events-none absolute -top-40 -right-30 w-140 h-140 rounded-full bg-[radial-gradient(circle,rgba(216,255,77,.10),transparent_70%)]" />

      <div className="w-full max-w-md bg-surface border border-(--line) rounded-lg p-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <SproutLogo size={22} className="text-sprout" />
            <span className="font-display text-lg">sprout</span>
          </div>
          <ThemeToggle />
        </div>

        <h1 className="font-display text-2xl tracking-tight mb-1.5">
          Apply for your card
        </h1>
        <p className="text-sm text-text-dim mb-7 leading-relaxed">
          A one-time issuance fee unlocks your dashboard and your virtual
          Sprout card.
        </p>

        <div className="flex flex-col gap-3 mb-7">
          <div className="flex items-center justify-between px-4 py-3.5 rounded-md bg-surface-2 border border-(--line)">
            <span className="text-sm text-text-dim">Issuance fee</span>
            <span className="font-display num text-base">$5.00</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 rounded-md bg-surface-2 border border-(--line)">
            <span className="text-sm text-text-dim">Issuing country</span>
            <span className="text-sm font-medium">Europe (any)</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 rounded-md bg-surface-2 border border-(--line)">
            <span className="text-sm text-text-dim">Card type</span>
            <span className="text-sm font-medium">Virtual, instant</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-text-dim uppercase tracking-wide mb-2.5">
            1. Connect wallet
          </div>
          <ConnectButton.Custom>
            {({ account, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account;
              if (!ready) return null;
              return connected ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-full border border-(--line) bg-surface-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-sprout to-sprout-deep" />
                  {account.displayName}
                </div>
              ) : (
                <button
                  onClick={openConnectModal}
                  className="w-full px-4 py-3 rounded-full border border-(--line) text-sm font-medium hover:border-sprout/40 transition-colors duration-[var(--motion-fast)]"
                >
                  Connect wallet
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>

        <div>
          <div className="text-xs text-text-dim uppercase tracking-wide mb-2.5">
            2. Pay &amp; issue card
          </div>
          <button
            onClick={handlePay}
            disabled={!isConnected || status !== "idle"}
            className="w-full px-4 py-3.5 rounded-full bg-sprout text-ink text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-[var(--motion-fast)]"
          >
            {status === "paying" ? "Processing payment…" : "Pay $5 & get card"}
          </button>
        </div>

        <p className="text-xs text-text-dim mt-6 leading-relaxed">
          Concept preview only. No real funds are charged in this build.
        </p>
      </div>
    </div>
  );
}
