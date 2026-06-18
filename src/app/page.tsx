import Link from "next/link";
import {
  Search,
  MapPin,
  FileText,
  ScrollText,
  Waves,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { SearchBox } from "@/components/SearchBox";
import { RecentLookups } from "@/components/RecentLookups";
import { addressToSlug } from "@/lib/utils/id";

const EXAMPLES = [
  "5500 Grand Lake Dr, San Antonio, TX 78244",
  "1600 Pennsylvania Ave NW, Washington, DC 20500",
  "1 Beach Rd, Galveston, TX 77550",
];

const STEPS = [
  {
    icon: Search,
    title: "Paste an address or listing link",
    body: "Any US address — or a listing link. We read only the address, never the listing's content.",
  },
  {
    icon: MapPin,
    title: "We pull public data",
    body: "Ownership, tax, value & rent estimates, comps, zoning, flood and walkability — from official and licensed sources.",
  },
  {
    icon: FileText,
    title: "Get a plain-English dossier",
    body: "Every number shows its range, confidence, and source. When data is thin, we say so — never a guess.",
  },
];

const SIGNALS = [
  {
    icon: ScrollText,
    title: "Ownership, value & comps",
    body: "Owner of record, last sale, tax, and an AVM value & rent — each as a range with the comparable sales behind it, plotted on a map.",
  },
  {
    icon: Waves,
    title: "Risk & neighborhood",
    body: "FEMA flood zone, walkability, and demographics — informational context, never a verdict, and clearly marked when a source has no coverage.",
  },
  {
    icon: Scale,
    title: "The “good deal?” read",
    body: "A grounded, hedged read with a confidence level and the exact data points used — never buy/don’t-buy, never an invented figure.",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
      <span className="inline-block size-1.5 rounded-full bg-primary" aria-hidden />
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden text-white">
        <div
          className="absolute inset-0 -z-20"
          style={{
            background:
              "radial-gradient(120% 100% at 50% -20%, #1c3f6e 0%, #0c1626 54%, #060a12 100%)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(125,164,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(125,164,255,.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.14,
            maskImage:
              "radial-gradient(85% 70% at 50% 22%, black, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(85% 70% at 50% 22%, black, transparent 80%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
            <ShieldCheck className="size-3.5" aria-hidden />
            Public &amp; licensed data, in plain English
          </span>

          <h1 className="mt-6 max-w-3xl font-serif text-5xl font-medium leading-[1.04] tracking-tight text-balance sm:text-6xl md:text-7xl">
            Understand any home before you commit.
          </h1>

          <p className="mt-5 max-w-xl text-lg text-white/70">
            Paste an address — get ownership, value &amp; rent, comps on a map,
            flood &amp; walkability, and a grounded read on it. Built from public
            data, in plain English.
          </p>

          <div className="mt-8 max-w-2xl rounded-2xl bg-white p-2 text-foreground shadow-2xl shadow-black/40">
            <SearchBox />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-white/55">Try:</span>
            {EXAMPLES.map((addr) => (
              <Link
                key={addr}
                href={`/property/${addressToSlug(addr)}?address=${encodeURIComponent(addr)}`}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/85 transition-colors hover:bg-white/10"
              >
                {addr}
              </Link>
            ))}
          </div>

          <p className="mt-8 text-xs text-white/45">
            Informational only — not an appraisal, inspection, or financial
            advice. We never scrape listing sites.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/70 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <SectionLabel>How it works</SectionLabel>
              <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight text-balance sm:text-5xl">
                Hard-to-read records. Made plain.
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                The data is the hard part, not the prose. Homescout pulls it from
                official and licensed sources, validates it, and shows you exactly
                where every number came from.
              </p>
            </div>
            <div className="divide-y divide-border">
              {STEPS.map((step) => (
                <div key={step.title} className="flex gap-4 py-5 first:pt-0">
                  <step.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <div>
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product preview */}
      <section className="border-t border-border/70 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionLabel>One dossier</SectionLabel>
              <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight text-balance sm:text-5xl">
                Everything you need, on one page.
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                A clean, scannable dossier — value and rent as ranges, comps on an
                interactive map, risk signals, and a grounded deal read. Every
                section shows its source, confidence, and freshness.
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                {[
                  "Ranges + confidence on every estimate",
                  "Comps you can click to highlight on the map",
                  "“Not available” instead of a guessed number",
                ].map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <DossierPreview />
          </div>
        </div>
      </section>

      {/* What's inside */}
      <section className="border-t border-border/70 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionLabel>What&rsquo;s inside</SectionLabel>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl font-medium tracking-tight text-balance sm:text-5xl">
            A complete read on the home — and its limits.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {SIGNALS.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border bg-card p-6 text-card-foreground"
              >
                <s.icon className="size-5 text-primary" aria-hidden />
                <h3 className="mt-4 font-medium">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent + closing note */}
      <section className="border-t border-border/70 bg-background">
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6">
          <RecentLookups />
          <p className="max-w-2xl text-sm text-muted-foreground">
            Homescout is informational only — not an appraisal, inspection, or
            financial advice. When public data is thin, we say so and show lower
            confidence rather than guessing. Not affiliated with any data
            provider; our own implementation on public/licensed data.
          </p>
        </div>
      </section>
    </>
  );
}

/** Decorative sample dossier — a UI preview, not a real property. */
function DossierPreview() {
  return (
    <div className="rounded-2xl border bg-card p-4 text-card-foreground shadow-xl shadow-black/5">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          Single Family
        </span>
        <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
          Sample dossier
        </span>
      </div>
      <p className="mt-2 font-serif text-lg">2502 Bowman Ave, Austin, TX</p>

      {/* faux map */}
      <div
        className="relative mt-3 h-36 overflow-hidden rounded-lg border bg-muted/40"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      >
        <Dot className="left-[46%] top-[44%]" color="#0f766e" big />
        <Dot className="left-[28%] top-[62%]" color="#2563eb" />
        <Dot className="left-[64%] top-[34%]" color="#2563eb" />
        <Dot className="left-[70%] top-[66%]" color="#d97706" />
        <span className="absolute bottom-1 right-2 text-[9px] text-muted-foreground">
          Comps · subject / sale / rental
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Estimated value</p>
          <p className="font-semibold">$452,000</p>
          <p className="text-xs text-muted-foreground">range $428k–$479k</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
            Medium confidence
          </span>
          <p className="mt-2 text-xs text-muted-foreground">Gross yield</p>
          <p className="font-semibold">6.4%</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
        Based on available public data, the asking price appears within the
        estimated value range. Confidence: medium. Informational only.
      </div>
    </div>
  );
}

function Dot({
  className,
  color,
  big,
}: {
  className: string;
  color: string;
  big?: boolean;
}) {
  return (
    <span
      className={`absolute ${big ? "size-3.5" : "size-2.5"} -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}
