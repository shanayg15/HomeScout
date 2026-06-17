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

  if (!address) {
    return NextResponse.json(
      { error: "address query param is required" },
      { status: 400 },
    );
  }

  try {
    const dossier = await lookupProperty(address);
    return NextResponse.json(dossier);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
