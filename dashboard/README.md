# Sprout Dashboard

The user-facing personal dashboard (ЛК) for the Sprout card — see
[`../sprout-dashboard-concept.md`](../sprout-dashboard-concept.md) for
the approved visual concept, SIWE auth architecture, and roadmap this
is being built against, and the published design mockups linked
there.

**Status: Phase 1 (environment/UI-kit/Web3 providers) — no
authentication or real data yet.** The Overview page renders on mock
data; SIWE login, real balances, and the card order flow are Phase
2-4.

## Stack

Next.js 16 (App Router, Turbopack) · Tailwind CSS v4 (tokens matching
the landing page's dark-mode palette — see `src/app/globals.css`) ·
wagmi v2 + viem + RainbowKit for wallet connection.

## Known gaps / TODOs

- **Chain: Robinhood Chain Testnet only** (`src/lib/wagmi.ts`, chain ID
  46630) — verified against docs.robinhood.com/chain/connecting.
  Mainnet (`robinhoodChain`, chain ID 4663) is defined but unused until
  the testnet payment flow is confirmed working end-to-end.
- **Card-issuance payment is real but unconfigured.** `/apply`
  transfers a small amount of test ETH on Robinhood Chain Testnet via
  wagmi (see `src/lib/payments.ts`) — needs `NEXT_PUBLIC_TREASURY_ADDRESS`
  set (`.env.example`) or the pay button stays disabled with an
  explicit "not configured" state. No mock fallback. Charging in ETH
  rather than USDG for now — there's no official USDG contract on
  Robinhood Chain Testnet to verify against; see the comment in
  `payments.ts` before switching to the ERC-20 path.
- **No WalletConnect project ID set.** Copy `.env.example` to `.env.local`
  and fill in `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (free at
  [cloud.reown.com](https://cloud.reown.com)) — MetaMask/injected/Safe
  wallets work without it, only the WalletConnect QR connector needs it.
- **Coinbase Wallet is intentionally excluded** from the wallet list
  (`src/lib/wagmi.ts`) — RainbowKit's default config pulls in
  `@coinbase/cdp-sdk`, which has an optional x402-payments code path
  that dynamically imports uninstalled `@x402/*` packages and breaks
  the Turbopack build. See the comments in `next.config.ts` and
  `src/lib/wagmi.ts` before re-adding it.
- Sidebar links to `/grow-back` and `/activity` — those two routes
  don't exist yet (Phase 3). `/card` and `/settings` are built.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
