import type { Address } from "viem";

// Minimal ERC-20 surface, kept for later — decimals() is read on-chain
// rather than hardcoded: stablecoin decimals aren't universally 6 or
// 18, and guessing wrong silently sends the wrong amount.
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

// Where the issuance fee actually lands. Set once a real receiving
// wallet is chosen (see sprout-dashboard-concept.md 3.4.C).
export const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS as Address | undefined;

// Charging in native ETH for now, not USDG: there is no official USDG
// contract on Robinhood Chain Testnet (docs.robinhood.com/chain/
// contracts only lists a mainnet address) — the testnet explorer's
// token search turns up ~50 different contracts all named
// "USDG"/"Global Dollar"/"Test USDG", which is ordinary testnet
// token-squatting, not a real canonical token. Picking one at random
// would risk paying into an unrelated contract. ETH is the one asset
// the official faucet actually dispenses, so it's what's testable
// today. Switch back to the ERC-20 path (erc20Abi above +
// NEXT_PUBLIC_USDG_ADDRESS) once a real testnet USDG (or a
// self-deployed mock) is confirmed.
export const ISSUANCE_FEE_ETH = "0.001"; // human units — arbitrary test amount, not pegged to $5

export function isPaymentConfigured(): boolean {
  return Boolean(TREASURY_ADDRESS);
}
