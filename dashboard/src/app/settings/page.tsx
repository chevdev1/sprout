"use client";

import { useState, type CSSProperties } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

function stagger(index: number): CSSProperties {
  return { "--stagger-index": index } as CSSProperties;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`min-w-10 w-10 h-6 rounded-full relative shrink-0 transition-colors duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2 ${
        checked ? "bg-(--fill-sprout)" : "bg-(--line)"
      }`}
    >
      <span
        className={`absolute top-0.75 left-0.75 w-4.5 h-4.5 rounded-full transition-transform duration-[var(--dur-hover)] ${
          checked ? "translate-x-4 bg-ink" : "translate-x-0 bg-text-dim"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [notifications, setNotifications] = useState({
    growBack: true,
    largeTx: true,
    updates: false,
  });

  function toggle(key: keyof typeof notifications) {
    setNotifications((n) => ({ ...n, [key]: !n[key] }));
  }

  return (
    <div className="flex h-dvh bg-bg relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -right-30 w-140 h-140 rounded-full bg-[radial-gradient(circle,rgba(216,255,77,.10),transparent_70%)]" />

      <Sidebar active="Settings" />

      <div className="flex-1 h-full overflow-hidden relative z-10 flex flex-col">
        <DashboardHeader title="Settings" />

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-7 pb-20 md:pb-7 max-w-260 flex flex-col lg:flex-row gap-5">
            <div className="flex-1 flex flex-col gap-5 min-w-0">
              {/* Connected wallets */}
              <div
                className="stagger-card bg-surface border border-(--line) rounded-lg p-6.5"
                style={stagger(0)}
              >
                <div className="font-display text-[15px] mb-1">Connected wallets</div>
                <p className="text-xs text-text-dim mb-4.5">
                  Sign in and fund your card from any of these.
                </p>

                {isConnected && address ? (
                  <div className="flex items-center justify-between py-3.5 border-t border-(--line)">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-sprout to-sprout-deep shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-mono truncate">
                          {address.slice(0, 6)}…{address.slice(-4)}
                        </div>
                        <div className="text-[11.5px] text-text-dim mt-0.5">
                          Primary · connected
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 text-[10.5px] font-semibold text-sprout-deep bg-sprout/10 px-2.5 py-1 rounded-full">
                      Primary
                    </span>
                  </div>
                ) : (
                  <div className="py-3.5 border-t border-(--line)">
                    <p className="text-sm text-text-dim mb-3">No wallet connected.</p>
                    <button
                      onClick={openConnectModal}
                      className="min-h-11 px-4 py-2.5 rounded-full border border-(--line) text-sm font-medium hover:border-sprout/40 active:scale-[0.97] transition-[border-color,transform] duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2"
                    >
                      Connect wallet
                    </button>
                  </div>
                )}

                <button
                  onClick={openConnectModal}
                  className="min-h-11 mt-3 -mx-2 px-2 text-left text-[13px] text-sprout-deep hover:underline active:scale-[0.97] transition-transform duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2 rounded-sm"
                >
                  + Connect another wallet
                </button>
              </div>

              {/* Notifications */}
              <div
                className="stagger-card bg-surface border border-(--line) rounded-lg p-6.5"
                style={stagger(1)}
              >
                <div className="font-display text-[15px] mb-4.5">Notifications</div>
                <div className="flex justify-between items-center py-3 border-t border-(--line)">
                  <span className="text-[13.5px]">Grow-back contributions</span>
                  <Toggle
                    checked={notifications.growBack}
                    onChange={() => toggle("growBack")}
                    label="Grow-back contributions notifications"
                  />
                </div>
                <div className="flex justify-between items-center py-3 border-t border-(--line)">
                  <span className="text-[13.5px]">Large transactions</span>
                  <Toggle
                    checked={notifications.largeTx}
                    onChange={() => toggle("largeTx")}
                    label="Large transaction notifications"
                  />
                </div>
                <div className="flex justify-between items-center py-3 border-t border-(--line)">
                  <span className="text-[13.5px]">Product &amp; launch updates</span>
                  <Toggle
                    checked={notifications.updates}
                    onChange={() => toggle("updates")}
                    label="Product and launch update notifications"
                  />
                </div>
              </div>
            </div>

            {/* Active sessions */}
            <div className="w-full lg:w-90 shrink-0">
              <div
                className="stagger-card bg-surface border border-(--line) rounded-lg p-6.5"
                style={stagger(2)}
              >
                <div className="font-display text-[15px] mb-1">Active sessions</div>
                <p className="text-xs text-text-dim mb-4.5">
                  Signed in via Sign-In with Ethereum.
                </p>

                <div className="py-3.5 border-t border-(--line)">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[13px] truncate">Chrome · macOS</span>
                    <span className="shrink-0 text-[10.5px] font-semibold text-sprout-deep bg-sprout/10 px-2.25 py-1 rounded-full">
                      This device
                    </span>
                  </div>
                  <div className="text-[11.5px] text-text-dim mt-1">Active now</div>
                </div>
                <div className="py-3.5 border-t border-(--line)">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px]">Safari · iOS</span>
                    <button className="min-h-11 -my-2.5 px-2 text-[12.5px] text-text-dim hover:text-text active:scale-[0.97] transition-[color,transform] duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2 rounded-sm">
                      Revoke
                    </button>
                  </div>
                  <div className="text-[11.5px] text-text-dim mt-1">2 days ago</div>
                </div>

                <button className="min-h-11 w-full mt-4.5 px-4 rounded-md border border-(--line) text-[13px] text-text-dim hover:border-red-500/40 hover:text-red-500 active:scale-[0.97] transition-[border-color,color,transform] duration-[var(--dur-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprout focus-visible:outline-offset-2">
                  Sign out everywhere
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
