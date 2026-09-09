// Mock card-issuance gate for Phase 1 UX testing — no backend yet.
// Real version (Phase 3) replaces localStorage with a server-verified
// payment record tied to the SIWE session.
const ACCESS_KEY = "sprout_card_access";
const CARD_KEY = "sprout_card_data";

export type CardData = {
  number: string;
  expiry: string;
  cvv: string;
};

export function hasCardAccess(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ACCESS_KEY) === "true";
}

export function grantCardAccess() {
  window.localStorage.setItem(ACCESS_KEY, "true");
}

export function resetCardAccess() {
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(CARD_KEY);
}

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
