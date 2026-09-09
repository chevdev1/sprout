"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getFlowStage } from "@/lib/cardAccess";

// Onboarding routes reachable only in their matching flow stage.
const ENTRY_PATHS = new Set(["/apply", "/welcome", "/onboarding"]);

export function CardAccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    // Always reachable — it clears the flow/wallet state itself, so the
    // gate can't route around it based on stale state.
    if (pathname === "/reset") {
      setReady(true);
      return;
    }
    const stage = getFlowStage();

    if (stage === "unpaid" && pathname !== "/apply") {
      router.replace("/apply");
      return;
    }
    if (stage === "paid" && pathname !== "/welcome" && pathname !== "/onboarding") {
      router.replace("/welcome");
      return;
    }
    if (stage === "onboarded" && ENTRY_PATHS.has(pathname)) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) return null;
  return <>{children}</>;
}
