import type { NextConfig } from "next";

// RainbowKit's Coinbase Wallet connector (@base-org/account ->
// @coinbase/cdp-sdk) dynamically imports @x402/* payment packages we
// don't install and never exercise — src/lib/wagmi.ts's curated
// wallet list doesn't include Coinbase Wallet at all. The packages
// don't exist in node_modules, so Turbopack fails to resolve them at
// build time even though the code path is unreachable for us; alias
// them to a stub instead of installing an unused payments SDK.
// (Turbopack's resolveAlias needs a forward-slash/relative specifier
// on Windows — an absolute Windows path errors with "windows imports
// are not implemented yet".)
const x402Stub = "./stubs/x402-stub.js";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@x402/core/client": x402Stub,
      "@x402/evm/exact/client": x402Stub,
      "@x402/evm/upto/client": x402Stub,
      "@x402/svm/exact/client": x402Stub,
      "@x402/evm": x402Stub,
      "@x402/svm": x402Stub,
      "@x402/core": x402Stub,
    },
  },
};

export default nextConfig;
