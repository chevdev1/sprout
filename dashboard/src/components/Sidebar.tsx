import Link from "next/link";
import { SproutLogo } from "./SproutLogo";
import {
  GridIcon,
  CardIcon,
  GrowBackIcon,
  ActivityIcon,
  SettingsIcon,
} from "./NavIcons";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: GridIcon },
  { href: "/card", label: "Card", icon: CardIcon },
  { href: "/grow-back", label: "Grow-back", icon: GrowBackIcon },
  { href: "/activity", label: "Activity", icon: ActivityIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function Sidebar({ active }: { active: (typeof NAV_ITEMS)[number]["label"] }) {
  return (
    <div className="w-60 shrink-0 h-full bg-surface border-r border-(--line) flex flex-col p-4">
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
        <div className="text-xs text-text-dim leading-relaxed mb-2.5">
          Want a physical card?
        </div>
        <div className="text-sm font-medium text-sprout">Order one — at cost →</div>
      </div>
    </div>
  );
}
