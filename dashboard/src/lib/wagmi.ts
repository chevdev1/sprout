import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  rainbowWallet,
  injectedWallet,
  safeWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { defineChain } from "viem";

// Robinhood Chain — Arbitrum Orbit L2, fully EVM-compatible. Facts below
// verified against docs.robinhood.com/chain/connecting (2026-09):
// chain IDs, RPC URLs and explorers are confirmed; ETH is the native
// gas token on both networks (no custom gas token).
export const robinhoodChainTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Chain Testnet Explorer",
      url: "https://explorer.testnet.chain.robinhood.com",
    },
  },
  testnet: true,
});

export const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: { name: "Robinhood Chain Explorer", url: "https://robinhoodchain.blockscout.com" },
  },
});

// Testnet-only for now — real payment flow (see src/lib/payments.ts) is
// being built and tested against Robinhood Chain Testnet before any
// mainnet money moves. Swap to [robinhoodChain] (and update the
// transport below) when that's confirmed working end-to-end.
const chains = [robinhoodChainTestnet] as const;

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
    [robinhoodChainTestnet.id]: http(),
  },
});
