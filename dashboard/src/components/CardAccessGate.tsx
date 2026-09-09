"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasCardAccess } from "@/lib/cardAccess";

// Routes reachable before a card is issued.
const PUBLIC_PATHS = new Set(["/apply"]);

export function CardAccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const paid = hasCardAccess();
    const isPublic = PUBLIC_PATHS.has(pathname);

    if (!paid && !isPublic) {
      router.replace("/apply");
      return;
    }
    if (paid && isPublic) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) return null;
  return <>{children}</>;
}
