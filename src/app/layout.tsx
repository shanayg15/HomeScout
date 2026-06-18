import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Home } from "lucide-react";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Disclaimer } from "@/components/Disclaimer";
import { buttonVariants } from "@/components/ui/button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <TooltipProvider>
          <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold tracking-tight"
              >
                <Home className="size-5 text-primary" aria-hidden />
                Homescout
              </Link>
              <nav className="ml-auto flex items-center gap-5 text-sm">
                <Link
                  href="/saved"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Saved
                </Link>
                <Link href="/#search" className={buttonVariants({ size: "sm" })}>
                  Try now
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t">
            <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
              <Disclaimer variant="footer" />
            </div>
          </footer>
        </TooltipProvider>
      </body>
    </html>
  );
}
