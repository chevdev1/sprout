"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "@/lib/wagmi";
import { useUiTheme } from "@/lib/useUiTheme";

// Per Next.js's own TanStack Query guide (node_modules/next/dist/docs/
// 01-app/02-guides/client-side-data-fetching/tanstack-query.md): a new
// QueryClient per server render, one reused singleton in the browser.
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return new QueryClient();
  browserQueryClient ??= new QueryClient();
  return browserQueryClient;
}

// Two variants so the wallet modal/button chrome matches the site theme
// instead of always rendering RainbowKit's dark UI — light theme uses
// sprout-deep as the accent (see globals.css --fill-sprout) rather than
// the full-neon sprout, for the same reason buttons do.
const darkRainbowTheme = darkTheme({
  accentColor: "#D8FF4D",
  accentColorForeground: "#0D110C",
  borderRadius: "medium",
  fontStack: "system",
});
const lightRainbowTheme = lightTheme({
  accentColor: "#8FB300",
  accentColorForeground: "#F6F5EF",
  borderRadius: "medium",
  fontStack: "system",
});

export function Providers({ children }: { children: ReactNode }) {
  const uiTheme = useUiTheme();
  return (
    <QueryClientProvider client={getQueryClient()}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider theme={uiTheme === "dark" ? darkRainbowTheme : lightRainbowTheme}>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
