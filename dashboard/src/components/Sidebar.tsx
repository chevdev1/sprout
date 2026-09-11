import Link from "next/link";
import { SproutLogo } from "./SproutLogo";
import { GridIcon, CardIcon, SettingsIcon } from "./NavIcons";

// Grow-back and Activity are on the roadmap (sprout-dashboard-concept.md
// section 3.2) but have no page yet — left out of nav rather than
// linking to a 404. Add them back here once those routes exist.
const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: GridIcon },
  { href: "/card", label: "Card", icon: CardIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

// Two renders of the same nav, toggled by CSS breakpoint (no JS media
// query, so no hydration mismatch): a left rail on md+ screens, and a
// fixed bottom tab bar below it — the native pattern on a phone-sized
// card dashboard, and how Robinhood/Revolut-style apps handle exactly
// this. Pages using Sidebar need bottom padding on mobile (pb-16
// md:pb-0) so content doesn't sit under the fixed bar.
export function Sidebar({ active }: { active: (typeof NAV_ITEMS)[number]["label"] }) {
  return (
    <>
      <div className="hidden md:flex w-60 shrink-0 h-full bg-surface border-r border-(--line) flex-col p-4">
        <Link href="/" className="flex items-center gap-2 px-2.5 py-2 pb-7">
          <SproutLogo size={22} className="text-sprout" />
          <span className="font-display text-lg">sprout</span>
        </Link>

        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = label === active;
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-colors duration-[var(--motion-fast)] ${
                  isActive
                    ? "bg-sprout/10 text-sprout font-medium"
                    : "text-text-dim hover:text-text"
                }`}
              >
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 rounded-md bg-surface-2 border border-(--line)">
          <div className="text-xs font-medium mb-1.5">Physical card</div>
          <p className="text-xs text-text-dim leading-relaxed">
            Ships after your virtual card is active — priced at cost,
            shown before you order.
          </p>
        </div>
      </div>

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-surface/95 backdrop-blur-md border-t border-(--line) flex items-stretch"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = label === active;
          return (
            <Link
              key={label}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] transition-colors duration-[var(--motion-fast)] ${
                isActive ? "text-sprout" : "text-text-dim"
              }`}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
