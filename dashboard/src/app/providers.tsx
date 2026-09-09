"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "@/lib/wagmi";

// Per Next.js's own TanStack Query guide (node_modules/next/dist/docs/
// 01-app/02-guides/client-side-data-fetching/tanstack-query.md): a new
// QueryClient per server render, one reused singleton in the browser.
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return new QueryClient();
  browserQueryClient ??= new QueryClient();
  return browserQueryClient;
}

const sproutRainbowTheme = darkTheme({
  accentColor: "#D8FF4D",
  accentColorForeground: "#0D110C",
  borderRadius: "medium",
  fontStack: "system",
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider theme={sproutRainbowTheme}>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
