import { NextResponse, type NextRequest } from "next/server";
import { lookupProperty } from "@/lib/services/lookupProperty";

/**
 * GET /api/property/lookup?address=<address>
 *
 * Thin route handler: parse the query, call the service, return JSON. No
 * business logic lives here. A not-found address is still a valid 200 result
 * (the dossier shows fields as "unavailable") — only genuine failures are 500.
 */
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim();
  // Optional &refresh=true bypasses the cache (still respects quota).
  const refresh = request.nextUrl.searchParams.get("refresh") === "true";

  if (!address) {
    return NextResponse.json(
      { error: "address query param is required" },
      { status: 400 },
    );
  }

  try {
    // A not-found address is a valid 200 result (dossier with unavailable
    // fields), not an error — only genuine failures become 500.
    const dossier = await lookupProperty(address, { refresh });
    return NextResponse.json(dossier);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
