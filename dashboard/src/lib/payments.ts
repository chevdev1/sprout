import type { Address } from "viem";

// Minimal ERC-20 surface — just what a transfer needs. decimals() is
// read on-chain rather than hardcoded: stablecoin decimals aren't
// universally 6 or 18, and guessing wrong silently sends the wrong
// amount.
export const erc20Abi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

// Both required before a real on-chain charge can run.
//
// TREASURY_ADDRESS: where the $5 issuance fee actually lands — set once
// a real receiving wallet is chosen (see sprout-dashboard-concept.md
// 3.4.C). USDG_ADDRESS: USDG's contract on Robinhood Chain Testnet —
// verify against docs.robinhood.com/chain/contracts or the testnet
// explorer's token list before setting this; an unverified address
// here would silently misdirect or lose the payment.
export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS as Address | undefined;
export const USDG_ADDRESS = process.env.NEXT_PUBLIC_USDG_ADDRESS as Address | undefined;

export const ISSUANCE_FEE_USDG = "5"; // human units, e.g. "5" == 5 USDG

export function isPaymentConfigured(): boolean {
  return Boolean(TREASURY_ADDRESS && USDG_ADDRESS);
}
