import type { LucideIcon } from "lucide-react";
import { SceneBackdrop } from "./SceneBackdrop";

/** A section label: a small dot + uppercase tracked text in the brand accent. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
      <span className="inline-block size-1.5 rounded-full bg-primary" aria-hidden />
      {children}
    </span>
  );
}

export type Feature = { icon: LucideIcon; title: string; body: string };
export type ShowcasePoint = { title: string; body?: string };

/**
 * An editorial showcase section: a header band (label + serif two-line headline
 * on the left, three feature columns on the right) above a large product card
 * (a cinematic residential scene with a floating product panel on one side, and
 * a titled, divided list of capabilities on the other). The card image side
 * alternates down the page.
 */
export function ShowcaseSection({
  label,
  title,
  features,
  card,
}: {
  label: string;
  title: React.ReactNode;
  features: Feature[];
  card: {
    icon: LucideIcon;
    title: string;
    description: string;
    points: ShowcasePoint[];
    sceneVariant: "dusk" | "day" | "twilight";
    panel: React.ReactNode;
    imageSide?: "left" | "right";
  };
}) {
  const imageLeft = card.imageSide === "left";

  const scene = (
    <div className="relative min-h-[22rem] overflow-hidden lg:min-h-[34rem]">
      <SceneBackdrop variant={card.sceneVariant} />
      <div className="absolute inset-0 flex items-start justify-center px-6 pt-10 sm:pt-14">
        {card.panel}
      </div>
    </div>
  );

  const detail = (
    <div className="flex flex-col justify-center p-6 sm:p-10">
      <div className="flex items-center gap-2">
        <card.icon className="size-5 text-primary" aria-hidden />
        <h3 className="text-lg font-semibold">{card.title}</h3>
      </div>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {card.description}
      </p>
      <ul className="mt-6 divide-y divide-border border-t border-border">
        {card.points.map((p) => (
          <li key={p.title} className="py-4">
            <p className="text-sm font-medium">{p.title}</p>
            {p.body ? (
              <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section className="border-t border-border/70 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        {/* header band */}
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <div>
            <SectionLabel>{label}</SectionLabel>
            <h2 className="mt-4 font-serif text-4xl font-medium leading-[1.05] tracking-tight text-balance sm:text-5xl">
              {title}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 lg:pt-1">
            {features.map((f) => (
              <div key={f.title}>
                <f.icon className="size-5 text-muted-foreground" aria-hidden />
                <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* product card - text always leads on mobile; sides alternate at lg */}
        <div className="mt-12 overflow-hidden rounded-3xl border bg-card shadow-md">
          <div className="grid divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            <div className={imageLeft ? "lg:order-2" : "lg:order-1"}>{detail}</div>
            <div className={imageLeft ? "lg:order-1" : "lg:order-2"}>{scene}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
