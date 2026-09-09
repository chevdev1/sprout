import type { Metadata } from "next";
import { Inter, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CardAccessGate } from "@/components/CardAccessGate";
import { ToastProvider } from "@/components/ToastProvider";
import { ThemeInit } from "@/components/ThemeInit";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Sprout — Dashboard",
  description: "Manage your Sprout card, balance and grow-back settings.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSans.variable} h-full`}
    >
      <body className="min-h-full bg-bg text-text antialiased">
        <ThemeInit />
        <Providers>
          <ToastProvider>
            <CardAccessGate>{children}</CardAccessGate>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
