"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDisconnect } from "wagmi";

// Dev/testing utility: wagmi + RainbowKit + WalletConnect all persist
// the last connection in localStorage, so a wallet that auto-reconnects
// on a later visit skips right past "Connect wallet" — there's nothing
// to click to re-test that step. Visiting /reset disconnects the
// active session, wipes both our own flow state and every
// wagmi/RainbowKit/WalletConnect storage key, then drops you back at
// the start of the apply flow.
export default function ResetPage() {
  const router = useRouter();
  const { disconnectAsync } = useDisconnect();
  const [status, setStatus] = useState("Disconnecting wallet…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await disconnectAsync();
      } catch {
        // already disconnected — fine
      }
      if (cancelled) return;
      setStatus("Clearing local state…");

      try {
        const keys = Object.keys(window.localStorage);
        for (const key of keys) {
          if (/^(sprout_|wagmi|rk-|wc@2:|walletconnect)/i.test(key)) {
            window.localStorage.removeItem(key);
          }
        }
      } catch {
        // localStorage unavailable — nothing to clear
      }

      if (cancelled) return;
      setStatus("Done — redirecting…");
      setTimeout(() => {
        if (!cancelled) router.replace("/apply");
      }, 700);
    })();

    return () => {
      cancelled = true;
    };
  }, [disconnectAsync, router]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg">
      <p className="text-sm text-text-dim">{status}</p>
    </div>
  );
}
