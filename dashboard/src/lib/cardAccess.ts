// Mock card-issuance flow for Phase 1 UX testing — no backend yet.
// Real version (Phase 3) replaces localStorage with a server-verified
// payment + onboarding record tied to the SIWE session.
const STAGE_KEY = "sprout_flow_stage";
const CARD_KEY = "sprout_card_data";
const SETUP_KEY = "sprout_card_setup";

export type FlowStage = "unpaid" | "paid" | "onboarded";

export function getFlowStage(): FlowStage {
  if (typeof window === "undefined") return "unpaid";
  const v = window.localStorage.getItem(STAGE_KEY);
  return v === "paid" || v === "onboarded" ? v : "unpaid";
}

export function setFlowStage(stage: FlowStage) {
  window.localStorage.setItem(STAGE_KEY, stage);
}

export function resetFlow() {
  window.localStorage.removeItem(STAGE_KEY);
  window.localStorage.removeItem(CARD_KEY);
  window.localStorage.removeItem(SETUP_KEY);
}

export type CardSetup = {
  fundingAsset: "ETH" | "USDG" | "Tokenized stocks";
  fundingAmount: string;
  growBackTicker: string;
  growBackRate: string;
};

export const DEFAULT_SETUP: CardSetup = {
  fundingAsset: "ETH",
  fundingAmount: "1.20 ETH",
  growBackTicker: "AAPL",
  growBackRate: "1.5%",
};

export function getCardSetup(): CardSetup {
  if (typeof window === "undefined") return DEFAULT_SETUP;
  const stored = window.localStorage.getItem(SETUP_KEY);
  return stored ? (JSON.parse(stored) as CardSetup) : DEFAULT_SETUP;
}

export function saveCardSetup(setup: CardSetup) {
  window.localStorage.setItem(SETUP_KEY, JSON.stringify(setup));
}

export type CardData = {
  number: string;
  expiry: string;
  cvv: string;
};

function randomDigits(n: number) {
  let out = "";
  for (let i = 0; i < n; i++) out += Math.floor(Math.random() * 10);
  return out;
}

// Generates the card once, then persists it — clicking "reveal" again
// shouldn't issue a new number.
export function getOrIssueCard(): CardData {
  if (typeof window === "undefined") {
    return { number: "0000 0000 0000 0000", expiry: "00/00", cvv: "000" };
  }
  const stored = window.localStorage.getItem(CARD_KEY);
  if (stored) return JSON.parse(stored) as CardData;

  const groups = [randomDigits(4), randomDigits(4), randomDigits(4), randomDigits(4)];
  const now = new Date();
  const expiry = `${String(now.getMonth() + 1).padStart(2, "0")}/${String((now.getFullYear() + 3) % 100).padStart(2, "0")}`;
  const card: CardData = {
    number: groups.join(" "),
    expiry,
    cvv: randomDigits(3),
  };
  window.localStorage.setItem(CARD_KEY, JSON.stringify(card));
  return card;
}
