"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SproutLogo } from "@/components/SproutLogo";
import { playWelcomeChime } from "@/lib/sound";

const AUTO_ADVANCE_MS = 2200;

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    playWelcomeChime();
    const t = setTimeout(() => router.replace("/onboarding"), AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center relative overflow-hidden bg-bg">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-sprout/40 [animation:welcome-ring_1.8s_var(--ease-out-expo)_infinite]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-sprout/40 [animation:welcome-ring_1.8s_var(--ease-out-expo)_.6s_infinite]" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-ink border border-(--line-on-ink) flex items-center justify-center [animation:fade-up_var(--motion-slow)_var(--ease-out-expo)]">
          <SproutLogo size={34} className="text-sprout" />
        </div>

        <div
          className="flex flex-col items-center gap-2 [animation:fade-up_var(--motion-slow)_var(--ease-out-expo)_120ms_backwards]"
        >
          <h1 className="font-display text-3xl tracking-tight">
            Welcome to Sprout
          </h1>
          <p className="text-sm text-text-dim">
            Setting up your card…
          </p>
        </div>

        <button
          onClick={() => router.replace("/onboarding")}
          className="text-xs text-text-dim hover:text-sprout transition-colors duration-[var(--motion-fast)] [animation:fade-up_var(--motion-slow)_var(--ease-out-expo)_240ms_backwards]"
        >
          Skip →
        </button>
      </div>
    </div>
  );
}
