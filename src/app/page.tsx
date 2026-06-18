import Link from "next/link";
import {
  ShieldCheck,
  FileSearch,
  Clock,
  Database,
  Map,
  Waves,
  Bookmark,
  LayoutDashboard,
  Scale,
  LineChart,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { SearchBox } from "@/components/SearchBox";
import { RecentLookups } from "@/components/RecentLookups";
import { ShowcaseSection } from "@/components/marketing/ShowcaseSection";
import {
  DataSourcesPanel,
  DossierShowcasePanel,
  DealReadPanel,
} from "@/components/marketing/ShowcasePanels";
import { addressToSlug } from "@/lib/utils/id";

const EXAMPLES = [
  "5500 Grand Lake Dr, San Antonio, TX 78244",
  "1600 Pennsylvania Ave NW, Washington, DC 20500",
  "1 Beach Rd, Galveston, TX 77550",
];

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
            Paste an address - get ownership, value &amp; rent, comps on a map,
            flood &amp; walkability, and a grounded read on it. Built from public
            data, in plain English.
          </p>

          <div
            id="search"
            className="mt-8 max-w-2xl scroll-mt-24 rounded-2xl bg-white p-2 text-foreground shadow-2xl shadow-black/40"
          >
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
            Informational only - not an appraisal, inspection, or financial
            advice. We never scrape listing sites.
          </p>
        </div>
      </section>

      {/* Stat strip */}
      <section className="border-t border-border/70 bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Public-records research for any{" "}
            <strong className="font-semibold text-foreground">U.S. home</strong>{" "}
            - ownership, <strong className="font-semibold text-foreground">value &amp; rent</strong>,{" "}
            <strong className="font-semibold text-foreground">comps</strong>,{" "}
            <strong className="font-semibold text-foreground">flood</strong>, and{" "}
            <strong className="font-semibold text-foreground">walkability</strong>{" "}
            - sourced, dated, and structured into one plain-English dossier.
          </p>
          <div className="grid grid-cols-2 gap-8 sm:flex sm:gap-10">
            <Stat label="Data sources" value="4" note="public + licensed" />
            <Stat label="Cost to search" value="$0" note="no account needed" />
          </div>
        </div>
      </section>

      {/* The data */}
      <ShowcaseSection
        label="The data"
        title={
          <>
            The hard part is the data.
            <br />
            We did the hard part.
          </>
        }
        features={[
          {
            icon: FileSearch,
            title: "Sourced at the origin",
            body: "FEMA flood maps, Census, Walk Score, and licensed property data - each pulled from its official or licensed source.",
          },
          {
            icon: ShieldCheck,
            title: "Validated, not guessed",
            body: "Cross-checked and range-bounded. No coverage? The field reads “not available” - never a filler number.",
          },
          {
            icon: Clock,
            title: "Dated & traceable",
            body: "Every value carries its source and as-of date, so you see exactly how fresh it is.",
          },
        ]}
        card={{
          icon: Database,
          title: "Inside the data",
          description:
            "Public records, licensed estimates, and full provenance on every field.",
          points: [
            {
              title: "Pulled from authoritative sources",
              body: "FEMA flood maps, Census, Walk Score, and licensed property data from RentCast (which aggregates public records).",
            },
            { title: "Validated and range-bounded" },
            { title: "Sourced and dated on every field" },
            { title: "Structured for a clean read" },
          ],
          sceneVariant: "dusk",
          panel: <DataSourcesPanel />,
          imageSide: "right",
        }}
      />

      {/* The dossier */}
      <ShowcaseSection
        label="The dossier"
        title={
          <>
            One search.
            <br />
            The whole picture.
          </>
        }
        features={[
          {
            icon: Map,
            title: "Comps on a map",
            body: "Recent sales and rental comps plotted around the home - click any pin to see how it compares.",
          },
          {
            icon: Waves,
            title: "Flood & walkability",
            body: "FEMA flood zone, Walk Score, and neighborhood demographics, in context.",
          },
          {
            icon: Bookmark,
            title: "Save & revisit",
            body: "Keep the homes you’re weighing. Saved on your device, not our servers.",
          },
        ]}
        card={{
          icon: LayoutDashboard,
          title: "Everything on one page",
          description:
            "Value, rent, comps, risk, and a grounded read - one scannable dossier.",
          points: [
            {
              title: "Value & rent as ranges",
              body: "Each estimate carries a confidence level and the comparable sales behind it.",
            },
            { title: "Comps you can click on the map" },
            { title: "Flood, walkability & demographics" },
            { title: "Saved to your device, not our servers" },
          ],
          sceneVariant: "day",
          panel: <DossierShowcasePanel />,
          imageSide: "left",
        }}
      />

      {/* The read */}
      <ShowcaseSection
        label="The read"
        title={
          <>
            A grounded read
            <br />
            on the deal.
          </>
        }
        features={[
          {
            icon: Scale,
            title: "Is the price fair?",
            body: "We compare the asking price to a range-bounded estimate - and say so when the data’s too thin to tell.",
          },
          {
            icon: LineChart,
            title: "What the comps say",
            body: "The exact comparable sales and rents behind the numbers, never a black box.",
          },
          {
            icon: ShieldAlert,
            title: "Know the risks",
            body: "Flood zone and walkability flagged up front - context, not a verdict.",
          },
        ]}
        card={{
          icon: Sparkles,
          title: "A read you can trust",
          description:
            "A hedged, plain-English read with its confidence level and the exact data points it used.",
          points: [
            {
              title: "Asking price vs. estimated range",
              body: "Computed in code from comps, then explained in plain English.",
            },
            { title: "A confidence level on every read" },
            { title: "The data points it used, shown" },
            { title: "Never a buy / don’t-buy verdict" },
          ],
          sceneVariant: "twilight",
          panel: <DealReadPanel />,
          imageSide: "right",
        }}
      />

      {/* Recent + closing note */}
      <section className="border-t border-border/70 bg-background">
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6">
          <RecentLookups />
          <p className="max-w-2xl text-sm text-muted-foreground">
            Homescout is informational only - not an appraisal, inspection, or
            financial advice. When public data is thin, we say so and show lower
            confidence rather than guessing. Not affiliated with any data
            provider; our own implementation on public/licensed data.
          </p>
        </div>
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="border-l border-border pl-4">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 font-serif text-4xl font-medium tracking-tight">
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
