import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Home } from "lucide-react";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Disclaimer } from "@/components/Disclaimer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Homescout — understand any home before you commit",
  description:
    "Paste an address, get a plain-English property dossier from public data: ownership, value & rent estimates, comps, zoning and risk. Information, not advice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <TooltipProvider>
          <header className="border-b">
            <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-3">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold tracking-tight"
              >
                <Home className="size-5 text-primary" aria-hidden />
                Homescout
              </Link>
              <Link
                href="/saved"
                className="ml-auto text-sm text-muted-foreground hover:text-foreground"
              >
                Saved
              </Link>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Informational only — not advice
              </span>
            </div>
          </header>

          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
            {children}
          </main>

          <footer className="border-t">
            <div className="mx-auto w-full max-w-5xl px-4 py-4">
              <Disclaimer variant="footer" />
            </div>
          </footer>
        </TooltipProvider>
      </body>
    </html>
  );
}
