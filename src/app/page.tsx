import Link from "next/link";
import { MapPin, FileText, Search } from "lucide-react";
import { SearchBox } from "@/components/SearchBox";
import { addressToSlug } from "@/lib/utils/id";

const EXAMPLES = [
  "5500 Grand Lake Dr, San Antonio, TX 78244",
  "1600 Pennsylvania Ave NW, Washington, DC 20500",
  "350 5th Ave, New York, NY 10118",
];

const STEPS = [
  {
    icon: Search,
    title: "Paste an address",
    body: "Any US residential address — street, city, state, ZIP.",
  },
  {
    icon: MapPin,
    title: "We pull public data",
    body: "Ownership, tax, value & rent estimates, comps, zoning and risk signals.",
  },
  {
    icon: FileText,
    title: "Get a plain-English dossier",
    body: "Every number shows its range, confidence, and source — no guesses.",
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="space-y-5 pt-6">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Understand any home before you commit.
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          Paste an address, get the full picture — ownership, value, comps,
          zoning and risks, in plain English. Built from public data.
        </p>
        <SearchBox className="max-w-2xl" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Try:</span>
          {EXAMPLES.map((addr) => (
            <Link
              key={addr}
              href={`/property/${addressToSlug(addr)}?address=${encodeURIComponent(addr)}`}
              className="rounded-full border bg-card px-3 py-1 text-xs text-foreground transition-colors hover:bg-muted"
            >
              {addr}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.title}
            className="rounded-xl border bg-card p-4 text-card-foreground"
          >
            <step.icon className="size-5 text-primary" aria-hidden />
            <h2 className="mt-3 text-sm font-semibold">{step.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </section>

      <p className="text-sm text-muted-foreground">
        Homescout is informational only — not an appraisal, inspection, or
        financial advice. When public data is thin, we say so and show lower
        confidence rather than guessing.
      </p>
    </div>
  );
}
