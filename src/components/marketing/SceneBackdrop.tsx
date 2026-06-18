/**
 * Cinematic residential backdrop — an original, self-contained scene (no
 * third-party photography). Evokes an aerial-at-golden-hour real-estate mood
 * with a graded sky, a low sun glow, a layered neighborhood silhouette (pitched
 * roofs + trees, so it reads residential, not a generic city), and a faint
 * plat-grid. Each variant has its own skyline and hue so the three showcase
 * cards stay visually distinct.
 *
 * Drop into a `relative` parent; it fills it (`absolute inset-0`). To use real
 * licensed photography later, layer an <img>/background-image above the sky and
 * keep the vignette + grid on top.
 */

type Variant = "dusk" | "day" | "twilight";

const SKY: Record<Variant, string> = {
  // deep navy → violet → warm amber horizon
  dusk: "linear-gradient(180deg, #0b1830 0%, #1b2c52 38%, #3a3a63 64%, #8a5a52 86%, #d9956a 100%)",
  // cool overcast daytime, brighter toward horizon
  day: "linear-gradient(180deg, #1a3354 0%, #2d527e 46%, #5b86ac 78%, #9cbcd6 100%)",
  // marina blue hour, teal-tinged
  twilight:
    "linear-gradient(180deg, #07182b 0%, #0f2c44 42%, #1d4a5c 72%, #3f7d80 92%, #6fae9c 100%)",
};

const GLOW: Record<Variant, string> = {
  dusk: "radial-gradient(50% 60% at 72% 100%, rgba(255,180,120,.55), transparent 70%)",
  day: "radial-gradient(60% 70% at 50% 110%, rgba(220,235,250,.38), transparent 70%)",
  twilight:
    "radial-gradient(55% 65% at 30% 105%, rgba(150,220,210,.45), transparent 70%)",
};

// Per-variant neighborhood silhouettes. Each house is [x, width, height] in
// viewBox percent; a gable roof is drawn on top. Deterministic (no
// Math.random) so SSR and client agree.
const HOUSES: Record<Variant, Array<[number, number, number]>> = {
  // denser, mixed-height town
  dusk: [
    [2, 6, 15], [9, 5, 23], [15, 7, 11], [23, 6, 28], [30, 5, 17],
    [36, 8, 21], [45, 6, 31], [52, 7, 13], [60, 6, 24], [67, 8, 17],
    [76, 6, 28], [83, 7, 15], [91, 6, 21],
  ],
  // low, even suburban rooflines
  day: [
    [3, 8, 11], [13, 7, 15], [22, 9, 10], [33, 7, 17], [42, 8, 12],
    [52, 9, 14], [63, 7, 11], [72, 8, 16], [83, 9, 11], [93, 6, 13],
  ],
  // sparser waterfront-edge homes
  twilight: [
    [4, 7, 13], [13, 6, 19], [21, 8, 11], [31, 6, 25], [39, 7, 14],
    [48, 9, 17], [59, 6, 11], [67, 8, 21], [77, 6, 13], [85, 8, 17],
    [94, 5, 11],
  ],
};

const TREES: Record<Variant, Array<[number, number]>> = {
  dusk: [[12, 10], [42, 12], [58, 9], [88, 11]],
  day: [[10, 13], [30, 12], [49, 15], [69, 12], [90, 11]],
  twilight: [[9, 15], [27, 13], [45, 17], [63, 14], [82, 15], [97, 11]],
};

const BASE = 60; // baseline y in the viewBox

export function SceneBackdrop({
  variant = "dusk",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* graded sky */}
      <div className="absolute inset-0" style={{ background: SKY[variant] }} />
      {/* low sun / horizon glow */}
      <div className="absolute inset-0" style={{ background: GLOW[variant] }} />

      {/* layered neighborhood silhouette anchored to the horizon */}
      <svg
        className="absolute inset-x-0 bottom-0 h-2/3 w-full"
        viewBox="0 0 100 60"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* far rolling treeline */}
        <path
          d="M0,42 C12,36 20,40 30,37 C42,33 52,41 64,36 C76,31 86,40 100,35 L100,60 L0,60 Z"
          fill="#0a1422"
          opacity="0.45"
        />
        {/* trees behind the rooftops */}
        <g fill="#060d18" opacity="0.7">
          {TREES[variant].map(([x, h], i) => (
            <polygon
              key={`t${i}`}
              points={`${x - h * 0.32},${BASE} ${x},${BASE - h} ${x + h * 0.32},${BASE}`}
            />
          ))}
        </g>
        {/* pitched-roof houses */}
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
        {/* near foreground mass */}
        <rect x="0" y="52" width="100" height="8" fill="#05090f" opacity="0.92" />
      </svg>

      {/* brand plat-grid, masked toward center */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(125,164,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(125,164,255,.5) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          opacity: 0.1,
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
            "radial-gradient(120% 90% at 50% 0%, transparent 55%, rgba(2,6,14,.55) 100%)",
        }}
      />
    </div>
  );
}
