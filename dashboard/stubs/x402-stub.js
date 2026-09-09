// Stub for @x402/* subpath imports that @coinbase/cdp-sdk (pulled in
// transitively via RainbowKit's Coinbase Wallet connector, which we
// don't use — see src/lib/wagmi.ts) dynamically imports behind an
// optional x402-payments code path we never exercise. The real
// packages aren't installed; this stub only exists so Turbopack can
// resolve the specifier at build time. Throws if anything ever
// actually calls into it, rather than failing silently.
module.exports = new Proxy(
  {},
  {
    get() {
      throw new Error(
        "x402 payment support is stubbed out — Sprout doesn't use Coinbase Wallet's x402 payments flow.",
      );
    },
  },
);
