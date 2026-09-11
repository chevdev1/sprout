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

- **Chain: Robinhood Chain mainnet (chain ID 4663)** is what
  card-issuance payment targets (`src/lib/wagmi.ts`), verified against
  docs.robinhood.com/chain/connecting. Testnet (46630) stays in the
  wagmi config too but isn't the default payment target anymore.
- **Card-issuance payment is real and live — this moves actual
  money.** `/apply` transfers 5 USDG on Robinhood Chain mainnet via
  wagmi (see `src/lib/payments.ts`) — needs both
  `NEXT_PUBLIC_TREASURY_ADDRESS` and `NEXT_PUBLIC_USDG_ADDRESS` set
  (`.env.example`) or the pay button stays disabled with an explicit
  "not configured" state. No mock fallback. `USDG_ADDRESS` must be
  hand-verified against docs.robinhood.com/chain/contracts before ever
  changing it — never trust an automated/AI-summarized copy of it.
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
