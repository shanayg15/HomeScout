/** Marker colors shared by the map and its legend (no MapLibre import here, so
 * the wrapper/legend never pulls MapLibre into a non-lazy chunk). */
export const MARKER_COLORS = {
  subject: "#0f766e", // teal-700
  sale: "#2563eb", // blue-600
  rental: "#d97706", // amber-600
} as const;
