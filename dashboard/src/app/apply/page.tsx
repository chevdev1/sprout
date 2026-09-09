"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SproutLogo } from "@/components/SproutLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { setFlowStage } from "@/lib/cardAccess";
import { useToast } from "@/components/ToastProvider";
import { primeAudio } from "@/lib/sound";
import { robinhoodChainTestnet } from "@/lib/wagmi";
import {
  erc20Abi,
  ISSUANCE_FEE_USDG,
  TREASURY_ADDRESS,
  USDG_ADDRESS,
  isPaymentConfigured,
} from "@/lib/payments";

// Real on-chain payment: $5 in USDG, transferred on Robinhood Chain
// Testnet to TREASURY_ADDRESS. See sprout-dashboard-concept.md 3.4.C
// and src/lib/payments.ts for what still needs verifying before this
// can move to mainnet.
export default function ApplyPage() {
  const router = useRouter();
  const toast = useToast();
  const { isConnected, chain } = useAccount();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const configured = isPaymentConfigured();
  const wrongNetwork = isConnected && chain?.id !== robinhoodChainTestnet.id;

  const { data: decimals } = useReadContract({
    address: USDG_ADDRESS,
    abi: erc20Abi,
    functionName: "decimals",
    chainId: robinhoodChainTestnet.id,
    query: { enabled: configured },
  });

  const { writeContract, data: hash, isPending: isSending, error: writeError } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!isConfirmed) return;
    setFlowStage("paid");
    toast.push("Payment confirmed", "5 USDG received — setting up your card");
    router.replace("/welcome");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed]);

  useEffect(() => {
    const err = writeError ?? receiptError;
    if (!err) return;
    toast.push("Payment failed", err.message.split("\n")[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writeError, receiptError]);

  async function handlePay() {
    primeAudio(); // must fire inside the click gesture, not later awaits
    if (!configured || decimals === undefined || !USDG_ADDRESS || !TREASURY_ADDRESS) return;

    if (wrongNetwork) {
      try {
        await switchChainAsync({ chainId: robinhoodChainTestnet.id });
      } catch {
        return; // user rejected the network switch
      }
    }

    writeContract({
      address: USDG_ADDRESS,
      abi: erc20Abi,
      functionName: "transfer",
      args: [TREASURY_ADDRESS, parseUnits(ISSUANCE_FEE_USDG, decimals)],
      chainId: robinhoodChainTestnet.id,
    });
  }

  const busy = isSwitching || isSending || isConfirming;
  const payLabel = !configured
    ? "Payment not configured yet"
    : isSwitching
      ? "Switching to Robinhood Chain…"
      : isSending
        ? "Confirm in wallet…"
        : isConfirming
          ? "Confirming on-chain…"
          : `Pay ${ISSUANCE_FEE_USDG} USDG & get card`;

  return (
    <div className="min-h-dvh flex items-center justify-center relative overflow-hidden bg-bg p-6">
      <div className="pointer-events-none absolute -top-40 -right-30 w-140 h-140 rounded-full bg-[radial-gradient(circle,var(--glow-a),transparent_70%)]" />

      <div className="w-full max-w-md bg-surface border border-(--line) rounded-lg p-8 relative z-10 [animation:fade-up_var(--dur-enter)_var(--ease-out)_backwards]">
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
            <span className="font-display num text-base">{ISSUANCE_FEE_USDG} USDG</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 rounded-md bg-surface-2 border border-(--line)">
            <span className="text-sm text-text-dim">Network</span>
            <span className="text-sm font-medium">Robinhood Chain (testnet)</span>
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
            {({ account, chain: rkChain, openConnectModal, openChainModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && rkChain;
              if (!ready) return null;
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="w-full min-h-11 px-4 py-3 rounded-full border border-(--line) text-sm font-medium hover:border-sprout/40 active:scale-[0.97] transition-[border-color,transform] duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2"
                  >
                    Connect wallet
                  </button>
                );
              }
              if (rkChain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="w-full min-h-11 px-4 py-3 rounded-full border border-red-500/40 text-red-500 text-sm font-medium hover:border-red-500/70 active:scale-[0.97] transition-[border-color,transform] duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2"
                  >
                    Wrong network — switch to Robinhood Chain
                  </button>
                );
              }
              return (
                <div className="flex items-center gap-2 px-4 py-3 rounded-full border border-(--line) bg-surface-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-sprout to-sprout-deep" />
                  {account.displayName}
                </div>
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
            disabled={!isConnected || busy || !configured}
            className="w-full min-h-11 px-4 py-3.5 rounded-full bg-(--fill-sprout) text-ink text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-[opacity,transform] duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2"
          >
            {payLabel}
          </button>
        </div>

        <p className="text-xs text-text-dim mt-6 leading-relaxed">
          {configured
            ? "Testnet payment — Robinhood Chain Testnet, real USDG-standard transfer, no real funds at risk."
            : "Payment isn't wired up yet — treasury address and USDG contract still need to be set (NEXT_PUBLIC_TREASURY_ADDRESS / NEXT_PUBLIC_USDG_ADDRESS)."}
        </p>
      </div>
    </div>
  );
}
