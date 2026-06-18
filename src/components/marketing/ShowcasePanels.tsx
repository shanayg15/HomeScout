/**
 * Frosted-glass product panels that float over a {@link SceneBackdrop} in the
 * marketing showcase sections. Each one mocks a REAL Homescout surface with our
 * real data sources and our real, guardrailed copy - no invented metrics, no
 * features we don't ship. The figures are ILLUSTRATIVE samples (labelled as
 * such, in the UI and for assistive tech), not a live lookup.
 */

const card =
  "rounded-xl border border-white/40 bg-white/90 p-4 shadow-2xl shadow-black/30 ring-1 ring-black/5 backdrop-blur-md";

/** Small "Example" pill so sample figures can't be mistaken for live data. */
function ExampleTag() {
  return (
    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      Example
    </span>
  );
}

/**
 * "Data sources" - the providers behind every dossier. The real app has four
 * distinct external providers; ownership/tax come through RentCast's licensed
 * dataset (which aggregates public records), so we don't list "county records"
 * as a separate source.
 */
export function DataSourcesPanel() {
  const sources: Array<{
    name: string;
    gives: string;
    tag: "Public" | "Licensed";
  }> = [
    { name: "RentCast", gives: "Value, rent, comps, ownership & tax", tag: "Licensed" },
    { name: "FEMA flood (NFHL)", gives: "Flood zone", tag: "Public" },
    { name: "Walk Score", gives: "Walkability", tag: "Licensed" },
    { name: "Census ACS", gives: "Income & tenure", tag: "Public" },
  ];
  return (
    <div className={`${card} w-[min(21rem,84%)]`} aria-label="Example: the data sources behind a dossier">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Data sources
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Public records &amp; licensed datasets
      </p>
      <ul className="mt-3 space-y-2.5">
        {sources.map((s) => (
          <li key={s.name} className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {s.name}
              </span>
              <span className="ml-3.5 block text-[11px] text-muted-foreground">
                {s.gives}
              </span>
            </span>
            <span className="mt-0.5 shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {s.tag}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2 text-[10px] text-muted-foreground">
        <span>Every field shows its source &amp; date</span>
        <span className="font-medium text-primary">Sourced &amp; dated</span>
      </div>
    </div>
  );
}

/** "The dossier" - value range, comps on a map, risk chips. */
export function DossierShowcasePanel() {
  return (
    <div className={`${card} w-[min(22rem,86%)]`} aria-label="Example dossier preview with illustrative numbers">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Dossier
        </span>
        <div className="flex items-center gap-1.5">
          <ExampleTag />
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
            Single Family
          </span>
        </div>
      </div>

      {/* faux comps map */}
      <div
        className="relative mt-2 h-24 overflow-hidden rounded-lg border bg-muted/40"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      >
        <Dot className="left-[47%] top-[46%]" color="#0f766e" big />
        <Dot className="left-[27%] top-[64%]" color="#2563eb" />
        <Dot className="left-[66%] top-[32%]" color="#2563eb" />
        <Dot className="left-[72%] top-[68%]" color="#d97706" />
        <span className="absolute right-2 bottom-1 text-[9px] text-muted-foreground">
          subject / sale / rental
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground">Estimated value</p>
          <p className="text-sm font-semibold">$452,000</p>
          <p className="text-[11px] text-muted-foreground">range $428k–$479k</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">Est. rent</p>
          <p className="text-sm font-semibold">$2,400/mo</p>
          <p className="text-[11px] text-muted-foreground">range $2.2k–$2.6k</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip tone="sky">Flood: Zone X</Chip>
        <Chip tone="emerald">Walk Score 72</Chip>
        <Chip tone="amber">Medium confidence</Chip>
      </div>
    </div>
  );
}

/** "The read" - a grounded, hedged deal read; never a verdict, never a guess. */
export function DealReadPanel() {
  return (
    <div className={`${card} w-[min(21rem,84%)]`} aria-label="Example deal read with illustrative numbers">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          The read
        </span>
        <div className="flex items-center gap-1.5">
          <ExampleTag />
          <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
            Medium confidence
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <Row label="Asking price" value="$465,000" />
        <Row label="Estimated value" value="$428k–$479k" muted />
        <Row label="Gross yield" value="6.4%" muted />
      </div>

      <div className="mt-3 rounded-lg border bg-muted/40 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
        The asking price sits within the estimated value range. Rent supports a
        gross yield near the local norm. Comps are sparse, so confidence is
        medium. Informational only - not advice.
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "font-medium text-muted-foreground" : "font-semibold"}>
        {value}
      </span>
    </div>
  );
}

const TONE = {
  sky: "border-sky-200 bg-sky-50 text-sky-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-300 bg-amber-50 text-amber-800",
} as const;

function Chip({
  tone,
  children,
}: {
  tone: keyof typeof TONE;
  children: React.ReactNode;
}) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${TONE[tone]}`}>
      {children}
    </span>
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
      className={`absolute ${big ? "size-3" : "size-2"} -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}
