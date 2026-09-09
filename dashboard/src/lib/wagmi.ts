import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  rainbowWallet,
  injectedWallet,
  safeWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

/**
 * TODO: swap in Robinhood Chain's real chainId/RPC/explorer once
 * published. mainnet + sepolia are placeholders only so the app has a
 * working chain to connect to during Phase 1 — nothing on these two
 * chains is part of the actual product.
 */
const chains = [mainnet, sepolia] as const;

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
  "REPLACE_WITH_WALLETCONNECT_PROJECT_ID";

// Curated wallet list instead of RainbowKit's getDefaultConfig(): the
// default set pulls in coinbaseWallet -> @base-org/account ->
// @coinbase/cdp-sdk, which dynamically imports optional @x402/* payment
// packages that aren't installed and that Turbopack tries to resolve
// at build time regardless, breaking the build. None of that is
// something a card-linking dashboard needs, so it's left out entirely
// rather than worked around.
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, injectedWallet, safeWallet],
    },
  ],
  { appName: "Sprout", projectId },
);

export const wagmiConfig = createConfig({
  chains,
  connectors,
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
