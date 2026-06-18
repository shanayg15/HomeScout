/**
 * Cinematic residential backdrop for the marketing showcase cards.
 *
 * Layers, bottom → top:
 *   1. An original CSS/SVG scene (graded sky + pitched-roof neighborhood
 *      silhouette) - this is the FALLBACK. If the photo fails to load, the CSS
 *      `background-image` simply paints nothing and this shows through, so the
 *      card never breaks and needs no client JS.
 *   2. A free-license aerial-neighborhood photo (Unsplash) as a CSS background.
 *   3. A per-variant tint + vignette + faint plat-grid so each card keeps a
 *      distinct hue and the floating panel stays legible.
 *
 * Three variants (dusk/day/twilight) keep the three cards visually distinct.
 */

type Variant = "dusk" | "day" | "twilight";

// Free-license aerial residential photos (Unsplash License - free for
// commercial use, no attribution required). Decorative only.
const IMAGE: Record<Variant, string> = {
  dusk: "https://images.unsplash.com/photo-1744744417265-c777029afac3?auto=format&fit=crop&w=1600&q=70",
  day: "https://images.unsplash.com/photo-1758304480340-cb2c43aafd4f?auto=format&fit=crop&w=1600&q=70",
  twilight:
    "https://images.unsplash.com/photo-1765106893273-980e5bf89a7c?auto=format&fit=crop&w=1600&q=70",
};

// Tint over the photo - gives each card a distinct hue and darkens enough for
// the light frosted panel to read.
const TINT: Record<Variant, string> = {
  dusk: "linear-gradient(180deg, rgba(14,22,46,.55) 0%, rgba(60,40,30,.30) 60%, rgba(120,70,40,.30) 100%)",
  day: "linear-gradient(180deg, rgba(16,32,60,.50) 0%, rgba(30,60,95,.22) 70%, rgba(50,90,120,.20) 100%)",
  twilight:
    "linear-gradient(180deg, rgba(6,18,32,.62) 0%, rgba(15,46,60,.36) 70%, rgba(40,90,90,.30) 100%)",
};

// ---- Fallback CSS/SVG scene (shown only if the photo fails to load) ---------

const SKY: Record<Variant, string> = {
  dusk: "linear-gradient(180deg, #0b1830 0%, #1b2c52 38%, #3a3a63 64%, #8a5a52 86%, #d9956a 100%)",
  day: "linear-gradient(180deg, #1a3354 0%, #2d527e 46%, #5b86ac 78%, #9cbcd6 100%)",
  twilight:
    "linear-gradient(180deg, #07182b 0%, #0f2c44 42%, #1d4a5c 72%, #3f7d80 92%, #6fae9c 100%)",
};

const HOUSES: Record<Variant, Array<[number, number, number]>> = {
  dusk: [
    [2, 6, 15], [9, 5, 23], [15, 7, 11], [23, 6, 28], [30, 5, 17],
    [36, 8, 21], [45, 6, 31], [52, 7, 13], [60, 6, 24], [67, 8, 17],
    [76, 6, 28], [83, 7, 15], [91, 6, 21],
  ],
  day: [
    [3, 8, 11], [13, 7, 15], [22, 9, 10], [33, 7, 17], [42, 8, 12],
    [52, 9, 14], [63, 7, 11], [72, 8, 16], [83, 9, 11], [93, 6, 13],
  ],
  twilight: [
    [4, 7, 13], [13, 6, 19], [21, 8, 11], [31, 6, 25], [39, 7, 14],
    [48, 9, 17], [59, 6, 11], [67, 8, 21], [77, 6, 13], [85, 8, 17],
    [94, 5, 11],
  ],
};

const BASE = 60;

function FallbackScene({ variant }: { variant: Variant }) {
  return (
    <>
      <div className="absolute inset-0" style={{ background: SKY[variant] }} />
      <svg
        className="absolute inset-x-0 bottom-0 h-2/3 w-full"
        viewBox="0 0 100 60"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0,42 C12,36 20,40 30,37 C42,33 52,41 64,36 C76,31 86,40 100,35 L100,60 L0,60 Z"
          fill="#0a1422"
          opacity="0.45"
        />
        <g fill="#070e1a" opacity="0.82">
          {HOUSES[variant].map(([x, w, h], i) => {
            const bodyY = BASE - h;
            const roofH = Math.min(w * 0.55, h * 0.8);
            return (
              <g key={`h${i}`}>
                <rect x={x} y={bodyY} width={w - 0.6} height={h} />
                <polygon
                  points={`${x - 0.6},${bodyY} ${x + (w - 0.6) / 2},${bodyY - roofH} ${x + w - 0.6},${bodyY}`}
                />
              </g>
            );
          })}
        </g>
        <rect x="0" y="52" width="100" height="8" fill="#05090f" opacity="0.92" />
      </svg>
    </>
  );
}

// ----------------------------------------------------------------------------

export function SceneBackdrop({
  variant = "dusk",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* fallback scene (only visible if the photo fails) */}
      <FallbackScene variant={variant} />

      {/* free-license aerial photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${IMAGE[variant]}")` }}
      />

      {/* hue tint + legibility wash */}
      <div className="absolute inset-0" style={{ background: TINT[variant] }} />

      {/* brand plat-grid, masked toward center */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(125,164,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(125,164,255,.5) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          opacity: 0.08,
          maskImage: "radial-gradient(80% 75% at 50% 30%, black, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(80% 75% at 50% 30%, black, transparent 82%)",
        }}
      />

      {/* cinematic vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, transparent 50%, rgba(2,6,14,.6) 100%)",
        }}
      />
    </div>
  );
}
